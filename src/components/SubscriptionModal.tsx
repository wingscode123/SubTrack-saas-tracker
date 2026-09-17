import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CreditCard,
  FileText,
  HelpCircle,
  Plus,
  Sparkles,
  Tag,
  X,
} from 'lucide-react';
import { POPULAR_SERVICES, findMatchingPreset } from '../data/popularServices';
import {
  BillingCycle,
  PopularService,
  Subscription,
  SubscriptionCategory,
  SubscriptionStatus,
} from '../types';
import { getDateOffsetStr, getTodayDateStr } from '../utils/dates';
import { ServiceLogo } from './ServiceLogo';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subscriptionData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>, editId?: string) => void;
  editSubscription?: Subscription | null;
  defaultCurrency: string;
  isPro: boolean;
  activeCount: number;
  maxFreeLimit: number;
  onOpenPaywall: () => void;
}

const CATEGORIES: SubscriptionCategory[] = [
  'Entertainment',
  'Productivity',
  'Cloud & Hosting',
  'Design & Creative',
  'Dev & AI Tools',
  'Communication',
  'Finance & Utilities',
  'Other',
];

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editSubscription,
  defaultCurrency,
  isPro,
  activeCount,
  maxFreeLimit,
  onOpenPaywall,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SubscriptionCategory>('Other');
  const [price, setPrice] = useState<string>('');
  const [currency, setCurrency] = useState(defaultCurrency);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [customDays, setCustomDays] = useState<number>(30);
  const [startDate, setStartDate] = useState(getTodayDateStr());
  const [nextDueDate, setNextDueDate] = useState(getDateOffsetStr(30));
  const [paymentMethod, setPaymentMethod] = useState('BCA Jenius');
  const [status, setStatus] = useState<SubscriptionStatus>('active');
  const [notes, setNotes] = useState('');
  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const [logoKey, setLogoKey] = useState<string | undefined>(undefined);
  const [color, setColor] = useState<string | undefined>(undefined);

  // When editing, populate existing subscription fields
  useEffect(() => {
    if (editSubscription) {
      setName(editSubscription.name);
      setCategory(editSubscription.category);
      setPrice(String(editSubscription.price));
      setCurrency(editSubscription.currency);
      setBillingCycle(editSubscription.billingCycle);
      setCustomDays(editSubscription.customDays || 30);
      setStartDate(editSubscription.startDate);
      setNextDueDate(editSubscription.nextDueDate);
      setPaymentMethod(editSubscription.paymentMethod);
      setStatus(editSubscription.status);
      setNotes(editSubscription.notes || '');
      setCustomLogoUrl(editSubscription.customLogoUrl || '');
      setLogoKey(editSubscription.logoKey);
      setColor(editSubscription.color);
    } else {
      // Reset to defaults
      setName('');
      setCategory('Entertainment');
      setPrice('');
      setCurrency(defaultCurrency);
      setBillingCycle('monthly');
      setCustomDays(30);
      setStartDate(getTodayDateStr());
      setNextDueDate(getDateOffsetStr(30));
      setPaymentMethod('BCA Jenius');
      setStatus('active');
      setNotes('');
      setCustomLogoUrl('');
      setLogoKey(undefined);
      setColor(undefined);
    }
  }, [editSubscription, isOpen, defaultCurrency]);

  // Handle service selection from quick-pick chips
  const handleSelectPreset = (preset: PopularService) => {
    setName(preset.name);
    setCategory(preset.category);
    setBillingCycle(preset.billingCycle);
    setLogoKey(preset.logoSvgKey);
    setColor(preset.color);

    // Pick appropriate price based on currency
    if (currency === 'IDR') {
      setPrice(String(preset.defaultPriceIDR));
    } else {
      setPrice(String(preset.defaultPriceUSD));
    }
  };

  // When user types in name, try to auto-match preset logo
  const handleNameChange = (val: string) => {
    setName(val);
    const matched = findMatchingPreset(val);
    if (matched) {
      setLogoKey(matched.logoSvgKey);
      setColor(matched.color);
      if (category === 'Other') {
        setCategory(matched.category);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || isNaN(Number(price))) {
      return;
    }

    // Check freemium limit for new active subscription
    if (!editSubscription && status === 'active' && !isPro && activeCount >= maxFreeLimit) {
      onClose();
      onOpenPaywall();
      return;
    }

    onSave(
      {
        name: name.trim(),
        category,
        price: Number(price),
        currency,
        billingCycle,
        customDays: billingCycle === 'custom_days' ? customDays : undefined,
        startDate,
        nextDueDate,
        paymentMethod: paymentMethod.trim(),
        status,
        notes: notes.trim() || undefined,
        customLogoUrl: customLogoUrl.trim() || undefined,
        logoKey,
        color,
      },
      editSubscription?.id
    );

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {editSubscription ? 'Edit Langganan' : 'Tambah Langganan Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Lacak biaya, siklus pembayaran, dan reminder jatuh tempo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Quick presets (only when adding new) */}
          {!editSubscription && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pilih Cepat Layanan Populer</span>
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
                {POPULAR_SERVICES.slice(0, 10).map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 transition-colors shrink-0"
                  >
                    <ServiceLogo name={preset.name} logoKey={preset.logoSvgKey} color={preset.color} size="sm" />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Layanan *
              </label>
              <div className="flex items-center gap-2">
                <ServiceLogo name={name || 'Service'} logoKey={logoKey} customLogoUrl={customLogoUrl} color={color} size="md" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Contoh: Netflix, Spotify, Notion..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-white text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SubscriptionCategory)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium text-slate-800"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Harga Langganan *
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-24 px-2 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="IDR">IDR (Rp)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="SGD">SGD (S$)</option>
                </select>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={currency === 'IDR' ? '186000' : '15.49'}
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-white text-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Siklus Penagihan
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                {(
                  [
                    { id: 'monthly', label: 'Bulanan' },
                    { id: 'yearly', label: 'Tahunan' },
                    { id: 'custom_days', label: 'Custom' },
                  ] as const
                ).map((cycle) => (
                  <button
                    key={cycle.id}
                    type="button"
                    onClick={() => setBillingCycle(cycle.id)}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      billingCycle === cycle.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cycle.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Custom days field if selected */}
          {billingCycle === 'custom_days' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Interval Hari Custom
              </label>
              <input
                type="number"
                min="1"
                value={customDays}
                onChange={(e) => setCustomDays(Number(e.target.value))}
                placeholder="30"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 text-slate-900"
              />
            </div>
          )}

          {/* Dates & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Tanggal Jatuh Tempo Berikutnya *</span>
              </label>
              <input
                type="date"
                required
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                <span>Metode Pembayaran (Label)</span>
              </label>
              <input
                type="text"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="Contoh: BCA Jenius, Mandiri CC, GoPay..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 text-slate-900"
              />
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status Langganan
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('active')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                  status === 'active'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Aktif
              </button>
              <button
                type="button"
                onClick={() => setStatus('trial')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                  status === 'trial'
                    ? 'bg-amber-50 border-amber-400 text-amber-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Masa Trial
              </button>
              <button
                type="button"
                onClick={() => setStatus('cancelled')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                  status === 'cancelled'
                    ? 'bg-rose-50 border-rose-400 text-rose-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Dibatalkan (Arsip)
              </button>
            </div>
          </div>

          {/* Optional: Notes & Custom Logo URL */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan / Alasan Langganan (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Tool untuk proyek freelance Klien X, evaluasi bulan depan"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custom Logo URL (Opsional)
              </label>
              <input
                type="url"
                value={customLogoUrl}
                onChange={(e) => setCustomLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 text-slate-900"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
            >
              {editSubscription ? 'Simpan Perubahan' : 'Tambah Langganan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
