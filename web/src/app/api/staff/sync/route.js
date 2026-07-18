import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

/**
 * GET /api/staff/sync
 * Returns active staff with Waiter position for mobile roster pull.
 * Web Staff (position = Waiter) is the source of truth.
 */
export async function GET() {
  try {
    const { data: staff, error } = await supabase
      .from('staff')
      .select(`
        id,
        name,
        is_active,
        position_name,
        updated_at,
        positions (
          id,
          name
        )
      `)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    const waiters = (staff || [])
      .filter((member) => {
        const positionName =
          member.positions?.name || member.position_name || '';
        return positionName.toLowerCase() === 'waiter';
      })
      .map((member) => ({
        id: member.id,
        name: member.name,
        isActive: member.is_active !== false,
        updatedAt: member.updated_at,
      }));

    return NextResponse.json({
      waiters,
      count: waiters.length,
      source: 'staff',
      message: 'Active waiters from web Staff roster',
    });
  } catch (error) {
    console.error('Error syncing waiters from staff:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync waiters',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
