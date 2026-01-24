import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 4,
  tables: [
    tableSchema({
      name: 'menu_items',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'price', type: 'number' },
        { name: 'category', type: 'string' },
        { name: 'is_available', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'orders',
      columns: [
        { name: 'order_number', type: 'string', isIndexed: true },
        { name: 'waiter', type: 'string' },
        { name: 'customer_name', type: 'string', isOptional: true },
        { name: 'total', type: 'number' },
        { name: 'status', type: 'string' }, // 'pending', 'paid', 'unpaid'
        { name: 'timestamp', type: 'number' },
        { name: 'is_synced', type: 'boolean' },
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'order_items',
      columns: [
        { name: 'order_id', type: 'string', isIndexed: true },
        { name: 'item_name', type: 'string' },
        { name: 'price', type: 'number' },
        { name: 'quantity', type: 'number' },
        { name: 'total_price', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'waiters',
      columns: [
        { name: 'name', type: 'string', isIndexed: true },
        { name: 'is_active', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'expenses',
      columns: [
        { name: 'category', type: 'string', isIndexed: true },
        { name: 'amount', type: 'number' },
        { name: 'description', type: 'string' },
        { name: 'timestamp', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
