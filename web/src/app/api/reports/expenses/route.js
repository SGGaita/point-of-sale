import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = supabase
      .from('expenses')
      .select(`
        *,
        users!expenses_recorded_by_fkey (
          name
        )
      `)
      .order('expense_date', { ascending: false });

    if (startDate) {
      query = query.gte('expense_date', startDate);
    }

    if (endDate) {
      query = query.lte('expense_date', `${endDate}T23:59:59`);
    }

    const { data: expensesData, error } = await query;

    if (error) throw error;

    const expenses = expensesData?.map(expense => ({
      id: expense.id,
      expenseDate: expense.expense_date,
      category: expense.category,
      description: expense.description,
      amount: parseFloat(expense.amount || 0),
      recordedBy: expense.users?.name || 'Unknown',
    })) || [];

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    return NextResponse.json({
      expenses,
      totalExpenses,
    });
  } catch (error) {
    console.error('Error fetching expense report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense report' },
      { status: 500 }
    );
  }
}
