# POS Web

Next.js admin dashboard and API for the Point of Sale system (Prisma + PostgreSQL/Supabase).

## Local setup

From the repo root:

```bash
cd web
cp .env.example .env
```

Edit `.env` with your Supabase project URL, anon key, and Postgres connection strings. See [DATABASE_SETUP.md](./DATABASE_SETUP.md).

```bash
npm install
npm run prisma:generate
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run lint` | ESLint |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:push` | Push schema to DB |
| `npm run prisma:migrate` | Create/apply migrations |
| `npm run prisma:studio` | Prisma Studio GUI |
| `npm run prisma:seed` | Seed database |

## Project layout

```
web/
├── src/           # App router pages, components, lib
├── prisma/        # schema.prisma, seed
├── public/        # Static assets
└── *.sql          # Manual SQL helpers / migrations
```

## Connecting the mobile app

When testing sync from the mobile app against this local server, set `APP_API_URL` in `mobile/.env` to your machine’s LAN IP on port 3000 (for example `http://192.168.1.10:3000`).
