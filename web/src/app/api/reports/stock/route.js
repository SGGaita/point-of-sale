import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const { data: inventoryItems, error } = await supabase
      .from('inventory')
      .select('*')
      .order('item_name');

    if (error) throw error;

    let query = supabase
      .from('orders')
      .select(`
        order_items (
          item_name,
          quantity
        )
      `)
      .eq('order_status', 'COMPLETED');

    if (startDate) {
      query = query.gte('order_date', startDate);
    }

    if (endDate) {
      query = query.lte('order_date', `${endDate}T23:59:59`);
    }

    const { data: orders, error: ordersError } = await query;

    if (ordersError) throw ordersError;

    const stockUsage = {};
    orders?.forEach(order => {
      order.order_items?.forEach(item => {
        stockUsage[item.item_name] = (stockUsage[item.item_name] || 0) + parseFloat(item.quantity || 0);
      });
    });

    const items = inventoryItems?.map(item => {
      const used = stockUsage[item.item_name] || 0;
      return {
        itemName: item.item_name,
        openingStock: parseFloat(item.quantity_in_stock || 0) + used,
        stockUsed: used,
        closingStock: parseFloat(item.quantity_in_stock || 0),
        unit: item.unit,
      };
    }) || [];

    const totalOpeningStock = items.reduce((sum, item) => sum + item.openingStock, 0);
    const totalStockUsed = items.reduce((sum, item) => sum + item.stockUsed, 0);
    const totalClosingStock = items.reduce((sum, item) => sum + item.closingStock, 0);

    return NextResponse.json({
      items,
      totalOpeningStock,
      totalStockUsed,
      totalClosingStock,
    });
  } catch (error) {
    console.error('Error fetching stock report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock report' },
      { status: 500 }
    );
  }
}
