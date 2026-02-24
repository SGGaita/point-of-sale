import React, {useState, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import RNPrint from 'react-native-print';
import Header from '../components/Header';
import MenuView from '../components/MenuView';
import OrdersView from '../components/OrdersView';
import WaitersView from '../components/WaitersView';
import ExpensesViewNew from '../components/ExpensesViewNew';
import SummaryView from '../components/SummaryView';
import Snackbar from '../components/Snackbar';
import ReceiptModal from '../components/ReceiptModal';
import {orderService} from '../services/orderService';
import {waiterService} from '../services/waiterService';
import {expenseService} from '../services/expenseService';

const HomeScreen = () => {
  const [activeView, setActiveView] = useState('menu');
  const [orders, setOrders] = useState([]);
  const [orderCounter, setOrderCounter] = useState(1);
  const [waiters, setWaiters] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [lastResetDate, setLastResetDate] = useState(null);
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'success',
  });
  const [receiptModal, setReceiptModal] = useState({
    visible: false,
    order: null,
  });

  // Load orders, waiters, and expenses from database on mount
  useEffect(() => {
    loadOrders();
    loadWaiters();
    loadExpenses();
  }, []);

  const loadOrders = async () => {
    try {
      const dbOrders = await orderService.getAllOrders();
      setOrders(dbOrders);
      
      // Calculate next order counter based on existing orders
      if (dbOrders.length > 0) {
        const lastOrderNumber = dbOrders[dbOrders.length - 1].orderNumber;
        const lastCounter = parseInt(lastOrderNumber.split('-')[1]);
        setOrderCounter(lastCounter + 1);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
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

  const loadExpenses = async () => {
    try {
      const dbExpenses = await expenseService.getAllExpenses();
      setExpenses(dbExpenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const handleMenuPress = () => {
    setActiveView('menu');
  };

  const handleOrdersPress = () => {
    setActiveView('orders');
  };

  const handleWaitersPress = () => {
    setActiveView('waiters');
  };

  const handleExpensesPress = () => {
    setActiveView('expenses');
  };

  const handleSummaryPress = () => {
    setActiveView('summary');
  };

  const handleCreateOrder = async (orderData) => {
    try {
      const orderNumber = `DBK-${String(orderCounter).padStart(4, '0')}`;
      
      const orderToCreate = {
        orderNumber: orderNumber,
        waiter: orderData.waiter,
        customerName: orderData.customerName || '',
        total: orderData.total,
        status: 'pending',
        timestamp: Date.now(),
        items: orderData.items,
      };

      // Save to database
      const createdOrder = await orderService.createOrder(orderToCreate);
      
      // Update local state
      setOrders(prev => [createdOrder, ...prev]);
      setOrderCounter(prev => prev + 1);

      // Show receipt modal
      setReceiptModal({
        visible: true,
        order: createdOrder,
      });
    } catch (error) {
      console.error('Error creating order:', error);
      setSnackbar({
        visible: true,
        message: 'Failed to create order',
        type: 'error',
      });
    }
  };

  const handleCloseReceipt = () => {
    setReceiptModal({
      visible: false,
      order: null,
    });
    
    // Show success snackbar after closing receipt
    if (receiptModal.order) {
      setSnackbar({
        visible: true,
        message: `Order ${receiptModal.order.orderNumber} created successfully!`,
        type: 'success',
      });
    }
  };

  const handlePrintReceipt = async (order) => {
    try {
      const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-GB');
      };

      const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'});
      };

      const itemsHTML = order.items.map(item => `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px dotted #ccc;">${item.name} x${item.quantity}</td>
          <td style="padding: 8px 0; border-bottom: 1px dotted #ccc; text-align: right;">${item.totalPrice} Ksh</td>
        </tr>
      `).join('');

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: flex-start;
              min-height: 100vh;
              padding: 40px 0;
            }
            .receipt-container {
              width: 33.33%;
              max-width: 300px;
              min-width: 250px;
              padding: 20px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .restaurant-name {
              font-size: 24px;
              font-weight: bold;
              letter-spacing: 1px;
              margin-bottom: 5px;
            }
            .restaurant-info {
              font-size: 14px;
              color: #666;
            }
            .divider {
              border-top: 2px solid #000;
              margin: 15px 0;
            }
            .order-details {
              margin: 15px 0;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
              font-size: 14px;
            }
            table {
              width: 100%;
              margin: 15px 0;
              border-collapse: collapse;
            }
            th {
              text-align: left;
              padding: 8px 0;
              border-bottom: 1px dotted #ccc;
              font-weight: bold;
            }
            th:last-child {
              text-align: right;
            }
            td:last-child {
              text-align: right;
            }
            .total {
              margin-top: 15px;
              padding-top: 15px;
              border-top: 2px solid #000;
              display: flex;
              justify-content: space-between;
              font-size: 18px;
              font-weight: bold;
            }
            .thank-you {
              text-align: center;
              margin-top: 20px;
              font-size: 13px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="restaurant-name">KITCHEN POS</div>
              <div class="restaurant-info">Hotel Restaurant</div>
              <div class="restaurant-info">Nairobi, Kenya</div>
            </div>
            
            <div class="divider"></div>
            
            <div class="order-details">
              <div class="detail-row">
                <span>Order #: ${order.orderNumber}</span>
                <span>Date: ${formatDate(order.timestamp)}</span>
              </div>
              <div class="detail-row">
                <span>Waiter: ${order.waiter}</span>
                <span>Time: ${formatTime(order.timestamp)}</span>
              </div>
              ${order.customerName ? `
              <div class="detail-row">
                <span>Customer: ${order.customerName}</span>
              </div>
              ` : ''}
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>ITEM</th>
                  <th>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
            
            <div class="total">
              <span>TOTAL:</span>
              <span>${order.total} Ksh</span>
            </div>
            
            <div class="divider"></div>
            
            <div class="thank-you">Thank you for dining with us!</div>
          </div>
        </body>
        </html>
      `;

      await RNPrint.print({
        html: html,
        fileName: `Receipt_${order.orderNumber}`,
      });
      
      setSnackbar({
        visible: true,
        message: 'Receipt printed successfully',
        type: 'success',
      });
    } catch (error) {
      console.error('Error printing receipt:', error);
      setSnackbar({
        visible: true,
        message: 'Failed to print receipt',
        type: 'error',
      });
    }
  };

  const handleMarkPaid = async (orderId) => {
    try {
      // Update in database
      await orderService.updateOrderStatus(orderId, 'paid');
      
      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? {...order, status: 'paid'} : order
        )
      );
      
      setSnackbar({
        visible: true,
        message: 'Order marked as paid',
        type: 'success',
      });
    } catch (error) {
      console.error('Error marking order as paid:', error);
      setSnackbar({
        visible: true,
        message: 'Failed to update order status',
        type: 'error',
      });
    }
  };

  const handleAddWaiter = async (waiterName) => {
    try {
      // Save to database
      await waiterService.createWaiter(waiterName);
      
      // Reload waiters from database
      await loadWaiters();
      
      setSnackbar({
        visible: true,
        message: `${waiterName} added successfully`,
        type: 'success',
      });
    } catch (error) {
      console.error('Error adding waiter:', error);
      setSnackbar({
        visible: true,
        message: error.message || 'Failed to add waiter',
        type: 'error',
      });
    }
  };

  const handleUpdateCustomerName = async (orderId, customerName) => {
    try {
      // Update in database
      await orderService.updateOrderCustomerName(orderId, customerName);
      
      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? {...order, customerName} : order
        )
      );
    } catch (error) {
      console.error('Error updating customer name:', error);
      setSnackbar({
        visible: true,
        message: 'Failed to update customer name',
        type: 'error',
      });
    }
  };

  const handleAddExpense = async (expenseData) => {
    try {
      // Save to database
      await expenseService.createExpense(expenseData);
      
      // Reload expenses from database
      await loadExpenses();
      
      setSnackbar({
        visible: true,
        message: 'Expense added successfully',
        type: 'success',
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      setSnackbar({
        visible: true,
        message: 'Failed to add expense',
        type: 'error',
      });
    }
  };

  const handleUpdateExpense = async (updatedExpense) => {
    try {
      // Update in database
      await expenseService.updateExpense(updatedExpense);
      
      // Reload expenses from database
      await loadExpenses();
      
      setSnackbar({
        visible: true,
        message: 'Expense updated successfully',
        type: 'success',
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      setSnackbar({
        visible: true,
        message: 'Failed to update expense',
        type: 'error',
      });
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      // Delete from database
      await expenseService.deleteExpense(expenseId);
      
      // Reload expenses from database
      await loadExpenses();
      
      setSnackbar({
        visible: true,
        message: 'Expense deleted successfully',
        type: 'success',
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      setSnackbar({
        visible: true,
        message: 'Failed to delete expense',
        type: 'error',
      });
    }
  };

  const handleResetOrders = () => {
    setOrders([]);
    setOrderCounter(1);
    setLastResetDate(Date.now());
    setSnackbar({
      visible: true,
      message: 'All orders have been reset',
      type: 'success',
    });
  };

  const showErrorSnackbar = (message) => {
    setSnackbar({
      visible: true,
      message: message,
      type: 'error',
    });
  };

  const showSnackbar = (message, type = 'success') => {
    setSnackbar({
      visible: true,
      message: message,
      type: type,
    });
  };

  const hideSnackbar = () => {
    setSnackbar({
      ...snackbar,
      visible: false,
    });
  };

  const getNextOrderNumber = () => {
    return `DBK-${String(orderCounter).padStart(4, '0')}`;
  };

  const renderView = () => {
    switch (activeView) {
      case 'menu':
        return <MenuView onCreateOrder={handleCreateOrder} onError={showErrorSnackbar} />;
      case 'orders':
        return <OrdersView orders={orders} onMarkPaid={handleMarkPaid} onPrintReceipt={handlePrintReceipt} />;
      case 'waiters':
        return <WaitersView waiters={waiters} orders={orders} onAddWaiter={handleAddWaiter} onMarkPaid={handleMarkPaid} onPrintReceipt={handlePrintReceipt} onUpdateCustomerName={handleUpdateCustomerName} />;
      case 'expenses':
        return <ExpensesViewNew expenses={expenses} onAddExpense={handleAddExpense} onUpdateExpense={handleUpdateExpense} onDeleteExpense={handleDeleteExpense} onShowSnackbar={showSnackbar} />;
      case 'summary':
        return <SummaryView orders={orders} expenses={expenses} onMarkPaid={handleMarkPaid} />;
      default:
        return <MenuView onCreateOrder={handleCreateOrder} onError={showErrorSnackbar} />;
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        restaurantName="Kitchen POS"
        nextOrderNumber={getNextOrderNumber()}
        activeView={activeView}
        onMenuPress={handleMenuPress}
        onOrdersPress={handleOrdersPress}
        onWaitersPress={handleWaitersPress}
        onExpensesPress={handleExpensesPress}
        onSummaryPress={handleSummaryPress}
      />
      <View style={styles.content}>
        {renderView()}
      </View>
      <Snackbar
        visible={snackbar.visible}
        message={snackbar.message}
        type={snackbar.type}
        onDismiss={hideSnackbar}
      />
      <ReceiptModal
        visible={receiptModal.visible}
        order={receiptModal.order}
        onClose={handleCloseReceipt}
        onPrint={handlePrintReceipt}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
});

export default HomeScreen;
