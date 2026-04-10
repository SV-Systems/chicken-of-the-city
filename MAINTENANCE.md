# Przewodnik Utrzymania Aplikacji

Dokument opisuje jak zarządzać treścią, aktualizować kod i utrzymywać aplikację Chicken of the City.

**Repozytorium GitHub:** https://github.com/SV-Systems/chicken-of-the-city

---

## Zarządzanie treścią (DatoCMS)

Panel admina: **https://app.datocms.com**

### Dodawanie nowego produktu

1. Zaloguj się do DatoCMS
2. Przejdź do **Content → Produkty**
3. Kliknij **+ New record**
4. Uzupełnij pola: Nazwa, Opis, Cena, Zdjęcie, Kategoria, Alergeny
5. Kliknij **Publish**

Strona automatycznie zaktualizuje się po chwili (Vercel robi rebuild po webhoku z DatoCMS).

### Dodawanie nowej kategorii

1. **Content → Kategorie → + New record**
2. Uzupełnij: Nazwa, Kolejność wyświetlania (Order)
3. **Publish**

Kolejność w menu odpowiada polu **Order** (1 = pierwsza kategoria).

### Edycja istniejącego produktu / ceny

1. **Content → Produkty** → kliknij produkt
2. Zmień co trzeba
3. **Publish**

### Zmiana godzin otwarcia / telefonu / adresu

1. **Content → Info o Restauracji**
2. Edytuj pola
3. **Publish**

### Przywracanie poprzedniej wersji rekordu

Przy edycji każdego rekordu po prawej stronie jest zakładka **Versions** — można cofnąć do dowolnej poprzedniej wersji.

> **Uwaga:** Usuniętych rekordów nie można przywrócić. Klient powinien mieć rolę bez uprawnień do usuwania (Settings → Roles).

---

## Aktualizacja kodu

### Workflow

```
edycja kodu lokalnie → git push → Vercel automatycznie deployuje
```

### Kroki

```bash
# 1. Wprowadź zmiany w kodzie lokalnie
# 2. Sprawdź co się zmieniło
git status
git diff

# 3. Dodaj pliki i zrób commit
git add .
git commit -m "Opis zmiany"

# 4. Wypchnij na GitHub
git push
```

Po pushu Vercel automatycznie wykrywa zmiany i deployuje nową wersję. Status deployu widać w dashboardzie Vercel → zakładka **Deployments**.

### Testowanie lokalnie przed pushem

```bash
npm run dev       # serwer deweloperski na localhost:3000
npm run build     # sprawdza czy build produkcyjny przechodzi bez błędów
```

---

## Vercel — monitoring i limity

Dashboard: **https://vercel.com/dashboard**

### Gdzie sprawdzić status

- **Deployments** — historia wdrożeń, logi buildów, ewentualne błędy
- **Settings → Usage** — zużycie bandwidth i function invocations

### Limity planu Hobby (darmowy)

| Zasób | Limit miesięczny |
|---|---|
| Bandwidth | 100 GB |
| Function Invocations (API) | 100 000 |
| Build minutes | 6 000 min |

Dla typowego ruchu restauracyjnego limity te są praktycznie nieosiągalne.

> Vercel nie wysyła alertów o zbliżaniu się do limitu na planie darmowym — sprawdzaj Usage raz w miesiącu jeśli chcesz mieć pewność.

---

## Stripe — obsługa płatności

Panel: **https://dashboard.stripe.com**

### Gdzie sprawdzić zamówienia i płatności

- **Payments** — lista wszystkich transakcji
- **Events** — logi webhooków (czy powiadomienia e-mail się wysłały)

### Tryb testowy vs produkcyjny

W lewym górnym rogu Stripe jest przełącznik **Test mode / Live mode**. Upewnij się że jesteś w trybie **Live** gdy sprawdzasz prawdziwe zamówienia.

---

## Zmienne środowiskowe

Zmienne produkcyjne przechowywane są w Vercel (nie w kodzie).

Aby dodać lub zmienić zmienną:
1. Vercel Dashboard → projekt → **Settings → Environment Variables**
2. Dodaj/zmień wartość
3. Zrób nowy deploy (push czegokolwiek na `main`) żeby zmiany weszły w życie

Lokalne zmienne trzymaj w pliku `.env.local` (nie jest commitowany do GitHuba).

---

## Częste pytania

**Zmieniłem cenę w DatoCMS ale na stronie nadal jest stara — co robić?**
Poczekaj 1-2 minuty na rebuild Vercel. Jeśli po 5 minutach nadal nie ma zmiany, sprawdź w Vercel → Deployments czy build się udał.

**Klient przypadkowo zmienił coś i chce cofnąć**
W DatoCMS przy rekordzie zakładka **Versions** → przywróć poprzednią wersję.

**Jak sprawdzić czy webhook z DatoCMS do Vercel działa?**
DatoCMS → **Settings → Webhooks** — widać historię wywołań i statusy odpowiedzi.
