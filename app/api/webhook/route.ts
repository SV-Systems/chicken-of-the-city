import { NextRequest } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const sig = request.headers.get('stripe-signature');
  if (!sig) {
    return new Response('Brak podpisu Stripe.', { status: 400 });
  }

  // Stripe wymaga surowego body (nie parsowanego JSON) do weryfikacji podpisu
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('[webhook] Błąd weryfikacji podpisu:', err);
    return new Response('Nieprawidłowy podpis.', { status: 400 });
  }

  // --- Obsługa zdarzeń ---
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      const customerEmail = session.customer_details?.email ?? 'brak';
      const customerName = session.customer_details?.name ?? 'brak';
      const amountTotal = ((session.amount_total ?? 0) / 100).toFixed(2);

      console.log(
        `[webhook] Nowe zamówienie #${session.id}\n` +
          `  Klient: ${customerName} <${customerEmail}>\n` +
          `  Kwota: ${amountTotal} PLN`
      );

      /*
       * TODO (Faza 5 — e-maile):
       * Skonfiguruj wybraną usługę e-mail (np. Resend, SendGrid, nodemailer + SMTP)
       * i wyślij tutaj powiadomienie do restauratora na adres z env RESTAURANT_EMAIL.
       *
       * Przykład z Resend:
       *   await resend.emails.send({
       *     from: 'zamowienia@twojadomena.pl',
       *     to: process.env.RESTAURANT_EMAIL,
       *     subject: `Nowe zamówienie — ${amountTotal} PLN`,
       *     text: `Klient: ${customerName}\nE-mail: ${customerEmail}\nKwota: ${amountTotal} PLN`,
       *   });
       *
       * Potwierdzenie dla klienta: Stripe wysyła je automatycznie
       * jeśli w Stripe Dashboard > Settings > Customer emails masz włączone "Receipts".
       */

      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`[webhook] Sesja wygasła: ${session.id}`);
      break;
    }

    default:
      // Ignoruj inne zdarzenia
      break;
  }

  return new Response('OK', { status: 200 });
}
