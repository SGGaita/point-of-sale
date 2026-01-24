import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { randomUUID } from 'crypto';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    let query = supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (!includeInactive) {
      query = query.eq('isActive', true);
    }

    const { data: products, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, sku, price, cost, stock, category } = body;

    if (!name || !sku || price === undefined || stock === undefined) {
      return NextResponse.json(
        { error: 'Name, SKU, price, and stock are required' },
        { status: 400 }
      );
    }

    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('sku', sku)
      .single();

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this SKU already exists' },
        { status: 409 }
      );
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        id: randomUUID(),
        name,
        description: description || null,
        sku,
        price,
        cost: cost || null,
        stock,
        category: category || null,
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
