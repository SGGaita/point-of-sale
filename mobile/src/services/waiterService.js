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
   * Waiters are managed only on web Staff (position = Waiter).
   * Mobile may pull/sync the roster, but must not create waiters.
   */
  async createWaiter() {
    throw new Error(
      'Waiters can only be added from the web Staff page (position: Waiter).',
    );
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
