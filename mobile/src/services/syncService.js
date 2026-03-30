import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import { networkUtils } from '../utils/networkUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.APP_API_URL || 'https://pos-web-delta-opal.vercel.app';
const SYNC_STATUS_KEY = '@last_sync_status';
const SYNC_TIMESTAMP_KEY = '@last_sync_timestamp';

export const syncService = {
  async getUnsyncedOrders() {
    try {
      const ordersCollection = database.collections.get('orders');
      const unsyncedOrders = await ordersCollection
        .query(Q.where('is_synced', false))
        .fetch();
      
      return unsyncedOrders;
    } catch (error) {
      console.error('Error fetching unsynced orders:', error);
      return [];
    }
  },

  async prepareOrderForSync(order) {
    try {
      const items = await order.orderItems.fetch();
      
      return {
        orderNumber: order.orderNumber,
        waiter: order.waiter,
        customerName: order.customerName || null,
        total: order.total,
        status: order.status,
        timestamp: order.timestamp,
        orderItems: items.map(item => ({
          itemName: item.itemName,
          price: item.price,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
        })),
      };
    } catch (error) {
      console.error('Error preparing order for sync:', error);
      throw error;
    }
  },

  async syncOrdersToBackend() {
    let unsyncedOrders = [];
    try {
      const isConnected = await networkUtils.isConnected();
      if (!isConnected) {
        console.log('No internet connection. Sync skipped.');
        return {
          success: false,
          error: 'No internet connection',
          synced: 0,
          failed: 0
        };
      }

      unsyncedOrders = await this.getUnsyncedOrders();
      
      if (unsyncedOrders.length === 0) {
        console.log('No orders to sync');
        return {
          success: true,
          synced: 0,
          failed: 0,
          message: 'No orders to sync'
        };
      }

      const ordersData = await Promise.all(
        unsyncedOrders.map(order => this.prepareOrderForSync(order))
      );

      console.log('Syncing to:', `${API_BASE_URL}/api/orders/sync`);
      console.log('Orders to sync:', ordersData.length);

      const response = await fetch(`${API_BASE_URL}/api/orders/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orders: ordersData }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sync failed with status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      console.log('Sync result:', JSON.stringify(result, null, 2));

      if (result.errors && result.errors.length > 0) {
        console.error('Sync errors:', result.errors);
      }

      if (result.success && result.syncedOrders) {
        await database.write(async () => {
          for (const syncedOrder of result.syncedOrders) {
            const order = unsyncedOrders.find(
              o => o.orderNumber === syncedOrder.orderNumber
            );
            if (order) {
              await order.update(o => {
                o.isSynced = true;
                o.syncedAt = Date.now();
              });
            }
          }
        });
      }

      // Save sync status for both old and new keys
      await AsyncStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(result));
      await AsyncStorage.setItem(SYNC_TIMESTAMP_KEY, Date.now().toString());
      
      // Also save in format expected by OrdersView
      await AsyncStorage.setItem('orderSyncStatus', JSON.stringify({
        ...result,
        lastSyncTimestamp: Date.now()
      }));

      console.log(`Sync completed: ${result.synced} synced, ${result.failed} failed`);
      
      return result;
    } catch (error) {
      console.error('Error syncing orders to backend:', error);
      
      const errorResult = {
        success: false,
        error: error.message,
        synced: 0,
        failed: unsyncedOrders?.length || 0
      };
      
      await AsyncStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(errorResult));
      
      return errorResult;
    }
  },

  async getLastSyncStatus() {
    try {
      const status = await AsyncStorage.getItem(SYNC_STATUS_KEY);
      const timestamp = await AsyncStorage.getItem(SYNC_TIMESTAMP_KEY);
      
      return {
        status: status ? JSON.parse(status) : null,
        timestamp: timestamp ? parseInt(timestamp, 10) : null,
      };
    } catch (error) {
      console.error('Error getting last sync status:', error);
      return { status: null, timestamp: null };
    }
  },

  async pullOrdersFromServer() {
    try {
      const isConnected = await networkUtils.isConnected();
      if (!isConnected) {
        console.log('No internet connection. Pull skipped.');
        return { success: false, error: 'No internet connection', pulled: 0 };
      }

      console.log('Pulling orders from:', `${API_BASE_URL}/api/orders/sync`);
      
      const response = await fetch(`${API_BASE_URL}/api/orders/sync`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Pull failed with status: ${response.status}`);
      }

      const result = await response.json();
      const remoteOrders = result.orders || [];
      
      console.log(`Pulled ${remoteOrders.length} orders from server`);

      if (remoteOrders.length === 0) {
        return { success: true, pulled: 0, updated: 0, created: 0 };
      }

      const ordersCollection = database.collections.get('orders');
      const orderItemsCollection = database.collections.get('order_items');
      let markedAsSynced = 0;
      let created = 0;

      await database.write(async () => {
        for (const remoteOrder of remoteOrders) {
          let existingOrders = [];

          // Try to match by orderNumber if available
          if (remoteOrder.orderNumber) {
            existingOrders = await ordersCollection
              .query(Q.where('order_number', remoteOrder.orderNumber))
              .fetch();
          } else if (remoteOrder.timestamp && remoteOrder.total) {
            // Fallback: match by timestamp and total if orderNumber is null
            const orderTimestamp = new Date(remoteOrder.timestamp).getTime();
            const allOrders = await ordersCollection.query().fetch();
            
            existingOrders = allOrders.filter(order => {
              const localTimestamp = new Date(order.timestamp).getTime();
              const timeDiff = Math.abs(localTimestamp - orderTimestamp);
              // Match if timestamp within 1 second and total matches
              return timeDiff < 1000 && Math.abs(order.total - remoteOrder.total) < 0.01;
            });
          }

          if (existingOrders.length > 0) {
            // Order exists locally - mark as synced if not already
            const localOrder = existingOrders[0];
            if (!localOrder.isSynced) {
              await localOrder.update(order => {
                order.isSynced = true;
                order.syncedAt = Date.now();
              });
              markedAsSynced++;
              console.log(`Marked order (timestamp: ${remoteOrder.timestamp}, total: ${remoteOrder.total}) as synced`);
            }
          }
        }
      });

      console.log(`Pull completed: ${markedAsSynced} orders marked as synced, ${created} new orders created`);
      
      // Save sync status after pull
      const pullResult = { success: true, pulled: remoteOrders.length, markedAsSynced, created };
      await AsyncStorage.setItem('orderSyncStatus', JSON.stringify({
        ...pullResult,
        lastSyncTimestamp: Date.now()
      }));
      
      return pullResult;
    } catch (error) {
      console.error('Error pulling orders from server:', error);
      return { success: false, error: error.message, pulled: 0, markedAsSynced: 0, created: 0 };
    }
  },

  async getSyncStats() {
    try {
      const ordersCollection = database.collections.get('orders');
      
      const [totalOrders, syncedOrders, unsyncedOrders] = await Promise.all([
        ordersCollection.query().fetchCount(),
        ordersCollection.query(Q.where('is_synced', true)).fetchCount(),
        ordersCollection.query(Q.where('is_synced', false)).fetchCount(),
      ]);

      const lastSync = await this.getLastSyncStatus();

      return {
        total: totalOrders,
        synced: syncedOrders,
        unsynced: unsyncedOrders,
        lastSyncTimestamp: lastSync.timestamp,
        lastSyncStatus: lastSync.status,
      };
    } catch (error) {
      console.error('Error getting sync stats:', error);
      return {
        total: 0,
        synced: 0,
        unsynced: 0,
        lastSyncTimestamp: null,
        lastSyncStatus: null,
      };
    }
  },

  async forceSyncAll() {
    try {
      const ordersCollection = database.collections.get('orders');
      const allOrders = await ordersCollection.query().fetch();

      await database.write(async () => {
        for (const order of allOrders) {
          await order.update(o => {
            o.isSynced = false;
            o.syncedAt = null;
          });
        }
      });

      return await this.syncOrdersToBackend();
    } catch (error) {
      console.error('Error forcing sync all:', error);
      throw error;
    }
  },

  startAutoSync(intervalMinutes = 5) {
    const intervalMs = intervalMinutes * 60 * 1000;
    let isSyncing = false;
    let networkDebounceTimer = null;
    
    const syncInterval = setInterval(async () => {
      if (isSyncing) return;
      
      const isConnected = await networkUtils.isConnected();
      if (isConnected) {
        console.log('Auto-sync triggered...');
        isSyncing = true;
        await this.syncOrdersToBackend();
        isSyncing = false;
      }
    }, intervalMs);

    const unsubscribe = networkUtils.subscribeToNetworkChanges(async (isConnected) => {
      if (isConnected && !isSyncing) {
        // Debounce network reconnection to avoid multiple triggers
        if (networkDebounceTimer) {
          clearTimeout(networkDebounceTimer);
        }
        
        networkDebounceTimer = setTimeout(async () => {
          console.log('Network connected. Triggering sync...');
          isSyncing = true;
          await this.syncOrdersToBackend();
          isSyncing = false;
          networkDebounceTimer = null;
        }, 2000); // Wait 2 seconds before syncing on network change
      }
    });

    return () => {
      clearInterval(syncInterval);
      if (networkDebounceTimer) {
        clearTimeout(networkDebounceTimer);
      }
      unsubscribe();
    };
  },
};
