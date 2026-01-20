import React, {useState} from 'react';
import {View, TextInput, StyleSheet, ScrollView, TouchableOpacity, Text, Modal} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors, typography, spacing, borderRadius, shadows, commonStyles} from '../theme/theme';

const MenuView = ({onCreateOrder, onError}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [quantities, setQuantities] = useState({});
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [customItems, setCustomItems] = useState([]);
  const [selectedWaiter, setSelectedWaiter] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [showWaiterModal, setShowWaiterModal] = useState(false);
  const [waiterSearchQuery, setWaiterSearchQuery] = useState('');

  const filters = [
    {id: 'all', label: 'All Items'},
    {id: 'breakfast', label: 'Breakfast'},
    {id: 'meals', label: 'Meals'},
    {id: 'custom', label: 'Custom'},
  ];

  const baseMenuItems = [
    {id: 1, name: 'Mixed Tea', price: 30, category: 'breakfast'},
    {id: 2, name: 'Andazi', price: 10, category: 'breakfast'},
    {id: 3, name: 'Beef Samosa', price: 30, category: 'breakfast'},
    {id: 4, name: 'Pilau (Small)', price: 100, category: 'meals'},
    {id: 5, name: 'Pilau (Large)', price: 150, category: 'meals'},
    {id: 6, name: 'Ugali Fry (Small)', price: 200, category: 'meals'},
    {id: 7, name: 'Ugali Fry (Large)', price: 250, category: 'meals'},
    {id: 8, name: 'Ugali Mix (Small)', price: 100, category: 'meals'},
    {id: 9, name: 'Ugali Mix (Large)', price: 150, category: 'meals'},
    {id: 10, name: 'Chapo Minji', price: 150, category: 'meals'},
    {id: 11, name: 'Matoke', price: 150, category: 'meals'},
  ];

  const menuItems = [...baseMenuItems, ...customItems];

  const getFilteredItems = () => {
    let items = menuItems;
    
    // Filter by category
    if (activeFilter !== 'all') {
      items = items.filter(item => item.category === activeFilter);
    }
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return items;
  };

  const filteredItems = getFilteredItems();

  const getQuantity = (itemId) => quantities[itemId] || 0;

  const increaseQuantity = (itemId) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const decreaseQuantity = (itemId) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 0) - 1, 0),
    }));
  };

  const waiters = ['Noorah', 'Valary', 'Jasmine', 'Pauline'];

  const getFilteredWaiters = () => {
    if (waiterSearchQuery.trim() === '') {
      return waiters;
    }
    return waiters.filter(waiter =>
      waiter.toLowerCase().includes(waiterSearchQuery.toLowerCase())
    );
  };

  const handleSelectWaiter = (waiter) => {
    setSelectedWaiter(waiter);
    setShowWaiterModal(false);
    setWaiterSearchQuery('');
  };

  const handleAddCustomItem = () => {
    if (customItemName.trim() && customItemPrice.trim()) {
      const newItem = {
        id: `custom-${Date.now()}`,
        name: customItemName,
        price: parseInt(customItemPrice),
        category: 'custom',
      };
      setCustomItems(prev => [...prev, newItem]);
      setCustomItemName('');
      setCustomItemPrice('');
    }
  };

  const handleCreateOrder = () => {
    const selectedItems = menuItems
      .filter(item => quantities[item.id] > 0)
      .map(item => ({
        ...item,
        quantity: quantities[item.id],
        totalPrice: item.price * quantities[item.id],
      }));

    if (selectedItems.length === 0) {
      if (onError) {
        onError('Please select at least one item');
      }
      return;
    }

    if (!selectedWaiter) {
      if (onError) {
        onError('Please select a waiter/waitress');
      }
      return;
    }

    const total = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);

    const order = {
      items: selectedItems,
      waiter: selectedWaiter,
      customerName: customerName || null,
      total: total,
      timestamp: new Date().toISOString(),
    };

    if (onCreateOrder) {
      onCreateOrder(order);
    }

    // Clear selections
    setQuantities({});
    setSelectedWaiter('');
    setCustomerName('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Card Container for Search and Filters */}
      <View style={styles.cardContainer}>
        {/* Search Field */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#95A5A6" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search menu items..."
            placeholderTextColor="#95A5A6"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Buttons */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
          style={styles.filtersContainer}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                activeFilter === filter.id && styles.activeFilterButton,
              ]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  activeFilter === filter.id && styles.activeFilterButtonText,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Menu Items Grid */}
      <View style={styles.menuGrid}>
        {filteredItems.map((item, index) => (
          <View 
            key={item.id} 
            style={[
              styles.menuCard,
              index % 2 === 0 && styles.menuCardLeft
            ]}
          >
            <View style={styles.menuCardHeader}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>{item.price} Ksh</Text>
            </View>
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                style={styles.quantityButton} 
                onPress={() => decreaseQuantity(item.id)}
              >
                <Icon name="remove" size={18} color="#24222c" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{getQuantity(item.id)}</Text>
              <TouchableOpacity 
                style={styles.quantityButton} 
                onPress={() => increaseQuantity(item.id)}
              >
                <Icon name="add" size={18} color="#24222c" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Custom Item Section */}
      <View style={styles.customItemSection}>
        <Text style={styles.customItemTitle}>Add Custom Item</Text>
        
        <TextInput
          style={styles.customInput}
          placeholder="Item Name"
          placeholderTextColor="#95A5A6"
          value={customItemName}
          onChangeText={setCustomItemName}
        />
        
        <TextInput
          style={styles.customInput}
          placeholder="Price (Ksh)"
          placeholderTextColor="#95A5A6"
          keyboardType="numeric"
          value={customItemPrice}
          onChangeText={setCustomItemPrice}
        />
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddCustomItem}
        >
          <Icon name="add-circle" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add to Order</Text>
        </TouchableOpacity>
      </View>

      {/* Selected Items Section */}
      <View style={styles.selectedItemsSection}>
        <Text style={styles.selectedItemsTitle}>Selected Items</Text>
        
        {Object.keys(quantities).filter(id => quantities[id] > 0).length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No items selected yet</Text>
          </View>
        ) : (
          <View style={styles.selectedItemsList}>
            {menuItems
              .filter(item => quantities[item.id] > 0)
              .map(item => (
                <View key={item.id} style={styles.selectedItem}>
                  <View style={styles.selectedItemInfo}>
                    <Text style={styles.selectedItemName}>{item.name}</Text>
                    <Text style={styles.selectedItemQuantity}>x{quantities[item.id]}</Text>
                  </View>
                  <Text style={styles.selectedItemPrice}>
                    {item.price * quantities[item.id]} Ksh
                  </Text>
                </View>
              ))}
          </View>
        )}
        
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>
            Total: {menuItems.reduce((total, item) => {
              return total + (item.price * (quantities[item.id] || 0));
            }, 0)} Ksh
          </Text>
        </View>
      </View>

      {/* Order Creation Section */}
      <View style={styles.orderCreationSection}>
        <Text style={styles.orderCreationTitle}>Complete Order</Text>
        
        {/* Waiter Selection */}
        <Text style={styles.inputLabel}>Waiter/Waitress</Text>
        <TouchableOpacity 
          style={styles.waiterDropdown}
          onPress={() => setShowWaiterModal(true)}
        >
          <Text style={[styles.waiterDropdownText, !selectedWaiter && styles.placeholderText]}>
            {selectedWaiter || 'Select Waiter/Waitress'}
          </Text>
          <Icon name="arrow-drop-down" size={24} color="#fb3441" />
        </TouchableOpacity>

        {/* Customer Name Field */}
        <Text style={styles.inputLabel}>Customer Name (Optional)</Text>
        <TextInput
          style={styles.customerInput}
          placeholder="Enter customer name"
          placeholderTextColor="#95A5A6"
          value={customerName}
          onChangeText={setCustomerName}
        />

        {/* Create Order Button */}
        <TouchableOpacity 
          style={styles.createOrderButton}
          onPress={handleCreateOrder}
        >
          <Icon name="receipt-long" size={20} color="#FFFFFF" />
          <Text style={styles.createOrderButtonText}>Create Order</Text>
        </TouchableOpacity>
      </View>

      {/* Waiter Selection Modal */}
      <Modal
        visible={showWaiterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWaiterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Waiter/Waitress</Text>
              <TouchableOpacity onPress={() => setShowWaiterModal(false)}>
                <Icon name="close" size={24} color="#fb3441" />
              </TouchableOpacity>
            </View>

            {/* Search Field */}
            <View style={styles.modalSearchContainer}>
              <Icon name="search" size={20} color="#95A5A6" style={styles.modalSearchIcon} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search waiter..."
                placeholderTextColor="#95A5A6"
                value={waiterSearchQuery}
                onChangeText={setWaiterSearchQuery}
              />
            </View>

            {/* Waiter List with Radio Buttons */}
            <ScrollView style={styles.waiterList}>
              {getFilteredWaiters().map((waiter) => (
                <TouchableOpacity
                  key={waiter}
                  style={styles.waiterModalOption}
                  onPress={() => handleSelectWaiter(waiter)}
                >
                  <View style={styles.radioButton}>
                    {selectedWaiter === waiter && (
                      <View style={styles.radioButtonSelected} />
                    )}
                  </View>
                  <Text style={styles.waiterModalOptionText}>{waiter}</Text>
                </TouchableOpacity>
              ))}
              {getFilteredWaiters().length === 0 && (
                <Text style={styles.noResultsText}>No waiters found</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8EEF5',
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  filtersContainer: {
    maxHeight: 50,
    marginBottom: 16,
  },
  filtersScrollContent: {
    paddingRight: 16,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E8EEF5',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  menuCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuCardLeft: {
    marginRight: '4%',
  },
  menuCardHeader: {
    marginBottom: 12,
  },
  itemName: {
    fontSize: 19,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8EEF5',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    minWidth: 30,
    textAlign: 'center',
  },
  customItemSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  customItemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  customInput: {
    backgroundColor: '#E8EEF5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  selectedItemsSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedItemsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  emptyStateContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#95A5A6',
  },
  selectedItemsList: {
    marginBottom: 16,
  },
  selectedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  selectedItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedItemName: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  selectedItemQuantity: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    marginRight: 16,
  },
  selectedItemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  totalContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  orderCreationSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderCreationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  waiterDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8EEF5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  waiterDropdownText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  placeholderText: {
    color: '#95A5A6',
  },
  customerInput: {
    backgroundColor: '#E8EEF5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
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
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8EEF5',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  modalSearchIcon: {
    marginRight: 8,
  },
  modalSearchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
  },
  waiterList: {
    maxHeight: 300,
  },
  waiterModalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  waiterModalOptionText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  noResultsText: {
    fontSize: 15,
    color: '#95A5A6',
    textAlign: 'center',
    paddingVertical: 20,
  },
  createOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  createOrderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export default MenuView;
