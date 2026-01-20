import React from 'react';
import {View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors, typography, spacing, borderRadius, shadows} from '../theme/theme';

const ResetConfirmModal = ({visible, orders, onConfirm, onCancel}) => {
  const getTotalSales = () => {
    return orders
      .filter(order => order.status === 'paid')
      .reduce((sum, order) => sum + order.total, 0);
  };

  const getOrderStats = () => {
    const totalOrders = orders.length;
    const paidOrders = orders.filter(order => order.status === 'paid').length;
    const unpaidOrders = orders.filter(order => order.status === 'unpaid').length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;

    return {totalOrders, paidOrders, unpaidOrders, pendingOrders};
  };

  const getTopPerformers = () => {
    const waiterStats = {};
    
    orders.forEach(order => {
      if (!waiterStats[order.waiter]) {
        waiterStats[order.waiter] = {
          name: order.waiter,
          totalSales: 0,
          orderCount: 0,
        };
      }
      if (order.status === 'paid') {
        waiterStats[order.waiter].totalSales += order.total;
      }
      waiterStats[order.waiter].orderCount += 1;
    });

    const performers = Object.values(waiterStats)
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 3);

    return performers;
  };

  const totalSales = getTotalSales();
  const stats = getOrderStats();
  const topPerformers = getTopPerformers();

  const getMedalEmoji = (index) => {
    switch(index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleContainer}>
              <Icon name="warning" size={24} color={colors.danger} />
              <Text style={styles.modalTitle}>Confirm Reset</Text>
            </View>
            <TouchableOpacity onPress={onCancel}>
              <Icon name="close" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* End of Day Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>End of Day Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Sales:</Text>
                <Text style={styles.summaryValue}>{totalSales} Ksh</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Orders:</Text>
                <Text style={styles.summaryValue}>{stats.totalOrders}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Paid Orders:</Text>
                <Text style={[styles.summaryValue, styles.paidColor]}>{stats.paidOrders}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Unpaid Orders:</Text>
                <Text style={[styles.summaryValue, styles.unpaidColor]}>{stats.unpaidOrders}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Pending Orders:</Text>
                <Text style={[styles.summaryValue, styles.pendingColor]}>{stats.pendingOrders}</Text>
              </View>

              {/* Top Performers */}
              {topPerformers.length > 0 && (
                <>
                  <View style={styles.performersSection}>
                    <Text style={styles.performersTitle}>Top Performers:</Text>
                  </View>

                  {topPerformers.map((performer, index) => (
                    <View key={index} style={styles.performerRow}>
                      <Text style={styles.performerName}>
                        {getMedalEmoji(index)} {performer.name}:
                      </Text>
                      <Text style={styles.performerStats}>
                        {performer.totalSales} Ksh ({performer.orderCount} orders)
                      </Text>
                    </View>
                  ))}
                </>
              )}

              {/* Warning Message */}
              <View style={styles.warningSection}>
                <Text style={styles.warningTitle}>This action will clear all {stats.totalOrders} orders.</Text>
                <Text style={styles.warningSubtitle}>This cannot be undone. Make sure to save any needed reports.</Text>
              </View>
            </View>

            {/* Confirmation Question */}
            <Text style={styles.confirmQuestion}>Are you sure you want to reset all orders?</Text>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={onConfirm}
            >
              <Icon name="check" size={20} color={colors.white} />
              <Text style={styles.confirmButtonText}>Yes, Reset All Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onCancel}
            >
              <Icon name="close" size={20} color={colors.white} />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    width: '90%',
    maxHeight: '85%',
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.danger,
  },
  modalBody: {
    padding: 16,
  },
  summaryCard: {
    borderWidth: 2,
    borderColor: colors.danger,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.danger,
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  paidColor: {
    color: colors.success,
  },
  unpaidColor: {
    color: colors.danger,
  },
  pendingColor: {
    color: colors.warning,
  },
  performersSection: {
    marginTop: 16,
    marginBottom: 8,
  },
  performersTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  performerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  performerName: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  performerStats: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  warningSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 4,
  },
  warningSubtitle: {
    fontSize: 13,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  confirmQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7F8C8D',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});

export default ResetConfirmModal;
