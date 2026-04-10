import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { getEmailSettings, getRestaurantInfo } from '@/lib/datocms';

function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const sig = request.headers.get('stripe-signature');
  if (!sig) {
    return new Response('Brak podpisu Stripe.', { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('[webhook] Błąd weryfikacji podpisu:', err);
    return new Response('Nieprawidłowy podpis.', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      const customerEmail = session.customer_details?.email ?? '';
      const customerName = session.customer_details?.name ?? 'Klient';
      const amountTotal = ((session.amount_total ?? 0) / 100).toFixed(2);
      const stripeSessionId = session.id;

      // Adres dostawy
      const addr = session.shipping_details?.address;
      const shippingAddress = addr
        ? [addr.line1, addr.line2, `${addr.postal_code ?? ''} ${addr.city ?? ''}`.trim(), addr.country]
            .filter(Boolean)
            .join('\n')
        : 'brak';

      // Krótki numer zamówienia oparty na czasie sesji, np. "260410-1423"
      const sessionDate = new Date((session.created ?? Date.now() / 1000) * 1000);
      const pad = (n: number) => n.toString().padStart(2, '0');
      const orderId = `${sessionDate.getFullYear().toString().slice(2)}${pad(sessionDate.getMonth() + 1)}${pad(sessionDate.getDate())}-${pad(sessionDate.getHours())}${pad(sessionDate.getMinutes())}${pad(sessionDate.getSeconds())}`;

      // Zbierz uwagi z metadata sesji (format: uwaga_1 = "Produkt: treść")
      const notes = Object.entries(session.metadata ?? {})
        .filter(([k]) => k.startsWith('uwaga_'))
        .map(([, v]) => `• ${v}`)
        .join('\n');

      // Pobierz pozycje zamówienia ze Stripe
      let itemsText = '';
      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(stripeSessionId, { limit: 100 });
        itemsText = lineItems.data
          .map(li => `• ${li.description} × ${li.quantity}`)
          .join('\n');
      } catch (err) {
        console.error('[webhook] Błąd pobierania line items:', err);
        itemsText = '(brak szczegółów)';
      }

      console.log(
        `[webhook] Nowe zamówienie #${orderId} (Stripe: ${stripeSessionId})\n` +
          `  Klient: ${customerName} <${customerEmail}>\n` +
          `  Kwota: ${amountTotal} PLN`
      );

      // Wyślij maile tylko gdy klucz Resend jest skonfigurowany
      if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
        console.warn('[webhook] Brak RESEND_API_KEY lub RESEND_FROM — pomijam wysyłkę maili.');
        break;
      }

      const resend = new Resend(process.env.RESEND_API_KEY);

      let emailSettings, restaurantInfo;
      try {
        [emailSettings, restaurantInfo] = await Promise.all([
          getEmailSettings(),
          getRestaurantInfo(),
        ]);
      } catch (err) {
        console.error('[webhook] Błąd pobierania ustawień z DatoCMS:', err);
        break;
      }

      const vars: Record<string, string> = {
        name: customerName,
        email: customerEmail,
        amount: amountTotal,
        orderId,
        items: itemsText,
        notes: notes || 'brak',
        address: shippingAddress,
      };

      // Mail do właściciela
      if (restaurantInfo.email) {
        try {
          await resend.emails.send({
            from: process.env.RESEND_FROM,
            to: restaurantInfo.email,
            subject: fillTemplate(emailSettings.ownerSubject, vars),
            text: fillTemplate(emailSettings.ownerBody, vars),
          });
          console.log(`[webhook] Mail do właściciela wysłany → ${restaurantInfo.email}`);
        } catch (err) {
          console.error('[webhook] Błąd wysyłki maila do właściciela:', err);
        }
      }

      // Mail do klienta
      if (customerEmail) {
        try {
          await resend.emails.send({
            from: process.env.RESEND_FROM,
            to: customerEmail,
            subject: fillTemplate(emailSettings.customerSubject, vars),
            text: fillTemplate(emailSettings.customerBody, vars),
          });
          console.log(`[webhook] Mail do klienta wysłany → ${customerEmail}`);
        } catch (err) {
          console.error('[webhook] Błąd wysyłki maila do klienta:', err);
        }
      }

      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`[webhook] Sesja wygasła: ${session.id}`);
      break;
    }

    default:
      break;
  }

  return new Response('OK', { status: 200 });
}
