import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

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
      const { inventoryItemId, closingStock, wastage, entryDate, enteredBy } = entry;

      // Get or create daily entry
      const { data: existingEntry } = await supabase
        .from('daily_stock_entries')
        .select('id, opening_stock')
        .eq('entry_date', entryDate)
        .eq('inventory_item_id', inventoryItemId)
        .single();

      let savedEntry;

      if (existingEntry) {
        // Calculate stock used
        const stockUsed = (existingEntry.opening_stock || 0) - closingStock - (wastage || 0);

        const { data, error } = await supabase
          .from('daily_stock_entries')
          .update({
            closing_stock: closingStock,
            wastage: wastage || 0,
            stock_used: stockUsed,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingEntry.id)
          .select()
          .single();

        if (error) throw error;
        savedEntry = data;
      } else {
        // Create new entry with closing stock
        const { data, error } = await supabase
          .from('daily_stock_entries')
          .insert({
            id: crypto.randomUUID(),
            entry_date: entryDate,
            inventory_item_id: inventoryItemId,
            opening_stock: closingStock, // If no opening was entered, use closing as opening
            closing_stock: closingStock,
            wastage: wastage || 0,
            stock_used: 0,
            entered_by: enteredBy,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        savedEntry = data;
      }

      // Update current stock in inventory_items
      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({
          current_stock: closingStock,
          updated_at: new Date().toISOString(),
        })
        .eq('id', inventoryItemId);

      if (updateError) throw updateError;

      // Record wastage transaction if any
      if (wastage && wastage > 0) {
        stockTransactions.push({
          id: crypto.randomUUID(),
          inventory_item_id: inventoryItemId,
          transaction_type: 'WASTAGE',
          quantity: wastage,
          created_by: enteredBy,
          notes: `End-of-day wastage for ${entryDate}`,
          created_at: new Date().toISOString(),
        });
      }

      // Record closing transaction
      stockTransactions.push({
        id: crypto.randomUUID(),
        inventory_item_id: inventoryItemId,
        transaction_type: 'CLOSING',
        quantity: closingStock,
        created_by: enteredBy,
        notes: `Closing stock for ${entryDate}`,
        created_at: new Date().toISOString(),
      });

      results.push(savedEntry);
    }

    // Insert all stock transactions
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
      message: 'End-of-day closing stock saved successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error saving closing stock:', error);
    return NextResponse.json(
      { error: 'Failed to save closing stock' },
      { status: 500 }
    );
  }
}
