import { database } from '../database';
import MenuItem from '../database/models/MenuItem';

export const menuService = {
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
