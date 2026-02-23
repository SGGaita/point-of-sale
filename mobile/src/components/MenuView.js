import React, {useState, useEffect} from 'react';
import {View, TextInput, StyleSheet, ScrollView, TouchableOpacity, Text, Modal, ActivityIndicator} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors, typography, spacing, borderRadius, shadows, commonStyles} from '../theme/theme';
import {menuService} from '../services/menuService';
import {menuSyncService} from '../services/menuSyncService';
import {waiterService} from '../services/waiterService';
import {database} from '../database';
import {Q} from '@nozbe/watermelondb';
import {networkUtils} from '../utils/networkUtils';

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
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({visible: false, message: '', type: 'success'});
  const [waiters, setWaiters] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemPrice, setEditItemPrice] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncStats, setSyncStats] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const filters = [
    {id: 'all', label: 'All Items'},
    {id: 'Breakfast', label: 'Breakfast'},
    {id: 'Meals', label: 'Meals'},
    {id: 'Custom', label: 'Custom'},
  ];

  // Load menu items and waiters from database
  useEffect(() => {
    loadMenuItems();
    loadWaiters();
    loadSyncStats();
    // Auto-sync on app load
    handleSync();

    // Subscribe to network changes to sync when internet becomes available
    const unsubscribe = networkUtils.subscribeToNetworkChanges(async (isConnected) => {
      if (isConnected) {
        console.log('Internet connection restored. Checking for unsynced items...');
        const stats = await menuSyncService.getSyncStats();
        if (stats.unsynced > 0) {
          console.log(`Found ${stats.unsynced} unsynced items. Triggering sync...`);
          handleSync(true);
        }
      }
    });

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const loadMenuItems = async () => {
    try {
      // Try to load from cache first
      const isCacheValid = await menuService.isCacheValid();
      
      if (isCacheValid) {
        const cachedItems = await menuService.getMenuFromCache();
        if (cachedItems && cachedItems.length > 0) {
          setMenuItems(cachedItems);
          setLoading(false);
          return;
        }
      }
      
      // If no valid cache, load from database
      const menuItemsCollection = database.collections.get('menu_items');
      const items = await menuItemsCollection.query().fetch();
      
      const formattedItems = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
      }));
      
      // Save to cache for next time
      await menuService.saveMenuToCache(items);
      
      setMenuItems(formattedItems);
      setLoading(false);
    } catch (error) {
      console.error('Error loading menu items:', error);
      setLoading(false);
    }
  };

  const loadWaiters = async () => {
    try {
      const dbWaiters = await waiterService.getAllWaiters();
      setWaiters(dbWaiters);
    } catch (error) {
      console.error('Error loading waiters:', error);
    }
  };

  const loadSyncStats = async () => {
    try {
      const stats = await menuSyncService.getSyncStats();
      setSyncStats(stats);
      if (stats.lastSyncTimestamp) {
        setLastSyncTime(new Date(stats.lastSyncTimestamp));
      }
    } catch (error) {
      console.error('Error loading sync stats:', error);
    }
  };

  const handleSync = async (silent = false) => {
    // Check internet connection before attempting sync
    const isConnected = await networkUtils.isConnected();
    if (!isConnected) {
      if (!silent) {
        showSnackbar('No internet connection. Changes will sync when online.', 'info');
      }
      return;
    }

    setSyncing(true);
    try {
      const result = await menuSyncService.syncMenuItems();
      await loadSyncStats();
      await loadMenuItems();
      
      if (!silent && result.success) {
        const message = [];
        if (result.pushed > 0) message.push(`${result.pushed} pushed`);
        if (result.pulled > 0) message.push(`${result.pulled} pulled`);
        if (message.length > 0) {
          showSnackbar(`Menu synced: ${message.join(', ')}`, 'success');
        }
      } else if (!silent && !result.success) {
        showSnackbar(
          result.error || 'Failed to sync menu',
          'error'
        );
      }
    } catch (error) {
      if (!silent) {
        showSnackbar(
          error.message || 'An error occurred while syncing',
          'error'
        );
      }
    } finally {
      setSyncing(false);
    }
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never synced';
    
    const now = new Date();
    const diffMs = now - lastSyncTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getFilteredItems = () => {
    let items = [...menuItems, ...customItems];
    
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

  const showSnackbar = (message, type = 'success') => {
    setSnackbar({visible: true, message, type});
    setTimeout(() => {
      setSnackbar({visible: false, message: '', type: 'success'});
    }, 3000);
  };

  const handleAddCustomItem = async () => {
    if (customItemName.trim() && customItemPrice.trim()) {
      try {
        // Persist to database
        await menuService.createMenuItem({
          name: customItemName.trim(),
          price: parseInt(customItemPrice),
          category: 'Custom',
          isAvailable: true,
        });
        
        // Clear cache to ensure fresh data
        await menuService.clearMenuCache();
        
        // Reload menu items from database
        await loadMenuItems();
        
        // Clear form
        setCustomItemName('');
        setCustomItemPrice('');
        
        // Show success message
        showSnackbar('Item added to menu successfully', 'success');
        
        // Auto-sync after adding item
        handleSync(true);
      } catch (error) {
        console.error('Error adding custom item:', error);
        showSnackbar('Failed to add item to menu', 'error');
      }
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setEditItemName(item.name);
    setEditItemPrice(item.price.toString());
    setShowEditModal(true);
  };

  const hasItemChanged = () => {
    if (!editingItem) return false;
    return (
      editItemName.trim() !== editingItem.name ||
      editItemPrice.trim() !== editingItem.price.toString()
    );
  };

  const handleUpdateItem = async () => {
    if (editItemName.trim() && editItemPrice.trim() && editingItem) {
      try {
        // Get the actual menu item from database
        const menuItemsCollection = database.collections.get('menu_items');
        const menuItem = await menuItemsCollection.find(editingItem.id);
        
        // Update in database
        await menuService.updateMenuItem(menuItem, {
          name: editItemName.trim(),
          price: parseInt(editItemPrice),
        });
        
        // Clear cache to ensure fresh data
        await menuService.clearMenuCache();
        
        // Reload menu items
        await loadMenuItems();
        
        // Close modal and clear state
        setShowEditModal(false);
        setEditingItem(null);
        setEditItemName('');
        setEditItemPrice('');
        
        showSnackbar('Item updated successfully', 'success');
        
        // Auto-sync after updating item
        handleSync(true);
      } catch (error) {
        console.error('Error updating item:', error);
        showSnackbar('Failed to update item', 'error');
      }
    }
  };

  const handleDeleteItem = async (item) => {
    try {
      // Get the actual menu item from database
      const menuItemsCollection = database.collections.get('menu_items');
      const menuItem = await menuItemsCollection.find(item.id);
      
      // Delete from database
      await menuService.deleteMenuItem(menuItem);
      
      // Clear cache to ensure fresh data
      await menuService.clearMenuCache();
      
      // Reload menu items
      await loadMenuItems();
      
      showSnackbar('Item deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting item:', error);
      showSnackbar('Failed to delete item', 'error');
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
      {/* Sync Status Indicator (Minimal) */}
      {syncing && (
        <View style={styles.syncIndicator}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={styles.syncIndicatorText}>Syncing menu...</Text>
        </View>
      )}

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
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading menu...</Text>
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="restaurant" size={64} color={colors.border} />
            <Text style={styles.emptyText}>No items found</Text>
          </View>
        ) : (
          filteredItems.map((item, index) => (
          <View 
            key={item.id} 
            style={[
              styles.menuCard,
              index % 2 === 0 && styles.menuCardLeft
            ]}
          >
            <View style={styles.menuCardHeader}>
              <View style={styles.itemNameRow}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.category === 'Custom' && activeFilter === 'Custom' && (
                  <View style={styles.itemActions}>
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => handleEditItem(item)}
                    >
                      <Icon name="edit" size={16} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteItem(item)}
                    >
                      <Icon name="delete" size={16} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
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
        ))
        )}
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
          style={[
            styles.addButton,
            (!customItemName.trim() || !customItemPrice.trim()) && styles.addButtonDisabled
          ]}
          onPress={handleAddCustomItem}
          disabled={!customItemName.trim() || !customItemPrice.trim()}
        >
          <Icon name="add-circle" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add to Menu</Text>
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
          style={[
            styles.createOrderButton,
            !selectedWaiter && styles.createOrderButtonDisabled
          ]}
          onPress={handleCreateOrder}
          disabled={!selectedWaiter}
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

      {/* Edit Item Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Menu Item</Text>
              <TouchableOpacity onPress={() => {
                setShowEditModal(false);
                setEditingItem(null);
                setEditItemName('');
                setEditItemPrice('');
              }}>
                <Icon name="close" size={24} color="#fb3441" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Item Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter item name"
                placeholderTextColor="#95A5A6"
                value={editItemName}
                onChangeText={setEditItemName}
                autoFocus={true}
              />

              <Text style={[styles.inputLabel, {marginTop: 16}]}>Price (Ksh)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter price"
                placeholderTextColor="#95A5A6"
                value={editItemPrice}
                onChangeText={setEditItemPrice}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                  setEditItemName('');
                  setEditItemPrice('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.updateButton,
                  (!editItemName.trim() || !editItemPrice.trim() || !hasItemChanged()) && styles.updateButtonDisabled
                ]}
                onPress={handleUpdateItem}
                disabled={!editItemName.trim() || !editItemPrice.trim() || !hasItemChanged()}
              >
                <Text style={styles.updateButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Snackbar */}
      {snackbar.visible && (
        <View style={[
          styles.snackbar,
          snackbar.type === 'error' && styles.snackbarError
        ]}>
          <Icon 
            name={snackbar.type === 'success' ? 'check-circle' : 'error'} 
            size={20} 
            color="#FFFFFF" 
          />
          <Text style={styles.snackbarText}>{snackbar.message}</Text>
        </View>
      )}
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
  syncIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    ...shadows.small,
  },
  syncIndicatorText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
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
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 19,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
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
  addButtonDisabled: {
    backgroundColor: 'rgba(251, 52, 65, 0.4)',
    opacity: 0.6,
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
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
  createOrderButtonDisabled: {
    backgroundColor: 'rgba(251, 52, 65, 0.4)',
    opacity: 0.6,
  },
  createOrderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  snackbar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    gap: 12,
  },
  snackbarError: {
    backgroundColor: colors.danger,
  },
  snackbarText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
  },
});

export default MenuView;
