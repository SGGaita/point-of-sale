import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors, typography, spacing, borderRadius} from '../theme/theme';

const ExpensesView = ({expenses = [], onAddExpense, onUpdateExpense, onDeleteExpense}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food Supplies');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('Food Supplies');
  const [showEditCategoryDropdown, setShowEditCategoryDropdown] = useState(false);

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

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setEditDescription(expense.description);
    setEditAmount(expense.amount.toString());
    setEditCategory(expense.category);
    setShowEditModal(true);
  };

  const handleUpdateExpense = () => {
    if (!editDescription.trim() || !editAmount.trim()) {
      return;
    }

    const updatedExpense = {
      ...editingExpense,
      description: editDescription.trim(),
      amount: parseFloat(editAmount),
      category: editCategory,
    };

    onUpdateExpense && onUpdateExpense(updatedExpense);
    
    // Close modal and reset
    setShowEditModal(false);
    setEditingExpense(null);
    setEditDescription('');
    setEditAmount('');
    setEditCategory('Food Supplies');
  };

  const handleDeleteExpense = (expense) => {
    onDeleteExpense && onDeleteExpense(expense.id);
  };

  const hasEditChanged = () => {
    if (!editingExpense) return false;
    return (
      editDescription.trim() !== editingExpense.description ||
      editAmount.trim() !== editingExpense.amount.toString() ||
      editCategory !== editingExpense.category
    );
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
            style={[
              styles.addButton,
              (!description.trim() || !amount.trim()) && styles.addButtonDisabled
            ]}
            onPress={handleAddExpense}
            disabled={!description.trim() || !amount.trim()}
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
                <View style={styles.expenseRight}>
                  <Text style={styles.expenseAmount}>{expense.amount} Ksh</Text>
                  <View style={styles.expenseActions}>
                    <TouchableOpacity
                      style={styles.editIconButton}
                      onPress={() => handleEditExpense(expense)}
                    >
                      <Icon name="edit" size={18} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteIconButton}
                      onPress={() => handleDeleteExpense(expense)}
                    >
                      <Icon name="delete" size={18} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
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
                  <View style={styles.expenseRight}>
                    <Text style={styles.expenseAmount}>{expense.amount} Ksh</Text>
                    <View style={styles.expenseActions}>
                      <TouchableOpacity
                        style={styles.editIconButton}
                        onPress={() => handleEditExpense(expense)}
                      >
                        <Icon name="edit" size={18} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteIconButton}
                        onPress={() => handleDeleteExpense(expense)}
                      >
                        <Icon name="delete" size={18} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Edit Expense Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Expense</Text>
              <TouchableOpacity onPress={() => {
                setShowEditModal(false);
                setEditingExpense(null);
                setEditDescription('');
                setEditAmount('');
                setEditCategory('Food Supplies');
              }}>
                <Icon name="close" size={24} color={colors.danger} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Expense Description</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter description"
                placeholderTextColor={colors.placeholder}
                value={editDescription}
                onChangeText={setEditDescription}
                autoFocus={true}
              />

              <Text style={[styles.inputLabel, {marginTop: 16}]}>Amount (Ksh)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter amount"
                placeholderTextColor={colors.placeholder}
                value={editAmount}
                onChangeText={setEditAmount}
                keyboardType="numeric"
              />

              <Text style={[styles.inputLabel, {marginTop: 16}]}>Category</Text>
              <TouchableOpacity
                style={styles.modalDropdown}
                onPress={() => setShowEditCategoryDropdown(!showEditCategoryDropdown)}
              >
                <Text style={styles.modalDropdownText}>{editCategory}</Text>
                <Icon name={showEditCategoryDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color={colors.textSecondary} />
              </TouchableOpacity>

              {showEditCategoryDropdown && (
                <View style={styles.modalDropdownList}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={styles.modalDropdownItem}
                      onPress={() => {
                        setEditCategory(cat);
                        setShowEditCategoryDropdown(false);
                      }}
                    >
                      <Text style={[styles.modalDropdownItemText, editCategory === cat && styles.selectedDropdownItem]}>
                        {cat}
                      </Text>
                      {editCategory === cat && <Icon name="check" size={20} color={colors.primary} />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowEditModal(false);
                  setEditingExpense(null);
                  setEditDescription('');
                  setEditAmount('');
                  setEditCategory('Food Supplies');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.updateButton,
                  (!editDescription.trim() || !editAmount.trim() || !hasEditChanged()) && styles.updateButtonDisabled
                ]}
                onPress={handleUpdateExpense}
                disabled={!editDescription.trim() || !editAmount.trim() || !hasEditChanged()}
              >
                <Text style={styles.updateButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addButtonDisabled: {
    backgroundColor: 'rgba(251, 52, 65, 0.4)',
    opacity: 0.6,
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
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 6,
  },
  expenseActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editIconButton: {
    padding: 4,
  },
  deleteIconButton: {
    padding: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    width: '85%',
    maxHeight: '70%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  modalInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalDropdownText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  modalDropdownList: {
    backgroundColor: colors.white,
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 200,
  },
  modalDropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalDropdownItemText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.inputBackground,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  updateButton: {
    backgroundColor: colors.primary,
  },
  updateButtonDisabled: {
    backgroundColor: 'rgba(251, 52, 65, 0.4)',
    opacity: 0.6,
  },
  updateButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ExpensesView;
