# Local File Transfer App

A simple, web-based file transfer application for sharing files and messages between devices on the same WiFi network. No authentication required - perfect for home use.

## Features

### 📁 File Transfer
- **Multi-file upload** with drag-and-drop interface
- **Progress indicators** for uploads/downloads
- **File type support**: Images, documents, videos, and more
- **Temporary storage** with automatic cleanup (1 hour)
- **Direct download links** with QR codes for mobile access

### 💬 Real-time Messaging
- **Instant text messaging** between connected devices
- **Message history** (keeps last 100 messages)
- **Copy-to-clipboard** functionality for API keys and sensitive text
- **No file creation** - messages display directly in browser

### 🌐 Network Features
- **Automatic IP detection** for easy access
- **QR code generation** for mobile device access
- **Network status indicators**
- **Cross-platform compatibility** (iOS, Android, Windows, macOS, Linux)

## Requirements

- Python 3.8+
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Installation

1. **Clone or download** this project to your computer
2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

### Starting the Server

1. **Navigate to the project directory**:
   ```bash
   cd file-transfer-app
   ```

2. **Run the application**:
   ```bash
   python app.py
   ```

3. **Access the app**:
   - The server will display the local IP address and port
   - Open the provided URL in any browser on your network
   - Example: `http://192.168.1.100:5000`

### Using the App

#### On Desktop
1. Open the provided URL in your browser
2. Use drag-and-drop or the file selector to upload files
3. Send messages using the message box
4. Download files using the download buttons

#### On Mobile
1. **Scan the QR code** displayed on the desktop interface
2. **Or manually enter** the IP address and port
3. Use the mobile-optimized interface to upload/download files
4. Send and receive messages

## Security & Privacy

- **Local network only** - no internet exposure
- **No authentication required** (as requested for home use)
- **Temporary file storage** with automatic cleanup
- **No data persistence** beyond session
- **No user tracking** or data collection

## File Management

### Automatic Cleanup
- Files are automatically deleted after 1 hour
- Message history is limited to 100 messages
- Cleanup runs every 10 minutes

### Manual Management
- Delete individual files using the delete button
- Clear all files using the "Clear All" button
- Clear message history using the trash icon

## Troubleshooting

### Server Won't Start
- Ensure Python 3.8+ is installed
- Check that port 5000 is not in use
- Verify all dependencies are installed

### Can't Access from Other Devices
- Ensure all devices are on the same WiFi network
- Check firewall settings (may need to allow port 5000)
- Try using the IP address directly instead of hostname

### Upload/Download Issues
- Check file size limits (max 500MB)
- Ensure sufficient disk space on server
- Try refreshing the page if uploads seem stuck

### QR Code Not Scanning
- Ensure good lighting when scanning
- Try moving closer to the screen
- Manually enter the IP address if QR scanning fails

## Technical Details

### Backend
- **Flask** - Web framework
- **Flask-SocketIO** - Real-time communication
- **Werkzeug** - File handling
- **qrcode** - QR code generation

### Frontend
- **Bootstrap 5** - Responsive UI framework
- **Socket.IO Client** - Real-time messaging
- **Vanilla JavaScript** - No frameworks for simplicity
- **HTML5 File API** - Native file handling

### Architecture
- Single Python server process
- WebSocket connections for real-time features
- Temporary file storage in `uploads/` directory
- In-memory message storage with limits

## Customization

### Changing Port
Edit `app.py` and modify the port number:
```python
port = 8080  # Change from 5000 to your preferred port
```

### Changing File Size Limit
Edit `app.py` to modify the max content length:
```python
app.config['MAX_CONTENT_LENGTH'] = 1000 * 1024 * 1024  # 1GB instead of 500MB
```

### Changing Cleanup Time
Edit the cleanup interval in `app.py`:
```python
if (current_time - uploaded_time).total_seconds() > 7200:  # 2 hours instead of 1
```

## Contributing

This is a simple, self-contained application. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the technical details
3. Ensure all requirements are met
4. Check browser console for JavaScript errors

## Notes

- This application is designed for **home/local network use only**
- No security measures beyond network isolation
- Perfect for quick file sharing between personal devices
- No cloud storage or external dependencies required