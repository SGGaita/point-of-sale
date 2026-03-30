import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { expenses } = body;

    if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
      return NextResponse.json(
        { error: 'Expenses array is required' },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const expense of expenses) {
      try {
        const expenseData = {
          template_id: expense.templateId || null,
          category: expense.category,
          amount: expense.amount,
          quantity: expense.quantity || null,
          unit_cost: expense.unitCost || null,
          description: expense.description,
          timestamp: new Date(expense.timestamp).toISOString(),
          created_at: expense.createdAt ? new Date(expense.createdAt).toISOString() : new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Check if expense already exists by checking similar timestamp and amount
        const { data: existingExpense } = await supabase
          .from('expenses')
          .select('id')
          .eq('timestamp', expenseData.timestamp)
          .eq('amount', expenseData.amount)
          .eq('description', expenseData.description)
          .single();

        if (existingExpense) {
          // Update existing expense
          const { error: updateError } = await supabase
            .from('expenses')
            .update(expenseData)
            .eq('id', existingExpense.id);

          if (updateError) throw updateError;
          results.push({ id: expense.id, status: 'updated' });
        } else {
          // Insert new expense
          const { error: insertError } = await supabase
            .from('expenses')
            .insert([expenseData]);

          if (insertError) throw insertError;
          results.push({ id: expense.id, status: 'created' });
        }
      } catch (error) {
        console.error('Error syncing expense:', error);
        errors.push({
          id: expense.id,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      synced: results.length,
      failed: errors.length,
      results,
      errors,
    });
  } catch (error) {
    console.error('Error in expense sync:', error);
    return NextResponse.json(
      { error: 'Failed to sync expenses', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = supabase
      .from('expenses')
      .select('*')
      .order('timestamp', { ascending: false });

    if (startDate) {
      query = query.gte('timestamp', startDate);
    }
    if (endDate) {
      query = query.lte('timestamp', endDate);
    }

    const { data: expenses, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      expenses: expenses || [],
      count: expenses?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses', details: error.message },
      { status: 500 }
    );
  }
}
