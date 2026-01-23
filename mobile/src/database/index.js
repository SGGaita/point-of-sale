import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import schema from './schema';
import migrations from './migrations';
import MenuItem from './models/MenuItem';
import Order from './models/Order';
import OrderItem from './models/OrderItem';
import Waiter from './models/Waiter';
import Expense from './models/Expense';

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  jsi: true,
  onSetUpError: error => {
    console.error('Database setup error:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [MenuItem, Order, OrderItem, Waiter, Expense],
});
