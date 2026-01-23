import { database } from '../database';
import { Q } from '@nozbe/watermelondb';

export const waiterService = {
  // Get all waiters
  async getAllWaiters() {
    const waitersCollection = database.collections.get('waiters');
    const waiters = await waitersCollection
      .query(Q.where('is_active', true))
      .fetch();
    
    return waiters.map(waiter => waiter.name);
  },

  // Create a new waiter
  async createWaiter(name) {
    const waitersCollection = database.collections.get('waiters');
    
    // Check if waiter already exists
    const existingWaiter = await waitersCollection
      .query(Q.where('name', name))
      .fetch();
    
    if (existingWaiter.length > 0) {
      throw new Error('Waiter already exists');
    }
    
    let createdWaiter;
    await database.write(async () => {
      createdWaiter = await waitersCollection.create(waiter => {
        waiter.name = name;
        waiter.isActive = true;
      });
    });
    
    return createdWaiter.name;
  },

  // Delete a waiter (soft delete by marking as inactive)
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

  // Seed initial waiters
  async seedWaiters() {
    const waitersCollection = database.collections.get('waiters');
    const existingWaiters = await waitersCollection.query().fetch();
    
    if (existingWaiters.length > 0) {
      return;
    }
    
    const defaultWaiters = ['Noorah', 'Valary', 'Jasmine', 'Pauline'];
    
    await database.write(async () => {
      for (const name of defaultWaiters) {
        await waitersCollection.create(waiter => {
          waiter.name = name;
          waiter.isActive = true;
        });
      }
    });
  },
};
