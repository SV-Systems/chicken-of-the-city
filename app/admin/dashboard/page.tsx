import { supabase } from '@/lib/supabase';
import Charts from './Charts';
import LogoutButton from './LogoutButton';
import OrdersTable from './OrdersTable';

export const dynamic = 'force-dynamic';

async function getData() {
  const [ordersRes, itemsRes] = await Promise.all([
    supabase
      .from('orders')
      .select('id, order_number, amount_total, created_at, customer_name, customer_email, shipping_address, status')
      .order('created_at', { ascending: false }),
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

  // Zamówienia i przychód ostatnie 30 dni
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
    date: date.slice(5), // MM-DD
    zamówienia: v.orders,
    przychód: Math.round(v.revenue * 100) / 100,
  }));

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

  return {
    kpi: { totalOrders, totalRevenue, todayOrders, todayRevenue },
    dailyData,
    topProducts,
    recentOrders: orders.slice(0, 100),
  };
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

export default async function DashboardPage() {
  const { kpi, dailyData, topProducts, recentOrders } = await getData();

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-zinc-900">Panel admina</h1>
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
        <Charts dailyData={dailyData} topProducts={topProducts} />

        {/* Recent orders with search */}
        <OrdersTable orders={recentOrders} />
      </div>
    </div>
  );
}
