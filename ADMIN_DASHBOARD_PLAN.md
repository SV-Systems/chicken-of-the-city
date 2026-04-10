# Plan rozbudowy panelu właściciela

Wszystkie dane pochodzą z istniejących tabel: `orders`, `order_items`, `products`.

---

## Faza 1 — Szybkie wygrane (KPI i wykresy)

### 1.1 Średnia wartość zamówienia (AVG Order Value)
**Gdzie:** nowy card w rzędzie KPI, obok "Przychód dzisiaj"  
**Dane:** `SUM(amount_total) / COUNT(*)` z tabeli `orders`  
**Wariant:** pokazać też trend — czy AOV rośnie czy spada vs poprzedni miesiąc (strzałka + %)

### 1.2 Top produkty po przychodzie
**Gdzie:** drugi tab w istniejącym wykresie "Najpopularniejsze produkty"  
**Dane:** `SUM(quantity * unit_price)` z `order_items`, grupowane po `product_name`  
**Toggle:** przycisk "Ilość / Przychód" nad wykresem — analogiczny do "30 dni / 12 mies."

### 1.3 Godziny szczytu
**Gdzie:** nowy wykres, bar chart poziomy lub kolumnowy  
**Dane:** grupowanie `created_at` po godzinie (0–23), `COUNT(*)` per godzina  
**Widok:** 24 słupki, highlight na najwyższym. Bez filtra daty — wszystkie zamówienia.  
**Wartość dla właściciela:** wie kiedy potrzebuje więcej personelu

### 1.4 Dzień tygodnia
**Gdzie:** obok wykresu godzin szczytu, mały bar chart  
**Dane:** grupowanie `created_at` po `EXTRACT(DOW ...)`, etykiety Pon–Niedz  
**Wartość:** planowanie grafiku, promocje w słabsze dni

---

## Faza 2 — Analiza klientów

### 2.1 Powracający vs nowi klienci
**Gdzie:** nowy card lub sekcja "Klienci"  
**Dane:**
- unikalne emaile z jednym zamówieniem = nowi
- unikalne emaile z 2+ zamówieniami = powracający
- % powracających = retention rate

**Widok:** dwa liczby + procent retencji. Opcjonalnie pie chart.

### 2.2 Najlepsi klienci
**Gdzie:** tabela obok tabeli zamówień, zakładka "Klienci"  
**Dane:** grupowanie po `customer_email`, `SUM(amount_total)`, `COUNT(*)`, `MAX(created_at)`  
**Kolumny:** Email / Imię / Liczba zamówień / Łączna kwota / Ostatnie zamówienie  
**Wartość:** identyfikacja VIP klientów

### 2.3 Częstotliwość powrotów
**Gdzie:** w sekcji klientów  
**Dane:** dla klientów z 2+ zamówieniami — średni czas między zamówieniami (dni)  
**Widok:** "Średni czas między zamówieniami: X dni"

---

## Faza 3 — Trendy i wzrost

### 3.1 Wzrost miesiąc do miesiąca (MoM)
**Gdzie:** dodatkowe wskaźniki przy istniejących KPI cardach  
**Dane:** porównanie bieżącego miesiąca do poprzedniego  
**Widok:** przy każdym KPI mała strzałka + % (np. ↑ 12% vs poprzedni miesiąc)

### 3.2 Najpopularniejsze zestawy (produkty kupowane razem)
**Gdzie:** nowa sekcja "Popularne zestawy"  
**Dane:** dla każdego `order_id` — pary produktów z `order_items`, zliczanie par  
**Widok:** lista np. "Burger + Frytki — 47 razy"  
**Wartość:** podstawa do tworzenia zestawów promocyjnych w menu

---

## Kolejność implementacji (rekomendowana)

| Priorytet | Feature | Trudność | Wartość |
|-----------|---------|----------|---------|
| 1 | Godziny szczytu | niska | wysoka |
| 2 | Dzień tygodnia | niska | wysoka |
| 3 | Top produkty po przychodzie (toggle) | niska | średnia |
| 4 | Średnia wartość zamówienia | niska | średnia |
| 5 | Powracający vs nowi klienci | średnia | wysoka |
| 6 | Najlepsi klienci (tabela) | średnia | wysoka |
| 7 | Wzrost MoM przy KPI | średnia | średnia |
| 8 | Popularne zestawy | wysoka | wysoka |
| 9 | Częstotliwość powrotów | wysoka | średnia |

---

## Uwagi techniczne

- Wszystkie obliczenia fazy 1 i 2 można zrobić po stronie serwera w `getStats()` w `page.tsx` — bez nowych tabel
- Faza 3 (zestawy) wymaga pętli po parach w JS lub funkcji SQL — do oceny przy implementacji
- Przy większej liczbie zamówień (1000+) warto przenieść agregacje do widoków (`VIEW`) w Supabase zamiast liczyć w JS
- Każdy nowy wykres to osobny client component analogiczny do `Charts.tsx`
