# POS Mobile

React Native Point of Sale app with offline-first WatermelonDB storage and backend sync.

## Prerequisites

- Node.js >= 18
- JDK 17 (Android)
- Android Studio + Android SDK (Android)
- Xcode 14+ and CocoaPods (iOS, macOS only)

## Local setup

```bash
cd mobile
cp .env.example .env
```

Edit `.env`:

```bash
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
# Local web API — use LAN IP for a physical device
APP_API_URL=http://192.168.x.x:3000
```

```bash
npm install
npm start
```

In another terminal:

```bash
npm run android
# or (macOS)
cd ios && pod install && cd ..
npm run ios
```

Native `android/` and `ios/` projects are already in this repo. See [SETUP_GUIDE.md](./SETUP_GUIDE.md) if you hit platform-specific issues.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Metro bundler |
| `npm run android` | Run on Android |
| `npm run ios` | Run on iOS |
| `npm test` | Jest |
| `npm run lint` | ESLint |

## Project structure

```
mobile/
├── src/
│   ├── screens/
│   ├── navigation/
│   ├── database/      # WatermelonDB schema, models, migrations
│   ├── services/      # Sync and API services
│   ├── components/
│   ├── hooks/
│   └── utils/
├── android/
├── ios/
└── App.js
```

## Sync with local web

1. Run the web app (`cd ../web && npm run dev`).
2. Point `APP_API_URL` at that server.
3. Restart Metro after changing `.env` (`npm start -- --reset-cache` if needed).

More: [SYNC_SETUP.md](./SYNC_SETUP.md), [QUICK_SYNC_INTEGRATION.md](./QUICK_SYNC_INTEGRATION.md).
