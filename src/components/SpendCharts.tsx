import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, PieChart as PieIcon } from 'lucide-react';
import { Subscription } from '../types';
import { convertCurrency, formatCurrency, getMonthlyEquivalent } from '../utils/currency';

interface SpendChartsProps {
  subscriptions: Subscription[];
  currency: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Entertainment': '#E11D48',      // rose-600
  'Productivity': '#059669',       // emerald-600
  'Cloud & Hosting': '#2563EB',    // blue-600
  'Design & Creative': '#D97706',  // amber-600
  'Dev & AI Tools': '#0D9488',     // teal-600
  'Communication': '#7C3AED',      // violet-600
  'Finance & Utilities': '#475569',// slate-600
  'Other': '#64748B',              // slate-500
};

export const SpendCharts: React.FC<SpendChartsProps> = ({ subscriptions, currency }) => {
  const [chartType, setChartType] = useState<'donut' | 'bar'>('donut');

  const data = useMemo(() => {
    // Only active and trial subscriptions are counted
    const activeSubs = subscriptions.filter((s) => s.status !== 'cancelled');
    const categoryTotals: Record<string, number> = {};

    let grandTotal = 0;
    for (const sub of activeSubs) {
      const monthly = getMonthlyEquivalent(sub.price, sub.billingCycle, sub.customDays);
      const converted = convertCurrency(monthly, sub.currency, currency);
      categoryTotals[sub.category] = (categoryTotals[sub.category] || 0) + converted;
      grandTotal += converted;
    }

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value: Math.round(value),
        percentage: grandTotal > 0 ? Math.round((value / grandTotal) * 100) : 0,
        color: CATEGORY_COLORS[name] || '#64748B',
      }))
      .sort((a, b) => b.value - a.value);
  }, [subscriptions, currency]);

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center min-h-[280px] text-center">
        <p className="text-sm font-semibold text-slate-700">Belum Ada Pengeluaran Aktif</p>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Tambahkan langganan baru untuk melihat visualisasi alokasi budget per kategori.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Alokasi Spend per Kategori</h3>
          <p className="text-xs text-slate-500">
            Proporsi pengeluaran bulanan berdasarkan sektor kebutuhan
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setChartType('donut')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
              chartType === 'donut'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Donut</span>
          </button>
          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
              chartType === 'bar'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Bar</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Chart View */}
        <div className="md:col-span-6 h-56 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'donut' ? (
              <PieChart>
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value), currency), 'Biaya Bulanan']}
                />
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            ) : (
              <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#475569' }}
                  width={90}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value), currency), 'Biaya Bulanan']}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {data.map((entry) => (
                    <Cell key={`bar-${entry.name}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend / Breakdown List */}
        <div className="md:col-span-6 space-y-2.5">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-slate-800">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">
                  {formatCurrency(item.value, currency)}
                </span>
                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
