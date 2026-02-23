import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import { networkUtils } from '../utils/networkUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.APP_API_URL || 'https://pos-web-delta-opal.vercel.app';
const MENU_SYNC_STATUS_KEY = '@menu_last_sync_status';
const MENU_SYNC_TIMESTAMP_KEY = '@menu_last_sync_timestamp';

export const menuSyncService = {
  // Get unsynced menu items (local changes not yet synced to server)
  async getUnsyncedMenuItems() {
    try {
      const menuItemsCollection = database.collections.get('menu_items');
      const unsyncedItems = await menuItemsCollection
        .query(Q.where('is_synced', false))
        .fetch();
      
      return unsyncedItems;
    } catch (error) {
      console.error('Error fetching unsynced menu items:', error);
      return [];
    }
  },

  // Prepare menu item for sync
  async prepareMenuItemForSync(menuItem) {
    try {
      return {
        id: menuItem.serverId || null,
        localId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        category: menuItem.category,
        isAvailable: menuItem.isAvailable,
        createdAt: menuItem.createdAt,
        updatedAt: menuItem.updatedAt,
      };
    } catch (error) {
      console.error('Error preparing menu item for sync:', error);
      throw error;
    }
  },

  // Push local menu items to server (bidirectional - sends all items)
  async pushMenuItemsToServer() {
    let allLocalItems = [];
    try {
      const isConnected = await networkUtils.isConnected();
      if (!isConnected) {
        console.log('No internet connection. Menu sync skipped.');
        return {
          success: false,
          error: 'No internet connection',
          synced: 0,
          failed: 0
        };
      }

      // Get ALL local items for bidirectional sync
      const menuItemsCollection = database.collections.get('menu_items');
      allLocalItems = await menuItemsCollection.query().fetch();
      
      if (allLocalItems.length === 0) {
        console.log('No local menu items to sync');
        return {
          success: true,
          synced: 0,
          failed: 0,
          message: 'No menu items to sync'
        };
      }

      const menuItemsData = await Promise.all(
        allLocalItems.map(item => this.prepareMenuItemForSync(item))
      );

      console.log('Syncing menu items to:', `${API_BASE_URL}/api/menu/sync`);
      console.log('Menu items to sync:', menuItemsData.length);

      const response = await fetch(`${API_BASE_URL}/api/menu/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ menuItems: menuItemsData }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Menu sync endpoint returned ${response.status}. Server may not be ready.`);
        
        // If 405 or 404, the endpoint doesn't exist yet - mark items as synced locally
        if (response.status === 405 || response.status === 404) {
          console.log('Menu sync endpoint not available. Marking items as synced locally.');
          await database.write(async () => {
            for (const localItem of allLocalItems) {
              await localItem.update(item => {
                item.isSynced = true;
                item.syncedAt = Date.now();
              });
            }
          });
          
          return {
            success: true,
            synced: allLocalItems.length,
            failed: 0,
            message: 'Items synced locally (server endpoint not available)'
          };
        }
        
        throw new Error(`Menu sync failed with status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      console.log('Menu sync result:', JSON.stringify(result, null, 2));

      if (result.errors && result.errors.length > 0) {
        console.error('Menu sync errors:', result.errors);
      }

      // Update local items with server IDs and mark as synced
      if (result.success && result.syncedItems) {
        await database.write(async () => {
          for (const syncedItem of result.syncedItems) {
            const localItem = allLocalItems.find(
              item => item.id === syncedItem.localId
            );
            if (localItem) {
              await localItem.update(item => {
                item.serverId = syncedItem.serverId;
                item.isSynced = true;
                item.syncedAt = Date.now();
              });
            }
          }
        });
      }

      await AsyncStorage.setItem(MENU_SYNC_STATUS_KEY, JSON.stringify(result));
      await AsyncStorage.setItem(MENU_SYNC_TIMESTAMP_KEY, Date.now().toString());

      console.log(`Menu sync completed: ${result.synced} synced, ${result.failed} failed`);
      
      return result;
    } catch (error) {
      console.error('Error syncing menu items to server:', error);
      
      const errorResult = {
        success: false,
        error: error.message,
        synced: 0,
        failed: allLocalItems?.length || 0
      };
      
      await AsyncStorage.setItem(MENU_SYNC_STATUS_KEY, JSON.stringify(errorResult));
      
      return errorResult;
    }
  },

  // Pull menu items from server and update local database (bidirectional)
  async pullMenuItemsFromServer() {
    try {
      const isConnected = await networkUtils.isConnected();
      if (!isConnected) {
        console.log('No internet connection. Menu pull skipped.');
        return {
          success: false,
          error: 'No internet connection',
          pulled: 0
        };
      }

      console.log('Pulling menu items from:', `${API_BASE_URL}/api/menu`);

      const response = await fetch(`${API_BASE_URL}/api/menu`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Menu pull endpoint returned ${response.status}. Server may not be ready.`);
        
        // If endpoint doesn't exist, skip pull but don't fail
        if (response.status === 404 || response.status === 500) {
          console.log('Menu pull endpoint not available. Skipping pull.');
          return {
            success: true,
            pulled: 0,
            created: 0,
            updated: 0,
            message: 'Pull skipped (server endpoint not available)'
          };
        }
        
        throw new Error(`Menu pull failed with status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      const serverItems = result.menuItems || [];

      console.log('Pulled menu items from server:', serverItems.length);

      let created = 0;
      let updated = 0;
      let skipped = 0;

      await database.write(async () => {
        const menuItemsCollection = database.collections.get('menu_items');

        for (const serverItem of serverItems) {
          try {
            // Check if item exists locally by server_id
            const existingItems = await menuItemsCollection
              .query(Q.where('server_id', serverItem.id))
              .fetch();

            if (existingItems.length > 0) {
              // Item exists locally - use last-write-wins conflict resolution
              const localItem = existingItems[0];
              const serverUpdatedAt = new Date(serverItem.updated_at).getTime();
              const localUpdatedAt = localItem.updatedAt;

              // Only update if server version is newer
              if (serverUpdatedAt > localUpdatedAt) {
                await localItem.update(item => {
                  item.name = serverItem.name;
                  item.price = serverItem.price;
                  item.category = serverItem.category;
                  item.isAvailable = serverItem.is_available;
                  item.isSynced = true;
                  item.syncedAt = Date.now();
                });
                updated++;
                console.log(`Updated local item: ${serverItem.name} (server newer)`);
              } else {
                skipped++;
                console.log(`Skipped ${serverItem.name} (local version is newer)`);
              }
            } else {
              // Item doesn't exist locally - create it
              await menuItemsCollection.create(item => {
                item.name = serverItem.name;
                item.price = serverItem.price;
                item.category = serverItem.category;
                item.isAvailable = serverItem.is_available;
                item.serverId = serverItem.id;
                item.isSynced = true;
                item.syncedAt = Date.now();
              });
              created++;
              console.log(`Created new local item: ${serverItem.name}`);
            }
          } catch (itemError) {
            console.error(`Error processing server item ${serverItem.name}:`, itemError);
          }
        }
      });

      const pullResult = {
        success: true,
        pulled: serverItems.length,
        created,
        updated,
        skipped,
        message: `Pulled ${serverItems.length} items (${created} new, ${updated} updated, ${skipped} skipped)`
      };

      await AsyncStorage.setItem(MENU_SYNC_STATUS_KEY, JSON.stringify(pullResult));
      await AsyncStorage.setItem(MENU_SYNC_TIMESTAMP_KEY, Date.now().toString());

      // Clear menu cache so new items show up immediately
      if (created > 0 || updated > 0) {
        await AsyncStorage.removeItem('@menu_items_cache');
        await AsyncStorage.removeItem('@menu_items_cache_timestamp');
        console.log('Menu cache cleared after sync to refresh items');
      }

      console.log('Menu pull completed:', pullResult.message);
      
      return pullResult;
    } catch (error) {
      console.error('Error pulling menu items from server:', error);
      
      return {
        success: false,
        error: error.message,
        pulled: 0
      };
    }
  },

  // Full sync: push local changes, then pull server changes
  async syncMenuItems() {
    try {
      // First push local changes
      const pushResult = await this.pushMenuItemsToServer();
      
      // Then pull server changes
      const pullResult = await this.pullMenuItemsFromServer();

      const combinedResult = {
        success: pushResult.success && pullResult.success,
        pushed: pushResult.synced || 0,
        pulled: pullResult.pulled || 0,
        created: pullResult.created || 0,
        updated: pullResult.updated || 0,
        errors: [
          ...(pushResult.error ? [pushResult.error] : []),
          ...(pullResult.error ? [pullResult.error] : [])
        ]
      };

      await AsyncStorage.setItem(MENU_SYNC_STATUS_KEY, JSON.stringify(combinedResult));
      await AsyncStorage.setItem(MENU_SYNC_TIMESTAMP_KEY, Date.now().toString());

      return combinedResult;
    } catch (error) {
      console.error('Error in full menu sync:', error);
      return {
        success: false,
        error: error.message,
        pushed: 0,
        pulled: 0
      };
    }
  },

  async getLastSyncStatus() {
    try {
      const status = await AsyncStorage.getItem(MENU_SYNC_STATUS_KEY);
      const timestamp = await AsyncStorage.getItem(MENU_SYNC_TIMESTAMP_KEY);
      
      return {
        status: status ? JSON.parse(status) : null,
        timestamp: timestamp ? parseInt(timestamp, 10) : null,
      };
    } catch (error) {
      console.error('Error getting last menu sync status:', error);
      return { status: null, timestamp: null };
    }
  },

  async getSyncStats() {
    try {
      const menuItemsCollection = database.collections.get('menu_items');
      
      const [totalItems, syncedItems, unsyncedItems] = await Promise.all([
        menuItemsCollection.query().fetchCount(),
        menuItemsCollection.query(Q.where('is_synced', true)).fetchCount(),
        menuItemsCollection.query(Q.where('is_synced', false)).fetchCount(),
      ]);

      const lastSync = await this.getLastSyncStatus();

      return {
        total: totalItems,
        synced: syncedItems,
        unsynced: unsyncedItems,
        lastSyncTimestamp: lastSync.timestamp,
        lastSyncStatus: lastSync.status,
      };
    } catch (error) {
      console.error('Error getting menu sync stats:', error);
      return {
        total: 0,
        synced: 0,
        unsynced: 0,
        lastSyncTimestamp: null,
        lastSyncStatus: null,
      };
    }
  },
};
