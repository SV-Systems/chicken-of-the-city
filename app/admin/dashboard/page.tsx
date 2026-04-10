import { supabase } from '@/lib/supabase';
import Charts from './Charts';
import LogoutButton from './LogoutButton';
import OrdersTable from './OrdersTable';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

async function getStats() {
  const [ordersRes, itemsRes] = await Promise.all([
    supabase
      .from('orders')
      .select('amount_total, created_at'),
    supabase
      .from('order_items')
      .select('product_name, quantity, unit_price'),
  ]);

  const orders = ordersRes.data ?? [];
  const items = itemsRes.data ?? [];
  const today = new Date().toISOString().slice(0, 10);

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + Number(o.amount_total), 0);
  const todayOrders = orders.filter(o => o.created_at.slice(0, 10) === today).length;
  const todayRevenue = orders
    .filter(o => o.created_at.slice(0, 10) === today)
    .reduce((s, o) => s + Number(o.amount_total), 0);

  // Ostatnie 30 dni
  const last30 = new Date();
  last30.setDate(last30.getDate() - 29);
  const dailyMap: Record<string, { orders: number; revenue: number }> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(last30);
    d.setDate(d.getDate() + i);
    dailyMap[d.toISOString().slice(0, 10)] = { orders: 0, revenue: 0 };
  }
  orders
    .filter(o => o.created_at.slice(0, 10) >= last30.toISOString().slice(0, 10))
    .forEach(o => {
      const day = o.created_at.slice(0, 10);
      if (dailyMap[day]) {
        dailyMap[day].orders += 1;
        dailyMap[day].revenue += Number(o.amount_total);
      }
    });
  const dailyData = Object.entries(dailyMap).map(([date, v]) => ({
    date: date.slice(5),
    przychód: Math.round(v.revenue * 100) / 100,
  }));

  // Ostatnie 12 miesięcy
  const monthlyMap: Record<string, number> = {};
  const MONTHS_PL = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const key = d.toISOString().slice(0, 7); // YYYY-MM
    monthlyMap[key] = 0;
  }
  orders.forEach(o => {
    const key = o.created_at.slice(0, 7);
    if (key in monthlyMap) monthlyMap[key] += Number(o.amount_total);
  });
  const monthlyData = Object.entries(monthlyMap).map(([key, revenue]) => {
    const [, month] = key.split('-');
    return { date: MONTHS_PL[parseInt(month) - 1], przychód: Math.round(revenue * 100) / 100 };
  });

  // Top 10 produktów
  const productMap: Record<string, { quantity: number; revenue: number }> = {};
  items.forEach(item => {
    if (!productMap[item.product_name]) productMap[item.product_name] = { quantity: 0, revenue: 0 };
    productMap[item.product_name].quantity += item.quantity;
    productMap[item.product_name].revenue += item.quantity * Number(item.unit_price);
  });
  const topProducts = Object.entries(productMap)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  return { kpi: { totalOrders, totalRevenue, todayOrders, todayRevenue }, dailyData, monthlyData, topProducts };
}

async function getOrders(query: string, page: number) {
  const offset = (page - 1) * PAGE_SIZE;

  let q = supabase
    .from('orders')
    .select('id, order_number, amount_total, created_at, customer_name, customer_email, shipping_address, status', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (query) {
    q = q.or(
      `order_number.ilike.%${query}%,customer_name.ilike.%${query}%,customer_email.ilike.%${query}%`
    );
  }

  const { data, count } = await q;
  return { orders: data ?? [], total: count ?? 0 };
}

function fmt(amount: number) {
  return amount.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł';
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-3xl font-black text-zinc-900">{value}</p>
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = '', page: pageStr = '1' } = await searchParams;
  const page = Math.max(1, parseInt(pageStr) || 1);

  const [{ kpi, dailyData, monthlyData, topProducts }, { orders, total }] = await Promise.all([
    getStats(),
    getOrders(q, page),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-zinc-900">Panel właściciela</h1>
            <p className="text-sm text-zinc-400">Statystyki i zamówienia</p>
          </div>
          <LogoutButton />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* KPI */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Łączne zamówienia" value={kpi.totalOrders.toString()} />
          <KpiCard label="Łączny przychód" value={fmt(kpi.totalRevenue)} />
          <KpiCard label="Zamówienia dzisiaj" value={kpi.todayOrders.toString()} />
          <KpiCard label="Przychód dzisiaj" value={fmt(kpi.todayRevenue)} />
        </div>

        {/* Charts */}
        <Charts dailyData={dailyData} monthlyData={monthlyData} topProducts={topProducts} />

        {/* Orders with server-side search + pagination */}
        <Suspense>
          <OrdersTable orders={orders} total={total} page={page} query={q} />
        </Suspense>
      </div>
    </div>
  );
}
