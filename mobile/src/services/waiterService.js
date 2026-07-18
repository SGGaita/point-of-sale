import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import { waiterSyncService } from './waiterSyncService';

export const waiterService = {
  // Get all active waiters (local cache of web Staff roster)
  async getAllWaiters() {
    const waitersCollection = database.collections.get('waiters');
    const waiters = await waitersCollection
      .query(Q.where('is_active', true))
      .fetch();

    return waiters
      .map(waiter => waiter.name)
      .sort((a, b) => a.localeCompare(b));
  },

  /**
   * Create a waiter via the web Staff API (source of truth), then pull.
   * Offline local-only creates are not allowed so rosters stay aligned.
   */
  async createWaiter(name) {
    return waiterSyncService.createWaiterOnServer(name);
  },

  // Soft-delete locally (web soft-delete + next pull is preferred for permanent removal)
  async deleteWaiter(waiterName) {
    const waitersCollection = database.collections.get('waiters');
    const waiter = await waitersCollection
      .query(Q.where('name', waiterName))
      .fetch();

    if (waiter.length > 0) {
      await database.write(async () => {
        await waiter[0].update(w => {
          w.isActive = false;
        });
      });
    }
  },

  /**
   * Initialize roster from web when online.
   * No hardcoded seed — empty until first successful pull or web Staff add.
   */
  async seedWaiters() {
    try {
      const result = await waiterSyncService.pullWaitersFromServer();
      if (result.success) {
        console.log('Waiter roster synced from web Staff:', result.message);
      } else {
        console.log('Waiter roster pull skipped:', result.error);
      }
    } catch (error) {
      console.log('Waiter roster init skipped:', error.message);
    }
  },
};
