# Point of Sale

Offline-first POS system with a Next.js web admin/API and a React Native mobile app.

```
point-of-sale/
├── web/       # Next.js admin dashboard + API (Prisma + Supabase/PostgreSQL)
├── mobile/    # React Native POS app (WatermelonDB offline-first)
└── Planning/  # Design notes and implementation plans
```

## Clone locally

```bash
git clone https://github.com/sggaita/point-of-sale.git
cd point-of-sale
```

## Prerequisites

- **Node.js** 18+ (20+ recommended)
- **npm** 10+
- **PostgreSQL** via [Supabase](https://supabase.com) (or any Postgres URL)
- **Mobile only:** JDK 17, Android Studio (Android); Xcode + CocoaPods (iOS, macOS)

## One-command bootstrap (optional)

```bash
./scripts/setup-local.sh        # web + mobile
./scripts/setup-local.sh web    # web only
./scripts/setup-local.sh mobile # mobile only
```

This copies missing `.env` files from the examples and runs `npm install` (plus `prisma generate` for web). Edit the `.env` files with your real credentials afterward.

## Quick start — web

```bash
cd web
cp .env.example .env
# Edit .env with your Supabase URL, anon key, and database passwords

npm install
npm run prisma:generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful commands:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js on port 3000 |
| `npm run lint` | Run ESLint |
| `npm run build` | Production build |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:push` | Push schema to the database |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run prisma:seed` | Seed initial data |

More detail: [web/DATABASE_SETUP.md](web/DATABASE_SETUP.md) and [web/README.md](web/README.md).

## Quick start — mobile

```bash
cd mobile
cp .env.example .env
# Set SUPABASE_URL, SUPABASE_ANON_KEY, and APP_API_URL
# For local API testing, point APP_API_URL at your machine, e.g.:
# APP_API_URL=http://192.168.x.x:3000

npm install
npm start
```

In another terminal:

```bash
# Android
npm run android

# iOS (macOS only)
cd ios && pod install && cd ..
npm run ios
```

More detail: [mobile/README.md](mobile/README.md) and [mobile/SETUP_GUIDE.md](mobile/SETUP_GUIDE.md).

## Local web + mobile together

1. Start the web app (`cd web && npm run dev`).
2. Note your LAN IP (so the phone/emulator can reach your machine).
3. In `mobile/.env`, set `APP_API_URL` to `http://<your-lan-ip>:3000` (not `localhost` on a physical device).
4. Restart Metro after changing `.env`.

## Environment files

Never commit real `.env` files. Use the examples:

- `web/.env.example` → copy to `web/.env`
- `web/.env.production.example` → copy to `web/.env.production` when deploying
- `mobile/.env.example` → copy to `mobile/.env`

## Testing

```bash
# Web lint
cd web && npm run lint

# Mobile unit tests / lint
cd mobile && npm test
cd mobile && npm run lint
```
