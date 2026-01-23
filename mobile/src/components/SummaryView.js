import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors, typography, spacing, borderRadius, shadows} from '../theme/theme';

const SummaryView = ({orders = [], expenses = [], onMarkPaid}) => {
  const getCurrentDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState(getCurrentDate());
  const [endDate, setEndDate] = useState(getCurrentDate());
  const [tempStartDate, setTempStartDate] = useState(getCurrentDate());
  const [tempEndDate, setTempEndDate] = useState(getCurrentDate());

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDayPress = (day) => {
    const selectedDate = new Date(selectedYear, selectedMonth, day);
    selectedDate.setHours(0, 0, 0, 0);

    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      // Start new selection
      setTempStartDate(selectedDate);
      setTempEndDate(null);
    } else if (tempStartDate && !tempEndDate) {
      // Complete the range
      if (selectedDate >= tempStartDate) {
        setTempEndDate(selectedDate);
      } else {
        // If selected date is before start, swap them
        setTempEndDate(tempStartDate);
        setTempStartDate(selectedDate);
      }
    }
  };

  const handleFilter = () => {
    if (tempStartDate && tempEndDate) {
      setStartDate(tempStartDate);
      setEndDate(tempEndDate);
    } else if (tempStartDate) {
      // If only start date selected, use it as both start and end
      setStartDate(tempStartDate);
      setEndDate(tempStartDate);
    }
  };

  const formatDateDisplay = (date) => {
    if (!date) return 'Select date';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isDateInRange = (day) => {
    if (!tempStartDate) return false;
    const date = new Date(selectedYear, selectedMonth, day);
    date.setHours(0, 0, 0, 0);
    
    if (tempStartDate && tempEndDate) {
      return date >= tempStartDate && date <= tempEndDate;
    } else if (tempStartDate) {
      return date.getTime() === tempStartDate.getTime();
    }
    return false;
  };

  const isDateSelected = (day) => {
    const date = new Date(selectedYear, selectedMonth, day);
    date.setHours(0, 0, 0, 0);
    
    if (tempStartDate && date.getTime() === tempStartDate.getTime()) return true;
    if (tempEndDate && date.getTime() === tempEndDate.getTime()) return true;
    return false;
  };

  const isFutureDate = (day) => {
    const date = new Date(selectedYear, selectedMonth, day);
    date.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };
  const getFilteredOrders = () => {
    if (!startDate || !endDate) return orders;
    
    return orders.filter(order => {
      const orderDate = new Date(order.timestamp);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate >= startDate && orderDate <= endDate;
    });
  };

  const getFilteredExpenses = () => {
    if (!startDate || !endDate) return expenses;
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.timestamp);
      expenseDate.setHours(0, 0, 0, 0);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  };

  const getTotalSales = () => {
    const filteredOrders = getFilteredOrders();
    const paidOrders = filteredOrders.filter(order => order.status === 'paid');
    return paidOrders.reduce((sum, order) => sum + order.total, 0);
  };

  const getTotalExpenses = () => {
    const filteredExpenses = getFilteredExpenses();
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getTotalOrders = () => {
    return getFilteredOrders().length;
  };

  const getTotalProfit = () => {
    return getTotalSales() - getTotalExpenses();
  };

  const getTopSalesPerWaiter = () => {
    const filteredOrders = getFilteredOrders();
    const waiterStats = {};
    
    filteredOrders.forEach(order => {
      if (!waiterStats[order.waiter]) {
        waiterStats[order.waiter] = {
          name: order.waiter,
          totalRevenue: 0,
          totalOrders: 0,
        };
      }
      if (order.status === 'paid') {
        waiterStats[order.waiter].totalRevenue += order.total;
      }
      waiterStats[order.waiter].totalOrders += 1;
    });

    return Object.values(waiterStats)
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  };

  const getUnpaidOrders = () => {
    const filteredOrders = getFilteredOrders();
    return filteredOrders.filter(order => order.status === 'unpaid' || order.status === 'pending');
  };

  const getSalesPerItem = () => {
    const filteredOrders = getFilteredOrders();
    const itemStats = {};
    
    filteredOrders.forEach(order => {
      if (order.status === 'paid') {
        order.items.forEach(item => {
          if (!itemStats[item.name]) {
            itemStats[item.name] = {
              name: item.name,
              totalQuantity: 0,
              totalRevenue: 0,
            };
          }
          itemStats[item.name].totalQuantity += item.quantity;
          itemStats[item.name].totalRevenue += item.totalPrice;
        });
      }
    });

    return Object.values(itemStats)
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'});
  };

  const totalSales = getTotalSales();
  const totalExpenses = getTotalExpenses();
  const totalOrders = getTotalOrders();
  const totalProfit = getTotalProfit();
  const topSalesPerWaiter = getTopSalesPerWaiter();
  const unpaidOrders = getUnpaidOrders();
  const salesPerItem = getSalesPerItem();

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Calendar */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={handlePreviousMonth}>
              <Icon name="chevron-left" size={28} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.calendarMonth}>{months[selectedMonth]} {selectedYear}</Text>
            <TouchableOpacity onPress={handleNextMonth}>
              <Icon name="chevron-right" size={28} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarDays}>
            {dayNames.map((day) => (
              <Text key={day} style={styles.dayName}>{day}</Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {Array.from({length: firstDay}).map((_, index) => (
              <View key={`empty-${index}`} style={styles.dayCell} />
            ))}
            {Array.from({length: daysInMonth}).map((_, index) => {
              const day = index + 1;
              const inRange = isDateInRange(day);
              const selected = isDateSelected(day);
              const isFuture = isFutureDate(day);
              return (
                <TouchableOpacity 
                  key={day} 
                  style={[
                    styles.dayCell,
                    inRange && styles.dayCellInRange,
                    selected && styles.dayCellSelected,
                    isFuture && styles.dayCellDisabled,
                  ]}
                  onPress={() => !isFuture && handleDayPress(day)}
                  disabled={isFuture}
                >
                  <Text style={[
                    styles.dayNumber,
                    (inRange || selected) && styles.dayNumberSelected,
                    isFuture && styles.dayNumberDisabled,
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.dateRangeRow}>
            <View style={styles.dateInput}>
              <Text style={[styles.dateLabel, !tempStartDate && styles.datePlaceholder]}>
                {formatDateDisplay(tempStartDate)}
              </Text>
            </View>
            <Text style={styles.dateSeparator}>-</Text>
            <View style={styles.dateInput}>
              <Text style={[styles.dateLabel, !tempEndDate && styles.datePlaceholder]}>
                {formatDateDisplay(tempEndDate)}
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.filterButton, !tempStartDate && styles.filterButtonDisabled]}
              onPress={handleFilter}
              disabled={!tempStartDate}
            >
              <Text style={styles.filterButtonText}>Filter</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Sales</Text>
              <Text style={[styles.statValue, {color: colors.primary}]}>{totalSales} Ksh</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Expenses</Text>
              <Text style={[styles.statValue, {color: colors.primary}]}>{totalExpenses} Ksh</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Orders</Text>
              <Text style={styles.statValue}>{totalOrders}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Profit</Text>
              <Text style={[styles.statValue, {color: totalProfit >= 0 ? colors.success : colors.danger}]}>
                {totalProfit} Ksh{totalProfit < 0 ? ' (Loss)' : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Daily Profit/Loss */}
        <View style={[styles.profitCard, totalProfit < 0 && styles.lossCard]}>
          <Text style={styles.profitLabel}>Daily Profit/Loss</Text>
          <Text style={styles.profitValue}>
            {Math.abs(totalProfit)} Ksh {totalProfit < 0 ? '(Loss)' : ''}
          </Text>
        </View>

        {/* Top Sales per Waiter */}
        <View style={styles.topSalesCard}>
          <Text style={styles.topSalesTitle}>Top Sales per Waiter</Text>
          
          {topSalesPerWaiter.length === 0 ? (
            <Text style={styles.emptyText}>No sales data available</Text>
          ) : (
            topSalesPerWaiter.map((waiter, index) => (
              <View key={index} style={styles.waiterSalesRow}>
                <View style={styles.waiterSalesLeft}>
                  <Text style={styles.waiterSalesName}>{waiter.name}</Text>
                  <Text style={styles.waiterSalesOrders}>Paid: {waiter.totalOrders} - Unpaid: 1</Text>
                </View>
                <View style={styles.waiterSalesRight}>
                  <Text style={styles.waiterSalesLabel}>Orders</Text>
                  <Text style={styles.waiterSalesValue}>{waiter.totalOrders}</Text>
                  <Text style={styles.waiterSalesLabel}>Revenue</Text>
                  <Text style={styles.waiterSalesRevenue}>{waiter.totalRevenue} Ksh</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Sales Per Item */}
        <View style={styles.salesPerItemCard}>
          <Text style={styles.salesPerItemTitle}>Sales Per Item</Text>
          
          {salesPerItem.length === 0 ? (
            <Text style={styles.emptyText}>No sales data available</Text>
          ) : (
            salesPerItem.map((item, index) => (
              <View key={index} style={styles.itemSalesRow}>
                <View style={styles.itemSalesLeft}>
                  <Text style={styles.itemSalesName}>{item.name}</Text>
                  <Text style={styles.itemSalesQuantity}>Quantity: {item.totalQuantity}</Text>
                </View>
                <View style={styles.itemSalesRight}>
                  <Text style={styles.itemSalesRevenue}>{item.totalRevenue} Ksh</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Unpaid Orders */}
        <View style={styles.unpaidOrdersCard}>
          <Text style={styles.unpaidOrdersTitle}>Unpaid Orders</Text>
          
          {unpaidOrders.length === 0 ? (
            <Text style={styles.emptyText}>No unpaid orders</Text>
          ) : (
            unpaidOrders.map((order) => (
              <View key={order.id} style={styles.unpaidOrderItem}>
                <View style={styles.unpaidOrderInfo}>
                  <Text style={styles.unpaidOrderName}>{order.waiter}</Text>
                  <Text style={styles.unpaidOrderDetails}>
                    {order.orderNumber} • {formatDate(order.timestamp)} {formatTime(order.timestamp)}
                  </Text>
                  {order.customerName && (
                    <Text style={styles.unpaidOrderCustomer}>👤 {order.customerName}</Text>
                  )}
                </View>
                <View style={styles.unpaidOrderRight}>
                  <Text style={styles.unpaidOrderAmount}>{order.total} Ksh</Text>
                  <TouchableOpacity
                    style={styles.markPaidButton}
                    onPress={() => onMarkPaid && onMarkPaid(order.id)}
                  >
                    <Icon name="check-circle" size={16} color={colors.white} />
                    <Text style={styles.markPaidButtonText}>Mark as Paid</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
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
    padding: 16,
  },
  calendarCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarMonth: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  calendarDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 40,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCellInRange: {
    backgroundColor: colors.primaryLight || '#ffe5e7',
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  dayCellDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.5,
  },
  dayNumber: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  dayNumberSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  dayNumberDisabled: {
    color: colors.textSecondary,
    opacity: 0.4,
  },
  dateRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateInput: {
    flex: 1,
    backgroundColor: colors.inputBackground,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  datePlaceholder: {
    color: colors.placeholder,
  },
  dateSeparator: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  filterButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  filterButtonDisabled: {
    backgroundColor: colors.border,
    opacity: 0.5,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  statsGrid: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  profitCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  lossCard: {
    borderWidth: 2,
    borderColor: colors.danger,
  },
  profitLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  profitValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.danger,
  },
  topSalesCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  topSalesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  waiterSalesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  waiterSalesLeft: {
    flex: 1,
  },
  waiterSalesName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  waiterSalesOrders: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  waiterSalesRight: {
    alignItems: 'flex-end',
  },
  waiterSalesLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  waiterSalesValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  waiterSalesRevenue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  salesPerItemCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  salesPerItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  itemSalesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  itemSalesLeft: {
    flex: 1,
  },
  itemSalesName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  itemSalesQuantity: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  itemSalesRight: {
    alignItems: 'flex-end',
  },
  itemSalesRevenue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  unpaidOrdersCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  unpaidOrdersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.danger,
    marginBottom: 16,
  },
  unpaidOrderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  unpaidOrderInfo: {
    flex: 1,
    marginRight: 12,
  },
  unpaidOrderName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  unpaidOrderDetails: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  unpaidOrderCustomer: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  unpaidOrderRight: {
    alignItems: 'flex-end',
  },
  unpaidOrderAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  markPaidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  markPaidButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default SummaryView;
