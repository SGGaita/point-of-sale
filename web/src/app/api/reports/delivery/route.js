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
        total_amount,
        delivery_fee,
        created_by,
        users!orders_created_by_fkey (
          name
        )
      `)
      .eq('order_type', 'DELIVERY')
      .eq('order_status', 'COMPLETED');

    if (startDate) {
      query = query.gte('order_date', startDate);
    }

    if (endDate) {
      query = query.lte('order_date', `${endDate}T23:59:59`);
    }

    const { data: deliveries, error } = await query;

    if (error) throw error;

    const totalDeliveries = deliveries?.length || 0;
    let totalDeliveryFees = 0;
    const staffSales = {};

    deliveries?.forEach(delivery => {
      totalDeliveryFees += parseFloat(delivery.delivery_fee || 0);

      const staffName = delivery.users?.name || 'Unknown';
      if (!staffSales[staffName]) {
        staffSales[staffName] = {
          staffName,
          deliveryCount: 0,
          totalSales: 0,
          deliveryFees: 0,
        };
      }
      staffSales[staffName].deliveryCount += 1;
      staffSales[staffName].totalSales += parseFloat(delivery.total_amount || 0);
      staffSales[staffName].deliveryFees += parseFloat(delivery.delivery_fee || 0);
    });

    const salesByStaff = Object.values(staffSales).sort((a, b) => b.totalSales - a.totalSales);

    return NextResponse.json({
      totalDeliveries,
      totalDeliveryFees,
      salesByStaff,
    });
  } catch (error) {
    console.error('Error fetching delivery report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery report' },
      { status: 500 }
    );
  }
}
