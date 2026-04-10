'use client';

import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface RevenuePoint { date: string; przychód: number; }
interface ProductData { name: string; quantity: number; revenue: number; }

interface Props {
  dailyData: RevenuePoint[];
  monthlyData: RevenuePoint[];
  topProducts: ProductData[];
}

type View = '30d' | '12m';

export default function Charts({ dailyData, monthlyData, topProducts }: Props) {
  const [view, setView] = useState<View>('30d');
  const data = view === '30d' ? dailyData : monthlyData;
  const label = view === '30d' ? 'Ostatnie 30 dni' : 'Ostatnie 12 miesięcy';

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* Przychód */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-zinc-900">{label}</h2>
          <div className="flex rounded-lg border border-zinc-200 p-0.5">
            <button
              onClick={() => setView('30d')}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                view === '30d' ? 'bg-orange-500 text-white' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              30 dni
            </button>
            <button
              onClick={() => setView('12m')}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                view === '12m' ? 'bg-orange-500 text-white' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              12 mies.
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#71717a' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#71717a' }} tickLine={false} axisLine={false} unit=" zł" width={70} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', fontSize: '13px' }}
              formatter={(value) => [`${Number(value ?? 0).toFixed(2)} zł`, 'Przychód']}
            />
            <Area
              type="monotone"
              dataKey="przychód"
              stroke="#f97316"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top produkty */}
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
