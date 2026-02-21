import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Fetch orders in date range
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .gte('timestamp', start.toISOString())
      .lte('timestamp', end.toISOString());

    if (ordersError) throw ordersError;

    // Fetch order items for the orders
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*');

    if (itemsError) throw itemsError;

    // Calculate sales metrics
    const paidOrders = orders?.filter(o => o.status === 'PAID') || [];
    const totalRevenue = paidOrders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
    const totalOrders = orders?.length || 0;
    const paidOrdersCount = paidOrders.length;
    const unpaidOrdersCount = orders?.filter(o => o.status === 'UNPAID' || o.status === 'PENDING').length || 0;

    // Sales by item
    const itemSales = {};
    orderItems?.forEach(item => {
      if (!itemSales[item.item_name]) {
        itemSales[item.item_name] = {
          itemName: item.item_name,
          quantitySold: 0,
          totalSales: 0,
          unitPrice: parseFloat(item.price || 0)
        };
      }
      itemSales[item.item_name].quantitySold += item.quantity;
      itemSales[item.item_name].totalSales += item.quantity * parseFloat(item.price || 0);
    });

    const salesByItem = Object.values(itemSales).sort((a, b) => b.totalSales - a.totalSales);

    // Sales by waiter
    const waiterSales = {};
    paidOrders.forEach(order => {
      const waiter = order.waiter || 'Unknown';
      if (!waiterSales[waiter]) {
        waiterSales[waiter] = {
          waiter,
          orderCount: 0,
          totalSales: 0
        };
      }
      waiterSales[waiter].orderCount += 1;
      waiterSales[waiter].totalSales += parseFloat(order.total || 0);
    });

    const salesByWaiter = Object.values(waiterSales).sort((a, b) => b.totalSales - a.totalSales);

    // Daily breakdown
    const dailyBreakdown = {};
    paidOrders.forEach(order => {
      const date = new Date(order.timestamp).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      if (!dailyBreakdown[date]) {
        dailyBreakdown[date] = {
          date,
          orders: 0,
          revenue: 0
        };
      }
      dailyBreakdown[date].orders += 1;
      dailyBreakdown[date].revenue += parseFloat(order.total || 0);
    });

    const dailySales = Object.values(dailyBreakdown).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    // Payment status breakdown
    const statusBreakdown = {
      paid: paidOrdersCount,
      unpaid: unpaidOrdersCount,
      paidRevenue: totalRevenue,
      unpaidAmount: orders?.filter(o => o.status === 'UNPAID' || o.status === 'PENDING')
        .reduce((sum, o) => sum + parseFloat(o.total || 0), 0) || 0
    };

    // Top customers
    const customerSales = {};
    paidOrders.forEach(order => {
      const customer = order.customer_name || 'Walk-in';
      if (!customerSales[customer]) {
        customerSales[customer] = {
          customerName: customer,
          orderCount: 0,
          totalSpent: 0
        };
      }
      customerSales[customer].orderCount += 1;
      customerSales[customer].totalSpent += parseFloat(order.total || 0);
    });

    const topCustomers = Object.values(customerSales)
      .filter(c => c.customerName !== 'Walk-in')
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    // Average order value
    const avgOrderValue = paidOrdersCount > 0 ? totalRevenue / paidOrdersCount : 0;

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalOrders,
        paidOrders: paidOrdersCount,
        unpaidOrders: unpaidOrdersCount,
        avgOrderValue
      },
      salesByItem,
      salesByWaiter,
      dailySales,
      statusBreakdown,
      topCustomers,
      dateRange: {
        start: startDate,
        end: endDate
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports', details: error.message },
      { status: 500 }
    );
  }
}
