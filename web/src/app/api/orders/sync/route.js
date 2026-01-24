import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { orders } = body;

    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json(
        { error: 'Orders array is required' },
        { status: 400 }
      );
    }

    const syncedOrders = [];
    const errors = [];

    for (const orderData of orders) {
      try {
        const { orderNumber, waiter, customerName, total, status, timestamp, orderItems } = orderData;

        if (!orderNumber || !waiter || !total || !status || !timestamp) {
          errors.push({
            orderNumber: orderNumber || 'unknown',
            error: 'Missing required fields'
          });
          continue;
        }

        // Check if order exists
        const { data: existingOrder } = await supabase
          .from('orders')
          .select('id')
          .eq('order_number', orderNumber)
          .single();

        if (existingOrder) {
          // Update existing order
          const { error: updateError } = await supabase
            .from('orders')
            .update({
              waiter,
              customer_name: customerName || null,
              total: parseFloat(total),
              status: status.toUpperCase(),
              timestamp: new Date(timestamp).toISOString(),
              synced_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('order_number', orderNumber);

          if (updateError) throw updateError;

          // Delete existing order items
          if (orderItems && Array.isArray(orderItems) && orderItems.length > 0) {
            await supabase
              .from('order_items')
              .delete()
              .eq('order_id', existingOrder.id);

            // Insert new order items
            const items = orderItems.map(item => ({
              id: crypto.randomUUID(),
              order_id: existingOrder.id,
              item_name: item.itemName || item.item_name,
              price: parseFloat(item.price),
              quantity: parseInt(item.quantity),
              total_price: parseFloat(item.totalPrice || item.total_price),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));

            const { error: itemsError } = await supabase
              .from('order_items')
              .insert(items);

            if (itemsError) throw itemsError;
          }

          syncedOrders.push({ orderNumber, action: 'updated' });
        } else {
          // Create new order
          const orderId = crypto.randomUUID();
          
          const { error: insertError } = await supabase
            .from('orders')
            .insert({
              id: orderId,
              order_number: orderNumber,
              waiter,
              customer_name: customerName || null,
              total: parseFloat(total),
              status: status.toUpperCase(),
              timestamp: new Date(timestamp).toISOString(),
              synced_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (insertError) throw insertError;

          // Insert order items
          if (orderItems && Array.isArray(orderItems) && orderItems.length > 0) {
            const items = orderItems.map(item => ({
              id: crypto.randomUUID(),
              order_id: orderId,
              item_name: item.itemName || item.item_name,
              price: parseFloat(item.price),
              quantity: parseInt(item.quantity),
              total_price: parseFloat(item.totalPrice || item.total_price),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));

            const { error: itemsError } = await supabase
              .from('order_items')
              .insert(items);

            if (itemsError) throw itemsError;
          }

          syncedOrders.push({ orderNumber, action: 'created' });
        }
      } catch (orderError) {
        console.error(`Error syncing order ${orderData.orderNumber}:`, orderError);
        errors.push({
          orderNumber: orderData.orderNumber || 'unknown',
          error: orderError.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      synced: syncedOrders.length,
      failed: errors.length,
      syncedOrders,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully synced ${syncedOrders.length} orders${errors.length > 0 ? `, ${errors.length} failed` : ''}`
    });
  } catch (error) {
    console.error('Error syncing orders:', error);
    return NextResponse.json(
      { error: 'Failed to sync orders', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          item_name,
          quantity,
          price,
          total_price
        )
      `, { count: 'exact' })
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status.toUpperCase());
    }

    if (startDate) {
      query = query.gte('timestamp', startDate);
    }

    if (endDate) {
      query = query.lte('timestamp', endDate);
    }

    const { data: orders, error, count } = await query;

    if (error) throw error;

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
        total: count || 0,
        limit,
        offset,
        hasMore: offset + limit < (count || 0)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error.message },
      { status: 500 }
    );
  }
}
