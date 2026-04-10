import { supabase } from '@/lib/supabase';
import OrdersTable from '../OrdersTable';
import LogoutButton from '../LogoutButton';
import DashboardTabs from '../DashboardTabs';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

async function getOrders(query: string, page: number) {
  const offset = (page - 1) * PAGE_SIZE;
  let q = supabase
    .from('orders')
    .select('id, order_number, amount_total, created_at, customer_name, customer_email, shipping_address, status', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);
  if (query) {
    q = q.or(`order_number.ilike.%${query}%,customer_name.ilike.%${query}%,customer_email.ilike.%${query}%`);
  }
  const { data, count } = await q;
  return { orders: data ?? [], total: count ?? 0 };
}

export default async function ZamowieniaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = '', page: pageStr = '1' } = await searchParams;
  const page = Math.max(1, parseInt(pageStr) || 1);

  const { orders, total } = await getOrders(q, page);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-zinc-900">Panel właściciela</h1>
            <p className="text-sm text-zinc-400">Statystyki i zamówienia</p>
          </div>
          <LogoutButton />
        </div>
      </div>

      <DashboardTabs />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <Suspense>
          <OrdersTable orders={orders} total={total} page={page} query={q} />
        </Suspense>
      </div>
    </div>
  );
}
