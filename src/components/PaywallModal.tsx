import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  CreditCard,
  Crown,
  Lock,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPro: boolean;
  activeCount: number;
  maxFreeLimit: number;
  defaultCurrency: string;
  onUpgradePro: () => void;
  onDowngradeFree: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  isPro,
  activeCount,
  maxFreeLimit,
  defaultCurrency,
  onUpgradePro,
  onDowngradeFree,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  if (!isOpen) return null;

  const priceText = defaultCurrency === 'IDR' ? 'Rp 59.000 / bulan' : '$3.99 / month';

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onUpgradePro();
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
        onClose();
      }, 1500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-b from-slate-900 to-slate-850 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-3">
            <Crown className="w-3.5 h-3.5 text-emerald-400" />
            <span>SUBTRACK PRO</span>
          </div>

          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Buka Kuota Langganan Tanpa Batas
          </h2>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            Paket gratis terbatas maksimal {maxFreeLimit} langganan aktif. Upgrade ke SubTrack Pro untuk kontrol pengeluaran penuh tanpa batas.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="p-6 space-y-5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Paket Langganan
              </span>
              <span className="text-xl font-extrabold text-slate-900">
                {priceText}
              </span>
              <span className="text-[11px] text-slate-500 block">
                Bisa dibatalkan kapan saja.
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                Hemat $50+/bln
              </span>
            </div>
          </div>

          {/* Features Checklist */}
          <div className="space-y-2.5 text-xs text-slate-700">
            {[
              'Langganan aktif & arsip tanpa batas (Unlimited)',
              'Reminder H-7 dan H-1 via Email & Notifikasi In-App',
              'Visualisasi alokasi spend & analitik kategori lengkap',
              'Audit langganan nganggur untuk cegah kebocoran kartu kredit',
              'Export data laporan (CSV / JSON) untuk pembukuan',
              'Prioritas akses fitur Tim (Multi-user & Seat Assignment Fase 2)',
            ].map((feat) => (
              <div key={feat} className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {/* Security Badge */}
          <div className="flex items-center gap-2 p-3 bg-slate-100/70 rounded-xl text-[11px] text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Garansi kepuasan 14 hari. Diproses aman dengan enkripsi standar industri.
            </span>
          </div>

          {/* Upgrade Action */}
          {successMessage ? (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-center text-xs font-bold text-emerald-900 animate-in zoom-in-95">
              🎉 Selamat! Akun Anda kini aktif sebagai SubTrack PRO.
            </div>
          ) : isPro ? (
            <div className="space-y-2">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-bold text-emerald-800">
                Status saat ini: PRO AKTIF (Unlimited)
              </div>
              <button
                type="button"
                onClick={onDowngradeFree}
                className="w-full py-2 text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors text-center block"
              >
                Kembali ke Paket Gratis (Demo)
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleSimulatePayment}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses Checkout...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Upgrade ke Pro Sekarang</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
