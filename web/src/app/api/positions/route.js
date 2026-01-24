import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    let query = supabase
      .from('positions')
      .select('*')
      .order('name', { ascending: true });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data: positions, error } = await query;

    if (error) throw error;

    return NextResponse.json({ positions: positions || [] });
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch positions' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, createdBy } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Position name is required' },
        { status: 400 }
      );
    }

    const { data: position, error } = await supabase
      .from('positions')
      .insert({
        id: crypto.randomUUID(),
        name,
        description: description || null,
        is_active: true,
        created_by: createdBy || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'A position with this name already exists' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ 
      success: true,
      position,
      message: 'Position created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating position:', error);
    return NextResponse.json(
      { error: 'Failed to create position' },
      { status: 500 }
    );
  }
}
