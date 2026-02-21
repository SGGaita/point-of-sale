import { database } from '../database';
import { Q } from '@nozbe/watermelondb';

export const orderService = {
  // Get all orders
  async getAllOrders() {
    const ordersCollection = database.collections.get('orders');
    const orders = await ordersCollection.query().fetch();
    
    // Convert to plain objects with items
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await order.orderItems.fetch();
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          waiter: order.waiter,
          customerName: order.customerName,
          total: order.total,
          status: order.status,
          timestamp: order.timestamp,
          items: items.map(item => ({
            name: item.itemName,
            price: item.price,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
          })),
        };
      })
    );
    
    return ordersWithItems;
  },

  // Get orders by status
  async getOrdersByStatus(status) {
    const ordersCollection = database.collections.get('orders');
    const orders = await ordersCollection
      .query(Q.where('status', status))
      .fetch();
    
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await order.orderItems.fetch();
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          waiter: order.waiter,
          customerName: order.customerName,
          total: order.total,
          status: order.status,
          timestamp: order.timestamp,
          items: items.map(item => ({
            name: item.itemName,
            price: item.price,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
          })),
        };
      })
    );
    
    return ordersWithItems;
  },

  // Create a new order
  async createOrder(orderData) {
    const ordersCollection = database.collections.get('orders');
    const orderItemsCollection = database.collections.get('order_items');
    
    let createdOrder;
    
    await database.write(async () => {
      // Create the order
      createdOrder = await ordersCollection.create(order => {
        order.orderNumber = orderData.orderNumber;
        order.waiter = orderData.waiter;
        order.customerName = orderData.customerName || '';
        order.total = orderData.total;
        order.status = orderData.status || 'pending';
        order.timestamp = orderData.timestamp || Date.now();
        order.isSynced = false;
        order.syncedAt = null;
      });
      
      // Create order items
      for (const item of orderData.items) {
        await orderItemsCollection.create(orderItem => {
          orderItem.orderId = createdOrder.id;
          orderItem.itemName = item.name;
          orderItem.price = item.price;
          orderItem.quantity = item.quantity;
          orderItem.totalPrice = item.totalPrice;
        });
      }
    });
    
    // Return the created order with items
    const items = await createdOrder.orderItems.fetch();
    return {
      id: createdOrder.id,
      orderNumber: createdOrder.orderNumber,
      waiter: createdOrder.waiter,
      customerName: createdOrder.customerName,
      total: createdOrder.total,
      status: createdOrder.status,
      timestamp: createdOrder.timestamp,
      items: items.map(item => ({
        name: item.itemName,
        price: item.price,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
      })),
    };
  },

  // Update order status
  async updateOrderStatus(orderId, newStatus) {
    const ordersCollection = database.collections.get('orders');
    const order = await ordersCollection.find(orderId);
    
    await database.write(async () => {
      await order.update(o => {
        o.status = newStatus;
        o.isSynced = false; // Mark as unsynced so it will be synced to backend
        o.syncedAt = null;
      });
    });
    
    return order;
  },

  // Update order customer name
  async updateOrderCustomerName(orderId, customerName) {
    const ordersCollection = database.collections.get('orders');
    const order = await ordersCollection.find(orderId);
    
    await database.write(async () => {
      await order.update(o => {
        o.customerName = customerName;
      });
    });
    
    return order;
  },

  // Delete an order
  async deleteOrder(orderId) {
    const ordersCollection = database.collections.get('orders');
    const order = await ordersCollection.find(orderId);
    
    await database.write(async () => {
      // Delete associated order items first
      const items = await order.orderItems.fetch();
      for (const item of items) {
        await item.markAsDeleted();
      }
      
      // Delete the order
      await order.markAsDeleted();
    });
  },

  // Delete all orders (for reset functionality)
  async deleteAllOrders() {
    const ordersCollection = database.collections.get('orders');
    const orderItemsCollection = database.collections.get('order_items');
    
    const allOrders = await ordersCollection.query().fetch();
    const allOrderItems = await orderItemsCollection.query().fetch();
    
    await database.write(async () => {
      // Delete all order items
      for (const item of allOrderItems) {
        await item.markAsDeleted();
      }
      
      // Delete all orders
      for (const order of allOrders) {
        await order.markAsDeleted();
      }
    });
  },

  // Get orders by date range
  async getOrdersByDateRange(startDate, endDate) {
    const ordersCollection = database.collections.get('orders');
    const orders = await ordersCollection
      .query(
        Q.where('timestamp', Q.gte(startDate)),
        Q.where('timestamp', Q.lte(endDate))
      )
      .fetch();
    
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await order.orderItems.fetch();
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          waiter: order.waiter,
          customerName: order.customerName,
          total: order.total,
          status: order.status,
          timestamp: order.timestamp,
          items: items.map(item => ({
            name: item.itemName,
            price: item.price,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
          })),
        };
      })
    );
    
    return ordersWithItems;
  },
};
