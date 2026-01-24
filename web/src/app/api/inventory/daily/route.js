import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { randomUUID } from 'crypto';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const { data: entries, error } = await supabase
      .from('daily_stock_entries')
      .select(`
        *,
        inventory_items (
          id,
          name,
          type,
          category,
          unit
        )
      `)
      .eq('entry_date', date)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ entries: entries || [] });
  } catch (error) {
    console.error('Error fetching daily entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily entries' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { entries } = body;

    if (!entries || !Array.isArray(entries)) {
      return NextResponse.json(
        { error: 'Entries array is required' },
        { status: 400 }
      );
    }

    const results = [];
    const stockTransactions = [];

    for (const entry of entries) {
      const { inventoryItemId, openingStock, entryDate, enteredBy } = entry;

      const { data: existingEntry } = await supabase
        .from('daily_stock_entries')
        .select('id')
        .eq('entry_date', entryDate)
        .eq('inventory_item_id', inventoryItemId)
        .single();

      let savedEntry;

      if (existingEntry) {
        const { data, error } = await supabase
          .from('daily_stock_entries')
          .update({
            opening_stock: openingStock,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingEntry.id)
          .select()
          .single();

        if (error) throw error;
        savedEntry = data;
      } else {
        const { data, error } = await supabase
          .from('daily_stock_entries')
          .insert({
            id: randomUUID(),
            entry_date: entryDate,
            inventory_item_id: inventoryItemId,
            opening_stock: openingStock,
            entered_by: enteredBy,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        savedEntry = data;
      }

      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({
          current_stock: openingStock,
          updated_at: new Date().toISOString(),
        })
        .eq('id', inventoryItemId);

      if (updateError) throw updateError;

      stockTransactions.push({
        id: randomUUID(),
        inventory_item_id: inventoryItemId,
        transaction_type: 'OPENING',
        quantity: openingStock,
        created_by: enteredBy,
        notes: `Opening stock entry for ${entryDate}`,
        created_at: new Date().toISOString(),
      });

      results.push(savedEntry);
    }

    if (stockTransactions.length > 0) {
      const { error: transError } = await supabase
        .from('stock_transactions')
        .insert(stockTransactions);

      if (transError) {
        console.error('Error creating stock transactions:', transError);
      }
    }

    return NextResponse.json({ 
      success: true,
      entries: results,
      message: 'Morning stock entries saved successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error saving daily entries:', error);
    return NextResponse.json(
      { error: 'Failed to save daily entries' },
      { status: 500 }
    );
  }
}
