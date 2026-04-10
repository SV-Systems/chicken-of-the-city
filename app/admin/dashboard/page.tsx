import { supabase } from '@/lib/supabase';
import Charts from './Charts';
import LogoutButton from './LogoutButton';
import CustomerSection from './CustomerSection';
import DashboardTabs from './DashboardTabs';

export const dynamic = 'force-dynamic';

function getWarsawHour(dateStr: string): number {
  const h = parseInt(
    new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Warsaw', hour: 'numeric', hour12: false }).format(new Date(dateStr))
  );
  return h === 24 ? 0 : h;
}

function getWarsawWeekday(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Warsaw', weekday: 'short' }).format(new Date(dateStr));
}

async function getStats() {
  const [ordersRes, itemsRes] = await Promise.all([
    supabase.from('orders').select('amount_total, created_at, customer_email, customer_name'),
    supabase.from('order_items').select('order_id, product_name, quantity, unit_price'),
  ]);

  const orders = ordersRes.data ?? [];
  const items = itemsRes.data ?? [];
  const today = new Date().toISOString().slice(0, 10);

  // === KPI ===
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + Number(o.amount_total), 0);
  const todayOrders = orders.filter(o => o.created_at.slice(0, 10) === today).length;
  const todayRevenue = orders
    .filter(o => o.created_at.slice(0, 10) === today)
    .reduce((s, o) => s + Number(o.amount_total), 0);
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // === MoM ===
  const thisMonth = new Date().toISOString().slice(0, 7);
  const prevDate = new Date();
  prevDate.setDate(1);
  prevDate.setMonth(prevDate.getMonth() - 1);
  const prevMonth = prevDate.toISOString().slice(0, 7);

  const thisMonthOrders = orders.filter(o => o.created_at.startsWith(thisMonth));
  const prevMonthOrders = orders.filter(o => o.created_at.startsWith(prevMonth));
  const thisMonthRevenue = thisMonthOrders.reduce((s, o) => s + Number(o.amount_total), 0);
  const prevMonthRevenue = prevMonthOrders.reduce((s, o) => s + Number(o.amount_total), 0);
  const thisMonthAov = thisMonthOrders.length > 0 ? thisMonthRevenue / thisMonthOrders.length : 0;
  const prevMonthAov = prevMonthOrders.length > 0 ? prevMonthRevenue / prevMonthOrders.length : 0;

  function momPct(curr: number, prev: number): number | null {
    return prev > 0 ? Math.round(((curr - prev) / prev) * 100) : null;
  }

  const momRevenue = momPct(thisMonthRevenue, prevMonthRevenue);
  const momOrders = momPct(thisMonthOrders.length, prevMonthOrders.length);
  const momAov = momPct(thisMonthAov, prevMonthAov);

  // === Ostatnie 30 dni ===
  const last30 = new Date();
  last30.setDate(last30.getDate() - 29);
  const dailyMap: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(last30);
    d.setDate(d.getDate() + i);
    dailyMap[d.toISOString().slice(0, 10)] = 0;
  }
  orders
    .filter(o => o.created_at.slice(0, 10) >= last30.toISOString().slice(0, 10))
    .forEach(o => {
      const day = o.created_at.slice(0, 10);
      if (day in dailyMap) dailyMap[day] += Number(o.amount_total);
    });
  const dailyData = Object.entries(dailyMap).map(([date, revenue]) => ({
    date: date.slice(5),
    przychód: Math.round(revenue * 100) / 100,
  }));

  // === Ostatnie 12 miesięcy ===
  const MONTHS_PL = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
  const monthlyMap: Record<string, number> = {};
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    monthlyMap[d.toISOString().slice(0, 7)] = 0;
  }
  orders.forEach(o => {
    const key = o.created_at.slice(0, 7);
    if (key in monthlyMap) monthlyMap[key] += Number(o.amount_total);
  });
  const monthlyData = Object.entries(monthlyMap).map(([key, revenue]) => ({
    date: MONTHS_PL[parseInt(key.split('-')[1]) - 1],
    przychód: Math.round(revenue * 100) / 100,
  }));

  // === Top 10 produktów ===
  const productMap: Record<string, { quantity: number; revenue: number }> = {};
  items.forEach(item => {
    if (!productMap[item.product_name]) productMap[item.product_name] = { quantity: 0, revenue: 0 };
    productMap[item.product_name].quantity += item.quantity;
    productMap[item.product_name].revenue += item.quantity * Number(item.unit_price);
  });
  const topProducts = Object.entries(productMap)
    .map(([name, v]) => ({ name, quantity: v.quantity, revenue: Math.round(v.revenue * 100) / 100 }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  // === Godziny szczytu ===
  const hoursMap: Record<number, number> = {};
  for (let i = 0; i < 24; i++) hoursMap[i] = 0;
  orders.forEach(o => {
    const h = getWarsawHour(o.created_at);
    hoursMap[h] = (hoursMap[h] ?? 0) + 1;
  });
  const peakHours = Array.from({ length: 24 }, (_, i) => ({ label: `${i}:00`, count: hoursMap[i] }));

  // === Dzień tygodnia ===
  const DAY_LABELS = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Niedz'];
  const DAY_MAP: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
  const daysMap: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  orders.forEach(o => {
    const d = DAY_MAP[getWarsawWeekday(o.created_at)];
    if (d !== undefined) daysMap[d] += 1;
  });
  const peakDays = DAY_LABELS.map((label, i) => ({ label, count: daysMap[i] }));

  // === Klienci ===
  const customerMap: Record<string, { orders: number; revenue: number; name: string; dates: string[] }> = {};
  orders.forEach(o => {
    const email = o.customer_email ?? '';
    if (!email) return;
    if (!customerMap[email]) customerMap[email] = { orders: 0, revenue: 0, name: o.customer_name ?? '', dates: [] };
    customerMap[email].orders += 1;
    customerMap[email].revenue += Number(o.amount_total);
    customerMap[email].dates.push(o.created_at);
  });

  const allCustomers = Object.entries(customerMap);
  const newCustomers = allCustomers.filter(([, v]) => v.orders === 1).length;
  const returningCustomers = allCustomers.filter(([, v]) => v.orders >= 2).length;
  const retentionRate = allCustomers.length > 0 ? Math.round((returningCustomers / allCustomers.length) * 100) : 0;

  let totalGaps = 0;
  let gapCount = 0;
  allCustomers.forEach(([, v]) => {
    const sorted = [...v.dates].sort();
    for (let i = 1; i < sorted.length; i++) {
      totalGaps += (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86400000;
      gapCount++;
    }
  });
  const avgDaysBetweenOrders = gapCount > 0 ? Math.round(totalGaps / gapCount) : null;

  const topCustomers = allCustomers
    .map(([email, v]) => ({
      email,
      name: v.name,
      orders: v.orders,
      revenue: Math.round(v.revenue * 100) / 100,
      lastOrder: [...v.dates].sort().at(-1) ?? '',
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // === Popularne zestawy ===
  const orderGroupMap: Record<string, Set<string>> = {};
  items.forEach(item => {
    if (!orderGroupMap[item.order_id]) orderGroupMap[item.order_id] = new Set();
    orderGroupMap[item.order_id].add(item.product_name);
  });
  const pairMap: Record<string, number> = {};
  Object.values(orderGroupMap).forEach(productSet => {
    const prods = [...productSet];
    for (let i = 0; i < prods.length; i++) {
      for (let j = i + 1; j < prods.length; j++) {
        const pair = [prods[i], prods[j]].sort().join(' + ');
        pairMap[pair] = (pairMap[pair] ?? 0) + 1;
      }
    }
  });
  const popularBundles = Object.entries(pairMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([pair, count]) => ({ pair, count }));

  return {
    kpi: { totalOrders, totalRevenue, todayOrders, todayRevenue, aov, momRevenue, momOrders, momAov },
    dailyData, monthlyData, topProducts,
    peakHours, peakDays,
    customerStats: { newCustomers, returningCustomers, retentionRate, avgDaysBetweenOrders },
    topCustomers,
    popularBundles,
  };
}

function fmt(amount: number) {
  return amount.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł';
}

function KpiCard({ label, value, trend }: { label: string; value: string; trend?: number | null }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-3xl font-black text-zinc-900">{value}</p>
      {trend != null && (
        <p className={`mt-2 text-xs font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs poprzedni miesiąc
        </p>
      )}
    </div>
  );
}

export default async function DashboardPage() {
  const stats = await getStats();

  const { kpi, dailyData, monthlyData, topProducts, peakHours, peakDays, customerStats, topCustomers, popularBundles } = stats;

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
        {/* KPI */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <KpiCard label="Łączne zamówienia" value={kpi.totalOrders.toString()} trend={kpi.momOrders} />
          <KpiCard label="Łączny przychód" value={fmt(kpi.totalRevenue)} trend={kpi.momRevenue} />
          <KpiCard label="Zamówienia dzisiaj" value={kpi.todayOrders.toString()} />
          <KpiCard label="Przychód dzisiaj" value={fmt(kpi.todayRevenue)} />
          <KpiCard label="Śr. wartość zamówienia" value={fmt(kpi.aov)} trend={kpi.momAov} />
        </div>

        {/* Charts: przychód, produkty, godziny, dni */}
        <Charts
          dailyData={dailyData}
          monthlyData={monthlyData}
          topProducts={topProducts}
          peakHours={peakHours}
          peakDays={peakDays}
        />

        {/* Sekcja klientów */}
        <CustomerSection customerStats={customerStats} topCustomers={topCustomers} />

        {/* Popularne zestawy */}
        {popularBundles.length > 0 && (
          <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-bold text-zinc-900">Popularne zestawy</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {popularBundles.map(({ pair, count }) => (
                <div key={pair} className="rounded-xl bg-zinc-50 px-4 py-3">
                  <p className="text-xs font-medium text-zinc-600">{pair}</p>
                  <p className="mt-1 text-lg font-black text-zinc-900">{count}×</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
