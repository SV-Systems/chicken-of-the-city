'use client';

import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface RevenuePoint { date: string; przychód: number; }
interface ProductData { name: string; quantity: number; revenue: number; }
interface PeakPoint { label: string; count: number; }

interface Props {
  dailyData: RevenuePoint[];
  monthlyData: RevenuePoint[];
  topProducts: ProductData[];
  peakHours: PeakPoint[];
  peakDays: PeakPoint[];
}

type View = '30d' | '12m';
type ProductMetric = 'quantity' | 'revenue';

function fmtRevenue(v: number) {
  return v.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł';
}

export default function Charts({ dailyData, monthlyData, topProducts, peakHours, peakDays }: Props) {
  const [view, setView] = useState<View>('30d');
  const [productMetric, setProductMetric] = useState<ProductMetric>('quantity');

  const revenueData = view === '30d' ? dailyData : monthlyData;
  const label = view === '30d' ? 'Ostatnie 30 dni' : 'Ostatnie 12 miesięcy';

  const sortedProducts = [...topProducts].sort((a, b) =>
    productMetric === 'quantity' ? b.quantity - a.quantity : b.revenue - a.revenue
  );

  const maxHour = Math.max(...peakHours.map(h => h.count), 1);
  const maxDay = Math.max(...peakDays.map(d => d.count), 1);

  return (
    <div className="mb-8 space-y-6">
      {/* Przychód + Top produkty */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-zinc-900">{label}</h2>
            <div className="flex rounded-lg border border-zinc-200 p-0.5">
              <button
                onClick={() => setView('30d')}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${view === '30d' ? 'bg-orange-500 text-white' : 'text-zinc-500 hover:text-zinc-800'}`}
              >
                30 dni
              </button>
              <button
                onClick={() => setView('12m')}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${view === '12m' ? 'bg-orange-500 text-white' : 'text-zinc-500 hover:text-zinc-800'}`}
              >
                12 mies.
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-zinc-900">Najpopularniejsze produkty</h2>
            <div className="flex rounded-lg border border-zinc-200 p-0.5">
              <button
                onClick={() => setProductMetric('quantity')}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${productMetric === 'quantity' ? 'bg-orange-500 text-white' : 'text-zinc-500 hover:text-zinc-800'}`}
              >
                Ilość
              </button>
              <button
                onClick={() => setProductMetric('revenue')}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${productMetric === 'revenue' ? 'bg-orange-500 text-white' : 'text-zinc-500 hover:text-zinc-800'}`}
              >
                Przychód
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={sortedProducts}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#71717a' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={productMetric === 'revenue' ? (v) => `${v} zł` : undefined}
              />
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
                formatter={(value) =>
                  productMetric === 'quantity'
                    ? [Number(value ?? 0), 'Sprzedano (szt.)']
                    : [fmtRevenue(Number(value ?? 0)), 'Przychód']
                }
              />
              <Bar dataKey={productMetric} fill="#f97316" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Godziny szczytu + Dzień tygodnia */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-zinc-900">Godziny szczytu</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={peakHours} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: '#71717a' }}
                tickLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#71717a' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', fontSize: '13px' }}
                formatter={(value) => [value, 'Zamówienia']}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {peakHours.map((entry, i) => (
                  <Cell key={i} fill={entry.count === maxHour ? '#f97316' : '#fed7aa'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-zinc-900">Ruch w tygodniu</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={peakDays} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: '#71717a' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#71717a' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', fontSize: '13px' }}
                formatter={(value) => [value, 'Zamówienia']}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {peakDays.map((entry, i) => (
                  <Cell key={i} fill={entry.count === maxDay ? '#f97316' : '#fed7aa'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
