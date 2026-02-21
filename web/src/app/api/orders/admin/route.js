import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const waiter = searchParams.get('waiter');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Build query
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *
        )
      `, { count: 'exact' })
      .order('timestamp', { ascending: false })
      .range(from, to);

    if (status && status !== 'ALL') {
      query = query.eq('status', status.toUpperCase());
    }

    if (waiter) {
      query = query.ilike('waiter', `%${waiter}%`);
    }

    if (startDate) {
      query = query.gte('timestamp', startDate);
    }

    if (endDate) {
      query = query.lte('timestamp', endDate);
    }

    const { data: orders, error, count } = await query;

    if (error) throw error;

    // Get status counts
    const { data: allOrders } = await supabase
      .from('orders')
      .select('status, total');

    const statusCounts = {
      total: count || 0,
      paid: allOrders?.filter(o => o.status === 'PAID').length || 0,
      unpaid: allOrders?.filter(o => o.status === 'UNPAID' || o.status === 'PENDING').length || 0,
    };

    const totalRevenue = allOrders
      ?.filter(o => o.status === 'PAID')
      .reduce((sum, o) => sum + parseFloat(o.total || 0), 0) || 0;

    const unpaidAmount = allOrders
      ?.filter(o => o.status === 'UNPAID' || o.status === 'PENDING')
      .reduce((sum, o) => sum + parseFloat(o.total || 0), 0) || 0;

    // Transform order_items to match expected format
    const transformedOrders = orders?.map(order => ({
      ...order,
      orderItems: order.order_items?.map(item => ({
        id: item.id,
        itemName: item.item_name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.total_price,
      })) || []
    })) || [];

    return NextResponse.json({
      orders: transformedOrders,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
        hasMore: from + pageSize < (count || 0)
      },
      summary: {
        ...statusCounts,
        totalRevenue,
        unpaidAmount
      }
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { orderNumber, status } = body;

    if (!orderNumber || !status) {
      return NextResponse.json(
        { error: 'Order number and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['PENDING', 'PAID', 'UNPAID'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({
        status: status.toUpperCase(),
        updated_at: new Date().toISOString()
      })
      .eq('order_number', orderNumber)
      .select(`
        *,
        order_items (
          *
        )
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    // Transform order_items to match expected format
    const transformedOrder = {
      ...updatedOrder,
      orderItems: updatedOrder.order_items?.map(item => ({
        id: item.id,
        itemName: item.item_name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.total_price,
      })) || []
    };

    return NextResponse.json({
      success: true,
      order: transformedOrder,
      message: `Order ${orderNumber} status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status', details: error.message },
      { status: 500 }
    );
  }
}
