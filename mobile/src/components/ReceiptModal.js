import React from 'react';
import {View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors, typography, spacing, borderRadius, shadows} from '../theme/theme';

const ReceiptModal = ({visible, order, onClose, onPrint}) => {
  if (!order) return null;

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'});
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header with Close Button */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Receipt</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#fb3441" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.receiptContent}>
            {/* Restaurant Info */}
            <View style={styles.restaurantSection}>
              <Text style={styles.restaurantName}>DOSBROS KITCHEN</Text>
              <Text style={styles.restaurantSubtitle}>Hotel Restaurant</Text>
              <Text style={styles.restaurantLocation}>Nairobi, Kenya</Text>
            </View>

            <View style={styles.divider} />

            {/* Order Details */}
            <View style={styles.orderDetailsSection}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Order #: {order.orderNumber}</Text>
                <Text style={styles.detailValue}>Date: {formatDate(order.timestamp)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Waiter: {order.waiter}</Text>
                <Text style={styles.detailValue}>Time: {formatTime(order.timestamp)}</Text>
              </View>
              {order.customerName && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Customer: {order.customerName}</Text>
                </View>
              )}
            </View>

            {/* Items Header */}
            <View style={styles.itemsHeader}>
              <Text style={styles.itemsHeaderText}>ITEM</Text>
              <Text style={styles.itemsHeaderText}>AMOUNT</Text>
            </View>

            <View style={styles.dottedLine} />

            {/* Items List */}
            <View style={styles.itemsList}>
              {order.items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.name} x{item.quantity}</Text>
                  <Text style={styles.itemAmount}>{item.totalPrice} Ksh</Text>
                </View>
              ))}
            </View>

            <View style={styles.dottedLine} />

            {/* Total */}
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>TOTAL:</Text>
              <Text style={styles.totalAmount}>{order.total} Ksh</Text>
            </View>

            <View style={styles.divider} />

            {/* Thank You Message */}
            <Text style={styles.thankYouText}>Thank you for dining with us!</Text>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.printButton}
              onPress={() => {
                if (onPrint) onPrint(order);
              }}
            >
              <Icon name="print" size={20} color="#FFFFFF" />
              <Text style={styles.printButtonText}>Print Receipt</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Icon name="close" size={20} color="#FFFFFF" />
              <Text style={styles.closeButtonText}>Close</Text>
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
    borderRadius: 12,
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
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  receiptContent: {
    padding: 20,
  },
  restaurantSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  restaurantSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  restaurantLocation: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.primary,
    marginVertical: 12,
  },
  orderDetailsSection: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  detailValue: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemsHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  dottedLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    borderStyle: 'dotted',
    marginVertical: 8,
  },
  itemsList: {
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  itemAmount: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  thankYouText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  printButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  printButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
    marginLeft: 8,
  },
  closeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.textSecondary,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
    marginLeft: 8,
  },
});

export default ReceiptModal;
