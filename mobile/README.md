# POS Mobile Application

A React Native mobile application for Point of Sale with offline-first capabilities using WatermelonDB and Supabase sync.

## Features

- 📱 Cross-platform (iOS & Android)
- 🔄 Offline-first architecture with WatermelonDB
- ☁️ Cloud sync with Supabase
- 🎨 Modern UI with React Navigation
- 🚀 Built with React Native CLI (no Expo)

## Prerequisites

- Node.js >= 18
- JDK 17 (for Android)
- Android Studio with Android SDK (for Android)
- Xcode 14+ (for iOS, macOS only)
- CocoaPods (for iOS, macOS only)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Android Setup

The Android project needs to be initialized using React Native CLI:

```bash
npx react-native init POSMobile --version 0.73.2
```

Then copy the android folder to this project, or run:

```bash
npx react-native@latest init-android
```

### 4. iOS Setup (macOS only)

The iOS project needs to be initialized:

```bash
npx react-native@latest init-ios
```

Then install pods:

```bash
cd ios
pod install
cd ..
```

### 5. Run the App

**Android:**
```bash
npm run android
```

**iOS (macOS only):**
```bash
npm run ios
```

**Start Metro Bundler separately:**
```bash
npm start
```

## Project Structure

```
mobile/
├── src/
│   ├── screens/        # Screen components
│   ├── navigation/     # Navigation configuration
│   ├── database/       # WatermelonDB models and schema
│   ├── services/       # API and sync services
│   ├── components/     # Reusable components
│   ├── hooks/          # Custom React hooks
│   └── utils/          # Utility functions
├── android/           # Android native code
├── ios/              # iOS native code
└── App.tsx           # Entry point
```

## Technologies

- React Native CLI 0.73.2
- React Navigation (Bottom Tabs + Stack)
- WatermelonDB (Offline storage)
- Supabase (Backend & sync)
- React Native Config (Environment variables)
- React Native Vector Icons

## Next Steps

1. Install dependencies: `npm install`
2. Initialize Android/iOS projects (see setup above)
3. Configure your Supabase credentials in `.env`
4. Set up WatermelonDB schema and models
5. Implement sync logic with Supabase
6. Add product and sales management features

## Development

The app is structured with:
- **Home Screen**: Dashboard with sales overview
- **Sales Screen**: Transaction management
- **Products Screen**: Product catalog
- **Settings Screen**: App configuration

All screens are ready with basic UI. Next steps involve connecting to WatermelonDB for local storage and Supabase for cloud sync.
