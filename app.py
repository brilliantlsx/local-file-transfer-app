#!/usr/bin/env python3
"""
File Transfer App - Internal website for transferring files between devices on same WiFi
"""

import os
import uuid
import tempfile
import threading
import socket
from datetime import datetime
from pathlib import Path
from flask import Flask, render_template, request, send_file, jsonify, redirect, url_for
from flask_socketio import SocketIO, emit
import qrcode
from io import BytesIO
import base64
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'file-transfer-secret-key'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB max file size

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="*")

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Global variables for messages and file info
messages = []
file_info = {}

def get_local_ip():
    """Get the local IP address of the machine"""
    try:
        # Connect to a remote server to determine local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def generate_qr_code(url):
    """Generate QR code for the given URL"""
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    img_str = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"

@app.route('/')
def index():
    """Main page"""
    local_ip = get_local_ip()
    port = request.environ.get('SERVER_PORT', 5000)
    url = f"http://{local_ip}:{port}"
    qr_code = generate_qr_code(url)
    
    return render_template('index.html', 
                         local_ip=local_ip, 
                         port=port, 
                         url=url,
                         qr_code=qr_code)

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file uploads"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and file.filename:
            # Generate unique filename
            filename = str(uuid.uuid4()) + '_' + file.filename
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            
            # Save file
            file.save(filepath)
            
            # Get file info
            file_size = os.path.getsize(filepath)
            file_url = url_for('download_file', filename=filename, _external=True)
            
            # Store file info
            file_info[filename] = {
                'original_name': file.filename,
                'size': file_size,
                'uploaded_at': datetime.now().isoformat(),
                'url': file_url
            }
            
            # Notify all clients about new file
            socketio.emit('file_uploaded', {
                'filename': filename,
                'original_name': file.filename,
                'size': file_size,
                'uploaded_at': file_info[filename]['uploaded_at']
            })
            
            return jsonify({
                'success': True,
                'filename': filename,
                'original_name': file.filename,
                'size': file_size
            })
        else:
            return jsonify({'error': 'Invalid file'}), 400
            
    except Exception as e:
        print(f"Upload error: {e}")
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@app.route('/download/<filename>')
def download_file(filename):
    """Handle file downloads"""
    try:
        return send_file(
            os.path.join(app.config['UPLOAD_FOLDER'], filename),
            as_attachment=True
        )
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404

@app.route('/files')
def list_files():
    """List all available files"""
    files = []
    for filename, info in file_info.items():
        files.append({
            'filename': filename,
            'original_name': info['original_name'],
            'size': info['size'],
            'uploaded_at': info['uploaded_at'],
            'url': info['url']
        })
    return jsonify(files)

@app.route('/delete/<filename>', methods=['DELETE'])
def delete_file(filename):
    """Delete a file"""
    try:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if os.path.exists(filepath):
            os.remove(filepath)
            if filename in file_info:
                del file_info[filename]
            
            # Notify all clients about deleted file
            socketio.emit('file_deleted', {'filename': filename})
            
            return jsonify({'success': True})
        else:
            return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@socketio.on('send_message')
def handle_message(data):
    """Handle real-time messages"""
    message = {
        'id': str(uuid.uuid4()),
        'text': data['text'],
        'timestamp': datetime.now().isoformat(),
        'sender': request.remote_addr
    }
    
    messages.append(message)
    
    # Keep only last 100 messages in memory
    if len(messages) > 100:
        messages.pop(0)
    
    # Broadcast message to all clients
    emit('new_message', message, broadcast=True)

@app.route('/messages')
def get_messages():
    """Get all messages"""
    return jsonify(messages)

@app.route('/clear_messages', methods=['POST'])
def clear_messages():
    """Clear all messages"""
    messages.clear()
    socketio.emit('messages_cleared')
    return jsonify({'success': True})

def cleanup_old_files():
    """Clean up old files periodically"""
    while True:
        try:
            current_time = datetime.now()
            files_to_delete = []
            
            for filename, info in file_info.items():
                uploaded_time = datetime.fromisoformat(info['uploaded_at'])
                if (current_time - uploaded_time).total_seconds() > 3600:  # 1 hour
                    files_to_delete.append(filename)
            
            for filename in files_to_delete:
                try:
                    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                    if os.path.exists(filepath):
                        os.remove(filepath)
                    del file_info[filename]
                    socketio.emit('file_deleted', {'filename': filename})
                except Exception as e:
                    print(f"Error deleting file {filename}: {e}")
            
            # Sleep for 10 minutes
            threading.Event().wait(600)
        except Exception as e:
            print(f"Error in cleanup: {e}")
            threading.Event().wait(60)

if __name__ == '__main__':
    # Start cleanup thread
    cleanup_thread = threading.Thread(target=cleanup_old_files, daemon=True)
    cleanup_thread.start()
    
    # Get local IP for display
    local_ip = get_local_ip()
    port = 5000
    
    print(f"File Transfer App starting...")
    print(f"Access the app at: http://{local_ip}:{port}")
    print(f"QR Code generated for mobile access")
    print(f"Press Ctrl+C to stop")
    
    socketio.run(app, host='0.0.0.0', port=port, debug=False)