import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { templates } = body;

    if (!templates || !Array.isArray(templates) || templates.length === 0) {
      return NextResponse.json(
        { error: 'Templates array is required' },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const template of templates) {
      try {
        const templateData = {
          name: template.name,
          category: template.category,
          unit: template.unit,
          is_active: template.isActive !== undefined ? template.isActive : true,
          sort_order: template.sortOrder || 999,
          created_at: template.createdAt ? new Date(template.createdAt).toISOString() : new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Check if template exists by name and category
        const { data: existingTemplate } = await supabase
          .from('expense_templates')
          .select('id')
          .eq('name', templateData.name)
          .eq('category', templateData.category)
          .single();

        if (existingTemplate) {
          // Update existing template
          const { error: updateError } = await supabase
            .from('expense_templates')
            .update(templateData)
            .eq('id', existingTemplate.id);

          if (updateError) throw updateError;
          results.push({ id: template.id, status: 'updated' });
        } else {
          // Insert new template
          const { error: insertError } = await supabase
            .from('expense_templates')
            .insert([templateData]);

          if (insertError) throw insertError;
          results.push({ id: template.id, status: 'created' });
        }
      } catch (error) {
        console.error('Error syncing template:', error);
        errors.push({
          id: template.id,
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
    console.error('Error in template sync:', error);
    return NextResponse.json(
      { error: 'Failed to sync templates', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { data: templates, error } = await supabase
      .from('expense_templates')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      templates: templates || [],
      count: templates?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates', details: error.message },
      { status: 500 }
    );
  }
}
