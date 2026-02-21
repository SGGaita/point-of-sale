import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { menuItems } = body;

    if (!menuItems || !Array.isArray(menuItems) || menuItems.length === 0) {
      return NextResponse.json(
        { error: 'Menu items array is required' },
        { status: 400 }
      );
    }

    const syncedItems = [];
    const errors = [];
    let syncedCount = 0;
    let failedCount = 0;

    for (const item of menuItems) {
      try {
        // If item has server ID, update existing item
        if (item.id) {
          const { data: updatedItem, error } = await supabase
            .from('menu_items')
            .update({
              name: item.name,
              price: item.price,
              category: item.category,
              is_available: item.isAvailable,
              updated_at: new Date().toISOString(),
            })
            .eq('id', item.id)
            .select()
            .single();

          if (error) throw error;

          syncedItems.push({
            localId: item.localId,
            serverId: updatedItem.id,
            action: 'updated'
          });
          syncedCount++;
        } else {
          // Create new item
          const { data: newItem, error } = await supabase
            .from('menu_items')
            .insert({
              name: item.name,
              price: item.price,
              category: item.category,
              is_available: item.isAvailable,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) throw error;

          syncedItems.push({
            localId: item.localId,
            serverId: newItem.id,
            action: 'created'
          });
          syncedCount++;
        }
      } catch (itemError) {
        console.error(`Error syncing menu item ${item.name}:`, itemError);
        errors.push({
          item: item.name,
          error: itemError.message
        });
        failedCount++;
      }
    }

    return NextResponse.json({
      success: syncedCount > 0,
      synced: syncedCount,
      failed: failedCount,
      syncedItems,
      errors,
      message: `Synced ${syncedCount} menu items, ${failedCount} failed`
    });

  } catch (error) {
    console.error('Error in menu sync:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to sync menu items',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
