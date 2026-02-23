import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  return NextResponse.json({ 
    message: 'Menu sync endpoint. Use POST to sync menu items.',
    endpoint: '/api/menu/sync',
    method: 'POST'
  });
}

export async function POST(request) {
  try {
    console.log('Menu sync POST request received');
    const body = await request.json();
    const { menuItems } = body;

    console.log(`Received ${menuItems?.length || 0} menu items to sync`);

    if (!menuItems || !Array.isArray(menuItems) || menuItems.length === 0) {
      console.log('No menu items provided');
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
        console.log(`Processing item: ${item.name}, serverId: ${item.id}`);
        
        // If item has server ID, check if it exists and use conflict resolution
        if (item.id) {
          // Check if item exists on server
          const { data: existingItem, error: fetchError } = await supabase
            .from('menu_items')
            .select('*')
            .eq('id', item.id)
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') {
            // Error other than "not found"
            throw fetchError;
          }

          if (existingItem) {
            // Item exists - use last-write-wins conflict resolution
            const serverUpdatedAt = new Date(existingItem.updated_at).getTime();
            const clientUpdatedAt = new Date(item.updatedAt).getTime();

            if (clientUpdatedAt > serverUpdatedAt) {
              // Client version is newer - update server
              const { data: updatedItem, error } = await supabase
                .from('menu_items')
                .update({
                  name: item.name,
                  price: item.price,
                  category: item.category,
                  is_available: item.isAvailable,
                  updated_at: new Date(item.updatedAt).toISOString(),
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
              console.log(`Updated item: ${item.name} (client newer)`);
            } else {
              // Server version is newer or same - skip update
              syncedItems.push({
                localId: item.localId,
                serverId: existingItem.id,
                action: 'skipped'
              });
              syncedCount++;
              console.log(`Skipped ${item.name} (server version is newer or same)`);
            }
          } else {
            // Item doesn't exist on server - create it
            const { data: newItem, error } = await supabase
              .from('menu_items')
              .insert({
                id: item.id,
                name: item.name,
                price: item.price,
                category: item.category,
                is_available: item.isAvailable !== undefined ? item.isAvailable : true,
                created_at: new Date(item.createdAt).toISOString(),
                updated_at: new Date(item.updatedAt).toISOString(),
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
            console.log(`Created item: ${item.name}`);
          }
        } else {
          // No server ID - create new item on server
          const { data: newItem, error } = await supabase
            .from('menu_items')
            .insert({
              name: item.name,
              price: item.price,
              category: item.category,
              is_available: item.isAvailable !== undefined ? item.isAvailable : true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) {
            console.error(`Insert error for ${item.name}:`, error);
            throw error;
          }

          syncedItems.push({
            localId: item.localId,
            serverId: newItem.id,
            action: 'created'
          });
          syncedCount++;
          console.log(`Created new item: ${item.name}`);
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

    console.log(`Sync complete: ${syncedCount} synced, ${failedCount} failed`);

    return NextResponse.json({
      success: syncedCount > 0,
      synced: syncedCount,
      failed: failedCount,
      syncedItems,
      errors,
      message: `Synced ${syncedCount} menu items, ${failedCount} failed`
    });

  } catch (error) {
    console.error('Error in menu sync:', error.message, error);
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
