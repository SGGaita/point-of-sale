import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors, typography, spacing, borderRadius, shadows} from '../theme/theme';

const OrdersView = ({orders = [], onMarkPaid, onPrintReceipt}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    {id: 'all', label: 'All'},
    {id: 'paid', label: 'Paid'},
    {id: 'unpaid', label: 'Unpaid'},
  ];

  const getFilteredOrders = () => {
    let filtered = orders;

    // Filter by status
    if (activeFilter === 'paid') {
      filtered = filtered.filter(order => order.status === 'paid');
    } else if (activeFilter === 'unpaid') {
      // Treat both 'unpaid' and 'pending' as unpaid
      filtered = filtered.filter(order => order.status === 'unpaid' || order.status === 'pending');
    }

    // Filter by search query (waiter name or order number)
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.waiter.toLowerCase().includes(query) ||
        order.orderNumber.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  const getStatusBorderColor = (status) => {
    switch (status) {
      case 'pending':
      case 'unpaid':
        return colors.danger; // Red for both pending and unpaid
      case 'paid':
        return colors.success; // Green
      default:
        return colors.placeholder; // Gray
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'pending':
      case 'unpaid':
        return colors.danger; // Red for both pending and unpaid
      case 'paid':
        return colors.success; // Green
      default:
        return colors.info; // Blue
    }
  };

  const renderActionButtons = (order) => {
    if (order.status === 'paid') {
      return (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.printButton, styles.fullWidthButton]}
            onPress={() => onPrintReceipt && onPrintReceipt(order)}
          >
            <Icon name="print" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Print Receipt</Text>
          </TouchableOpacity>
        </View>
      );
    } else if (order.status === 'unpaid' || order.status === 'pending') {
      // Both unpaid and pending orders show the same action buttons
      return (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.markPaidButton]}
            onPress={() => onMarkPaid && onMarkPaid(order.id)}
          >
            <Icon name="check-circle" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Mark Paid</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.printButton]}
            onPress={() => onPrintReceipt && onPrintReceipt(order)}
          >
            <Icon name="print" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Print Receipt</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.mainScrollView} contentContainerStyle={styles.mainScrollContent}>
        {/* Search and Filter Section */}
        <View style={styles.searchFilterCard}>
          {/* Search Field */}
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#95A5A6" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search orders by waiter, order number"
              placeholderTextColor="#95A5A6"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filter Buttons */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScrollView}
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

        {/* Orders List */}
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptySubtitle}>Orders will appear here once created</Text>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Orders Found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
        <View key={order.id} style={[
          styles.orderCard,
          {borderLeftWidth: 5, borderLeftColor: getStatusBorderColor(order.status)}
        ]}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <Text style={[styles.orderStatus, {color: getStatusTextColor(order.status)}]}>
              {order.status === 'paid' ? 'Paid' : 'Unpaid'}
            </Text>
          </View>
          
          <View style={styles.orderInfo}>
            <Text style={styles.orderLabel}>Waiter/Waitress:</Text>
            <Text style={styles.orderValue}>{order.waiter}</Text>
          </View>

          {order.customerName && (
            <View style={styles.orderInfo}>
              <Text style={styles.orderLabel}>Customer:</Text>
              <Text style={styles.orderValue}>{order.customerName}</Text>
            </View>
          )}

          <View style={styles.orderInfo}>
            <Text style={styles.orderLabel}>Time:</Text>
            <Text style={styles.orderValue}>
              {new Date(order.timestamp).toLocaleTimeString()}
            </Text>
          </View>

          <View style={styles.itemsSection}>
            <Text style={styles.itemsTitle}>Items:</Text>
            {order.items.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <Text style={styles.itemName}>
                  {item.name} x{item.quantity}
                </Text>
                <Text style={styles.itemPrice}>{item.totalPrice} Ksh</Text>
              </View>
            ))}
          </View>

          <View style={styles.orderTotal}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{order.total} Ksh</Text>
          </View>

          {renderActionButtons(order)}
        </View>
      ))
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
  mainScrollView: {
    flex: 1,
  },
  mainScrollContent: {
    paddingBottom: 16,
  },
  searchFilterCard: {
    backgroundColor: colors.white,
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
    backgroundColor: colors.inputBackground,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
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
  filterScrollView: {
    flexGrow: 0,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.inputBackground,
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeFilterButtonText: {
    color: colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  orderInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  orderLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    marginRight: 8,
  },
  orderValue: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  itemsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  itemName: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  itemPrice: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  markPaidButton: {
    backgroundColor: colors.success,
  },
  printButton: {
    backgroundColor: colors.primary,
  },
  fullWidthButton: {
    flex: 1,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OrdersView;
