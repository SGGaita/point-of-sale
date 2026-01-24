import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const orderType = searchParams.get('orderType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          item_name,
          quantity,
          unit,
          unit_price,
          subtotal,
          tax_amount,
          total_amount,
          notes
        )
      `)
      .order('order_date', { ascending: false });

    if (status) {
      query = query.eq('order_status', status);
    }

    if (paymentStatus) {
      query = query.eq('payment_status', paymentStatus);
    }

    if (orderType) {
      query = query.eq('order_type', orderType);
    }

    if (startDate) {
      query = query.gte('order_date', startDate);
    }

    if (endDate) {
      query = query.lte('order_date', endDate);
    }

    const { data: orders, error } = await query;

    if (error) throw error;

    return NextResponse.json({ orders: orders || [] });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      orderType,
      customerName,
      customerPhone,
      tableNumber,
      deliveryAddress,
      items,
      notes,
      specialInstructions,
      createdBy 
    } = body;

    if (!orderType || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Order type and items are required' },
        { status: 400 }
      );
    }

    // Generate order number
    const { data: orderNumberData } = await supabase.rpc('generate_order_number');
    const orderNumber = orderNumberData || `ORD-${Date.now()}`;

    // Calculate totals
    let subtotal = 0;
    items.forEach(item => {
      subtotal += parseFloat(item.quantity) * parseFloat(item.unitPrice);
    });

    // Get VAT settings
    const { data: vatSettings } = await supabase
      .from('system_settings')
      .select('setting_value')
      .in('setting_key', ['vat_enabled', 'vat_rate'])
      .limit(2);

    const vatEnabled = vatSettings?.find(s => s.setting_key === 'vat_enabled')?.setting_value === 'true';
    const vatRate = parseFloat(vatSettings?.find(s => s.setting_key === 'vat_rate')?.setting_value || '0');

    const taxAmount = vatEnabled ? (subtotal * vatRate / 100) : 0;
    const totalAmount = subtotal + taxAmount;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: crypto.randomUUID(),
        order_number: orderNumber,
        order_type: orderType,
        order_status: 'PENDING',
        payment_status: 'UNPAID',
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
        table_number: tableNumber || null,
        delivery_address: deliveryAddress || null,
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        notes: notes || null,
        special_instructions: specialInstructions || null,
        created_by: createdBy || null,
        order_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map(item => ({
      id: crypto.randomUUID(),
      order_id: order.id,
      menu_item_id: item.menuItemId || null,
      inventory_item_id: item.inventoryItemId || null,
      item_name: item.itemName,
      quantity: parseFloat(item.quantity),
      unit: item.unit,
      unit_price: parseFloat(item.unitPrice),
      subtotal: parseFloat(item.quantity) * parseFloat(item.unitPrice),
      tax_amount: vatEnabled ? (parseFloat(item.quantity) * parseFloat(item.unitPrice) * vatRate / 100) : 0,
      total_amount: parseFloat(item.quantity) * parseFloat(item.unitPrice) * (1 + (vatEnabled ? vatRate / 100 : 0)),
      notes: item.notes || null,
      created_at: new Date().toISOString(),
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return NextResponse.json({ 
      success: true,
      order: { ...order, order_items: orderItems },
      message: 'Order created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
