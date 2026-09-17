import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Plus,
  Sparkles,
  Zap,
} from 'lucide-react';
import { POPULAR_SERVICES } from '../data/popularServices';
import { PopularService, Subscription } from '../types';
import { formatCurrency } from '../utils/currency';
import { getDateOffsetStr, getTodayDateStr } from '../utils/dates';
import { ServiceLogo } from './ServiceLogo';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBatch: (subscriptions: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  defaultCurrency: string;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onAddBatch,
  defaultCurrency,
}) => {
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'Netflix',
    'Spotify',
    'ChatGPT Plus',
  ]);

  if (!isOpen) return null;

  const toggleSelect = (name: string) => {
    setSelectedServices((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const handleComplete = () => {
    if (selectedServices.length === 0) {
      onClose();
      return;
    }

    const itemsToAdd: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>[] = selectedServices.map(
      (serviceName, idx) => {
        const preset = POPULAR_SERVICES.find((s) => s.name === serviceName);
        const price =
          defaultCurrency === 'IDR'
            ? preset?.defaultPriceIDR || 100000
            : preset?.defaultPriceUSD || 9.99;

        return {
          name: serviceName,
          category: preset?.category || 'Other',
          price,
          currency: defaultCurrency,
          billingCycle: preset?.billingCycle || 'monthly',
          startDate: getTodayDateStr(),
          nextDueDate: getDateOffsetStr((idx + 1) * 6), // Stagger due dates across 6, 12, 18 days
          paymentMethod: 'Kartu Utama',
          status: 'active',
          logoKey: preset?.logoSvgKey,
          color: preset?.color,
          notes: 'Ditambahkan saat onboarding cepat SubTrack',
        };
      }
    );

    onAddBatch(itemsToAdd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Setup Kilat &lt; 2 Menit</span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Pilih Langganan Digital yang Anda Gunakan
          </h2>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            Pilih minimal 3 layanan untuk langsung melihat kalkulasi total spend bulanan, kalender jatuh tempo, dan aktivasi reminder H-7.
          </p>
        </div>

        {/* Body: Selectable Grid */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>Pilih layanan populer:</span>
            <span className="font-bold text-slate-900">
              {selectedServices.length} dipilih (Rekomendasi minimal 3)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {POPULAR_SERVICES.slice(0, 12).map((service) => {
              const isSelected = selectedServices.includes(service.name);
              const priceDisplay =
                defaultCurrency === 'IDR'
                  ? formatCurrency(service.defaultPriceIDR, 'IDR')
                  : formatCurrency(service.defaultPriceUSD, 'USD');

              return (
                <button
                  key={service.name}
                  type="button"
                  onClick={() => toggleSelect(service.name)}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ServiceLogo
                      name={service.name}
                      logoKey={service.logoSvgKey}
                      color={service.color}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-xs truncate">
                        {service.name}
                      </p>
                      <p className="text-[11px] text-slate-500">{priceDisplay}/bln</p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'border border-slate-300 bg-slate-50'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Lewati Setup (Mulai dari Nol)
          </button>

          <button
            type="button"
            onClick={handleComplete}
            disabled={selectedServices.length === 0}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all ${
              selectedServices.length >= 3
                ? 'bg-slate-900 hover:bg-slate-800'
                : 'bg-slate-700 hover:bg-slate-800'
            }`}
          >
            <span>Tambahkan {selectedServices.length} Langganan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
