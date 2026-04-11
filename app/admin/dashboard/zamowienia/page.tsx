import { supabase } from '@/lib/supabase';
import OrdersTable from '../OrdersTable';
import LogoutButton from '../LogoutButton';
import DashboardTabs from '../DashboardTabs';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

async function getOrders(
  query: string,
  page: number,
  status: string,
  amountMin: string,
  amountMax: string,
  dateFrom: string,
  dateTo: string,
) {
  const offset = (page - 1) * PAGE_SIZE;
  let q = supabase
    .from('orders')
    .select('id, order_number, amount_total, created_at, customer_name, customer_email, shipping_address, status', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);
  if (query) {
    q = q.or(`order_number.ilike.%${query}%,customer_name.ilike.%${query}%,customer_email.ilike.%${query}%,shipping_address.ilike.%${query}%`);
  }
  if (status) {
    q = q.eq('status', status);
  }
  if (amountMin) {
    q = q.gte('amount_total', parseFloat(amountMin));
  }
  if (amountMax) {
    q = q.lte('amount_total', parseFloat(amountMax));
  }
  if (dateFrom) {
    q = q.gte('created_at', dateFrom);
  }
  if (dateTo) {
    q = q.lte('created_at', `${dateTo}T23:59:59.999Z`);
  }
  const { data, count } = await q;
  return { orders: data ?? [], total: count ?? 0 };
}

export default async function ZamowieniaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string; amountMin?: string; amountMax?: string; dateFrom?: string; dateTo?: string }>;
}) {
  const { q = '', page: pageStr = '1', status = '', amountMin = '', amountMax = '', dateFrom = '', dateTo = '' } = await searchParams;
  const page = Math.max(1, parseInt(pageStr) || 1);

  const { orders, total } = await getOrders(q, page, status, amountMin, amountMax, dateFrom, dateTo);

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
          <OrdersTable orders={orders} total={total} page={page} query={q} status={status} amountMin={amountMin} amountMax={amountMax} dateFrom={dateFrom} dateTo={dateTo} />
        </Suspense>
      </div>
    </div>
  );
}
