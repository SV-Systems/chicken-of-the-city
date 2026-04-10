# Chicken of the City

Aplikacja e-commerce dla restauracji oparta na architekturze **Serverless Headless**. Umożliwia przeglądanie menu, składanie zamówień i płatność online.

## Tech Stack

- **Next.js** (App Router) — frontend i API routes
- **Tailwind CSS** — stylizacja
- **DatoCMS** — zarządzanie treścią (menu, ceny, godziny otwarcia)
- **Stripe Checkout** — płatności (BLIK, karty, Apple/Google Pay)
- **Supabase** — baza danych PostgreSQL (zamówienia, analityka, sync produktów)
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

## Zarządzanie treścią

Szczegółowy przewodnik dla właściciela restauracji (produkty, ceny, godziny, branding) znajduje się w [MAINTENANCE.md](./MAINTENANCE.md).

## Funkcje konfigurowane w DatoCMS

### Minimalna kwota zamówienia

W DatoCMS → **Restaurant Info** → pole **Minimum Order Amount** (float, opcjonalne):

- **Puste / null** — brak limitu, koszyk działa normalnie
- **Np. `30`** — koszyk zablokuje checkout i pokaże komunikat "Brakuje X zł" dopóki suma nie osiągnie 30 zł
- Walidacja działa zarówno po stronie klienta (przycisk wyłączony) jak i serwera (API odrzuci żądanie)

## Skrypty pomocnicze

### Główny skrypt inicjalizacyjny (zalecany)

```bash
# Uruchom z katalogu chicken-of-the-city/
node ../setup-datocms-full.mjs
```

Skrypt `setup-datocms-full.mjs` (w katalogu głównym projektu) wykonuje jednorazowo **pełny setup DatoCMS**:

- Tworzy wszystkie modele i pola (Category, Product, Restaurant Info, SEO Settings, Brand Settings, Email Settings)
- Dodaje 3 przykładowe produkty i 2 kategorie jako punkt startowy
- **Bezpieczny do ponownego uruchomienia** — pomija modele i pola, które już istnieją

Po uruchomieniu skryptu wejdź w DatoCMS i dostosuj:
- **Brand Settings** — nazwa restauracji, kolory, teksty hero
- **Restaurant Info** — dane kontaktowe, godziny otwarcia, minimalna kwota zamówienia (opcjonalne)
- **Email Settings** — treści maili do właściciela i klienta
- Produkty i kategorie — zastąp przykładowe danymi restauracji

### Starsze skrypty migracyjne (legacy)

```bash
# Tylko jeśli setup-datocms-full.mjs nie pokrywa Twoich potrzeb:
node scripts/setup-datocms.mjs       # stary setup (bez email/brand)
node scripts/seed-datocms.mjs        # przykładowe dane (uwaga: nie sprawdza duplikatów)
node scripts/add-brand-settings.mjs  # jednorazowa migracja brand settings
node scripts/add-secondary-color.mjs # jednorazowa migracja secondary color
node scripts/setup-email-settings.mjs # jednorazowa migracja email settings
```

## Supabase

### Architektura bazy danych

Supabase przechowuje trzy rodzaje danych:

| Tabela | Co zawiera |
|--------|-----------|
| `orders` | Każde zamówienie: klient, kwota, adres, numer, status |
| `order_items` | Pozycje z zamówienia: nazwa produktu, cena, ilość |
| `products` | Produkty zsynchronizowane automatycznie z DatoCMS |

### Jak działa sync DatoCMS → Supabase

DatoCMS wysyła webhook przy każdej publikacji/zmianie produktu. Endpoint `/api/datocms-webhook` odbiera to zdarzenie i upsertuje dane do tabeli `products` w Supabase. Nie trzeba nic robić ręcznie — zmiana w CMS trafia automatycznie do bazy.

### Na czyim koncie Supabase?

**Każdy klient = osobny projekt Supabase.** Dane się nie mieszają i można projekt łatwo przekazać.

