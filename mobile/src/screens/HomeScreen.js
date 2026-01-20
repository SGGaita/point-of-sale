import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import Header from '../components/Header';
import MenuView from '../components/MenuView';
import OrdersView from '../components/OrdersView';
import WaitersView from '../components/WaitersView';
import ExpensesView from '../components/ExpensesView';
import SummaryView from '../components/SummaryView';
import Snackbar from '../components/Snackbar';
import ReceiptModal from '../components/ReceiptModal';

const HomeScreen = () => {
  const [activeView, setActiveView] = useState('menu');
  const [orders, setOrders] = useState([]);
  const [orderCounter, setOrderCounter] = useState(1);
  const [waiters, setWaiters] = useState(['Noorah', 'Valary', 'Jasmine', 'Pauline']);
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

  const handleCreateOrder = (orderData) => {
    const orderNumber = `DBK-${String(orderCounter).padStart(4, '0')}`;
    
    const newOrder = {
      ...orderData,
      orderNumber: orderNumber,
      id: Date.now(),
      status: 'pending',
    };

    setOrders(prev => [newOrder, ...prev]);
    setOrderCounter(prev => prev + 1);

    // Show receipt modal
    setReceiptModal({
      visible: true,
      order: newOrder,
    });
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
      const RNPrint = require('react-native-print');
      
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
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 600px;
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
          <div class="header">
            <div class="restaurant-name">DOSBROS KITCHEN</div>
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

  const handleMarkPaid = (orderId) => {
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
  };

  const handleAddWaiter = (waiterName) => {
    if (!waiters.includes(waiterName)) {
      setWaiters(prev => [...prev, waiterName]);
      setSnackbar({
        visible: true,
        message: `${waiterName} added successfully`,
        type: 'success',
      });
    } else {
      setSnackbar({
        visible: true,
        message: 'Waiter already exists',
        type: 'error',
      });
    }
  };

  const handleAddExpense = (expenseData) => {
    setExpenses(prev => [expenseData, ...prev]);
    setSnackbar({
      visible: true,
      message: 'Expense added successfully',
      type: 'success',
    });
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
        return <WaitersView waiters={waiters} orders={orders} onAddWaiter={handleAddWaiter} onMarkPaid={handleMarkPaid} onPrintReceipt={handlePrintReceipt} />;
      case 'expenses':
        return <ExpensesView expenses={expenses} onAddExpense={handleAddExpense} />;
      case 'summary':
        return <SummaryView orders={orders} expenses={expenses} onMarkPaid={handleMarkPaid} />;
      default:
        return <MenuView onCreateOrder={handleCreateOrder} onError={showErrorSnackbar} />;
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        restaurantName="DosBros Kitchen"
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
