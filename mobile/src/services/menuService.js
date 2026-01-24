import { database } from '../database';
import MenuItem from '../database/models/MenuItem';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MENU_CACHE_KEY = '@menu_items_cache';
const MENU_CACHE_TIMESTAMP_KEY = '@menu_items_cache_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const menuService = {
  // Check if cache is valid
  async isCacheValid() {
    try {
      const timestamp = await AsyncStorage.getItem(MENU_CACHE_TIMESTAMP_KEY);
      if (!timestamp) return false;
      
      const cacheAge = Date.now() - parseInt(timestamp, 10);
      return cacheAge < CACHE_DURATION;
    } catch (error) {
      console.error('Error checking cache validity:', error);
      return false;
    }
  },

  // Get menu items from cache
  async getMenuFromCache() {
    try {
      const cachedData = await AsyncStorage.getItem(MENU_CACHE_KEY);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      return null;
    } catch (error) {
      console.error('Error getting menu from cache:', error);
      return null;
    }
  },

  // Save menu items to cache
  async saveMenuToCache(menuItems) {
    try {
      const serializedItems = menuItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
        isAvailable: item.isAvailable,
      }));
      
      await AsyncStorage.setItem(MENU_CACHE_KEY, JSON.stringify(serializedItems));
      await AsyncStorage.setItem(MENU_CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error saving menu to cache:', error);
    }
  },

  // Clear menu cache
  async clearMenuCache() {
    try {
      await AsyncStorage.removeItem(MENU_CACHE_KEY);
      await AsyncStorage.removeItem(MENU_CACHE_TIMESTAMP_KEY);
    } catch (error) {
      console.error('Error clearing menu cache:', error);
    }
  },
  // Get all menu items
  async getAllMenuItems() {
    const menuItemsCollection = database.collections.get('menu_items');
    return await menuItemsCollection.query().fetch();
  },

  // Get menu items by category
  async getMenuItemsByCategory(category) {
    const menuItemsCollection = database.collections.get('menu_items');
    return await menuItemsCollection
      .query()
      .where('category', category)
      .fetch();
  },

  // Get available menu items
  async getAvailableMenuItems() {
    const menuItemsCollection = database.collections.get('menu_items');
    return await menuItemsCollection
      .query()
      .where('is_available', true)
      .fetch();
  },

  // Create a new menu item
  async createMenuItem(itemData) {
    const menuItemsCollection = database.collections.get('menu_items');
    return await database.write(async () => {
      return await menuItemsCollection.create(menuItem => {
        menuItem.name = itemData.name;
        menuItem.price = itemData.price;
        menuItem.category = itemData.category;
        menuItem.isAvailable = itemData.isAvailable !== undefined ? itemData.isAvailable : true;
      });
    });
  },

  // Update a menu item
  async updateMenuItem(menuItem, updates) {
    return await database.write(async () => {
      return await menuItem.update(item => {
        if (updates.name !== undefined) item.name = updates.name;
        if (updates.price !== undefined) item.price = updates.price;
        if (updates.category !== undefined) item.category = updates.category;
        if (updates.isAvailable !== undefined) item.isAvailable = updates.isAvailable;
      });
    });
  },

  // Delete a menu item
  async deleteMenuItem(menuItem) {
    return await database.write(async () => {
      await menuItem.markAsDeleted();
    });
  },

  // Seed initial menu data
  async seedMenuData() {
    const menuItemsCollection = database.collections.get('menu_items');
    const existingItems = await menuItemsCollection.query().fetch();
    
    // Only seed if database is empty
    if (existingItems.length > 0) {
      return;
    }

    const initialMenu = [
      // Breakfast
      { name: 'Mixed Tea', price: 30, category: 'Breakfast' },
      { name: 'Andazi', price: 10, category: 'Breakfast' },
      { name: 'Beef Samosa', price: 30, category: 'Breakfast' },
            
      // Meals
      { name: 'Pilau (Small)', price: 100, category: 'Meals' },
      { name: 'Pilau (Large)', price: 150, category: 'Meals' },
      { name: 'Ugali Fry (Small)', price: 200, category: 'Meals' },
      { name: 'Ugali Fry (Large)', price: 250, category: 'Meals' },
      { name: 'Ugali Mix (Small)', price: 100, category: 'Meals' },
      { name: 'Ugali Mix (Large)', price: 150, category: 'Meals' },
      { name: 'Chapo Minji', price: 150, category: 'Meals' },
      { name: 'Matoke', price: 150, category: 'Meals' },
    ];

    await database.write(async () => {
      for (const item of initialMenu) {
        await menuItemsCollection.create(menuItem => {
          menuItem.name = item.name;
          menuItem.price = item.price;
          menuItem.category = item.category;
          menuItem.isAvailable = true;
        });
      }
    });

    console.log('Menu data seeded successfully');
  },

  // Clear all menu items (for testing)
  async clearAllMenuItems() {
    const menuItemsCollection = database.collections.get('menu_items');
    const allItems = await menuItemsCollection.query().fetch();
    
    await database.write(async () => {
      for (const item of allItems) {
        await item.markAsDeleted();
      }
    });
  },
};
