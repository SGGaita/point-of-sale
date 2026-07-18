import {database} from '../database';
import {Q} from '@nozbe/watermelondb';
import {networkUtils} from '../utils/networkUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL =
  process.env.APP_API_URL || 'https://pos-web-delta-opal.vercel.app';
const WAITER_SYNC_STATUS_KEY = '@waiter_last_sync_status';
const WAITER_SYNC_TIMESTAMP_KEY = '@waiter_last_sync_timestamp';

export const waiterSyncService = {
  /**
   * Pull waiter roster from web Staff (position = Waiter).
   * Web is the source of truth: upsert by server_id, match legacy locals by name,
   * and deactivate locals that are no longer active on the server.
   */
  async pullWaitersFromServer() {
    try {
      const isConnected = await networkUtils.isConnected();
      if (!isConnected) {
        return {
          success: false,
          error: 'No internet connection',
          pulled: 0,
        };
      }

      const response = await fetch(`${API_BASE_URL}/api/staff/sync`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Waiter sync failed with status: ${response.status} - ${errorText}`,
        );
      }

      const result = await response.json();
      const serverWaiters = result.waiters || [];

      let created = 0;
      let updated = 0;
      let deactivated = 0;

      await database.write(async () => {
        const waitersCollection = database.collections.get('waiters');
        const localWaiters = await waitersCollection.query().fetch();
        const seenServerIds = new Set();

        for (const serverWaiter of serverWaiters) {
          seenServerIds.add(serverWaiter.id);

          const byServerId = localWaiters.filter(
            w => w.serverId === serverWaiter.id,
          );
          const byName =
            byServerId.length === 0
              ? localWaiters.filter(
                  w =>
                    !w.serverId &&
                    w.name.trim().toLowerCase() ===
                      serverWaiter.name.trim().toLowerCase(),
                )
              : [];

          const existing = byServerId[0] || byName[0];

          if (existing) {
            await existing.update(w => {
              w.name = serverWaiter.name;
              w.serverId = serverWaiter.id;
              w.isActive = serverWaiter.isActive !== false;
            });
            updated++;
          } else {
            await waitersCollection.create(w => {
              w.name = serverWaiter.name;
              w.serverId = serverWaiter.id;
              w.isActive = serverWaiter.isActive !== false;
            });
            created++;
          }
        }

        // Soft-deactivate local waiters that are no longer on the server roster
        for (const local of localWaiters) {
          if (local.serverId && !seenServerIds.has(local.serverId) && local.isActive) {
            await local.update(w => {
              w.isActive = false;
            });
            deactivated++;
          } else if (
            !local.serverId &&
            local.isActive &&
            !serverWaiters.some(
              s =>
                s.name.trim().toLowerCase() === local.name.trim().toLowerCase(),
            )
          ) {
            // Legacy seed / offline-only rows not on web roster
            await local.update(w => {
              w.isActive = false;
            });
            deactivated++;
          }
        }
      });

      const pullResult = {
        success: true,
        pulled: serverWaiters.length,
        created,
        updated,
        deactivated,
        message: `Pulled ${serverWaiters.length} waiters (${created} new, ${updated} updated, ${deactivated} deactivated)`,
      };

      await AsyncStorage.setItem(
        WAITER_SYNC_STATUS_KEY,
        JSON.stringify(pullResult),
      );
      await AsyncStorage.setItem(
        WAITER_SYNC_TIMESTAMP_KEY,
        Date.now().toString(),
      );

      return pullResult;
    } catch (error) {
      console.error('Error pulling waiters from server:', error);
      return {
        success: false,
        error: error.message,
        pulled: 0,
      };
    }
  },

  async getLastSyncStatus() {
    try {
      const status = await AsyncStorage.getItem(WAITER_SYNC_STATUS_KEY);
      const timestamp = await AsyncStorage.getItem(WAITER_SYNC_TIMESTAMP_KEY);
      return {
        status: status ? JSON.parse(status) : null,
        timestamp: timestamp ? parseInt(timestamp, 10) : null,
      };
    } catch (error) {
      return {status: null, timestamp: null};
    }
  },
};
