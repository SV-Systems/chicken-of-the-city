interface CustomerStats {
  newCustomers: number;
  returningCustomers: number;
  retentionRate: number;
  avgDaysBetweenOrders: number | null;
}

interface TopCustomer {
  email: string;
  name: string;
  orders: number;
  revenue: number;
  lastOrder: string;
}

interface Props {
  customerStats: CustomerStats;
  topCustomers: TopCustomer[];
}

function fmt(amount: number) {
  return amount.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł';
}

export default function CustomerSection({ customerStats, topCustomers }: Props) {
  const { newCustomers, returningCustomers, retentionRate, avgDaysBetweenOrders } = customerStats;
  const totalCustomers = newCustomers + returningCustomers;

  return (
    <div className="mb-8 space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-500">Wszyscy klienci</p>
          <p className="mt-1 text-3xl font-black text-zinc-900">{totalCustomers}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-500">Nowi klienci</p>
          <p className="mt-1 text-3xl font-black text-zinc-900">{newCustomers}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-500">Powracający klienci</p>
          <p className="mt-1 text-3xl font-black text-zinc-900">{returningCustomers}</p>
          {retentionRate > 0 && (
            <p className="mt-2 text-xs font-semibold text-orange-500">{retentionRate}% retencja</p>
          )}
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-500">Śr. czas między zamówieniami</p>
          <p className="mt-1 text-3xl font-black text-zinc-900">
            {avgDaysBetweenOrders != null ? `${avgDaysBetweenOrders} dni` : '—'}
          </p>
        </div>
      </div>

      {topCustomers.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 px-6 py-4">
            <h2 className="font-bold text-zinc-900">Najlepsi klienci</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-xs text-zinc-500">
                  <th className="px-6 py-3 font-semibold">Email</th>
                  <th className="px-6 py-3 font-semibold">Imię</th>
                  <th className="px-6 py-3 font-semibold text-right">Zamówienia</th>
                  <th className="px-6 py-3 font-semibold text-right">Łączna kwota</th>
                  <th className="px-6 py-3 font-semibold text-right">Ostatnie zamówienie</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((c, i) => (
                  <tr key={c.email} className={i % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}>
                    <td className="px-6 py-3 text-zinc-700">{c.email}</td>
                    <td className="px-6 py-3 text-zinc-700">{c.name || '—'}</td>
                    <td className="px-6 py-3 text-right font-semibold text-zinc-900">{c.orders}</td>
                    <td className="px-6 py-3 text-right font-semibold text-orange-600">{fmt(c.revenue)}</td>
                    <td className="px-6 py-3 text-right text-zinc-500">
                      {c.lastOrder ? new Date(c.lastOrder).toLocaleDateString('pl-PL') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
