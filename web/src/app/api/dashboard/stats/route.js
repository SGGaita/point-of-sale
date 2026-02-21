import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request) {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    
    const last7Days = new Date(todayStart);
    last7Days.setDate(last7Days.getDate() - 7);
    
    const last30Days = new Date(todayStart);
    last30Days.setDate(last30Days.getDate() - 30);

    // Get all orders
    const { data: allOrders } = await supabase
      .from('orders')
      .select('*');

    // Get today's orders
    const { data: todayOrders } = await supabase
      .from('orders')
      .select('*')
      .gte('timestamp', todayStart.toISOString());

    // Get yesterday's orders
    const { data: yesterdayOrders } = await supabase
      .from('orders')
      .select('*')
      .gte('timestamp', yesterdayStart.toISOString())
      .lt('timestamp', todayStart.toISOString());

    // Get last 7 days orders
    const { data: last7DaysOrders } = await supabase
      .from('orders')
      .select('*')
      .gte('timestamp', last7Days.toISOString());

    // Get all menu items
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('*');

    // Calculate today's stats
    const todayRevenue = todayOrders?.filter(o => o.status === 'PAID')
      .reduce((sum, o) => sum + parseFloat(o.total || 0), 0) || 0;
    
    const yesterdayRevenue = yesterdayOrders?.filter(o => o.status === 'PAID')
      .reduce((sum, o) => sum + parseFloat(o.total || 0), 0) || 0;

    const todayOrdersCount = todayOrders?.length || 0;
    const yesterdayOrdersCount = yesterdayOrders?.length || 0;

    const todayPaidOrders = todayOrders?.filter(o => o.status === 'PAID').length || 0;
    const todayUnpaidOrders = todayOrders?.filter(o => o.status === 'UNPAID' || o.status === 'PENDING').length || 0;

    // Calculate percentage changes
    const revenueChange = yesterdayRevenue > 0 
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1)
      : 0;
    
    const ordersChange = yesterdayOrdersCount > 0
      ? ((todayOrdersCount - yesterdayOrdersCount) / yesterdayOrdersCount * 100).toFixed(1)
      : 0;

    // Get total revenue (all time)
    const totalRevenue = allOrders?.filter(o => o.status === 'PAID')
      .reduce((sum, o) => sum + parseFloat(o.total || 0), 0) || 0;

    // Get pending orders count
    const pendingOrders = allOrders?.filter(o => o.status === 'UNPAID' || o.status === 'PENDING').length || 0;

    // Get recent orders (last 10)
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10);

    // Get daily revenue for last 7 days
    const dailyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(todayStart);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayOrders = last7DaysOrders?.filter(o => {
        const orderDate = new Date(o.timestamp);
        return orderDate >= dayStart && orderDate < dayEnd && o.status === 'PAID';
      }) || [];

      const revenue = dayOrders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
      
      dailyRevenue.push({
        date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: revenue,
        orders: dayOrders.length
      });
    }

    // Get top selling items (from order_items)
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('item_name, quantity, price');

    const itemSales = {};
    orderItems?.forEach(item => {
      if (!itemSales[item.item_name]) {
        itemSales[item.item_name] = {
          name: item.item_name,
          quantity: 0,
          revenue: 0
        };
      }
      itemSales[item.item_name].quantity += item.quantity;
      itemSales[item.item_name].revenue += item.quantity * parseFloat(item.price || 0);
    });

    const topItems = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return NextResponse.json({
      todayStats: {
        revenue: todayRevenue,
        revenueChange: parseFloat(revenueChange),
        orders: todayOrdersCount,
        ordersChange: parseFloat(ordersChange),
        paidOrders: todayPaidOrders,
        unpaidOrders: todayUnpaidOrders
      },
      overallStats: {
        totalRevenue,
        totalOrders: allOrders?.length || 0,
        totalProducts: menuItems?.length || 0,
        pendingOrders
      },
      recentOrders: recentOrders || [],
      dailyRevenue,
      topItems
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics', details: error.message },
      { status: 500 }
    );
  }
}
