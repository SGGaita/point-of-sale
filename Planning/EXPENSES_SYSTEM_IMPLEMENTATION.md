# Expenses System Implementation

## Overview
Complete expenses management system integrated between mobile app and web dashboard, with automatic sync via Supabase.

## Database Schema

### Tables Created

#### 1. `expense_templates` Table
Stores reusable expense templates for common expenses.

```sql
- id: UUID (Primary Key)
- name: VARCHAR(255) - Template name (e.g., "Electricity", "Rent")
- category: VARCHAR(100) - Category (e.g., "Utilities", "Fixed Costs")
- unit: VARCHAR(50) - Unit of measurement (e.g., "KWh", "Monthly")
- is_active: BOOLEAN - Whether template is active
- sort_order: INTEGER - Display order
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Indexes:**
- `idx_expense_templates_category` on `category`
- `idx_expense_templates_active` on `is_active`

#### 2. `expenses` Table
Stores all expense records.

```sql
- id: UUID (Primary Key)
- template_id: UUID (Foreign Key to expense_templates, nullable)
- category: VARCHAR(100) - Expense category
- amount: DECIMAL(10,2) - Total expense amount
- quantity: DECIMAL(10,2) - Quantity (optional)
- unit_cost: DECIMAL(10,2) - Cost per unit (optional)
- description: TEXT - Expense description
- timestamp: TIMESTAMP - When expense occurred
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Indexes:**
- `idx_expenses_category` on `category`
- `idx_expenses_timestamp` on `timestamp`
- `idx_expenses_template_id` on `template_id`

**Triggers:**
- Auto-update `updated_at` on record modification

## Mobile App Integration

### Database Schema (WatermelonDB)
The mobile app already has matching tables:

**expenses table:**
- template_id, category, amount, quantity, unit_cost, description
- timestamp, is_synced, synced_at, created_at, updated_at

**expense_templates table:**
- name, category, unit, is_active, sort_order
- is_synced, synced_at, created_at, updated_at

### Sync Service
**File:** `mobile/src/services/expenseSyncService.js`

**Functions:**
- `syncExpensesToBackend()` - Pushes unsynced expenses to server
- `syncTemplatesToBackend()` - Pushes unsynced templates to server
- `syncAll()` - Syncs both expenses and templates

**API Endpoints:**
- POST `/api/expenses/sync` - Sync expenses
- POST `/api/expense-templates/sync` - Sync templates
- GET `/api/expenses/sync` - Fetch expenses
- GET `/api/expense-templates/sync` - Fetch templates

## Web Dashboard

### Expenses Page
**File:** `web/src/app/expenses/page.js`

**Features:**
- ✅ View all expenses with filtering
- ✅ Filter by date range (Today, Week, Month, All Time)
- ✅ Filter by category
- ✅ Add new expenses
- ✅ Use expense templates for quick entry
- ✅ Delete expenses
- ✅ Display statistics (Total, Count, Categories)
- ✅ Responsive table view

**Components:**
- Stats cards showing totals
- Date range filter dropdown
- Category filter dropdown
- Add expense button
- Expenses table with sorting
- Add expense modal with form

### Navigation
**File:** `web/src/components/dashboard/Sidebar.js`

Added "Expenses" menu item with Receipt icon between Orders and Staff.

## Setup Instructions

### 1. Database Setup

Run the SQL migration file in Supabase:

```bash
# File: web/supabase_expenses_migration.sql
```

This will:
- Create `expense_templates` table
- Create `expenses` table
- Add indexes for performance
- Set up auto-update triggers
- Insert default expense templates

### 2. Deploy Web Changes

The web app changes are ready:
- ✅ Expenses page created
- ✅ Navigation updated
- ✅ API endpoints fixed (using shared supabase instance)

Deploy to Vercel:
```bash
git add .
git commit -m "Add expenses management system"
git push origin main
```

### 3. Mobile App

The mobile app already has:
- ✅ Expense tracking functionality
- ✅ Expense templates
- ✅ Sync service configured
- ✅ Auto-sync every 3 minutes

## Data Flow

### Mobile → Web (Sync)
1. User creates expense in mobile app
2. Expense saved to local WatermelonDB with `is_synced = false`
3. Auto-sync runs every 3 minutes
4. `expenseSyncService.syncExpensesToBackend()` pushes to API
5. API saves to Supabase `expenses` table
6. Mobile marks expense as `is_synced = true`

### Web → Mobile (View)
1. User views expenses in web dashboard
2. Web fetches from Supabase `expenses` table
3. Displays in table with filters
4. Mobile app can pull updates on next sync

## Features Comparison

| Feature | Mobile App | Web Dashboard |
|---------|-----------|---------------|
| Add Expense | ✅ | ✅ |
| View Expenses | ✅ | ✅ |
| Delete Expense | ✅ | ✅ |
| Expense Templates | ✅ | ✅ (view/use) |
| Filter by Category | ✅ | ✅ |
| Filter by Date | ✅ | ✅ |
| Offline Support | ✅ | ❌ |
| Auto Sync | ✅ | N/A |
| Statistics | ✅ | ✅ |

## API Endpoints

### Expenses

**POST** `/api/expenses/sync`
- Syncs expenses from mobile to server
- Upserts based on timestamp + amount + description
- Returns: `{ success, synced, failed, results, errors }`

**GET** `/api/expenses/sync`
- Fetches expenses with optional filters
- Query params: `startDate`, `endDate`
- Returns: `{ expenses, count }`

### Expense Templates

**POST** `/api/expense-templates/sync`
- Syncs templates from mobile to server
- Upserts based on name + category
- Returns: `{ success, synced, failed, results, errors }`

**GET** `/api/expense-templates/sync`
- Fetches active templates
- Returns: `{ templates, count }`

## Testing Checklist

- [ ] Run SQL migration in Supabase
- [ ] Deploy web app to Vercel
- [ ] Create expense in mobile app
- [ ] Wait 3 minutes for auto-sync
- [ ] Verify expense appears in web dashboard
- [ ] Create expense in web dashboard
- [ ] Verify it appears in Supabase
- [ ] Test filtering by date range
- [ ] Test filtering by category
- [ ] Test expense deletion
- [ ] Test template usage

## Default Templates

The migration includes these default templates:
1. **Electricity** - Utilities (KWh)
2. **Water** - Utilities (Liters)
3. **Rent** - Fixed Costs (Monthly)
4. **Salaries** - Labor (Monthly)
5. **Supplies** - Inventory (Items)

## Notes

- Expenses sync automatically every 3 minutes from mobile
- Web dashboard provides real-time view of all expenses
- Both mobile and web use the same Supabase database
- Expense templates can be managed from mobile app
- Web dashboard is read-only for templates (uses existing templates)

## Future Enhancements

- [ ] Edit expenses in web dashboard
- [ ] Manage templates in web dashboard
- [ ] Export expenses to Excel
- [ ] Expense analytics and charts
- [ ] Budget tracking
- [ ] Recurring expenses
- [ ] Expense categories management
- [ ] Multi-currency support
