# Database Setup Guide

This guide will help you set up PostgreSQL with Supabase and Prisma ORM for the Point of Sale system.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js installed on your machine

## Step 1: Create a Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in your project details:
   - Name: `pos-system` (or your preferred name)
   - Database Password: Create a strong password (save this!)
   - Region: Choose the closest region to your users
4. Click "Create new project" and wait for it to initialize

## Step 2: Get Your Database Connection String

1. In your Supabase project dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection string** section
3. Copy the **Connection string** (URI format)
4. You'll see something like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```

## Step 3: Configure Environment Variables

### For Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and update with your Supabase credentials:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

### For Production

1. Copy `.env.production.example` to `.env.production`:
   ```bash
   cp .env.production.example .env.production
   ```

2. Open `.env.production` and update with production settings:
   ```env
   # Use connection pooling (port 6543) for production
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   NEXT_PUBLIC_APP_URL="https://your-production-domain.com"
   ```

**Note:** The production `DATABASE_URL` uses port `6543` with `pgbouncer=true` for connection pooling, which is recommended for serverless environments.

## Step 4: Generate Prisma Client

Generate the Prisma Client based on your schema:

```bash
npm run prisma:generate
```

## Step 5: Push Database Schema

Push your Prisma schema to the database:

```bash
npm run prisma:push
```

Or create a migration (recommended for production):

```bash
npm run prisma:migrate
```

When prompted, give your migration a descriptive name like `init` or `initial_schema`.

## Step 6: Verify Database Setup

Open Prisma Studio to view your database:

```bash
npm run prisma:studio
```

This will open a browser window where you can view and edit your database tables.

## Available Prisma Commands

- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Create and apply migrations
- `npm run prisma:push` - Push schema changes to database (no migration files)
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed the database with initial data

## Database Models

The system includes the following models:

### User
- Stores user accounts with authentication
- Fields: email, name, password, role

### Product
- Manages product inventory
- Fields: name, description, sku, price, cost, stock, category

### Customer
- Stores customer information
- Fields: name, email, phone, address

### Sale
- Records sales transactions
- Fields: saleNumber, subtotal, tax, discount, total, status, paymentMethod

### SaleItem
- Individual items in a sale
- Fields: quantity, price, subtotal

## Troubleshooting

### Connection Issues

If you can't connect to the database:

1. Verify your password is correct
2. Check that your IP is allowed in Supabase (Settings → Database → Connection pooling)
3. Ensure you're using the correct connection string format

### Migration Errors

If migrations fail:

1. Make sure `DIRECT_URL` is set (required for migrations)
2. Check that your database is accessible
3. Try using `npm run prisma:push` instead for development

### Prisma Client Not Found

If you get "Cannot find module '@prisma/client'":

```bash
npm run prisma:generate
```

## Security Notes

- **Never commit `.env` files** to version control
- Keep your database password secure
- Use different credentials for development and production
- Enable Row Level Security (RLS) in Supabase for additional protection

## Next Steps

After setting up the database:

1. Create API routes for CRUD operations
2. Implement authentication with hashed passwords
3. Add data validation and error handling
4. Set up database backups in Supabase
