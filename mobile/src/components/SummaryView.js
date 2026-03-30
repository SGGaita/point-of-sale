import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors, typography, spacing, borderRadius, shadows} from '../theme/theme';
import {authService} from '../services/authService';

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
  const [expandedWaiter, setExpandedWaiter] = useState(null);
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    const authenticated = await authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    if (authenticated) {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLogin = async () => {
    setLoginError('');
    setIsLoggingIn(true);

    const result = await authService.login(email, password);

    setIsLoggingIn(false);

    if (result.success) {
      setIsAuthenticated(true);
      setCurrentUser(result.user);
      setShowLoginModal(false);
      setEmail('');
      setPassword('');
    } else {
      setLoginError(result.error);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setShowLoginModal(true);
  };

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
          paidRevenue: 0,
          unpaidRevenue: 0,
          totalRevenue: 0,
          paidOrders: 0,
          unpaidOrders: 0,
          totalOrders: 0,
        };
      }
      
      if (order.status === 'paid') {
        waiterStats[order.waiter].paidRevenue += order.total;
        waiterStats[order.waiter].paidOrders += 1;
      } else if (order.status === 'unpaid' || order.status === 'pending') {
        waiterStats[order.waiter].unpaidRevenue += order.total;
        waiterStats[order.waiter].unpaidOrders += 1;
      }
      
      waiterStats[order.waiter].totalRevenue += order.total;
      waiterStats[order.waiter].totalOrders += 1;
    });

    return Object.values(waiterStats)
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  };

  const getWaiterOrders = (waiterName) => {
    const filteredOrders = getFilteredOrders();
    const waiterOrders = filteredOrders.filter(order => order.waiter === waiterName);
    
    const paidOrdersList = waiterOrders.filter(order => order.status === 'paid');
    const unpaidOrdersList = waiterOrders.filter(order => order.status === 'unpaid' || order.status === 'pending');
    
    // Sort orders by order number (ascending)
    paidOrdersList.sort((a, b) => a.orderNumber.localeCompare(b.orderNumber));
    unpaidOrdersList.sort((a, b) => a.orderNumber.localeCompare(b.orderNumber));
    
    return {
      paidOrdersList,
      unpaidOrdersList,
    };
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

  // Show login modal or message if not authenticated
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        {!showLoginModal ? (
          <View style={styles.lockedContainer}>
            <Icon name="lock" size={64} color={colors.textSecondary} />
            <Text style={styles.lockedTitle}>Summary View Locked</Text>
            <Text style={styles.lockedMessage}>
              This view requires admin authentication to access sales and financial data.
            </Text>
            <TouchableOpacity
              style={styles.loginPromptButton}
              onPress={() => setShowLoginModal(true)}
            >
              <Icon name="login" size={20} color={colors.white} />
              <Text style={styles.loginPromptButtonText}>Login to Access</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        
        <Modal
          visible={showLoginModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowLoginModal(false)}
        >
          <View style={styles.loginOverlay}>
            <View style={styles.loginContent}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowLoginModal(false)}
              >
                <Icon name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              <View style={styles.loginHeader}>
                <Icon name="lock" size={48} color={colors.primary} />
                <Text style={styles.loginTitle}>Admin Login Required</Text>
                <Text style={styles.loginSubtitle}>Please login to access the Summary</Text>
              </View>

              <View style={styles.loginBody}>
                <Text style={styles.loginLabel}>Email</Text>
                <TextInput
                  style={styles.loginInput}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoggingIn}
                />

                <Text style={[styles.loginLabel, {marginTop: 16}]}>Password</Text>
                <TextInput
                  style={styles.loginInput}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.placeholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={true}
                  editable={!isLoggingIn}
                />

                {loginError ? (
                  <View style={styles.errorContainer}>
                    <Icon name="error" size={20} color={colors.danger} />
                    <Text style={styles.errorText}>{loginError}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[styles.loginButton, isLoggingIn && styles.loginButtonDisabled]}
                  onPress={handleLogin}
                  disabled={isLoggingIn || !email || !password}
                >
                  {isLoggingIn ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <>
                      <Icon name="login" size={20} color={colors.white} />
                      <Text style={styles.loginButtonText}>Login</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Logout Button */}
      <View style={styles.headerBar}>
        <View style={styles.userInfo}>
          <Icon name="account-circle" size={24} color={colors.primary} />
          <Text style={styles.userName}>{currentUser?.name || 'Admin'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={20} color={colors.danger} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

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

        {/* Total Sales per Waiter */}
        <View style={styles.topSalesCard}>
          <Text style={styles.topSalesTitle}>Total Sales per Waiter</Text>
          
          {topSalesPerWaiter.length === 0 ? (
            <Text style={styles.emptyText}>No sales data available</Text>
          ) : (
            topSalesPerWaiter.map((waiter, index) => {
              const isExpanded = expandedWaiter === waiter.name;
              const waiterOrders = isExpanded ? getWaiterOrders(waiter.name) : null;
              
              return (
                <TouchableOpacity 
                  key={index} 
                  style={styles.waiterSalesCard}
                  onPress={() => setExpandedWaiter(isExpanded ? null : waiter.name)}
                  activeOpacity={0.7}
                >
                  <View style={styles.waiterCardHeader}>
                    <Text style={styles.waiterCardName}>{waiter.name}</Text>
                    <View style={styles.waiterRevenueRow}>
                      <View style={styles.waiterRevenueColumn}>
                        <Text style={styles.waiterRevenueLabel}>Total</Text>
                        <Text style={[styles.waiterRevenueValue, {color: colors.danger}]}>
                          {waiter.totalRevenue} Ksh
                        </Text>
                      </View>
                      <View style={styles.waiterRevenueColumn}>
                        <Text style={styles.waiterRevenueLabel}>Paid</Text>
                        <Text style={[styles.waiterRevenueValue, {color: colors.success}]}>
                          {waiter.paidRevenue} Ksh
                        </Text>
                      </View>
                      <View style={styles.waiterRevenueColumn}>
                        <Text style={styles.waiterRevenueLabel}>Unpaid</Text>
                        <Text style={[styles.waiterRevenueValue, {color: colors.danger}]}>
                          {waiter.unpaidRevenue} Ksh
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.waiterOrdersSummary}>
                    Orders: {waiter.totalOrders} (Paid: {waiter.paidOrders} • Unpaid: {waiter.unpaidOrders})
                  </Text>
                  
                  {isExpanded && waiterOrders && (
                    <View style={styles.waiterOrdersExpanded}>
                      {/* Paid Orders */}
                      {waiterOrders.paidOrdersList.length > 0 && (
                        <View style={styles.ordersSection}>
                          <Text style={[styles.ordersSectionTitle, {color: colors.success}]}>
                            Paid Orders ({waiterOrders.paidOrdersList.length})
                          </Text>
                          {waiterOrders.paidOrdersList.map((order) => (
                            <View key={order.id} style={styles.orderDetailCard}>
                              <View style={styles.orderDetailHeader}>
                                <Text style={styles.orderDetailNumber}>{order.orderNumber}</Text>
                                <Text style={styles.orderDetailAmount}>{order.total} Ksh</Text>
                              </View>
                              {order.customerName && (
                                <Text style={styles.orderDetailCustomer}>Customer: {order.customerName}</Text>
                              )}
                              <Text style={styles.orderDetailTime}>
                                {formatDate(order.timestamp)} {formatTime(order.timestamp)}
                              </Text>
                              {order.items && order.items.length > 0 && (
                                <View style={styles.orderDetailItems}>
                                  {order.items.map((item, idx) => (
                                    <View key={idx} style={styles.orderDetailItem}>
                                      <Text style={styles.orderDetailItemName}>
                                        {item.name} x{item.quantity}
                                      </Text>
                                      <Text style={styles.orderDetailItemPrice}>{item.totalPrice} Ksh</Text>
                                    </View>
                                  ))}
                                </View>
                              )}
                            </View>
                          ))}
                        </View>
                      )}
                      
                      {/* Unpaid Orders */}
                      {waiterOrders.unpaidOrdersList.length > 0 && (
                        <View style={styles.ordersSection}>
                          <Text style={[styles.ordersSectionTitle, {color: colors.danger}]}>
                            Unpaid Orders ({waiterOrders.unpaidOrdersList.length})
                          </Text>
                          {waiterOrders.unpaidOrdersList.map((order) => (
                            <View key={order.id} style={styles.orderDetailCard}>
                              <View style={styles.orderDetailHeader}>
                                <Text style={styles.orderDetailNumber}>{order.orderNumber}</Text>
                                <Text style={styles.orderDetailAmount}>{order.total} Ksh</Text>
                              </View>
                              {order.customerName && (
                                <Text style={styles.orderDetailCustomer}>Customer: {order.customerName}</Text>
                              )}
                              <Text style={styles.orderDetailTime}>
                                {formatDate(order.timestamp)} {formatTime(order.timestamp)}
                              </Text>
                              {order.items && order.items.length > 0 && (
                                <View style={styles.orderDetailItems}>
                                  {order.items.map((item, idx) => (
                                    <View key={idx} style={styles.orderDetailItem}>
                                      <Text style={styles.orderDetailItemName}>
                                        {item.name} x{item.quantity}
                                      </Text>
                                      <Text style={styles.orderDetailItemPrice}>{item.totalPrice} Ksh</Text>
                                    </View>
                                  ))}
                                </View>
                              )}
                              <TouchableOpacity
                                style={styles.markPaidButtonInline}
                                onPress={(e) => {
                                  e.stopPropagation();
                                  onMarkPaid && onMarkPaid(order.id);
                                }}
                              >
                                <Icon name="check-circle" size={16} color={colors.white} />
                                <Text style={styles.markPaidButtonText}>Mark as Paid</Text>
                              </TouchableOpacity>
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
  waiterSalesCard: {
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  waiterCardHeader: {
    marginBottom: 12,
  },
  waiterCardName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.danger,
    marginBottom: 12,
  },
  waiterRevenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  waiterRevenueColumn: {
    flex: 1,
    alignItems: 'center',
  },
  waiterRevenueLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  waiterRevenueValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  waiterOrdersSummary: {
    fontSize: 13,
    color: colors.textSecondary,
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
  loginOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    width: '85%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  loginHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loginBody: {
    padding: 24,
  },
  loginLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  loginInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger + '15',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: colors.danger,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 24,
    gap: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.background,
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  lockedMessage: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  loginPromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  loginPromptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger + '15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.danger,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  waiterOrdersExpanded: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ordersSection: {
    marginBottom: 16,
  },
  ordersSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  orderDetailCard: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  orderDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderDetailNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  orderDetailAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.primary,
  },
  orderDetailCustomer: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  orderDetailTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  orderDetailItems: {
    backgroundColor: colors.inputBackground,
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
  },
  orderDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  orderDetailItemName: {
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
  },
  orderDetailItemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 12,
  },
  markPaidButtonInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
    gap: 6,
  },
});

export default SummaryView;
