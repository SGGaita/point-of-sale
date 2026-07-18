# Single waiter roster

Web **Staff** members with position **Waiter** are the source of truth for the mobile POS waiter list.

## Flow

1. Add or edit waiters on web: **Dashboard → Staff → Add Staff**, position = **Waiter**.
2. Mobile pulls that list via `GET /api/staff/sync` on app start, auto-sync, and when opening the Waiters screen.
3. Adding a waiter on mobile (while online) creates a Staff row on the web with position Waiter, then pulls again.
4. Orders still store the waiter **name** string (unchanged for reports/sync).

## Prerequisites

- `staff` and `positions` tables exist (see `web/SETUP_STAFF_POSITIONS.sql`).
- A position named `Waiter` exists (seeded by that SQL).
- Mobile `APP_API_URL` points at your web app.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/staff/sync` | Active Waiter-position staff for mobile |
| POST | `/api/staff` | Create staff (mobile sends `positionName: "Waiter"`) |
