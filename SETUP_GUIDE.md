# File Transfer App - Complete Setup Guide

This guide will help you install Python and set up the File Transfer App on your Windows system.

## Step 1: Install Python

### Option A: Download from Python.org (Recommended)

1. **Download Python**:
   - Go to [python.org/downloads](https://www.python.org/downloads/)
   - Click "Download Python 3.11.x" (or latest version)
   - Download the Windows installer

2. **Install Python**:
   - Run the downloaded installer
   - **IMPORTANT**: Check "Add Python to PATH" during installation
   - Click "Install Now"
   - Wait for installation to complete

3. **Verify Installation**:
   - Open Command Prompt (cmd)
   - Type: `python --version`
   - You should see something like: `Python 3.11.x`

### Option B: Install via Microsoft Store

1. **Open Microsoft Store**
2. **Search for "Python"**
3. **Install "Python 3.11"** (or latest version)
4. **Verify Installation**:
   - Open Command Prompt
   - Type: `python --version`

### Option C: Install via Chocolatey (if you have it)

```bash
choco install python
```

## Step 2: Install Required Dependencies

Once Python is installed, navigate to the project directory and install the required packages:

```bash
cd file-transfer-app
pip install -r requirements.txt
```

**If pip is not recognized**, try:
```bash
python -m pip install -r requirements.txt
```

## Step 3: Run the Application

After installing dependencies, start the server:

```bash
python app.py
```

You should see output like:
```
File Transfer App starting...
Access the app at: http://192.168.1.100:5000
QR Code generated for mobile access
Press Ctrl+C to stop
```

## Step 4: Access the App

1. **Open your browser** and go to the URL shown in the console
2. **Share with other devices** on the same WiFi network using:
   - The IP address shown in the console
   - The QR code displayed on the web interface

## Troubleshooting

### Python Not Found
If you get "python is not recognized":
1. Reinstall Python and ensure "Add Python to PATH" is checked
2. Or use the full path: `C:\Python311\python.exe app.py`

### pip Not Found
If pip is not recognized:
```bash
python -m ensurepip --upgrade
python -m pip install -r requirements.txt
```

### Port Already in Use
If port 5000 is busy:
1. Edit `app.py` and change `port = 5000` to another port (e.g., 8080)
2. Restart the application

### Firewall Blocking Access
If other devices can't connect:
1. Open Windows Defender Firewall
2. Allow Python through the firewall
3. Or temporarily disable firewall for testing

## Quick Test

To verify everything works, run our test script:

```bash
python test_app.py
```

You should see:
```
File Transfer App - Test Suite
========================================
Testing imports...
✓ Flask imported successfully
✓ Flask-SocketIO imported successfully
✓ QRCode imported successfully

Testing app creation...
✓ App created successfully
✓ App config loaded: 10 settings

Testing routes...
✓ Main route works
✓ Files route works
✓ Messages route works

========================================
Test Results:
1. test_imports: PASS
2. test_app_creation: PASS
3. test_routes: PASS

Overall: 3/3 tests passed
🎉 All tests passed! The application is ready to use.
```

## Alternative: Use Pre-built Python

If you have issues with Python installation, you can:

1. **Use Python from Windows Store** (easiest)
2. **Use Anaconda/Miniconda** (includes many packages)
3. **Use Windows Subsystem for Linux (WSL)** (advanced users)

## Getting Help

If you encounter issues:

1. **Check Python version**: `python --version`
2. **Check pip version**: `pip --version`
3. **Check if Flask is installed**: `python -c "import flask; print(flask.__version__)"`
4. **Run the test script**: `python test_app.py`

## Next Steps

Once the app is running:

1. **Test file upload** - Drag and drop a file to upload
2. **Test messaging** - Send a message and see it appear in real-time
3. **Test from mobile** - Scan the QR code with your phone
4. **Test file download** - Download files from any connected device

The application is designed for home use and requires no authentication - perfect for quick file sharing between your personal devices!