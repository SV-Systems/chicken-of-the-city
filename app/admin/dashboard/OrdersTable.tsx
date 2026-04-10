'use client';

import { useState } from 'react';
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

export default function OrdersTable({ orders }: { orders: Order[] }) {
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const filtered = q
    ? orders.filter(o =>
        o.order_number.toLowerCase().includes(q) ||
        (o.customer_name ?? '').toLowerCase().includes(q) ||
        (o.customer_email ?? '').toLowerCase().includes(q)
      )
    : orders;

  return (
    <div className="mt-8 rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-zinc-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-bold text-zinc-900">Ostatnie zamówienia</h2>
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Szukaj po nr, imieniu, emailu…"
            className="w-72 rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              ×
            </button>
          )}
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
              <th className="px-6 py-3">Adres</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                  {q ? `Brak wyników dla „${query}"` : 'Brak zamówień'}
                </td>
              </tr>
            )}
            {filtered.map((order, i) => (
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
                <td className="max-w-[200px] truncate px-6 py-3 text-zinc-500">
                  {order.shipping_address?.replace(/\n/g, ', ') || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {q && filtered.length > 0 && (
        <div className="border-t border-zinc-100 px-6 py-3 text-xs text-zinc-400">
          {filtered.length} {filtered.length === 1 ? 'wynik' : 'wyników'} dla „{query}"
        </div>
      )}
    </div>
  );
}
