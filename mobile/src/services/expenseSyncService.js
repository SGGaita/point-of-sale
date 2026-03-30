import { database } from '../database';
import { Q } from '@nozbe/watermelondb';

const API_BASE_URL = process.env.APP_API_URL || 'https://pos-web-delta-opal.vercel.app';

export const expenseSyncService = {
  async syncExpensesToBackend() {
    try {
      const expensesCollection = database.collections.get('expenses');
      const unsyncedExpenses = await expensesCollection
        .query(Q.where('is_synced', false))
        .fetch();

      if (unsyncedExpenses.length === 0) {
        return { success: true, synced: 0, failed: 0 };
      }

      const expensesToSync = unsyncedExpenses.map(expense => ({
        id: expense.id,
        templateId: expense.templateId,
        category: expense.category,
        amount: expense.amount,
        quantity: expense.quantity,
        unitCost: expense.unitCost,
        description: expense.description,
        timestamp: expense.timestamp,
        createdAt: expense.createdAt,
      }));

      const apiUrl = `${API_BASE_URL}/api/expenses/sync`;
      console.log('Syncing expenses to:', apiUrl);
      console.log('Expenses to sync:', expensesToSync.length);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expenses: expensesToSync }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sync failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Expense sync result:', result);

      if (result.success && result.synced > 0) {
        await database.write(async () => {
          for (const expense of unsyncedExpenses) {
            await expense.update(e => {
              e.isSynced = true;
              e.syncedAt = Date.now();
            });
          }
        });
      }

      return {
        success: true,
        synced: result.synced,
        failed: result.failed,
        errors: result.errors,
      };
    } catch (error) {
      console.error('Error syncing expenses:', error);
      return {
        success: false,
        error: error.message,
        synced: 0,
        failed: unsyncedExpenses?.length || 0,
      };
    }
  },

  async syncTemplatesToBackend() {
    try {
      const templatesCollection = database.collections.get('expense_templates');
      const unsyncedTemplates = await templatesCollection
        .query(Q.where('is_synced', false))
        .fetch();

      if (unsyncedTemplates.length === 0) {
        return { success: true, synced: 0, failed: 0 };
      }

      const templatesToSync = unsyncedTemplates.map(template => ({
        id: template.id,
        name: template.name,
        category: template.category,
        unit: template.unit,
        isActive: template.isActive,
        sortOrder: template.sortOrder,
        createdAt: template.createdAt,
      }));

      const apiUrl = `${API_BASE_URL}/api/expense-templates/sync`;
      console.log('Syncing templates to:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templates: templatesToSync }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Template sync failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Template sync result:', result);

      if (result.success && result.synced > 0) {
        await database.write(async () => {
          for (const template of unsyncedTemplates) {
            await template.update(t => {
              t.isSynced = true;
              t.syncedAt = Date.now();
            });
          }
        });
      }

      return {
        success: true,
        synced: result.synced,
        failed: result.failed,
        errors: result.errors,
      };
    } catch (error) {
      console.error('Error syncing templates:', error);
      return {
        success: false,
        error: error.message,
        synced: 0,
        failed: unsyncedTemplates?.length || 0,
      };
    }
  },

  async syncAll() {
    const templateResult = await this.syncTemplatesToBackend();
    const expenseResult = await this.syncExpensesToBackend();

    return {
      templates: templateResult,
      expenses: expenseResult,
    };
  },
};