- **Na start (rekomendowane):** Zakładasz projekt na swoim koncie Supabase (zalogowanym przez GitHub). Darmowy tier pozwala na 2 aktywne projekty jednocześnie.
- **Docelowo / profesjonalnie:** Klient zakłada własne konto Supabase, Ty dostajesz dostęp jako admin. Klient sam płaci rachunek. Można to zrobić też po fakcie — Supabase umożliwia transfer projektu między organizacjami.

> **Uwaga:** Darmowy tier pauzuje projekt po 7 dniach braku aktywności. Można wznowić ręcznie w panelu lub przejść na plan Pro ($25/mies.).

### Setup nowego projektu Supabase

1. Wejdź na **supabase.com** → zaloguj przez GitHub → **New project**
2. Wpisz nazwę projektu, ustaw hasło do bazy, wybierz region **Frankfurt (eu-central-1)**
3. Poczekaj ~2 min na uruchomienie
4. W panelu projektu: **Settings → API** — skopiuj `Project URL` i `service_role` key
5. Wklej je do `.env.local` jako `SUPABASE_URL` i `SUPABASE_SERVICE_ROLE_KEY`
6. Uruchom SQL z pliku `supabase/schema.sql` w edytorze SQL Supabase (Settings → SQL Editor)
7. W DatoCMS: **Settings → Webhooks** → dodaj nowy webhook:
   - URL: `https://twoja-domena.vercel.app/api/datocms-webhook`
   - Triggers: `publish`, `unpublish`, `delete` dla modeli Product i Category
   - Header: `x-datocms-webhook-secret: [wartość DATOCMS_WEBHOOK_SECRET]`

### Zmienne środowiskowe Supabase

```env
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...         # NIGDY nie ujawniaj publicznie — tylko server-side
DATOCMS_WEBHOOK_SECRET=losowy-string     # do weryfikacji webhooków z DatoCMS
```

> `SUPABASE_SERVICE_ROLE_KEY` pomija Row Level Security — używaj go tylko w API routes (server-side). Nigdy nie dodawaj go do zmiennych z prefixem `NEXT_PUBLIC_`.

---

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
| **Supabase** | Nowy projekt — patrz sekcja [Supabase](#supabase) poniżej |
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
SUPABASE_URL=                   # URL projektu z panelu Supabase
SUPABASE_SERVICE_ROLE_KEY=      # service role key (tylko server-side, nigdy publiczny)
DATOCMS_WEBHOOK_SECRET=         # dowolny losowy string do autoryzacji webhooka DatoCMS
```

### Krok 3 — Wypełnij Brand Settings w DatoCMS

Po uruchomieniu skryptów wejdź w DatoCMS → **Brand Settings** i uzupełnij:

| Pole | Opis | Przykład |
|------|------|---------|
| Restaurant Name | Główna część nazwy (bold) | `Pizza Roma` |
| Restaurant Tagline | Podtytuł (opcjonalny) | `Warszawa Śródmieście` |
| Hero Label | Mały tekst nad tytułem | `Zamów online` |
| Hero Title | Pierwsza linia tytułu | `Najlepsza pizza` |
| Hero Highlight | Druga linia (w kolorze marki) | `w mieście.` |
| Hero Subtitle | Opis pod tytułem | `Świeże składniki...` |
| Category Emoji | Emoji przy kategoriach | `🍕` |
| Brand Color | Kolor marki (hex) | `#dc2626` |

Kliknij **Publish** — żadna edycja kodu nie jest potrzebna.

### Co zależy od rodzaju restauracji

| Rodzaj restauracji | Co się zmienia |
|--------------------|----------------|
| Pizza, burgery, sushi... | Tylko treść w DatoCMS (produkty, kategorie, zdjęcia) |
| Inny kolor wiodący | Pole **Brand Color** w DatoCMS (np. `#dc2626` dla czerwonego) |
| Inna waluta niż PLN | `app/api/checkout/route.ts` — zmiana `'pln'` (jedyna edycja kodu) |
| Logo zamiast tekstu | Podmiana `<span>` w `Header.tsx` na `<Image>` |
