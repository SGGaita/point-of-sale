import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const available = searchParams.get('available');

    let query = supabase
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    if (available === 'true') {
      query = query.eq('is_available', true);
    }

    const { data: menuItems, error } = await query;

    if (error) throw error;

    return NextResponse.json({ menuItems: menuItems || [] });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      inventoryItemId, 
      name, 
      description, 
      category, 
      price, 
      unit, 
      preparationTime,
      imageUrl,
      createdBy 
    } = body;

    if (!name || !category || !price || !unit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: menuItem, error } = await supabase
      .from('menu_items')
      .insert({
        id: crypto.randomUUID(),
        inventory_item_id: inventoryItemId || null,
        name,
        description: description || null,
        category,
        price: parseFloat(price),
        unit,
        is_available: true,
        preparation_time: preparationTime || null,
        image_url: imageUrl || null,
        created_by: createdBy || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      menuItem,
      message: 'Menu item created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    );
  }
}
