# Single waiter roster

Web **Staff** members with position **Waiter** are the source of truth for the mobile POS waiter list.

## Flow

1. Add or edit waiters **only on web**: **Dashboard → Staff → Add Staff**, position = **Waiter**.
2. Mobile pulls that list via `GET /api/staff/sync` on app start, auto-sync, and when opening the Waiters screen.
3. Mobile does **not** create waiters — the Waiters screen is for viewing orders/stats and picking names when ordering.
4. Orders still store the waiter **name** string (unchanged for reports/sync).

## Prerequisites

- `staff` and `positions` tables exist (see `web/SETUP_STAFF_POSITIONS.sql`).
- A position named `Waiter` exists (seeded by that SQL).
- Mobile `APP_API_URL` points at your web app.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/staff/sync` | Active Waiter-position staff for mobile pull |
| POST | `/api/staff` | Create staff from **web** Staff UI only |
