import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { settingValue, updatedBy } = body;

    if (settingValue === undefined) {
      return NextResponse.json(
        { error: 'Setting value is required' },
        { status: 400 }
      );
    }

    // Check if setting is editable
    const { data: existingSetting } = await supabase
      .from('system_settings')
      .select('is_editable')
      .eq('id', id)
      .single();

    if (existingSetting && !existingSetting.is_editable) {
      return NextResponse.json(
        { error: 'This setting cannot be modified' },
        { status: 403 }
      );
    }

    const { data: setting, error } = await supabase
      .from('system_settings')
      .update({
        setting_value: settingValue,
        updated_by: updatedBy || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      setting,
      message: 'Setting updated successfully'
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json(
      { error: 'Failed to update setting' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Check if setting is editable
    const { data: existingSetting } = await supabase
      .from('system_settings')
      .select('is_editable')
      .eq('id', id)
      .single();

    if (existingSetting && !existingSetting.is_editable) {
      return NextResponse.json(
        { error: 'This setting cannot be deleted' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('system_settings')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      message: 'Setting deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting setting:', error);
    return NextResponse.json(
      { error: 'Failed to delete setting' },
      { status: 500 }
    );
  }
}
