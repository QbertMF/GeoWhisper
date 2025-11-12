# GeoWhisper APK Crash Debugging Guide

## 🚨 APK Crashes but Expo Development Works

This is a common issue with React Native/Expo apps. Here's a systematic approach to debug and fix it:

## 1. **Get Crash Logs**

### Android Logcat (Most Important)
```bash
# Connect phone via USB with debugging enabled
adb logcat | grep -i "geowhisper\|crash\|fatal\|exception"

# Or filter by process
adb logcat --pid=$(adb shell pidof de.qbert.geowhisper)
```

### Expo/EAS Build Logs
- Check your EAS build logs for warnings
- Look for "Failed to build" or dependency issues

## 2. **Common Causes & Fixes**

### A. Missing Google Maps API Key
**Issue**: Map crashes because no valid API key
**Fix**: 
1. Get Google Maps Android API key from Google Cloud Console
2. Add to app.json: `"android.config.googleMaps.apiKey": "YOUR_KEY"`
3. Enable "Maps SDK for Android" in Google Cloud Console

### B. Location Permissions
**Issue**: App crashes on location access
**Fix**: Already configured in app.json, but ensure:
- Location permission granted manually in phone settings
- Test with location services enabled

### C. Network Security (Android 9+)
**Issue**: HTTP requests blocked in production
**Fix**: Add to app.json:
```json
"android": {
  "usesCleartextTraffic": true,
  "networkSecurityConfig": "network_security_config"
}
```

### D. Missing Dependencies
**Issue**: Native modules not linked properly
**Fix**: Check these dependencies are properly installed:
- react-native-maps
- expo-location
- @react-native-async-storage/async-storage

## 3. **Debug Build Configuration**

Build debug version for better error messages:
```bash
# Debug build with more verbose logging
eas build --platform android --profile debug

# Or preview build for testing
eas build --platform android --profile preview
```

## 4. **Test Specific Features**

### Minimal Test (Comment out features one by one):
1. Disable map: Comment out `<InteractiveMap />` in HomeScreen
2. Disable location: Comment out `useLocationWithPois` hook
3. Disable API calls: Comment out GeoAPIfy service calls
4. Test basic navigation only

### Add Debugging Logs:
```javascript
// Add to _layout.tsx
console.log("App starting...");

// Add to HomeScreen
console.log("HomeScreen rendering...");

// Add to useLocationWithPois
console.log("Location hook initializing...");
```

## 5. **Production Build Differences**

### Metro Bundler Differences:
- Development uses Metro dev server
- Production bundles everything into APK
- Some imports might fail in production

### Check for:
- Dynamic imports that fail
- Missing assets
- Environment-specific code
- Dev-only dependencies

## 6. **Step-by-Step Debugging**

1. **Build minimal APK**: Comment out all map/location features
2. **Test basic navigation**: Just show empty screens
3. **Add features gradually**: Uncomment one feature at a time
4. **Test after each addition**: Find exact feature that causes crash

## 7. **Alternative Approaches**

### Development Build:
```bash
# Create development build for testing
eas build --platform android --profile development
# Install Expo development client on phone
```

### Use Flipper or Remote Debugging:
- Enable remote debugging in development build
- Use Chrome DevTools to see console logs

## 8. **Environment Variables**

Create .env file for API keys (don't commit to git):
```
GOOGLE_MAPS_API_KEY=your_key_here
GEOAPIFY_API_KEY=your_existing_key
```

Update app.json to use environment variables.

## 9. **Next Steps**

1. **Priority 1**: Get crash logs with `adb logcat`
2. **Priority 2**: Add Google Maps API key 
3. **Priority 3**: Test minimal build without maps
4. **Priority 4**: Add error boundary logging

The crash logs will tell us exactly what's failing!