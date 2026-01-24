import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let ordersQuery = supabase
      .from('orders')
      .select('total_amount')
      .eq('order_status', 'COMPLETED');

    if (startDate) {
      ordersQuery = ordersQuery.gte('order_date', startDate);
    }

    if (endDate) {
      ordersQuery = ordersQuery.lte('order_date', `${endDate}T23:59:59`);
    }

    const { data: orders, error: ordersError } = await ordersQuery;

    if (ordersError) throw ordersError;

    let expensesQuery = supabase
      .from('expenses')
      .select('amount, category');

    if (startDate) {
      expensesQuery = expensesQuery.gte('expense_date', startDate);
    }

    if (endDate) {
      expensesQuery = expensesQuery.lte('expense_date', `${endDate}T23:59:59`);
    }

    const { data: expenses, error: expensesError } = await expensesQuery;

    if (expensesError) throw expensesError;

    const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0) || 0;
    const totalExpenses = expenses?.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0) || 0;
    
    const morningSupplies = expenses
      ?.filter(expense => expense.category === 'SUPPLIES' || expense.category === 'INVENTORY')
      .reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0) || 0;

    const profit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    return NextResponse.json({
      totalRevenue,
      totalExpenses,
      profit,
      profitMargin,
      dailySales: totalRevenue,
      morningSupplies,
    });
  } catch (error) {
    console.error('Error fetching profitability report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profitability report' },
      { status: 500 }
    );
  }
}
