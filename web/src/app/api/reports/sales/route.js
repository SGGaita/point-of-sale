import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = supabase
      .from('orders')
      .select(`
        id,
        order_type,
        total_amount,
        order_items (
          item_name,
          quantity,
          unit_price,
          total_amount
        )
      `)
      .eq('order_status', 'COMPLETED');

    if (startDate) {
      query = query.gte('order_date', startDate);
    }

    if (endDate) {
      query = query.lte('order_date', `${endDate}T23:59:59`);
    }

    const { data: orders, error } = await query;

    if (error) throw error;

    const salesByItem = {};
    const salesByType = {
      DINE_IN: 0,
      TAKEAWAY: 0,
      DELIVERY: 0,
    };
    let totalSales = 0;

    orders?.forEach(order => {
      totalSales += parseFloat(order.total_amount || 0);
      salesByType[order.order_type] = (salesByType[order.order_type] || 0) + parseFloat(order.total_amount || 0);

      order.order_items?.forEach(item => {
        if (!salesByItem[item.item_name]) {
          salesByItem[item.item_name] = {
            itemName: item.item_name,
            quantitySold: 0,
            unitPrice: parseFloat(item.unit_price || 0),
            totalSales: 0,
          };
        }
        salesByItem[item.item_name].quantitySold += parseFloat(item.quantity || 0);
        salesByItem[item.item_name].totalSales += parseFloat(item.total_amount || 0);
      });
    });

    const salesByItemArray = Object.values(salesByItem).sort((a, b) => b.totalSales - a.totalSales);

    return NextResponse.json({
      salesByItem: salesByItemArray,
      salesByType,
      totalSales,
    });
  } catch (error) {
    console.error('Error fetching sales report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales report' },
      { status: 500 }
    );
  }
}
