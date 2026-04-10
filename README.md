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

## Wdrożenie dla nowego klienta

### Co pozostaje bez zmian

Cały kod aplikacji jest generyczny — nie wymaga modyfikacji przy nowym kliencie:

- `lib/datocms.ts` — zapytania GraphQL
- `context/CartContext.tsx` — logika koszyka
- `app/api/checkout/route.ts` — integracja ze Stripe
- `app/api/webhook/route.ts` — obsługa webhooków
- Komponenty UI: `CartDrawer`, `CartButton`, `ProductCard`
- Strony: `app/menu/`, `app/zamowienie/`

### Krok 1 — Nowe konta w serwisach

| Serwis | Co robisz |
|--------|-----------|
| **DatoCMS** | Nowy projekt — uruchom `setup-datocms.mjs`, potem `seed-datocms.mjs` |
| **Stripe** | Nowe konto klienta lub subkonto |
| **Vercel** | Nowy deployment podpięty pod nowe repo |
| **GitHub** | Nowe repo (kopia tego projektu) w organizacji agencji |

### Krok 2 — Zmienne środowiskowe

Uzupełnij nowe wartości w `.env.local` i w panelu Vercel:

```env
DATOCMS_API_TOKEN=              # nowy token z projektu DatoCMS klienta
DATOCMS_FULL_ACCESS_API_TOKEN=  # nowy full-access token (tylko do seedowania)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=  # nowy klucz publiczny Stripe klienta
STRIPE_SECRET_KEY=              # nowy klucz prywatny Stripe klienta
STRIPE_WEBHOOK_SECRET=          # nowy secret z webhooka Vercel → Stripe
NEXT_PUBLIC_BASE_URL=           # docelowa domena klienta
```

### Krok 3 — Edycja kodu (hardcoded elementy)

Miejsca wymagające zmiany na nazwę/branding nowego klienta:

| Plik | Linia | Co zmienić |
|------|-------|------------|
| `components/Header.tsx` | 9–15 | Nazwa restauracji w nagłówku |
| `components/Footer.tsx` | 14–16 | Nazwa restauracji w stopce |
| `components/Footer.tsx` | 53 | Nazwa w copyright |
| `app/layout.tsx` | 42–49 | Fallback metadata (tytuł, opis) |
| `app/page.tsx` | 28–31 | Teksty sekcji hero |
| `app/page.tsx` | 69 | Emoji przy kategoriach (🍗 → dopasuj do kuchni) |
| `app/globals.css` | — | Kolory brandowe (domyślnie orange) |

Aby zmienić kolor wiodący z pomarańczowego na inny, zamień `orange-500` / `orange-400` / `orange-600` na wybrany kolor Tailwind (np. `red-600`, `emerald-500`) we wszystkich komponentach.

### Co zależy od rodzaju restauracji

| Rodzaj restauracji | Co się zmienia |
|--------------------|----------------|
| Pizza, burgery, sushi... | Tylko treść w DatoCMS (produkty, kategorie, zdjęcia) |
| Inny kolor wiodący | Zamiana `orange-*` w komponentach i `globals.css` |
| Inna waluta niż PLN | `app/api/checkout/route.ts:59` — zmiana `'pln'` |
| Logo zamiast tekstu | Podmiana `<span>` w `Header.tsx` na `<Image>` |

### Opcja white-label (przy 3+ klientach)

Warto rozważyć przeniesienie hardcoded tekstów (nazwa, slogan, kolory) do modelu "Ustawienia Globalne" w DatoCMS. Wtedy kod staje się w 100% white-label — zero edycji kodu przy każdym nowym kliencie.
