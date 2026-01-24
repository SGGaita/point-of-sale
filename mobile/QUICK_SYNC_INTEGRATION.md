# Quick Sync Integration Guide

## Step 1: Create .env file

Create a `.env` file in the mobile app root directory:

```bash
# Copy from .env.example
cp .env.example .env
```

Then edit `.env` and add your backend URL:

```
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Backend API URL for order sync
REACT_APP_API_URL=http://YOUR_COMPUTER_IP:3000
```

**Important**: Replace `YOUR_COMPUTER_IP` with your actual computer's IP address (not localhost, since the mobile device needs to reach your computer). Find it with:
- Windows: `ipconfig` (look for IPv4 Address)
- Mac/Linux: `ifconfig` or `ip addr`

Example: `REACT_APP_API_URL=http://192.168.1.100:3000`

## Step 2: Integrate Sync Service in App.js

Add this to your main App.js file:

```javascript
import { useEffect } from 'react';
import { syncService } from './src/services/syncService';

function App() {
  useEffect(() => {
    // Start auto-sync every 5 minutes
    const stopAutoSync = syncService.startAutoSync(5);
    
    // Initial sync on app start
    syncService.syncOrdersToBackend();
    
    return () => stopAutoSync();
  }, []);

  // ... rest of your app
}
```

## Step 3: Add Manual Sync Button (Optional)

Add a sync button to your orders screen or settings:

```javascript
import { syncService } from '../services/syncService';

const handleSync = async () => {
  const result = await syncService.syncOrdersToBackend();
  if (result.success) {
    Alert.alert('Success', `Synced ${result.synced} orders`);
  } else {
    Alert.alert('Error', result.error);
  }
};

// In your render:
<Button title="Sync Orders" onPress={handleSync} />
```

## Step 4: Test the Sync

1. Make sure your backend is running: `npm run dev` in the web folder
2. Create an order in the mobile app
3. The order should auto-sync within 5 minutes, or click the manual sync button
4. Check the web dashboard at `http://localhost:3000/dashboard/orders`

## Troubleshooting

### Orders not syncing?

1. **Check network connection**: Make sure mobile device can reach your computer
2. **Check API URL**: Verify `REACT_APP_API_URL` in `.env` is correct
3. **Check backend**: Make sure web server is running on port 3000
4. **Check logs**: Look at mobile app console for sync errors
5. **Test manually**: 
   ```javascript
   const stats = await syncService.getSyncStats();
   console.log('Unsynced orders:', stats.unsynced);
   ```

### Database migration not applied?

The app should auto-migrate to version 4 when you restart it. If not:
- Close and reopen the app completely
- Check console for migration errors
