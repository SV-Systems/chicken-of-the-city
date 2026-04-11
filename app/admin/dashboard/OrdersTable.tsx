'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition, useCallback } from 'react';
import Link from 'next/link';

interface Order {
  id: string;
  order_number: string;
  amount_total: number;
  created_at: string;
  customer_name: string | null;
  customer_email: string | null;
  shipping_address: string | null;
  status: string;
}

function fmt(amount: number) {
  return amount.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł';
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-red-100 text-red-700',
    refunded: 'bg-zinc-100 text-zinc-600',
    shipped: 'bg-blue-100 text-blue-700',
    delivered: 'bg-teal-100 text-teal-700',
  };
  const cls = map[status] ?? 'bg-zinc-100 text-zinc-600';
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: '', label: 'Wszystkie statusy' },
  { value: 'paid', label: 'Opłacone (paid)' },
  { value: 'pending', label: 'Oczekujące (pending)' },
  { value: 'cancelled', label: 'Anulowane (cancelled)' },
  { value: 'refunded', label: 'Zwrócone (refunded)' },
  { value: 'shipped', label: 'Wysłane (shipped)' },
  { value: 'delivered', label: 'Dostarczone (delivered)' },
];

export default function OrdersTable({
  orders,
  total,
  page,
  query,
  status,
  amountMin,
  amountMax,
  dateFrom,
  dateTo,
}: {
  orders: Order[];
  total: number;
  page: number;
  query: string;
  status: string;
  amountMin: string;
  amountMax: string;
  dateFrom: string;
  dateTo: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    },
    [searchParams, pathname, router]
  );

  const hasFilters = query || status || amountMin || amountMax || dateFrom || dateTo;

  const clearAll = () => {
    startTransition(() => router.push(pathname));
  };

  return (
    <div className="mt-8 rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {/* Header + filtry */}
      <div className="border-b border-zinc-200 px-6 py-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-zinc-900">Zamówienia</h2>
            <p className="text-xs text-zinc-400">{total} łącznie</p>
          </div>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="text-xs text-zinc-400 hover:text-zinc-700 transition underline self-start sm:self-auto"
            >
              Wyczyść filtry
            </button>
          )}
        </div>

        {/* Wyszukiwarka tekstowa */}
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            defaultValue={query}
            onChange={e => updateParams({ q: e.target.value, page: '' })}
            placeholder="Szukaj po nr, imieniu, emailu, adresie…"
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
          {isPending && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
          )}
        </div>

        {/* Filtry zaawansowane */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {/* Status */}
          <select
            value={status}
            onChange={e => updateParams({ status: e.target.value, page: '' })}
            className="col-span-2 sm:col-span-1 rounded-lg border border-zinc-200 bg-zinc-50 py-2 px-3 text-sm text-zinc-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Kwota od */}
          <div className="relative">
            <input
              type="number"
              min={0}
              step="0.01"
              defaultValue={amountMin}
              onChange={e => updateParams({ amountMin: e.target.value, page: '' })}
              placeholder="Kwota od (zł)"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 px-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>

          {/* Kwota do */}
          <div className="relative">
            <input
              type="number"
              min={0}
              step="0.01"
              defaultValue={amountMax}
              onChange={e => updateParams({ amountMax: e.target.value, page: '' })}
              placeholder="Kwota do (zł)"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 px-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>

          {/* Data od */}
          <input
            type="date"
            defaultValue={dateFrom}
            onChange={e => updateParams({ dateFrom: e.target.value, page: '' })}
            className="rounded-lg border border-zinc-200 bg-zinc-50 py-2 px-3 text-sm text-zinc-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />

          {/* Data do */}
          <input
            type="date"
            defaultValue={dateTo}
            onChange={e => updateParams({ dateTo: e.target.value, page: '' })}
            className="rounded-lg border border-zinc-200 bg-zinc-50 py-2 px-3 text-sm text-zinc-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <th className="px-6 py-3">Nr</th>
              <th className="px-6 py-3">Data</th>
              <th className="px-6 py-3">Klient</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Kwota</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Adres</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-zinc-400">
                  {hasFilters ? 'Brak wyników dla podanych filtrów' : 'Brak zamówień'}
                </td>
              </tr>
            )}
            {orders.map((order, i) => (
              <tr
                key={order.id}
                className={`border-b border-zinc-100 transition hover:bg-orange-50 ${i % 2 === 0 ? '' : 'bg-zinc-50/50'}`}
              >
                <td className="px-6 py-3">
                  <Link href={`/admin/dashboard/orders/${order.id}`} className="font-mono font-semibold text-orange-500 hover:underline">
                    #{order.order_number}
                  </Link>
                </td>
                <td className="px-6 py-3 text-zinc-500">
                  {new Date(order.created_at).toLocaleString('pl-PL', {
                    day: '2-digit', month: '2-digit',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </td>
                <td className="px-6 py-3 text-zinc-900">{order.customer_name || '—'}</td>
                <td className="px-6 py-3 text-zinc-500">{order.customer_email || '—'}</td>
                <td className="px-6 py-3 font-semibold text-zinc-900">{fmt(Number(order.amount_total))}</td>
                <td className="px-6 py-3"><StatusBadge status={order.status} /></td>
                <td className="max-w-[200px] truncate px-6 py-3 text-zinc-500">
                  {order.shipping_address?.replace(/\n/g, ', ') || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginacja */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-4">
          <p className="text-sm text-zinc-500">
            Strona {page} z {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => updateParams({ page: String(page - 1) })}
              disabled={page <= 1}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Poprzednia
            </button>
            <button
              onClick={() => updateParams({ page: String(page + 1) })}
              disabled={page >= totalPages}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Następna →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
