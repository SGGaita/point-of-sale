import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, isActive } = body;

    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.is_active = isActive;

    const { data: position, error } = await supabase
      .from('positions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
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
      message: 'Position updated successfully'
    });
  } catch (error) {
    console.error('Error updating position:', error);
    return NextResponse.json(
      { error: 'Failed to update position' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Check if any staff members are using this position
    const { data: staffCount } = await supabase
      .from('staff')
      .select('id', { count: 'exact', head: true })
      .eq('position_id', id)
      .eq('is_active', true);

    // Soft delete by setting is_active to false
    const { data: position, error } = await supabase
      .from('positions')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      message: 'Position deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting position:', error);
    return NextResponse.json(
      { error: 'Failed to delete position' },
      { status: 500 }
    );
  }
}
