# Khutbah Companion - App Store Deployment Guide

## 📱 Your App is Ready for iOS and Android!

This guide will walk you through publishing your Khutbah Companion app to the App Store and Google Play Store.

---

## ✅ What's Already Done

- ✅ Capacitor installed and configured
- ✅ iOS and Android projects created
- ✅ App icons generated (all required sizes)
- ✅ Splash screens created (teal background with Islamic design)
- ✅ Permissions configured:
  - Microphone access (for khutbah recording)
  - Location access (for prayer times and mosque finder)
  - Background audio (for audio recording)

---

## 🔧 Prerequisites

### For iOS (App Store):
1. **Mac computer** (required for iOS builds)
   - Or rent a cloud Mac from MacStadium or similar service
2. **Apple Developer Account** ($99/year)
   - Sign up at: https://developer.apple.com
3. **Xcode** (free from Mac App Store)

### For Android (Google Play):
1. **Any computer** (Windows, Mac, or Linux works)
2. **Google Play Developer Account** ($25 one-time fee)
   - Sign up at: https://play.google.com/console
3. **Android Studio** (free download)
   - Download from: https://developer.android.com/studio

---

## 📦 Building the App

### Step 1: Build the Web App

```bash
npm run build
```

This creates the production-ready web assets in the `dist/public` folder.

### Step 2: Sync with Native Projects

```bash
npx cap sync
```

This copies your built web app into the iOS and Android projects.

---

## 🍎 iOS - App Store Deployment

### Step 1: Open in Xcode

```bash
npx cap open ios
```

This opens your app in Xcode.

### Step 2: Configure Signing

1. In Xcode, select your project in the left sidebar
2. Select "Signing & Capabilities" tab
3. Enable "Automatically manage signing"
4. Select your Apple Developer Team
5. Xcode will automatically create provisioning profiles

### Step 3: Update App Information

In Xcode:
- **Display Name**: Already set to "Khutbah Companion"
- **Bundle Identifier**: `com.khutbahtranslate.app` (already configured)
- **Version**: 1.0.0 (already set)
- **Build Number**: 1 (already set)

### Step 4: Test on Device/Simulator

1. Select a device or simulator from the top toolbar
2. Click the "Play" button or press Cmd+R
3. Test your app thoroughly

### Step 5: Archive for App Store

1. Select "Any iOS Device" from the device menu
2. Go to Product → Archive
3. Once archived, click "Distribute App"
4. Choose "App Store Connect"
5. Follow the wizard to upload to App Store

### Step 6: Submit for Review

1. Go to https://appstoreconnect.apple.com
2. Create a new app listing
3. Add screenshots (required sizes: 6.5", 5.5" iPhone)
4. Write app description
5. Set pricing and availability
6. Submit for review (typically takes 1-3 days)

---

## 🤖 Android - Google Play Deployment

### Step 1: Open in Android Studio

```bash
npx cap open android
```

This opens your app in Android Studio.

### Step 2: Configure Build Settings

1. Wait for Gradle to sync (first time can take a few minutes)
2. File → Project Structure → Modules
3. Verify:
   - **compileSdk**: 34 or higher
   - **minSdk**: 22 (supports 95%+ devices)
   - **targetSdk**: 34

### Step 3: Generate Signing Key

In terminal or Android Studio terminal:

```bash
keytool -genkey -v -keystore khutbah-translate.keystore -alias khutbah-translate -keyalg RSA -keysize 2048 -validity 10000
```

**IMPORTANT**: Save your keystore password securely! You'll need it for all future updates.

### Step 4: Configure Signing in Android Studio

1. Build → Generate Signed Bundle/APK
2. Choose "Android App Bundle"
3. Select your keystore file
4. Enter passwords and alias
5. Choose "release" build variant
6. Click "Finish"

This creates an `.aab` file (Android App Bundle) in:
`android/app/release/app-release.aab`

### Step 5: Upload to Google Play Console

1. Go to https://play.google.com/console
2. Create a new app
3. Fill in app details:
   - App name: Khutbah Companion
   - Category: Education or Lifestyle
   - Content rating: Everyone
4. Upload your `.aab` file
5. Add screenshots (required: at least 2)
6. Write description
7. Set pricing (Free)
8. Complete privacy policy URL (required)
9. Submit for review (typically takes 1-3 days)

---

## 🎨 Customizing Icons and Splash Screens

Your app currently has auto-generated icons. To customize:

### Replace Source Images

1. Create your custom designs:
   - **Icon**: 1024x1024px PNG (square, no transparency for Android)
   - **Splash**: 2732x2732px PNG (important content centered)

2. Save them as:
   ```
   resources/icon.png
   resources/splash.png
   ```

3. Regenerate assets:
   ```bash
   npx @capacitor/assets generate --ios --android
   ```

4. Sync to native projects:
   ```bash
   npx cap sync
   ```

---

## 🔄 Updating Your App

When you make changes:

1. Update version numbers:
   - **iOS**: In Xcode, increment "Version" and "Build"
   - **Android**: In `android/app/build.gradle`, increment `versionCode` and `versionName`

2. Build and sync:
   ```bash
   npm run build
   npx cap sync
   ```

3. Follow the same deployment steps for each platform

---

## 🐛 Troubleshooting

### iOS Build Issues

**"No development team selected"**
- Solution: Add your Apple Developer account in Xcode → Preferences → Accounts

**"Provisioning profile doesn't match"**
- Solution: Enable "Automatically manage signing" in Xcode

**"Failed to register bundle identifier"**
- Solution: The bundle ID might be taken. Change it in `capacitor.config.ts` and Xcode

### Android Build Issues

**"SDK location not found"**
- Solution: Create `android/local.properties` with:
  ```
  sdk.dir=/path/to/Android/sdk
  ```

**"Gradle build failed"**
- Solution: File → Invalidate Caches and Restart in Android Studio

---

## 📱 Testing on Real Devices

### iOS
1. Connect iPhone via USB
2. Trust the computer on your iPhone
3. In Xcode, select your iPhone from device list
4. Click Run

### Android
1. Enable Developer Mode on Android device:
   - Settings → About Phone → Tap "Build Number" 7 times
2. Enable USB Debugging:
   - Settings → Developer Options → USB Debugging
3. Connect via USB
4. In Android Studio, select your device
5. Click Run

---

## 🎯 App Store Checklist

### Before Submission:

- [ ] Test on multiple devices/screen sizes
- [ ] Verify microphone permission works
- [ ] Test location permission for prayer times
- [ ] Check all features work without crashes
- [ ] Prepare app screenshots
- [ ] Write compelling app description
- [ ] Create privacy policy (required!)
- [ ] Set up pricing (free or paid)
- [ ] Choose app category
- [ ] Get content rating

### App Store Assets Required:

**iOS:**
- Screenshots: 6.5" iPhone (1284 x 2778)
- Screenshots: 5.5" iPhone (1242 x 2208)
- App preview videos (optional but recommended)

**Android:**
- Screenshots: At least 2 (phone and/or tablet)
- Feature graphic: 1024 x 500 (required)
- App icon: Auto-generated, you're all set!

---

## 💰 Costs Summary

| Item | Cost | Frequency |
|------|------|-----------|
| Apple Developer | $99 | Per year |
| Google Play | $25 | One-time |
| Cloud Mac (optional) | $40-80 | Per month |

---

## 🎉 You're Ready to Launch!

Your Khutbah Companion app is fully configured and ready for the app stores. Good luck with your launch!

For questions about Capacitor, visit: https://capacitorjs.com/docs
