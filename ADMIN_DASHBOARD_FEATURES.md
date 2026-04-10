# Panel właściciela — opis funkcji

## KPI Cards (karty wskaźników)

### Łączne zamówienia
Całkowita liczba wszystkich zamówień w bazie. Pod wartością wyświetla strzałkę ze zmianą procentową względem poprzedniego miesiąca kalendarzowego (np. `↑ 12% vs poprzedni miesiąc`). Strzałka zielona przy wzroście, czerwona przy spadku.

### Łączny przychód
Suma `amount_total` ze wszystkich zamówień. Również z trendem MoM.

### Zamówienia dzisiaj
Liczba zamówień, których `created_at` odpowiada dzisiejszej dacie UTC. Bez trendu — jeden dzień nie ma sensu porównywać z miesiącem.

### Przychód dzisiaj
Suma przychodów z dzisiejszych zamówień.

### Śr. wartość zamówienia (AOV)
`Łączny przychód / Łączna liczba zamówień`. Mówi ile średnio wydaje jeden klient na jedno zamówienie. Z trendem MoM — widać czy klienci zamawiają więcej czy mniej na przestrzeni miesięcy.

---

## Wykresy

### Przychód — 30 dni / 12 miesięcy
Wykres obszarowy (area chart) pokazujący przychód w czasie. Przycisk toggluje między:
- **30 dni** — jeden punkt = jeden dzień, oś X w formacie `MM-DD`
- **12 miesięcy** — jeden punkt = jeden miesiąc, oś X z nazwami miesięcy po polsku

Dane liczymy po stronie serwera z tabeli `orders`.

### Najpopularniejsze produkty — Ilość / Przychód
Poziomy bar chart z top 10 produktami. Przycisk nad wykresem toggluje metrykę:
- **Ilość** — liczba sprzedanych sztuk (`SUM(quantity)` z `order_items`)
- **Przychód** — łączna wartość sprzedaży danego produktu (`SUM(quantity * unit_price)`)

Po zmianie metryki wykres re-sortuje produkty malejąco po wybranej wartości.

### Godziny szczytu
Bar chart z 24 słupkami (godziny 0:00–23:00). Każdy słupek = liczba zamówień złożonych w tej godzinie. Godziny przeliczone są na **strefę czasową Europa/Warszawa** (nie UTC), żeby dane były zgodne z rzeczywistością lokalu. Najwyższy słupek podświetlony pomarańczowo — reszta jasnopomrańczowa. Pozwala planować obsadę personelu.

### Ruch w tygodniu
Bar chart z 7 słupkami (Pon–Niedz). Liczba zamówień per dzień tygodnia, agregowana po wszystkich danych historycznych. Dzień z największą liczbą zamówień podświetlony pomarańczowo. Pomaga planować grafik i kierować promocje na słabsze dni.

---

## Sekcja klientów

### Karty statystyk klientów

**Wszyscy klienci** — liczba unikalnych adresów email w zamówieniach.

**Nowi klienci** — klienci z dokładnie jednym zamówieniem.

**Powracający klienci** — klienci z 2 lub więcej zamówieniami. Pod wartością pokazany jest **wskaźnik retencji** (`powracający / wszyscy * 100%`).

**Śr. czas między zamówieniami** — dla każdego klienta z 2+ zamówieniami liczymy odstępy w dniach między kolejnymi zamówieniami, a następnie uśredniamy wszystkie te odstępy. Wynik mówi ile dni mija przeciętnie zanim klient zamówi ponownie.

### Tabela: Najlepsi klienci
Top 10 klientów posortowanych malejąco po łącznej wartości zamówień. Kolumny:
- Email
- Imię (jeśli podane przy zamówieniu)
- Liczba zamówień
- Łączna kwota (pomarańczowa — najważniejsza metryka)
- Data ostatniego zamówienia

---

## Popularne zestawy

Lista par produktów, które klienci kupowali razem w jednym zamówieniu. Algorytm:
1. Grupujemy pozycje z `order_items` po `order_id`
2. Dla każdego zamówienia z 2+ różnymi produktami tworzymy wszystkie możliwe pary
3. Zliczamy ile razy każda para wystąpiła łącznie
4. Wyświetlamy top 8 par z licznikiem (np. `Burger + Frytki — 5×`)

Praktyczne zastosowanie: tworzenie zestawów w menu, promocje "kup razem taniej".

> Sekcja nie wyświetla się jeśli nie ma żadnych zamówień z więcej niż jednym produktem.
