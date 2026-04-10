'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

interface CartDrawerProps {
  minimumOrderAmount?: number | null;
}

export default function CartDrawer({ minimumOrderAmount }: CartDrawerProps) {
  const { items, isOpen, totalItems, totalPrice, removeFromCart, setQuantity, setNote, clearCart, closeCart } =
    useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  function toggleNote(id: string) {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, quantity: i.quantity, note: i.note ?? '' })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Błąd płatności.');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Spróbuj ponownie.');
      setLoading(false);
    }
  }

  const totalFormatted = totalPrice.toFixed(2).replace('.', ',');
  const belowMinimum =
    minimumOrderAmount != null && totalPrice < minimumOrderAmount && items.length > 0;
  const missingAmount = belowMinimum
    ? (minimumOrderAmount! - totalPrice).toFixed(2).replace('.', ',')
    : null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Koszyk"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <h2 className="text-lg font-bold text-zinc-900">
            Koszyk
            {totalItems > 0 && (
              <span className="ml-2 rounded-full bg-brand-subtle px-2 py-0.5 text-sm font-semibold text-brand-subtle">
                {totalItems}
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            aria-label="Zamknij koszyk"
            className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-zinc-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-12 w-12 opacity-30"
              >
                <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
              </svg>
              <p className="font-medium">Koszyk jest pusty</p>
              <p className="text-sm">Dodaj coś smacznego z menu!</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                    {item.image ? (
                      <Image
                        src={item.image.url}
                        alt={item.image.alt || item.name}
                        fill
                        sizes="64px"
                        quality={70}
                        className="object-contain p-1"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl">
                        🍗
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-zinc-900 leading-tight">
                        {item.name}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Usuń ${item.name}`}
                        className="flex-shrink-0 text-zinc-300 transition-colors hover:text-red-400"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-4 w-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQuantity(item.id, item.quantity - 1)}
                          aria-label="Zmniejsz ilość"
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-sm font-semibold text-zinc-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(item.id, item.quantity + 1)}
                          aria-label="Zwiększ ilość"
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-sm font-bold text-zinc-900">
                        {(item.price * item.quantity).toFixed(2).replace('.', ',')}{' '}
                        zł
                      </span>
                    </div>

                    {expandedNotes.has(item.id) ? (
                      <textarea
                        value={item.note ?? ''}
                        onChange={(e) => setNote(item.id, e.target.value)}
                        onBlur={() => {
                          if (!item.note) toggleNote(item.id);
                        }}
                        placeholder="Uwagi do pozycji (np. bez cebuli)"
                        maxLength={300}
                        rows={2}
                        autoFocus
                        className="w-full resize-none rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => toggleNote(item.id)}
                        className="self-start text-xs text-zinc-400 underline-offset-2 hover:text-zinc-600 hover:underline transition-colors"
                      >
                        + Dodaj uwagę
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-zinc-200 px-5 py-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-base font-semibold text-zinc-700">Suma</span>
              <span className="text-xl font-black text-zinc-900">
                {totalFormatted} zł
              </span>
            </div>
            {belowMinimum && (
              <p className="mb-3 rounded-xl bg-amber-50 px-4 py-2 text-center text-sm text-amber-700">
                Minimalna kwota zamówienia to{' '}
                <span className="font-semibold">
                  {minimumOrderAmount!.toFixed(2).replace('.', ',')} zł
                </span>
                . Brakuje jeszcze{' '}
                <span className="font-semibold">{missingAmount} zł</span>.
              </p>
            )}
            {error && (
              <p className="mb-3 rounded-xl bg-red-50 px-4 py-2 text-center text-sm text-red-600">
                {error}
              </p>
            )}
            <button
              onClick={handleCheckout}
              disabled={loading || !!belowMinimum}
              className="btn-brand w-full rounded-full py-3 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Przekierowuję...' : 'Przejdź do płatności'}
            </button>
            <p className="mt-2 text-center text-xs text-zinc-400">
              Bezpieczna płatność przez Stripe
            </p>

            {confirmClear ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center">
                <p className="mb-3 text-sm font-medium text-red-700">
                  Na pewno chcesz opróżnić koszyk?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      clearCart();
                      setConfirmClear(false);
                    }}
                    className="flex-1 rounded-full bg-red-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                  >
                    Tak, wyczyść
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="flex-1 rounded-full border border-zinc-300 py-2 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-100"
                  >
                    Anuluj
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="mt-3 w-full text-center text-xs text-zinc-400 underline-offset-2 hover:text-red-400 hover:underline transition-colors"
              >
                Opróżnij koszyk
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
