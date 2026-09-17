import React from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  Clock,
  ExternalLink,
  Mail,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import { Subscription } from '../types';
import { formatCurrency } from '../utils/currency';
import { formatDateDisplay, getDaysRemaining, getDueStatusLabel } from '../utils/dates';
import { ServiceLogo } from './ServiceLogo';

interface DueSoonAlertProps {
  subscriptions: Subscription[];
  currency: string;
  onMarkCancelled: (subId: string) => void;
  onRenewCycle: (subId: string) => void;
  onOpenAddModal: () => void;
  onOpenGmailReminder?: () => void;
}

export const DueSoonAlert: React.FC<DueSoonAlertProps> = ({
  subscriptions,
  currency,
  onMarkCancelled,
  onRenewCycle,
  onOpenGmailReminder,
}) => {
  // Filter subscriptions that are active or trial and have nextDueDate <= 7 days away
  const dueSoonSubs = subscriptions
    .filter((s) => s.status !== 'cancelled')
    .map((s) => ({
      ...s,
      daysLeft: getDaysRemaining(s.nextDueDate),
    }))
    .filter((s) => s.daysLeft <= 7)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  if (dueSoonSubs.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">
              Aman! Tidak ada perpanjangan dalam 7 hari ke depan.
            </p>
            <p className="text-xs text-slate-500">
              SubTrack akan mengingatkan Anda saat ada tagihan H-7 atau H-1 mendekat.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Perpanjangan Mendatang ({dueSoonSubs.length} langganan dalam 7 hari)
            </h3>
            <p className="text-xs text-slate-600">
              Tinjau sebelum auto-charge kartu kredit terjadi. Putuskan untuk perpanjang atau batalkan sekarang.
            </p>
          </div>
        </div>

        {onOpenGmailReminder && (
          <button
            type="button"
            id="due-soon-email-reminder-btn"
            onClick={onOpenGmailReminder}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-amber-300 shadow-2xs transition-colors shrink-0"
          >
            <Mail className="w-3.5 h-3.5 text-rose-600" />
            <span>Kirim Notifikasi ke Gmail</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {dueSoonSubs.map((sub) => {
          const statusInfo = getDueStatusLabel(sub.daysLeft);
          const isTrial = sub.status === 'trial';

          return (
            <div
              key={sub.id}
              className="bg-white rounded-xl p-4 border border-amber-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <ServiceLogo
                      name={sub.name}
                      logoKey={sub.logoKey}
                      customLogoUrl={sub.customLogoUrl}
                      color={sub.color}
                      size="md"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm tracking-tight">
                        {sub.name}
                      </h4>
                      <p className="text-xs text-slate-500">{sub.category}</p>
                    </div>
                  </div>

                  <div
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      sub.daysLeft <= 1
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {statusInfo.text}
                  </div>
                </div>

                <div className="mt-3.5 flex items-baseline justify-between border-t border-slate-100 pt-2.5">
                  <span className="text-xs text-slate-500">
                    Jatuh tempo: <strong className="text-slate-700">{formatDateDisplay(sub.nextDueDate)}</strong>
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {formatCurrency(sub.price, sub.currency)}
                  </span>
                </div>

                {sub.paymentMethod && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Metode: {sub.paymentMethod}
                  </p>
                )}

                {isTrial && (
                  <div className="mt-2 text-[11px] bg-amber-100/80 text-amber-900 p-1.5 rounded-md font-medium">
                    ⚠️ Masa Trial akan segera berakhir.
                  </div>
                )}
              </div>

              {/* Quick Actions (Keep vs Cancel) as requested in PRD Section 7 & Value Signal */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onRenewCycle(sub.id)}
                  title="Perpanjang dan majukan jatuh tempo ke siklus berikutnya"
                  className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Lanjut (Keep)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onMarkCancelled(sub.id)}
                  title="Tandai dibatalkan agar tidak dihitung dalam pengeluaran"
                  className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-slate-50 text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-rose-600" />
                  <span>Batalkan</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
