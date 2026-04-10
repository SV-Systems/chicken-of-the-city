# Chicken of the City

Aplikacja e-commerce dla restauracji oparta na architekturze **Serverless Headless**. Umożliwia przeglądanie menu, składanie zamówień i płatność online.

## Tech Stack

- **Next.js** (App Router) — frontend i API routes
- **Tailwind CSS** — stylizacja
- **DatoCMS** — zarządzanie treścią (menu, ceny, godziny otwarcia)
- **Stripe Checkout** — płatności (BLIK, karty, Apple/Google Pay)
- **Vercel** — hosting i CI/CD

## Środowisko lokalne

Skopiuj zmienne środowiskowe:

```bash
cp .env.example .env.local
```

Uzupełnij `.env.local`:

```env
DATOCMS_API_TOKEN=...
DATOCMS_FULL_ACCESS_API_TOKEN=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Zainstaluj zależności i uruchom serwer deweloperski:

```bash
npm install
npm run dev
```

Aplikacja działa pod adresem [http://localhost:3000](http://localhost:3000).

## Produkcja

Aplikacja jest wdrożona na **Vercel** i dostępna pod docelową domeną projektu. Każdy push na gałąź `main` automatycznie triggeruje nowy deploy.

Zmiana treści w DatoCMS (publikacja rekordu) wysyła webhook do Vercel, który przebudowuje stronę z nowymi danymi.

## Skrypty pomocnicze

```bash
# Jednorazowe zasiewanie danych w DatoCMS (tylko przy pierwszym setupie)
node scripts/seed-datocms.mjs

# Konfiguracja modeli w DatoCMS
node scripts/setup-datocms.mjs
```

> **Uwaga:** Nie uruchamiaj `seed-datocms.mjs` ponownie — skrypt nie sprawdza duplikatów i stworzy zdublowane rekordy.
