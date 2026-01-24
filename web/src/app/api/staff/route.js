import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request) {
  try {
    const { data: staff, error } = await supabase
      .from('staff')
      .select(`
        *,
        positions (
          id,
          name,
          description
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ staff: staff || [] });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, positionId, positionName, hireDate, salary, notes, createdBy } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const { data: staff, error } = await supabase
      .from('staff')
      .insert({
        id: crypto.randomUUID(),
        name,
        email: email || null,
        phone: phone || null,
        position_id: positionId || null,
        position_name: positionName || null,
        hire_date: hireDate || null,
        salary: salary || null,
        notes: notes || null,
        is_active: true,
        created_by: createdBy || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      staff,
      message: 'Staff member added successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json(
      { error: 'Failed to create staff member' },
      { status: 500 }
    );
  }
}
