#!/bin/bash

echo "🔍 GeoWhisper APK Crash Debugging Script"
echo "======================================="

# Check if ADB is available
if ! command -v adb &> /dev/null; then
    echo "❌ ADB not found. Please install Android SDK platform tools"
    exit 1
fi

# Check if device is connected
if [ $(adb devices | wc -l) -lt 3 ]; then
    echo "❌ No Android device connected"
    echo "💡 Connect your phone via USB with Developer Options enabled"
    exit 1
fi

echo "✅ Android device connected"

# Get package info
PACKAGE="de.qbert.geowhisper"
echo "📱 Checking if $PACKAGE is installed..."

if adb shell pm list packages | grep -q $PACKAGE; then
    echo "✅ App is installed"
    
    # Get PID if app is running
    PID=$(adb shell pidof $PACKAGE 2>/dev/null)
    if [ ! -z "$PID" ]; then
        echo "🏃 App is running with PID: $PID"
        echo "📋 Live logs (Ctrl+C to stop):"
        echo "================================"
        adb logcat --pid=$PID
    else
        echo "⚠️  App is not currently running"
        echo "🚀 Start the app on your phone, then run this script again"
        echo ""
        echo "📋 All logs for this app (Ctrl+C to stop):"
        echo "=========================================="
        adb logcat | grep -i "geowhisper\|$PACKAGE"
    fi
else
    echo "❌ App is not installed"
    echo "💡 Install the APK first: adb install your-app.apk"
fi