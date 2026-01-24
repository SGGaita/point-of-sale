# Order Sync Setup Guide

This guide explains how to set up and use the order synchronization system between the mobile app and the backend.

## Overview

The mobile app stores orders locally in WatermelonDB. When the device has an internet connection, orders are automatically synced to the backend server where admins can view all orders and their payment status (PAID/UNPAID/PENDING).

## Setup Steps

### 1. Environment Configuration

Create a `.env` file in the mobile app root directory (copy from `.env.example`):

```bash
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Backend API URL for order sync
REACT_APP_API_URL=https://your-backend-url.com
```

Replace `https://your-backend-url.com` with your actual backend URL.

### 2. Database Migration

The app will automatically migrate the database to version 4 which adds sync tracking fields:
- `is_synced` - Boolean flag indicating if order has been synced
- `synced_at` - Timestamp of last successful sync

### 3. Using the Sync Service

#### Manual Sync

```javascript
import { syncService } from './src/services/syncService';

// Trigger manual sync
const result = await syncService.syncOrdersToBackend();
console.log(`Synced ${result.synced} orders, ${result.failed} failed`);
```

#### Auto Sync

Enable automatic syncing in your App.js or main component:

```javascript
import { syncService } from './src/services/syncService';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Start auto-sync every 5 minutes
    const stopAutoSync = syncService.startAutoSync(5);
    
    // Cleanup on unmount
    return () => stopAutoSync();
  }, []);
  
  // ... rest of your app
}
```

#### Get Sync Statistics

```javascript
const stats = await syncService.getSyncStats();
console.log(stats);
// {
//   total: 50,
//   synced: 45,
//   unsynced: 5,
//   lastSyncTimestamp: 1706123456789,
//   lastSyncStatus: { success: true, synced: 5, failed: 0 }
// }
```

### 4. Add Sync Status Component

Import and use the `SyncStatus` component in your app:

```javascript
import SyncStatus from './src/components/SyncStatus';

function SettingsScreen() {
  return (
    <View>
      <SyncStatus />
      {/* Other settings */}
    </View>
  );
}
```

## API Endpoints

### Sync Orders (Mobile → Backend)

**POST** `/api/orders/sync`

Request body:
```json
{
  "orders": [
    {
      "orderNumber": "ORD-001",
      "waiter": "John Doe",
      "customerName": "Customer Name",
      "total": 150.50,
      "status": "paid",
      "timestamp": "2026-01-24T20:00:00Z",
      "orderItems": [
        {
          "itemName": "Pizza",
          "price": 50.00,
          "quantity": 2,
          "totalPrice": 100.00
        }
      ]
    }
  ]
}
```

Response:
```json
{
  "success": true,
  "synced": 1,
  "failed": 0,
  "syncedOrders": [
    { "orderNumber": "ORD-001", "action": "created" }
  ],
  "message": "Successfully synced 1 orders"
}
```

### Get Orders (Backend)

**GET** `/api/orders/sync?status=PAID&limit=50`

**GET** `/api/orders/admin?status=UNPAID&page=1&pageSize=50`

### Update Order Status (Admin)

**PATCH** `/api/orders/admin`

```json
{
  "orderNumber": "ORD-001",
  "status": "PAID"
}
```

## How It Works

1. **Order Creation**: When a waiter creates an order in the mobile app:
   - Order is saved to local WatermelonDB
   - `is_synced` is set to `false`
   - `synced_at` is set to `null`

2. **Automatic Sync**: 
   - Every 5 minutes (configurable), the app checks for unsynced orders
   - When network connection is detected, sync is triggered automatically
   - Only orders with `is_synced = false` are sent to backend

3. **Sync Process**:
   - Fetch all unsynced orders from local database
   - Prepare order data with items
   - Send POST request to `/api/orders/sync`
   - On success, mark orders as synced locally

4. **Admin Dashboard**:
   - Admins can view all synced orders
   - Filter by status (PAID/UNPAID/PENDING)
   - View total revenue and unpaid amounts
   - Update order payment status

## Troubleshooting

### Orders Not Syncing

1. Check internet connection
2. Verify `REACT_APP_API_URL` is set correctly in `.env`
3. Check sync stats: `await syncService.getSyncStats()`
4. View last sync status: `await syncService.getLastSyncStatus()`

### Force Resync All Orders

```javascript
// This will mark all orders as unsynced and sync them again
await syncService.forceSyncAll();
```

### Network Issues

The sync service automatically:
- Detects network connectivity
- Retries when connection is restored
- Queues orders for sync when offline

## Best Practices

1. **Enable Auto-Sync**: Always enable auto-sync in production
2. **Monitor Sync Status**: Show sync status to users
3. **Handle Errors**: Display user-friendly error messages
4. **Test Offline**: Test app behavior when offline
5. **Sync Before Closing**: Trigger manual sync before app closes

## Security Considerations

1. Add authentication to sync endpoints
2. Validate order data on backend
3. Use HTTPS for all API calls
4. Implement rate limiting on sync endpoint
5. Add API key or token authentication

## Example: Complete Integration

```javascript
// App.js
import React, { useEffect } from 'react';
import { syncService } from './src/services/syncService';
import SyncStatus from './src/components/SyncStatus';

function App() {
  useEffect(() => {
    // Start auto-sync every 5 minutes
    const stopAutoSync = syncService.startAutoSync(5);
    
    // Initial sync on app start
    syncService.syncOrdersToBackend();
    
    return () => stopAutoSync();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// SettingsScreen.js
function SettingsScreen() {
  return (
    <ScrollView>
      <SyncStatus />
      {/* Other settings */}
    </ScrollView>
  );
}
```
