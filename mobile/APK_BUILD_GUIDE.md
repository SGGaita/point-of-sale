# APK Release Build Guide

## Prerequisites
- Android SDK installed
- Java Development Kit (JDK) installed
- Project dependencies installed (`npm install`)

## Step 1: Generate a Release Keystore

First, you need to generate a signing key for your release APK.

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore pos-release-key.keystore -alias pos-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**You will be prompted for:**
- Keystore password (remember this!)
- Key password (can be same as keystore password)
- Your name
- Organization unit
- Organization name
- City/Locality
- State/Province
- Country code

**IMPORTANT:** Save these passwords securely! You'll need them to update your app in the future.

## Step 2: Configure Gradle for Release Signing

The keystore configuration needs to be added to your gradle files.

### Create `android/gradle.properties` (if it doesn't exist)

Add these lines (replace with your actual passwords):

```properties
POS_RELEASE_STORE_FILE=pos-release-key.keystore
POS_RELEASE_KEY_ALIAS=pos-key-alias
POS_RELEASE_STORE_PASSWORD=your_keystore_password_here
POS_RELEASE_KEY_PASSWORD=your_key_password_here
```

**SECURITY NOTE:** Add `gradle.properties` to `.gitignore` to keep passwords private!

## Step 3: Update build.gradle

Your `android/app/build.gradle` already has the structure. Just update the release signing config:

```gradle
signingConfigs {
    debug {
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }
    release {
        if (project.hasProperty('POS_RELEASE_STORE_FILE')) {
            storeFile file(POS_RELEASE_STORE_FILE)
            storePassword POS_RELEASE_STORE_PASSWORD
            keyAlias POS_RELEASE_KEY_ALIAS
            keyPassword POS_RELEASE_KEY_PASSWORD
        }
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled enableProguardInReleaseBuilds
        proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
    }
}
```

## Step 4: Update App Version

In `android/app/build.gradle`, update version:

```gradle
defaultConfig {
    applicationId "com.posmobile"
    minSdkVersion rootProject.ext.minSdkVersion
    targetSdkVersion rootProject.ext.targetSdkVersion
    versionCode 1        // Increment this for each release
    versionName "1.0.0"  // Update version name
}
```

## Step 5: Build the Release APK

### Option A: Build APK (Recommended for testing)

```bash
cd android
./gradlew assembleRelease
```

**APK Location:**
```
android/app/build/outputs/apk/release/app-release.apk
```

### Option B: Build AAB (For Google Play Store)

```bash
cd android
./gradlew bundleRelease
```

**AAB Location:**
```
android/app/build/outputs/bundle/release/app-release.aab
```

## Step 6: Test the Release APK

1. **Uninstall** any existing debug version from your device
2. **Install** the release APK:
   ```bash
   adb install android/app/build/outputs/apk/release/app-release.apk
   ```
3. **Test** all features thoroughly

## Quick Build Commands

### Clean and Build Release APK
```bash
cd android
./gradlew clean
./gradlew assembleRelease
cd ..
```

### Build with specific variant
```bash
cd android
./gradlew assembleRelease --stacktrace
cd ..
```

## Common Issues & Solutions

### Issue: "Keystore was tampered with, or password was incorrect"
**Solution:** Check your passwords in `gradle.properties`

### Issue: "Task :app:validateSigningRelease FAILED"
**Solution:** Ensure keystore file exists in `android/app/` directory

### Issue: APK size is too large
**Solution:** Enable ProGuard:
```gradle
def enableProguardInReleaseBuilds = true
```

### Issue: App crashes on release but not debug
**Solution:** Check ProGuard rules in `proguard-rules.pro`

## File Checklist

Before building, ensure you have:
- ✅ `android/app/pos-release-key.keystore` - Your signing key
- ✅ `android/gradle.properties` - Contains keystore credentials
- ✅ `android/app/build.gradle` - Updated with release config
- ✅ `.gitignore` - Includes `gradle.properties` and `*.keystore`

## Distribution

### For Internal Testing:
- Share the APK file directly
- Users need to enable "Install from Unknown Sources"

### For Google Play Store:
- Use the AAB file (bundleRelease)
- Upload to Google Play Console
- Follow Play Store submission guidelines

## Version Management

When releasing updates:
1. Increment `versionCode` by 1
2. Update `versionName` (e.g., "1.0.0" → "1.1.0")
3. Rebuild the APK/AAB
4. Test thoroughly before distribution

## Security Best Practices

1. **Never commit** keystore files to git
2. **Never commit** `gradle.properties` with passwords
3. **Backup** your keystore file securely
4. **Document** your keystore passwords in a secure location
5. **Use different keys** for different apps

## App Information

- **App Name:** Point of Sale
- **Package Name:** com.posmobile
- **Current Version:** 1.0.0
- **Min SDK:** 21 (Android 5.0)
- **Target SDK:** 34 (Android 14)
