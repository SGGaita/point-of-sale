# React Native Setup Guide

## Step-by-Step Setup for Windows

### Step 1: Install Node.js Dependencies

```bash
cd c:\projects\Point_of_sale\mobile
npm install
```

### Step 2: Initialize Android Project

Since we're building from scratch, you need to initialize the native Android project:

**Option A: Using React Native CLI (Recommended)**

```bash
npx @react-native-community/cli init-project-android
```

**Option B: Copy from a fresh React Native project**

```bash
cd c:\projects\Point_of_sale
npx react-native@0.73.2 init TempProject
xcopy TempProject\android mobile\android /E /I /H
rmdir /s /q TempProject
```

### Step 3: Configure Android Project

After initializing, you need to update the Android configuration:

1. Open `android/app/build.gradle`
2. Update the `applicationId` to match your app:
   ```gradle
   applicationId "com.posmobile"
   ```

3. Ensure the app name matches in `android/app/src/main/res/values/strings.xml`:
   ```xml
   <string name="app_name">POS Mobile</string>
   ```

### Step 4: Link Vector Icons (Android)

Add to `android/app/build.gradle`:

```gradle
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

### Step 5: Configure React Native Config

For environment variables, add to `android/app/build.gradle`:

```gradle
apply from: project(':react-native-config').projectDir.getPath() + "/dotenv.gradle"
```

### Step 6: Run the App

Start Metro bundler:
```bash
npm start
```

In a new terminal, run Android:
```bash
npm run android
```

## iOS Setup (macOS only)

### Step 1: Initialize iOS Project

```bash
npx @react-native-community/cli init-project-ios
```

### Step 2: Install CocoaPods

```bash
cd ios
pod install
cd ..
```

### Step 3: Run iOS

```bash
npm run ios
```

## Troubleshooting

### Android Build Issues

1. **Gradle sync failed**: Make sure JDK 17 is installed
2. **SDK not found**: Open Android Studio and install Android SDK 33
3. **Build tools**: Install Android SDK Build-Tools 33.0.0

### Metro Bundler Issues

Clear cache:
```bash
npm start -- --reset-cache
```

### Clean Build

Android:
```bash
cd android
./gradlew clean
cd ..
```

## Next Development Steps

1. ✅ Basic app structure created
2. ✅ Navigation setup complete
3. ✅ Four main screens implemented
4. 🔄 Next: Set up WatermelonDB
5. 🔄 Next: Configure Supabase integration
6. 🔄 Next: Implement product management
7. 🔄 Next: Implement sales transactions
