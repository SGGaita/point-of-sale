import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      paymentMethod,
      amount,
      referenceNumber,
      notes,
      createdBy 
    } = body;

    if (!paymentMethod || !amount) {
      return NextResponse.json(
        { error: 'Payment method and amount are required' },
        { status: 400 }
      );
    }

    // Get current order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('total_amount, amount_paid')
      .eq('id', id)
      .single();

    if (orderError) throw orderError;

    const currentPaid = parseFloat(order.amount_paid || 0);
    const newPaid = currentPaid + parseFloat(amount);
    const totalAmount = parseFloat(order.total_amount);

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('order_payments')
      .insert({
        id: crypto.randomUUID(),
        order_id: id,
        payment_method: paymentMethod,
        amount: parseFloat(amount),
        reference_number: referenceNumber || null,
        notes: notes || null,
        created_by: createdBy || null,
        payment_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Update order payment status
    let paymentStatus = 'PARTIAL';
    if (newPaid >= totalAmount) {
      paymentStatus = 'PAID';
    } else if (newPaid === 0) {
      paymentStatus = 'UNPAID';
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        amount_paid: newPaid,
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        paid_at: paymentStatus === 'PAID' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) throw updateError;

    return NextResponse.json({ 
      success: true,
      payment,
      message: 'Payment recorded successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { error: 'Failed to record payment' },
      { status: 500 }
    );
  }
}
