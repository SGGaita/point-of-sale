import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { randomUUID } from 'crypto';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    let query = supabase
      .from('inventory_items')
      .select('*')
      .order('name', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data: items, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ items: items || [] });
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory items' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, type, category, unit, currentStock, minStockLevel } = body;

    if (!name || !type || !unit) {
      return NextResponse.json(
        { error: 'Name, type, and unit are required' },
        { status: 400 }
      );
    }

    const { data: item, error } = await supabase
      .from('inventory_items')
      .insert({
        id: randomUUID(),
        name,
        type,
        category: category || null,
        unit,
        current_stock: currentStock || 0,
        min_stock_level: minStockLevel || 0,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}
