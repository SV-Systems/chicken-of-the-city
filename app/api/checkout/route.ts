import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { getAllProducts } from '@/lib/datocms';

interface CartItemInput {
  id: string;
  quantity: number;
  note?: string;
}

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // --- Parse body ---
  let items: CartItemInput[];
  try {
    const body = await request.json();
    items = body.items;
    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'Koszyk jest pusty.' }, { status: 400 });
    }
  } catch {
    return Response.json({ error: 'Nieprawidłowe dane.' }, { status: 400 });
  }

  // --- Validate structure ---
  for (const item of items) {
    if (
      typeof item.id !== 'string' ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1
    ) {
      return Response.json({ error: 'Nieprawidłowe dane koszyka.' }, { status: 400 });
    }
    if (item.note !== undefined && (typeof item.note !== 'string' || item.note.length > 300)) {
      return Response.json({ error: 'Nieprawidłowe dane koszyka.' }, { status: 400 });
    }
  }

  // --- Verify prices against DatoCMS (source of truth) ---
  let products;
  try {
    products = await getAllProducts();
  } catch {
    return Response.json({ error: 'Błąd pobierania menu.' }, { status: 502 });
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  const lineItems = [];

  for (const item of items) {
    const product = productMap.get(item.id);
    if (!product) {
      return Response.json(
        { error: `Produkt "${item.id}" nie istnieje.` },
        { status: 400 }
      );
    }

    lineItems.push({
      price_data: {
        currency: 'pln',
        unit_amount: Math.round(product.price * 100), // PLN → grosze (Stripe wymaga integer)
        product_data: {
          name: product.name,
          ...(product.image && { images: [product.image.url] }),
        },
      },
      quantity: item.quantity,
    });
  }

  // --- Build notes metadata ---
  const metadata: Record<string, string> = {};
  items.forEach((item, index) => {
    if (item.note && item.note.trim()) {
      const product = productMap.get(item.id);
      const label = product ? product.name : item.id;
      metadata[`uwaga_${index + 1}`] = `${label}: ${item.note.trim()}`;
    }
  });

  // --- Create Stripe Checkout session ---
  const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_BASE_URL;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      // Brak payment_method_types = Stripe używa metod skonfigurowanych w Dashboard
      // (BLIK, karty, Apple Pay, Google Pay — włącz w Stripe Dashboard > Settings)
      success_url: `${origin}/zamowienie/sukces?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/zamowienie/anulowano`,
      shipping_address_collection: { allowed_countries: ['PL'] },
      invoice_creation: { enabled: true },
      ...(Object.keys(metadata).length > 0 && { metadata }),
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error('[checkout] Stripe error:', err);
    return Response.json({ error: 'Błąd inicjalizacji płatności.' }, { status: 500 });
  }
}
