'use client';

import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface DailyData {
  date: string;
  zamówienia: number;
  przychód: number;
}

interface ProductData {
  name: string;
  quantity: number;
  revenue: number;
}

interface Props {
  dailyData: DailyData[];
  topProducts: ProductData[];
}

export default function Charts({ dailyData, topProducts }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* Line chart — ostatnie 30 dni */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
        <h2 className="mb-4 font-bold text-zinc-900">Ostatnie 30 dni</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={dailyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#71717a' }} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#71717a' }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#71717a' }} tickLine={false} axisLine={false} unit=" zł" />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', fontSize: '13px' }}
              formatter={(value, name) => {
                const v = Number(value ?? 0);
                return name === 'przychód' ? [`${v.toFixed(2)} zł`, 'Przychód'] : [v, 'Zamówienia'];
              }}
            />
            <Legend wrapperStyle={{ fontSize: '13px' }} />
            <Line yAxisId="left" type="monotone" dataKey="zamówienia" stroke="#f97316" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            <Line yAxisId="right" type="monotone" dataKey="przychód" stroke="#1d4ed8" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar chart — top produkty */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-2">
        <h2 className="mb-4 font-bold text-zinc-900">Najpopularniejsze produkty</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={topProducts}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#71717a' }} tickLine={false} axisLine={false} />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 11, fill: '#71717a' }}
              tickLine={false}
              axisLine={false}
              width={100}
              tickFormatter={(v: string) => v.length > 14 ? v.slice(0, 13) + '…' : v}
            />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', fontSize: '13px' }}
              formatter={(value) => [Number(value ?? 0), 'Sprzedano (szt.)']}
            />
            <Bar dataKey="quantity" fill="#f97316" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
