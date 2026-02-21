import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors, typography, spacing, borderRadius} from '../theme/theme';
import {expenseTemplateService} from '../services/expenseTemplateService';
import {waiterService} from '../services/waiterService';

const ExpensesViewNew = ({expenses = [], onAddExpense, onUpdateExpense, onDeleteExpense, onShowSnackbar}) => {
  const [templates, setTemplates] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [templateInputs, setTemplateInputs] = useState({});
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [customDescription, setCustomDescription] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [customCategory, setCustomCategory] = useState('Food Supplies');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Food Supplies');
  const [currentDate, setCurrentDate] = useState(new Date().toDateString());
  const autoSaveTimers = React.useRef({}).current;

  const categories = [
    'Food Supplies',
    'Utilities',
    'Staff Costs',
  ];

  useEffect(() => {
    loadTemplates();
    loadStaff();
  }, []);

  // Check for day change and clear inputs
  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date().toDateString();
      if (today !== currentDate) {
        // Day has changed, clear all inputs
        setTemplateInputs({});
        setCurrentDate(today);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [currentDate]);

  const loadTemplates = async () => {
    try {
      await expenseTemplateService.seedDefaultTemplates();
      const allTemplates = await expenseTemplateService.getAllTemplates();
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadStaff = async () => {
    try {
      await waiterService.seedWaiters();
      const waiters = await waiterService.getAllWaiters();
      setStaffList(waiters);
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  const autoSaveExpense = async (templateId, input) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    let amount, quantity, unitCost;

    if (template.unit === 'Ksh') {
      // Single field: just amount
      amount = parseFloat(input.amount);
      if (isNaN(amount) || amount <= 0) return;
      quantity = null;
      unitCost = null;
    } else {
      // Two fields: quantity × unitCost
      quantity = parseFloat(input.quantity);
      unitCost = parseFloat(input.unitCost);
      if (isNaN(quantity) || isNaN(unitCost) || quantity <= 0 || unitCost <= 0) return;
      amount = quantity * unitCost;
    }

    const expenseData = {
      templateId: template.id,
      category: template.category,
      description: template.name,
      quantity,
      unitCost,
      amount,
      timestamp: Date.now(),
    };

    onAddExpense && onAddExpense(expenseData);
    
    // Don't clear inputs - keep them populated until day ends

    onShowSnackbar && onShowSnackbar(`${template.name} added: ${amount} Ksh`, 'success');
  };

  const handleTemplateInput = (templateId, field, value) => {
    setTemplateInputs(prev => {
      const updated = {
        ...prev,
        [templateId]: {
          ...prev[templateId],
          [field]: value,
        },
      };
      
      // Auto-save when both fields are filled
      const input = updated[templateId];
      if (input.quantity && input.unitCost) {
        // Debounce the auto-save
        if (autoSaveTimers[templateId]) {
          clearTimeout(autoSaveTimers[templateId]);
        }
        
        autoSaveTimers[templateId] = setTimeout(() => {
          autoSaveExpense(templateId, input);
        }, 1000);
      }
      
      return updated;
    });
  };

  const handleAddTemplateExpense = async (template) => {
    const input = templateInputs[template.id];
    
    if (!input || !input.quantity || !input.unitCost) {
      onShowSnackbar && onShowSnackbar('Please enter both quantity and unit cost', 'error');
      return;
    }

    const quantity = parseFloat(input.quantity);
    const unitCost = parseFloat(input.unitCost);
    
    if (isNaN(quantity) || isNaN(unitCost) || quantity <= 0 || unitCost <= 0) {
      onShowSnackbar && onShowSnackbar('Please enter valid numbers', 'error');
      return;
    }

    const amount = quantity * unitCost;

    const expenseData = {
      templateId: template.id,
      category: template.category,
      description: template.name,
      quantity,
      unitCost,
      amount,
      timestamp: Date.now(),
    };

    onAddExpense && onAddExpense(expenseData);
    
    // Clear inputs for this template
    setTemplateInputs(prev => ({
      ...prev,
      [template.id]: { quantity: '', unitCost: '' },
    }));

    onShowSnackbar && onShowSnackbar(`${template.name} added: ${amount} Ksh`, 'success');
  };

  const handleAddCustomExpense = () => {
    if (!customDescription.trim() || !customAmount.trim()) {
      onShowSnackbar && onShowSnackbar('Please enter description and amount', 'error');
      return;
    }

    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      onShowSnackbar && onShowSnackbar('Please enter a valid amount', 'error');
      return;
    }

    const expenseData = {
      templateId: null,
      category: customCategory,
      description: customDescription.trim(),
      amount,
      quantity: null,
      unitCost: null,
      timestamp: Date.now(),
    };

    onAddExpense && onAddExpense(expenseData);
    
    // Reset form
    setCustomDescription('');
    setCustomAmount('');
    setCustomCategory('Other');
    setShowAddCustomModal(false);

    onShowSnackbar && onShowSnackbar('Custom expense added successfully', 'success');
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

  const getCategoryTotal = (category) => {
    const todayExpenses = getTodayExpenses();
    return todayExpenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'});
  };

  const getCategoryTemplates = () => {
    if (activeCategory === 'Staff Costs') {
      // Return staff list as dynamic templates
      return staffList.map((staffName, index) => ({
        id: `staff_${staffName}`,
        name: staffName,
        category: 'Staff Costs',
        unit: 'Ksh',
        sortOrder: index,
      }));
    }
    return templates.filter(t => t.category === activeCategory);
  };

  const todayExpenses = getTodayExpenses();
  const todayTotal = getTodayTotal();
  const categoryTemplates = getCategoryTemplates();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Category Summary Cards */}
        <View style={styles.categorySummaryContainer}>
          <View style={styles.categorySummaryCard}>
            <Text style={styles.categorySummaryLabel}>Food Supplies</Text>
            <Text style={styles.categorySummaryAmount}>{getCategoryTotal('Food Supplies')} Ksh</Text>
          </View>
          <View style={styles.categorySummaryCard}>
            <Text style={styles.categorySummaryLabel}>Utilities</Text>
            <Text style={styles.categorySummaryAmount}>{getCategoryTotal('Utilities')} Ksh</Text>
          </View>
          <View style={styles.categorySummaryCard}>
            <Text style={styles.categorySummaryLabel}>Staff Costs</Text>
            <Text style={styles.categorySummaryAmount}>{getCategoryTotal('Staff Costs')} Ksh</Text>
          </View>
        </View>

        {/* Today's Total */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Today's Expenses</Text>
          <Text style={styles.totalAmount}>{todayTotal} Ksh</Text>
        </View>

        {/* Category Tabs */}
        <View style={styles.categoryTabs}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryTab, activeCategory === cat && styles.activeCategoryTab]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.categoryTabText, activeCategory === cat && styles.activeCategoryTabText]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Expense Templates */}
        <View style={styles.templatesCard}>
          <Text style={styles.sectionTitle}>{activeCategory}</Text>
          
          {categoryTemplates.length === 0 ? (
            <Text style={styles.emptyText}>No templates for this category</Text>
          ) : (
            categoryTemplates.map((template) => {
              const input = templateInputs[template.id];
              let calculatedTotal = 0;
              
              if (template.unit === 'Ksh' && input?.amount) {
                const amount = parseFloat(input.amount);
                if (!isNaN(amount) && amount > 0) {
                  calculatedTotal = amount;
                }
              } else if (input?.quantity && input?.unitCost) {
                const qty = parseFloat(input.quantity);
                const cost = parseFloat(input.unitCost);
                if (!isNaN(qty) && !isNaN(cost) && qty > 0 && cost > 0) {
                  calculatedTotal = qty * cost;
                }
              }
              
              return (
                <View key={template.id} style={styles.templateRow}>
                  <View style={styles.templateLeft}>
                    <Text style={styles.templateName}>{template.name}</Text>
                  </View>
                  <View style={styles.templateInputs}>
                    {template.unit === 'Ksh' ? (
                      // Single amount field for Ksh items
                      <TextInput
                        style={styles.templateInputWide}
                        placeholder="Amount (Ksh)"
                        placeholderTextColor={colors.placeholder}
                        value={input?.amount || ''}
                        onChangeText={(value) => handleTemplateInput(template.id, 'amount', value)}
                        keyboardType="numeric"
                      />
                    ) : (
                      // Two fields for Qty items
                      <>
                        <TextInput
                          style={styles.templateInput}
                          placeholder={template.unit}
                          placeholderTextColor={colors.placeholder}
                          value={input?.quantity || ''}
                          onChangeText={(value) => handleTemplateInput(template.id, 'quantity', value)}
                          keyboardType="numeric"
                        />
                        <TextInput
                          style={styles.templateInput}
                          placeholder="Ksh"
                          placeholderTextColor={colors.placeholder}
                          value={input?.unitCost || ''}
                          onChangeText={(value) => handleTemplateInput(template.id, 'unitCost', value)}
                          keyboardType="numeric"
                        />
                      </>
                    )}
                    {calculatedTotal > 0 && (
                      <View style={styles.totalDisplay}>
                        <Text style={styles.totalText}>{calculatedTotal} Ksh</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Add Custom Expense Button */}
        <TouchableOpacity
          style={styles.addCustomButton}
          onPress={() => setShowAddCustomModal(true)}
        >
          <Icon name="add-circle" size={20} color={colors.white} />
          <Text style={styles.addCustomButtonText}>Add Additional Expense</Text>
        </TouchableOpacity>

        {/* Category Summary Cards */}
        <View style={styles.categorySummaryContainer}>
          <View style={styles.categorySummaryCard}>
            <Text style={styles.categorySummaryLabel}>Food Supplies</Text>
            <Text style={styles.categorySummaryAmount}>{getCategoryTotal('Food Supplies')} Ksh</Text>
          </View>
          <View style={styles.categorySummaryCard}>
            <Text style={styles.categorySummaryLabel}>Utilities</Text>
            <Text style={styles.categorySummaryAmount}>{getCategoryTotal('Utilities')} Ksh</Text>
          </View>
          <View style={styles.categorySummaryCard}>
            <Text style={styles.categorySummaryLabel}>Staff Costs</Text>
            <Text style={styles.categorySummaryAmount}>{getCategoryTotal('Staff Costs')} Ksh</Text>
          </View>
        </View>

        {/* Today's Expenses List */}
        <View style={styles.expensesListCard}>
          <Text style={styles.sectionTitle}>Today's Expenses</Text>
          
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
                  <Text style={styles.expenseDetails}>
                    {expense.category}
                    {expense.quantity && ` • ${expense.quantity} × ${expense.unitCost} Ksh`}
                  </Text>
                  <Text style={styles.expenseTime}>
                    {formatTime(expense.timestamp)}
                  </Text>
                </View>
                <View style={styles.expenseRight}>
                  <Text style={styles.expenseAmount}>{expense.amount} Ksh</Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => onDeleteExpense && onDeleteExpense(expense.id)}
                  >
                    <Icon name="delete" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Custom Expense Modal */}
      <Modal
        visible={showAddCustomModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddCustomModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Additional Expense</Text>
              <TouchableOpacity onPress={() => setShowAddCustomModal(false)}>
                <Icon name="close" size={24} color={colors.danger} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter expense description"
                placeholderTextColor={colors.placeholder}
                value={customDescription}
                onChangeText={setCustomDescription}
                autoFocus={true}
              />

              <Text style={[styles.inputLabel, {marginTop: 16}]}>Amount (Ksh)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter amount"
                placeholderTextColor={colors.placeholder}
                value={customAmount}
                onChangeText={setCustomAmount}
                keyboardType="numeric"
              />

              <Text style={[styles.inputLabel, {marginTop: 16}]}>Category</Text>
              <TouchableOpacity
                style={styles.modalDropdown}
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <Text style={styles.modalDropdownText}>{customCategory}</Text>
                <Icon name={showCategoryDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color={colors.textSecondary} />
              </TouchableOpacity>

              {showCategoryDropdown && (
                <View style={styles.modalDropdownList}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={styles.modalDropdownItem}
                      onPress={() => {
                        setCustomCategory(cat);
                        setShowCategoryDropdown(false);
                      }}
                    >
                      <Text style={[styles.modalDropdownItemText, customCategory === cat && styles.selectedDropdownItem]}>
                        {cat}
                      </Text>
                      {customCategory === cat && <Icon name="check" size={20} color={colors.primary} />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddCustomModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.addButton,
                  (!customDescription.trim() || !customAmount.trim()) && styles.addButtonDisabled
                ]}
                onPress={handleAddCustomExpense}
                disabled={!customDescription.trim() || !customAmount.trim()}
              >
                <Text style={styles.addButtonText}>Add Expense</Text>
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
    padding: 16,
  },
  totalCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: colors.white,
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
  },
  categoryTabs: {
    marginBottom: 16,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.inputBackground,
    marginRight: 8,
  },
  activeCategoryTab: {
    backgroundColor: colors.primary,
  },
  categoryTabText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeCategoryTabText: {
    color: colors.white,
  },
  templatesCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  templateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  templateLeft: {
    flex: 1,
  },
  templateName: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  templateInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  templateInput: {
    width: 60,
    backgroundColor: colors.inputBackground,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  templateInputWide: {
    width: 130,
    backgroundColor: colors.inputBackground,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  totalDisplay: {
    backgroundColor: colors.success + '15',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.success + '40',
  },
  totalText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.success,
  },
  addTemplateButton: {
    backgroundColor: colors.success,
    borderRadius: 6,
    padding: 6,
  },
  addCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    marginBottom: 16,
    gap: 8,
  },
  addCustomButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  categorySummaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  categorySummaryCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  categorySummaryLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 6,
    textAlign: 'center',
  },
  categorySummaryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  expensesListCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  expenseLeft: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  expenseDetails: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  expenseTime: {
    fontSize: 11,
    color: colors.placeholder,
  },
  expenseRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.danger,
    marginBottom: 8,
  },
  deleteButton: {
    padding: 4,
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
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalBody: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
  },
  modalDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  modalDropdownText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  modalDropdownList: {
    backgroundColor: colors.white,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalDropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalDropdownItemText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  selectedDropdownItem: {
    color: colors.primary,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
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
  addButton: {
    backgroundColor: colors.primary,
  },
  addButtonDisabled: {
    backgroundColor: colors.border,
    opacity: 0.5,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ExpensesViewNew;
