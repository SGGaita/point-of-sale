import { syncService } from './syncService';
import { menuSyncService } from './menuSyncService';
import { expenseSyncService } from './expenseSyncService';
import { networkUtils } from '../utils/networkUtils';

export const autoSyncService = {
  isSyncing: false,
  syncInterval: null,
  networkUnsubscribe: null,

  async syncAll() {
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping...');
      return {
        success: false,
        message: 'Sync already in progress'
      };
    }

    const isConnected = await networkUtils.isConnected();
    if (!isConnected) {
      console.log('No internet connection. Sync skipped.');
      return {
        success: false,
        message: 'No internet connection'
      };
    }

    this.isSyncing = true;
    console.log('Starting unified sync for all entities...');

    try {
      // First push local changes to server, then pull remote changes
      const results = await Promise.allSettled([
        syncService.syncOrdersToBackend(),
        syncService.pullOrdersFromServer(),
        menuSyncService.syncMenuItems(),
        expenseSyncService.syncAll()
      ]);

      const [ordersPushResult, ordersPullResult, menuResult, expensesResult] = results;

      const summary = {
        success: true,
        orders: {
          push: ordersPushResult.status === 'fulfilled' ? ordersPushResult.value : { success: false, error: ordersPushResult.reason?.message },
          pull: ordersPullResult.status === 'fulfilled' ? ordersPullResult.value : { success: false, error: ordersPullResult.reason?.message }
        },
        menu: menuResult.status === 'fulfilled' ? menuResult.value : { success: false, error: menuResult.reason?.message },
        expenses: expensesResult.status === 'fulfilled' ? expensesResult.value : { success: false, error: expensesResult.reason?.message }
      };

      console.log('Unified sync completed:', {
        orders: `${summary.orders.push.synced || 0} pushed, ${summary.orders.pull.updated || 0} pulled`,
        menu: summary.menu.success ? `${summary.menu.pushed || 0} pushed, ${summary.menu.pulled || 0} pulled` : 'failed',
        expenses: summary.expenses.expenses?.success ? 'synced' : 'failed'
      });

      return summary;
    } catch (error) {
      console.error('Error in unified sync:', error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      this.isSyncing = false;
    }
  },

  startAutoSync(intervalMinutes = 5) {
    console.log(`Starting auto-sync with ${intervalMinutes} minute interval...`);

    // Initial sync on start
    this.syncAll().catch(err => {
      console.log('Initial sync failed:', err.message);
    });

    // Set up periodic sync
    const intervalMs = intervalMinutes * 60 * 1000;
    this.syncInterval = setInterval(async () => {
      console.log('Periodic auto-sync triggered...');
      await this.syncAll();
    }, intervalMs);

    // Set up network reconnection sync
    let networkDebounceTimer = null;
    this.networkUnsubscribe = networkUtils.subscribeToNetworkChanges(async (isConnected) => {
      if (isConnected && !this.isSyncing) {
        // Debounce network reconnection to avoid multiple triggers
        if (networkDebounceTimer) {
          clearTimeout(networkDebounceTimer);
        }

        networkDebounceTimer = setTimeout(async () => {
          console.log('Network reconnected. Triggering sync...');
          await this.syncAll();
          networkDebounceTimer = null;
        }, 2000); // Wait 2 seconds before syncing on network change
      }
    });

    // Return cleanup function
    return () => {
      console.log('Stopping auto-sync...');
      if (this.syncInterval) {
        clearInterval(this.syncInterval);
        this.syncInterval = null;
      }
      if (this.networkUnsubscribe) {
        this.networkUnsubscribe();
        this.networkUnsubscribe = null;
      }
      if (networkDebounceTimer) {
        clearTimeout(networkDebounceTimer);
      }
    };
  },

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
      this.networkUnsubscribe = null;
    }
    console.log('Auto-sync stopped');
  },

  async getSyncStatus() {
    try {
      const [ordersStats, menuStats] = await Promise.all([
        syncService.getSyncStats(),
        menuSyncService.getSyncStats()
      ]);

      return {
        orders: ordersStats,
        menu: menuStats,
        isSyncing: this.isSyncing
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        orders: null,
        menu: null,
        isSyncing: this.isSyncing
      };
    }
  }
};
