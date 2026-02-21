import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'daily'; // daily, weekly, monthly
    const waiter = searchParams.get('waiter'); // optional: specific waiter

    const now = new Date();
    let startDate;

    // Calculate date range based on period
    switch (period) {
      case 'daily':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
    }

    // Fetch orders
    let query = supabase
      .from('orders')
      .select('*')
      .gte('timestamp', startDate.toISOString());

    if (waiter) {
      query = query.eq('waiter', waiter);
    }

    const { data: orders, error: ordersError } = await query;
    if (ordersError) throw ordersError;

    // Get all unique waiters
    const { data: allOrders } = await supabase
      .from('orders')
      .select('waiter')
      .gte('timestamp', startDate.toISOString());

    const uniqueWaiters = [...new Set(allOrders?.map(o => o.waiter).filter(Boolean))];

    // Calculate waiter performance
    const waiterPerformance = {};
    
    orders?.forEach(order => {
      const waiterName = order.waiter || 'Unknown';
      if (!waiterPerformance[waiterName]) {
        waiterPerformance[waiterName] = {
          waiter: waiterName,
          totalOrders: 0,
          paidOrders: 0,
          unpaidOrders: 0,
          totalRevenue: 0,
          paidRevenue: 0,
          unpaidAmount: 0,
          avgOrderValue: 0
        };
      }

      waiterPerformance[waiterName].totalOrders += 1;
      
      if (order.status === 'PAID') {
        waiterPerformance[waiterName].paidOrders += 1;
        waiterPerformance[waiterName].paidRevenue += parseFloat(order.total || 0);
        waiterPerformance[waiterName].totalRevenue += parseFloat(order.total || 0);
      } else if (order.status === 'UNPAID' || order.status === 'PENDING') {
        waiterPerformance[waiterName].unpaidOrders += 1;
        waiterPerformance[waiterName].unpaidAmount += parseFloat(order.total || 0);
      }
    });

    // Calculate average order value
    Object.values(waiterPerformance).forEach(waiter => {
      if (waiter.paidOrders > 0) {
        waiter.avgOrderValue = waiter.paidRevenue / waiter.paidOrders;
      }
    });

    const waiterStats = Object.values(waiterPerformance).sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Daily breakdown for specific waiter or all
    const dailyBreakdown = {};
    orders?.forEach(order => {
      const date = new Date(order.timestamp).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
      
      if (!dailyBreakdown[date]) {
        dailyBreakdown[date] = {
          date,
          orders: 0,
          paidOrders: 0,
          unpaidOrders: 0,
          revenue: 0,
          unpaidAmount: 0
        };
      }

      dailyBreakdown[date].orders += 1;
      
      if (order.status === 'PAID') {
        dailyBreakdown[date].paidOrders += 1;
        dailyBreakdown[date].revenue += parseFloat(order.total || 0);
      } else {
        dailyBreakdown[date].unpaidOrders += 1;
        dailyBreakdown[date].unpaidAmount += parseFloat(order.total || 0);
      }
    });

    const dailyData = Object.values(dailyBreakdown).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    // Overall summary
    const totalOrders = orders?.length || 0;
    const paidOrders = orders?.filter(o => o.status === 'PAID').length || 0;
    const unpaidOrders = orders?.filter(o => o.status === 'UNPAID' || o.status === 'PENDING').length || 0;
    const totalRevenue = orders?.filter(o => o.status === 'PAID')
      .reduce((sum, o) => sum + parseFloat(o.total || 0), 0) || 0;
    const unpaidAmount = orders?.filter(o => o.status === 'UNPAID' || o.status === 'PENDING')
      .reduce((sum, o) => sum + parseFloat(o.total || 0), 0) || 0;

    // Include individual orders if querying for specific waiter
    const individualOrders = waiter ? orders?.map(order => ({
      id: order.id,
      order_number: order.order_number,
      timestamp: order.timestamp,
      customer_name: order.customer_name,
      total: order.total,
      status: order.status,
      payment_method: order.payment_method
    })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) : [];

    return NextResponse.json({
      period,
      waiter: waiter || 'all',
      summary: {
        totalOrders,
        paidOrders,
        unpaidOrders,
        totalRevenue,
        unpaidAmount,
        avgOrderValue: paidOrders > 0 ? totalRevenue / paidOrders : 0
      },
      waiterStats,
      dailyData,
      uniqueWaiters,
      orders: individualOrders,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching waiter reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waiter reports', details: error.message },
      { status: 500 }
    );
  }
}
