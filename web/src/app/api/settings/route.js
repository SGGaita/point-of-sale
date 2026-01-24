import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query = supabase
      .from('system_settings')
      .select('*')
      .order('category', { ascending: true })
      .order('label', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data: settings, error } = await query;

    if (error) throw error;

    return NextResponse.json({ settings: settings || [] });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { settingKey, settingValue, settingType, category, label, description, updatedBy } = body;

    if (!settingKey || !settingValue || !settingType || !category || !label) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: setting, error } = await supabase
      .from('system_settings')
      .insert({
        id: crypto.randomUUID(),
        setting_key: settingKey,
        setting_value: settingValue,
        setting_type: settingType,
        category,
        label,
        description: description || null,
        is_editable: true,
        updated_by: updatedBy || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A setting with this key already exists' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ 
      success: true,
      setting,
      message: 'Setting created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating setting:', error);
    return NextResponse.json(
      { error: 'Failed to create setting' },
      { status: 500 }
    );
  }
}
