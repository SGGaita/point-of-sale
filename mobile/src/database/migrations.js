import { schemaMigrations, addColumns, createTable } from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        // Add orders table
        createTable({
          name: 'orders',
          columns: [
            { name: 'order_number', type: 'string', isIndexed: true },
            { name: 'waiter', type: 'string' },
            { name: 'customer_name', type: 'string', isOptional: true },
            { name: 'total', type: 'number' },
            { name: 'status', type: 'string' },
            { name: 'timestamp', type: 'number' },
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        // Add order_items table
        createTable({
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
        // Add waiters table
        createTable({
          name: 'waiters',
          columns: [
            { name: 'name', type: 'string', isIndexed: true },
            { name: 'is_active', type: 'boolean' },
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' },
          ],
        }),
      ],
    },
    {
      toVersion: 3,
      steps: [
        // Add expenses table
        createTable({
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
    },
  ],
});
