# Auto-Sync for Entire System (5-Minute + Online Detection)

Enable automatic background sync for all entities (orders, menu, expenses, templates) every 5 minutes and when internet connection is restored, removing all manual sync buttons from the UI.

## Current State

**What Works (Orders)**:
- ✅ Auto-sync every 5 minutes via `App.js`
- ✅ Auto-sync on network reconnection
- ✅ No manual sync button needed

**What Needs Fixing**:
- ❌ Menu items require manual sync button in `MenuView.js`
- ❌ Expenses require manual sync
- ❌ Expense templates require manual sync
- ❌ Each entity has separate sync logic (not coordinated)

## Solution: Extend Auto-Sync to All Entities

### 1. Update App.js - Add Auto-Sync for All Entities

**Current** (lines 25-44):
```javascript
// Only syncs orders
syncService.syncOrdersToBackend()
const stopAutoSync = syncService.startAutoSync(5)
```

**New**:
```javascript
// Sync all entities: orders, menu, expenses, templates
syncAll()
const stopAutoSync = startAutoSyncAll(5)
```

### 2. Remove All Manual Sync Buttons

**OrdersView.js** - Remove sync button (lines 396-409):
- Remove `handleSync()` function (lines 40-52)
- Remove sync button UI and TouchableOpacity
- Remove sync stats display (optional - can keep as passive indicator)

**MenuView.js** - Already auto-syncs, just clean up:
- Remove `handleSync()` function (lines 127-166)
- Remove manual sync trigger on mount (line 48)
- Remove network change manual sync (lines 50-60)
- Keep auto-sync after add/update (lines 268, 319) - will be handled by unified service

**SyncStatus.js** - Remove manual sync button:
- Remove "Sync Now" button (lines 99-111)
- Remove `handleManualSync()` function (lines 36-52)
- Keep sync stats display as passive indicator only

### 3. Create Unified Auto-Sync Function

**File**: `mobile/src/services/autoSyncService.js` (new)

```javascript
// Coordinates auto-sync for all entities
export const autoSyncService = {
  async syncAll() {
    // Sync in parallel
    await Promise.all([
      syncService.syncOrdersToBackend(),
      menuSyncService.syncMenuItems(),
      expenseSyncService.syncAll()
    ])
  },
  
  startAutoSync(intervalMinutes) {
    // Every 5 minutes
    const interval = setInterval(() => this.syncAll(), intervalMinutes * 60000)
    
    // On network reconnection
    const unsubscribe = networkUtils.subscribeToNetworkChanges((isOnline) => {
      if (isOnline) this.syncAll()
    })
    
    return () => {
      clearInterval(interval)
      unsubscribe()
    }
  }
}
```

### 4. Files to Modify

| File | Changes |
|------|---------|
| `App.js` | Import and use `autoSyncService` instead of just `syncService` |
| `OrdersView.js` | Remove sync button UI and `handleSync()` function |
| `MenuView.js` | Remove `handleSync()` function and manual sync triggers |
| `SyncStatus.js` | Remove "Sync Now" button, keep stats display only |
| `services/autoSyncService.js` | Create new unified auto-sync coordinator |
| `services/menuSyncService.js` | No changes needed (already has sync methods) |
| `services/expenseSyncService.js` | No changes needed (already has sync methods) |

## Implementation Steps

1. **Create Auto-Sync Service** (`autoSyncService.js`)
   - Coordinate all entity syncs (orders, menu, expenses, templates)
   - Handle 5-minute interval
   - Handle network reconnection
   - Error handling and logging

2. **Update App.js**
   - Import `autoSyncService`
   - Replace order-only sync with `syncAll()`
   - Start unified auto-sync on app load

3. **Clean Up OrdersView.js**
   - Remove `handleSync()` function (lines 40-52)
   - Remove sync button UI (lines 396-409)
   - Keep sync stats as passive display (optional)

4. **Clean Up MenuView.js**
   - Remove `handleSync()` function (lines 127-166)
   - Remove manual sync trigger on mount (line 48)
   - Remove network listener manual sync (lines 50-60)
   - Remove manual sync after add/update (lines 268, 319)

5. **Clean Up SyncStatus.js**
   - Remove "Sync Now" button (lines 99-111)
   - Remove `handleManualSync()` function (lines 36-52)
   - Keep sync stats display as passive indicator

6. **Test**
   - Create order offline → should sync within 5 minutes when online
   - Create menu item offline → should sync within 5 minutes when online
   - Create expense offline → should sync within 5 minutes when online
   - Disconnect/reconnect internet → should sync immediately
   - Verify no manual sync buttons anywhere in app

## Sync Behavior

**Automatic Triggers**:
- ✅ App startup (initial sync)
- ✅ Every 5 minutes (periodic)
- ✅ Network reconnection (immediate)

**User Experience**:
- Create/edit data → saves locally instantly
- No sync buttons to press
- Background sync happens automatically
- Works offline, syncs when online

## Success Criteria

- [ ] All entities sync every 5 minutes automatically
- [ ] All entities sync when internet reconnects
- [ ] No manual sync buttons in MenuView
- [ ] No manual sync buttons anywhere in app
- [ ] App works fully offline
- [ ] Data syncs to Supabase within 5 minutes when online
