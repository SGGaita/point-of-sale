import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const { data: order, error } = await supabase
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
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      orderStatus,
      paymentStatus,
      paymentMethod,
      amountPaid,
      notes,
      updatedBy 
    } = body;

    const updateData = {
      updated_at: new Date().toISOString(),
      updated_by: updatedBy || null,
    };

    if (orderStatus !== undefined) {
      updateData.order_status = orderStatus;
      if (orderStatus === 'COMPLETED') {
        updateData.completed_at = new Date().toISOString();
      }
    }

    if (paymentStatus !== undefined) {
      updateData.payment_status = paymentStatus;
      if (paymentStatus === 'PAID') {
        updateData.paid_at = new Date().toISOString();
      }
    }

    if (paymentMethod !== undefined) updateData.payment_method = paymentMethod;
    if (amountPaid !== undefined) updateData.amount_paid = parseFloat(amountPaid);
    if (notes !== undefined) updateData.notes = notes;

    const { data: order, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If order is completed, reduce inventory stock
    if (orderStatus === 'COMPLETED') {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('inventory_item_id, quantity')
        .eq('order_id', id);

      if (orderItems && orderItems.length > 0) {
        for (const item of orderItems) {
          if (item.inventory_item_id) {
            await supabase.rpc('reduce_inventory_stock', {
              item_id: item.inventory_item_id,
              quantity_to_reduce: item.quantity
            });
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true,
      order,
      message: 'Order updated successfully'
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Update status to CANCELLED instead of deleting
    const { data: order, error } = await supabase
      .from('orders')
      .update({
        order_status: 'CANCELLED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      order,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
