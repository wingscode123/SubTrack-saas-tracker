import React from 'react';
import {
  AlertTriangle,
  Calendar,
  CreditCard,
  PiggyBank,
  TrendingDown,
  Zap,
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';

interface SummaryCardsProps {
  totalMonthly: number;
  totalYearly: number;
  activeCount: number;
  trialCount: number;
  cancelledCount: number;
  totalMonthlySaved: number;
  currency: string;
  isPro: boolean;
  maxFreeLimit: number;
  onOpenPaywall: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalMonthly,
  totalYearly,
  activeCount,
  trialCount,
  cancelledCount,
  totalMonthlySaved,
  currency,
  isPro,
  maxFreeLimit,
  onOpenPaywall,
}) => {
  const percentUsed = Math.min(100, Math.round((activeCount / maxFreeLimit) * 100));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Monthly Spend */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Pengeluaran Bulanan
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {formatCurrency(totalMonthly, currency)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Normalisasi dari seluruh tagihan bulanan &amp; tahunan
          </p>
        </div>
      </div>

      {/* 2. Total Annual Spend */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Estimasi Biaya Tahunan
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {formatCurrency(totalYearly, currency)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Proyeksi 12 bulan jika semua langganan aktif dilanjutkan
          </p>
        </div>
      </div>

      {/* 3. Freemium Active Count */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Langganan Aktif &amp; Kuota
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {activeCount}{' '}
              <span className="text-sm font-normal text-slate-500">
                {isPro ? 'aktif (Unlimited)' : `/ ${maxFreeLimit} free`}
              </span>
            </div>
            {trialCount > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                {trialCount} Trial
              </span>
            )}
          </div>

          {!isPro ? (
            <div className="mt-2">
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    percentUsed >= 100 ? 'bg-rose-500' : percentUsed >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-1.5">
                <span className="text-[11px] text-slate-500">{percentUsed}% kuota gratis</span>
                {activeCount >= maxFreeLimit && (
                  <button
                    type="button"
                    onClick={onOpenPaywall}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 underline"
                  >
                    Upgrade Pro
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-emerald-600 font-medium mt-1">
              Akun Pro Aktif — Tambah langganan tanpa batas
            </p>
          )}
        </div>
      </div>

      {/* 4. Total Saved from Cancellations (PRD metric value signal) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Penghematan Pembatalan
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-emerald-600 tracking-tight">
            +{formatCurrency(totalMonthlySaved, currency)}
            <span className="text-xs font-medium text-slate-500 ml-1">/bln</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-600 inline" />
            <span>
              {cancelledCount} langganan berhasil diputus &amp; diarsip
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
