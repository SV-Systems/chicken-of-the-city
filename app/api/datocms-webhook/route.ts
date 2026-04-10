import { NextRequest } from 'next/server';
import { getAllProducts } from '@/lib/datocms';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-datocms-webhook-secret');
  if (secret !== process.env.DATOCMS_WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const products = await getAllProducts();

    const rows = products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description ?? null,
      price: p.price,
      allergens: p.allergens ?? null,
      image_url: p.image?.url ?? null,
      category_id: p.category?.id ?? null,
      category_name: p.category?.name ?? null,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('products')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.error('[datocms-webhook] Błąd upsert produktów:', error);
      return new Response('Błąd bazy danych', { status: 500 });
    }

    console.log(`[datocms-webhook] Zsynchronizowano ${rows.length} produktów z Supabase`);
    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('[datocms-webhook] Błąd:', err);
    return new Response('Błąd serwera', { status: 500 });
  }
}
