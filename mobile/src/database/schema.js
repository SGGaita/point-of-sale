import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 6,
  tables: [
    tableSchema({
      name: 'menu_items',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'price', type: 'number' },
        { name: 'category', type: 'string' },
        { name: 'is_available', type: 'boolean' },
        { name: 'server_id', type: 'string', isOptional: true },
        { name: 'is_synced', type: 'boolean' },
        { name: 'synced_at', type: 'number', isOptional: true },
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
        { name: 'template_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'category', type: 'string', isIndexed: true },
        { name: 'amount', type: 'number' },
        { name: 'quantity', type: 'number', isOptional: true },
        { name: 'unit_cost', type: 'number', isOptional: true },
        { name: 'description', type: 'string' },
        { name: 'timestamp', type: 'number' },
        { name: 'is_synced', type: 'boolean' },
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'expense_templates',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'category', type: 'string', isIndexed: true },
        { name: 'unit', type: 'string' },
        { name: 'is_active', type: 'boolean' },
        { name: 'sort_order', type: 'number' },
        { name: 'is_synced', type: 'boolean' },
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
