import { database } from '../database';
import { Q } from '@nozbe/watermelondb';

export const expenseService = {
  // Get all expenses
  async getAllExpenses() {
    const expensesCollection = database.collections.get('expenses');
    const expenses = await expensesCollection
      .query(Q.sortBy('timestamp', Q.desc))
      .fetch();
    
    return expenses.map(expense => ({
      id: expense.id,
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      timestamp: expense.timestamp,
    }));
  },

  // Get expenses by category
  async getExpensesByCategory(category) {
    const expensesCollection = database.collections.get('expenses');
    const expenses = await expensesCollection
      .query(
        Q.where('category', category),
        Q.sortBy('timestamp', Q.desc)
      )
      .fetch();
    
    return expenses.map(expense => ({
      id: expense.id,
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      timestamp: expense.timestamp,
    }));
  },

  // Get expenses by date range
  async getExpensesByDateRange(startDate, endDate) {
    const expensesCollection = database.collections.get('expenses');
    const expenses = await expensesCollection
      .query(
        Q.where('timestamp', Q.gte(startDate)),
        Q.where('timestamp', Q.lte(endDate)),
        Q.sortBy('timestamp', Q.desc)
      )
      .fetch();
    
    return expenses.map(expense => ({
      id: expense.id,
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      timestamp: expense.timestamp,
    }));
  },

  // Create a new expense
  async createExpense(expenseData) {
    const expensesCollection = database.collections.get('expenses');
    
    let createdExpense;
    await database.write(async () => {
      createdExpense = await expensesCollection.create(expense => {
        expense.category = expenseData.category;
        expense.amount = expenseData.amount;
        expense.description = expenseData.description || '';
        expense.timestamp = expenseData.timestamp || Date.now();
      });
    });
    
    return {
      id: createdExpense.id,
      category: createdExpense.category,
      amount: createdExpense.amount,
      description: createdExpense.description,
      timestamp: createdExpense.timestamp,
    };
  },

  // Update an expense
  async updateExpense(updatedExpense) {
    const expensesCollection = database.collections.get('expenses');
    const expense = await expensesCollection.find(updatedExpense.id);
    
    await database.write(async () => {
      await expense.update(e => {
        e.category = updatedExpense.category;
        e.amount = updatedExpense.amount;
        e.description = updatedExpense.description;
      });
    });
    
    return expense;
  },

  // Delete an expense
  async deleteExpense(expenseId) {
    const expensesCollection = database.collections.get('expenses');
    const expense = await expensesCollection.find(expenseId);
    
    await database.write(async () => {
      await expense.markAsDeleted();
    });
  },

  // Delete all expenses (for reset functionality)
  async deleteAllExpenses() {
    const expensesCollection = database.collections.get('expenses');
    const allExpenses = await expensesCollection.query().fetch();
    
    await database.write(async () => {
      for (const expense of allExpenses) {
        await expense.markAsDeleted();
      }
    });
  },

  // Get total expenses
  async getTotalExpenses() {
    const expenses = await this.getAllExpenses();
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  },

  // Get total expenses by category
  async getTotalExpensesByCategory(category) {
    const expenses = await this.getExpensesByCategory(category);
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  },
};
