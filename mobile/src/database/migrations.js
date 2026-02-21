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
    {
      toVersion: 4,
      steps: [
        // Add sync tracking fields to orders table
        addColumns({
          table: 'orders',
          columns: [
            { name: 'is_synced', type: 'boolean' },
            { name: 'synced_at', type: 'number', isOptional: true },
          ],
        }),
      ],
    },
    {
      toVersion: 5,
      steps: [
        // Add expense templates table
        createTable({
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
        // Add new fields to expenses table
        addColumns({
          table: 'expenses',
          columns: [
            { name: 'template_id', type: 'string', isOptional: true, isIndexed: true },
            { name: 'quantity', type: 'number', isOptional: true },
            { name: 'unit_cost', type: 'number', isOptional: true },
            { name: 'is_synced', type: 'boolean' },
            { name: 'synced_at', type: 'number', isOptional: true },
          ],
        }),
      ],
    },
    {
      toVersion: 6,
      steps: [
        // Add sync tracking fields to menu_items table
        addColumns({
          table: 'menu_items',
          columns: [
            { name: 'server_id', type: 'string', isOptional: true },
            { name: 'is_synced', type: 'boolean' },
            { name: 'synced_at', type: 'number', isOptional: true },
          ],
        }),
      ],
    },
  ],
});
