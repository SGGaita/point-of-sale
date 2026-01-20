import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors, typography, spacing, borderRadius} from '../theme/theme';

const ExpensesView = ({expenses = [], onAddExpense}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food Supplies');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const categories = [
    'Food Supplies',
    'Utilities',
    'Staff Costs',
    'Maintenance',
    'Other',
  ];

  const handleAddExpense = () => {
    if (!description.trim() || !amount.trim()) {
      return;
    }

    const expenseData = {
      id: Date.now(),
      description: description.trim(),
      amount: parseFloat(amount),
      category,
      timestamp: Date.now(),
    };

    onAddExpense && onAddExpense(expenseData);
    
    // Reset form
    setDescription('');
    setAmount('');
    setCategory('Food Supplies');
  };

  const getFilteredExpenses = () => {
    if (searchQuery.trim() === '') {
      return expenses;
    }

    const query = searchQuery.toLowerCase();
    return expenses.filter(expense =>
      expense.description.toLowerCase().includes(query) ||
      expense.category.toLowerCase().includes(query)
    );
  };

  const getTodayExpenses = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return expenses.filter(expense => {
      const expenseDate = new Date(expense.timestamp);
      expenseDate.setHours(0, 0, 0, 0);
      return expenseDate.getTime() === today.getTime();
    });
  };

  const getTodayTotal = () => {
    const todayExpenses = getTodayExpenses();
    return todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'});
  };

  const filteredExpenses = getFilteredExpenses();
  const todayExpenses = getTodayExpenses();
  const todayTotal = getTodayTotal();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Search Field */}
        <View style={styles.searchCard}>
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color={colors.placeholder} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search expenses..."
              placeholderTextColor={colors.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Add Expense Form */}
        <View style={styles.formCard}>
          <Text style={styles.inputLabel}>Expense Description</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g., Groceries, Utilities, etc."
            placeholderTextColor={colors.placeholder}
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.inputLabel}>Amount (Ksh)</Text>
          <TextInput
            style={styles.input}
            placeholder="Amount"
            placeholderTextColor={colors.placeholder}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />

          <Text style={styles.inputLabel}>Category</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <Text style={styles.dropdownText}>{category}</Text>
            <Icon name={showCategoryDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          {showCategoryDropdown && (
            <View style={styles.dropdownList}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategoryDropdown(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, category === cat && styles.selectedDropdownItem]}>
                    {cat}
                  </Text>
                  {category === cat && <Icon name="check" size={20} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddExpense}
          >
            <Icon name="add-circle" size={20} color={colors.white} />
            <Text style={styles.addButtonText}>Add Expense</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Expenses Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Today's Expenses</Text>
            <Text style={styles.summaryTotal}>Total: {todayTotal} Ksh</Text>
          </View>

          {todayExpenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="receipt-long" size={48} color={colors.border} />
              <Text style={styles.emptyStateText}>No expenses recorded today</Text>
            </View>
          ) : (
            todayExpenses.map((expense) => (
              <View key={expense.id} style={styles.expenseItem}>
                <View style={styles.expenseLeft}>
                  <Text style={styles.expenseDescription}>{expense.description}</Text>
                  <Text style={styles.expenseCategory}>
                    {expense.category} • {formatDate(expense.timestamp)} {formatTime(expense.timestamp)}
                  </Text>
                </View>
                <Text style={styles.expenseAmount}>{expense.amount} Ksh</Text>
              </View>
            ))
          )}
        </View>

        {/* All Expenses (if searching or want to show history) */}
        {searchQuery.trim() !== '' && (
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>Search Results ({filteredExpenses.length})</Text>
            {filteredExpenses.length === 0 ? (
              <Text style={styles.noResultsText}>No expenses found</Text>
            ) : (
              filteredExpenses.map((expense) => (
                <View key={expense.id} style={styles.expenseItem}>
                  <View style={styles.expenseLeft}>
                    <Text style={styles.expenseDescription}>{expense.description}</Text>
                    <Text style={styles.expenseCategory}>
                      {expense.category} • {formatDate(expense.timestamp)} {formatTime(expense.timestamp)}
                    </Text>
                  </View>
                  <Text style={styles.expenseAmount}>{expense.amount} Ksh</Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  searchCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
  },
  formCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  dropdownList: {
    backgroundColor: colors.white,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dropdownItemText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  selectedDropdownItem: {
    color: colors.primary,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 16,
    gap: 8,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 12,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  expenseLeft: {
    flex: 1,
    marginRight: 12,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  expenseCategory: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  historyCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  noResultsText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default ExpensesView;
