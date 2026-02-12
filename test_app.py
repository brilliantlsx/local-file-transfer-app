#!/usr/bin/env python3
"""
Simple test script to verify the File Transfer App works correctly
"""

import sys
import os
import requests
import time
import threading

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test if all required modules can be imported"""
    print("Testing imports...")
    
    try:
        import flask
        print("✓ Flask imported successfully")
    except ImportError as e:
        print(f"✗ Flask import failed: {e}")
        return False
    
    try:
        from flask_socketio import SocketIO
        print("✓ Flask-SocketIO imported successfully")
    except ImportError as e:
        print(f"✗ Flask-SocketIO import failed: {e}")
        return False
    
    try:
        import qrcode
        print("✓ QRCode imported successfully")
    except ImportError as e:
        print(f"✗ QRCode import failed: {e}")
        return False
    
    return True

def test_app_creation():
    """Test if the Flask app can be created"""
    print("\nTesting app creation...")
    
    try:
        from app import app, socketio
        print("✓ App created successfully")
        print(f"✓ App config loaded: {len(app.config)} settings")
        return True
    except Exception as e:
        print(f"✗ App creation failed: {e}")
        return False

def test_routes():
    """Test if routes are properly defined"""
    print("\nTesting routes...")
    
    try:
        from app import app
        
        with app.test_client() as client:
            # Test main route
            response = client.get('/')
            if response.status_code == 200:
                print("✓ Main route works")
            else:
                print(f"✗ Main route failed: {response.status_code}")
                return False
            
            # Test files route
            response = client.get('/files')
            if response.status_code == 200:
                print("✓ Files route works")
            else:
                print(f"✗ Files route failed: {response.status_code}")
                return False
            
            # Test messages route
            response = client.get('/messages')
            if response.status_code == 200:
                print("✓ Messages route works")
            else:
                print(f"✗ Messages route failed: {response.status_code}")
                return False
        
        return True
    except Exception as e:
        print(f"✗ Route testing failed: {e}")
        return False

def run_tests():
    """Run all tests"""
    print("File Transfer App - Test Suite")
    print("=" * 40)
    
    tests = [
        test_imports,
        test_app_creation,
        test_routes
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"✗ Test failed with exception: {e}")
            results.append(False)
    
    print("\n" + "=" * 40)
    print("Test Results:")
    
    passed = sum(results)
    total = len(results)
    
    for i, (test, result) in enumerate(zip(tests, results)):
        status = "PASS" if result else "FAIL"
        print(f"{i+1}. {test.__name__}: {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The application is ready to use.")
        print("\nTo start the server, run:")
        print("python app.py")
        return True
    else:
        print("❌ Some tests failed. Please check the errors above.")
        return False

if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)