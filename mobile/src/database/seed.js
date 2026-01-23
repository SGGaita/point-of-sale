import { database } from './index';

export const seedMenuItems = async () => {
  const menuItemsCollection = database.get('menu_items');
  
  // Check if menu items already exist
  const existingItems = await menuItemsCollection.query().fetch();
  
  if (existingItems.length > 0) {
    console.log('Menu items already seeded');
    return;
  }

  const defaultMenuItems = [
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
    for (const item of defaultMenuItems) {
      await menuItemsCollection.create(menuItem => {
        menuItem.name = item.name;
        menuItem.price = item.price;
        menuItem.category = item.category;
        menuItem.isCustom = false;
      });
    }
  });

  console.log('Menu items seeded successfully');
};
