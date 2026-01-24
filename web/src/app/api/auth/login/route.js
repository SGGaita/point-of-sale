import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, password, role, isActive')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Your account has been deactivated. Please contact an administrator.' },
        { status: 403 }
      );
    }

    // Allow all roles to login (ADMIN, MANAGER, CASHIER, STOREKEEPER)
    const allowedRoles = ['ADMIN', 'MANAGER', 'CASHIER', 'STOREKEEPER'];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Access denied. Invalid user role.' },
        { status: 403 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Track login
    const loginTime = new Date().toISOString();
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create login history record
    await supabase
      .from('login_history')
      .insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        login_time: loginTime,
        ip_address: ipAddress,
        user_agent: userAgent,
        created_at: loginTime,
      });

    // Update user's last login and login count
    const { data: currentUser } = await supabase
      .from('users')
      .select('login_count')
      .eq('id', user.id)
      .single();

    await supabase
      .from('users')
      .update({
        last_login: loginTime,
        login_count: (currentUser?.login_count || 0) + 1,
        updated_at: loginTime,
      })
      .eq('id', user.id);

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return NextResponse.json({ 
      success: true,
      user: userData,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
