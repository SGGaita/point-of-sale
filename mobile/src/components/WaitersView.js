import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors, typography, spacing, borderRadius, shadows} from '../theme/theme';

const WaitersView = ({waiters = [], orders = [], onAddWaiter, onMarkPaid, onPrintReceipt}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [addWaiterModal, setAddWaiterModal] = useState(false);
  const [newWaiterName, setNewWaiterName] = useState('');
  const [expandedWaiter, setExpandedWaiter] = useState(null);

  const filters = [
    {id: 'all', label: 'All Waiters'},
    {id: 'unpaid', label: 'With Unpaid Orders'},
  ];

  const getWaiterStats = (waiterName) => {
    const waiterOrders = orders.filter(order => order.waiter === waiterName);
    const totalOrders = waiterOrders.length;
    const paidOrdersList = waiterOrders.filter(order => order.status === 'paid');
    const unpaidOrdersList = waiterOrders.filter(order => order.status === 'unpaid' || order.status === 'pending');
    const totalRevenue = paidOrdersList.reduce((sum, order) => sum + order.total, 0);

    return {
      totalOrders,
      paidOrders: paidOrdersList.length,
      unpaidOrders: unpaidOrdersList.length,
      totalRevenue,
      paidOrdersList,
      unpaidOrdersList,
    };
  };

  const getFilteredWaiters = () => {
    let filtered = waiters;

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(waiter =>
        waiter.toLowerCase().includes(query)
      );
    }

    // Filter by unpaid orders
    if (activeFilter === 'unpaid') {
      filtered = filtered.filter(waiter => {
        const stats = getWaiterStats(waiter);
        return stats.unpaidOrders > 0;
      });
    }

    return filtered;
  };

  const handleAddWaiter = () => {
    if (newWaiterName.trim() !== '') {
      onAddWaiter && onAddWaiter(newWaiterName.trim());
      setNewWaiterName('');
      setAddWaiterModal(false);
    }
  };

  const filteredWaiters = getFilteredWaiters();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.mainScrollView} contentContainerStyle={styles.mainScrollContent}>
        {/* Search and Filter Section */}
        <View style={styles.searchFilterCard}>
          {/* Search Field */}
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color={colors.placeholder} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search waiters"
              placeholderTextColor={colors.placeholder}
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

        {/* Add New Waiter Button */}
        <TouchableOpacity 
          style={styles.addWaiterButton}
          onPress={() => setAddWaiterModal(true)}
        >
          <Icon name="person-add" size={20} color={colors.white} />
          <Text style={styles.addWaiterButtonText}>Add New Waiter/Waitress</Text>
        </TouchableOpacity>

        {/* Waiters List */}
        {waiters.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="people-outline" size={64} color={colors.border} />
            <Text style={styles.emptyTitle}>No Waiters Yet</Text>
            <Text style={styles.emptySubtitle}>Add waiters to start managing orders</Text>
          </View>
        ) : filteredWaiters.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="search-off" size={64} color={colors.border} />
            <Text style={styles.emptyTitle}>No Waiters Found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
          </View>
        ) : (
          filteredWaiters.map((waiter, index) => {
            const stats = getWaiterStats(waiter);
            const isExpanded = expandedWaiter === waiter;
            return (
              <TouchableOpacity 
                key={index} 
                style={styles.waiterCard}
                onPress={() => setExpandedWaiter(isExpanded ? null : waiter)}
                activeOpacity={0.7}
              >
                <View style={styles.waiterHeader}>
                  <View style={styles.waiterHeaderLeft}>
                    <Text style={styles.waiterName}>{waiter}</Text>
                  </View>
                  <View style={styles.statsRow}>
                    <View style={styles.statColumn}>
                      <Text style={styles.statColumnLabel}>Orders</Text>
                      <Text style={styles.statColumnValue}>{stats.totalOrders}</Text>
                    </View>
                    <View style={styles.statColumn}>
                      <Text style={styles.statColumnLabel}>Paid</Text>
                      <Text style={[styles.statColumnValue, {color: colors.success}]}>{stats.paidOrders}</Text>
                    </View>
                    <View style={styles.statColumn}>
                      <Text style={styles.statColumnLabel}>Unpaid</Text>
                      <Text style={[styles.statColumnValue, {color: colors.danger}]}>{stats.unpaidOrders}</Text>
                    </View>
                  </View>
                </View>
                
                {isExpanded && (
                  <View style={styles.expandedContent}>
                    {/* Total Revenue */}
                    <View style={styles.revenueSection}>
                      <Text style={styles.revenueLabel}>Total Revenue: {stats.totalRevenue} Ksh</Text>
                      <Text style={styles.revenueSubtext}>{stats.paidOrders} paid • {stats.unpaidOrders} unpaid</Text>
                    </View>

                    {/* Paid Orders */}
                    {stats.paidOrdersList.length > 0 && (
                      <View style={styles.ordersSection}>
                        <Text style={styles.ordersSectionTitle}>Paid Orders ({stats.paidOrdersList.length})</Text>
                        {stats.paidOrdersList.map((order) => (
                          <View key={order.id} style={styles.orderRow}>
                            <View style={styles.orderRowLeft}>
                              <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                              {order.customerName && (
                                <Text style={styles.orderCustomer}>{order.customerName}</Text>
                              )}
                            </View>
                            <Text style={styles.orderAmount}>{order.total} Ksh</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Unpaid Orders */}
                    {stats.unpaidOrdersList.length > 0 && (
                      <View style={styles.ordersSection}>
                        <Text style={[styles.ordersSectionTitle, {color: colors.danger}]}>Unpaid Orders ({stats.unpaidOrdersList.length})</Text>
                        {stats.unpaidOrdersList.map((order) => (
                          <View key={order.id} style={styles.orderRowWithActions}>
                            <View style={styles.orderRowTop}>
                              <View style={styles.orderRowLeft}>
                                <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                                {order.customerName && (
                                  <Text style={styles.orderCustomer}>{order.customerName}</Text>
                                )}
                              </View>
                              <Text style={styles.orderAmount}>{order.total} Ksh</Text>
                            </View>
                            <View style={styles.orderActions}>
                              <TouchableOpacity
                                style={styles.markPaidBtn}
                                onPress={(e) => {
                                  e.stopPropagation();
                                  onMarkPaid && onMarkPaid(order.id);
                                }}
                              >
                                <Icon name="check-circle" size={16} color={colors.white} />
                                <Text style={styles.actionBtnText}>Mark Paid</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.receiptBtn}
                                onPress={(e) => {
                                  e.stopPropagation();
                                  onPrintReceipt && onPrintReceipt(order);
                                }}
                              >
                                <Icon name="print" size={16} color={colors.white} />
                                <Text style={styles.actionBtnText}>Receipt</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Add Waiter Modal */}
      <Modal
        visible={addWaiterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAddWaiterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Waiter/Waitress</Text>
              <TouchableOpacity onPress={() => setAddWaiterModal(false)}>
                <Icon name="close" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter waiter/waitress name"
                placeholderTextColor={colors.placeholder}
                value={newWaiterName}
                onChangeText={setNewWaiterName}
                autoFocus={true}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setNewWaiterName('');
                  setAddWaiterModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddWaiter}
              >
                <Text style={styles.addButtonText}>Add Waiter</Text>
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
    marginBottom: 12,
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
  addWaiterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27AE60',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addWaiterButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  waiterCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  waiterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  waiterHeaderLeft: {
    flex: 1,
  },
  waiterName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statColumn: {
    alignItems: 'center',
  },
  statColumnLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statColumnValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  revenueSection: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
  },
  revenueLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  revenueSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  ordersSection: {
    marginBottom: 16,
  },
  ordersSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
    marginBottom: 12,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    borderRadius: 6,
    marginBottom: 8,
  },
  orderRowWithActions: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    borderRadius: 6,
    marginBottom: 8,
  },
  orderRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderRowLeft: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  orderCustomer: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  orderAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  markPaidBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  receiptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  actionBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statTextContainer: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
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
    backgroundColor: '#27AE60',
  },
  addButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default WaitersView;
