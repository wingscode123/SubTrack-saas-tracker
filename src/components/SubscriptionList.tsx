import React, { useMemo, useState } from 'react';
import {
  Archive,
  ArrowUpDown,
  Check,
  Edit2,
  Filter,
  MoreVertical,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import { Subscription, SubscriptionCategory, SubscriptionStatus } from '../types';
import { formatCurrency, getMonthlyEquivalent } from '../utils/currency';
import { formatDateDisplay, getDaysRemaining, getDueStatusLabel } from '../utils/dates';
import { ServiceLogo } from './ServiceLogo';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  currency: string;
  onEdit: (sub: Subscription) => void;
  onDelete: (subId: string) => void;
  onToggleStatus: (subId: string, newStatus: SubscriptionStatus) => void;
  onOpenAddModal: () => void;
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

export const SubscriptionList: React.FC<SubscriptionListProps> = ({
  subscriptions,
  currency,
  onEdit,
  onDelete,
  onToggleStatus,
  onOpenAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SubscriptionStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'due_asc' | 'price_desc' | 'name_asc'>('due_asc');
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  const filteredAndSorted = useMemo(() => {
    return subscriptions
      .filter((sub) => {
        // Status filter
        if (statusFilter !== 'all' && sub.status !== statusFilter) {
          return false;
        }
        // Category filter
        if (categoryFilter !== 'all' && sub.category !== categoryFilter) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = sub.name.toLowerCase().includes(q);
          const matchNotes = sub.notes?.toLowerCase().includes(q);
          const matchMethod = sub.paymentMethod?.toLowerCase().includes(q);
          const matchCat = sub.category.toLowerCase().includes(q);
          if (!matchName && !matchNotes && !matchMethod && !matchCat) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'due_asc') {
          const daysA = a.status === 'cancelled' ? 9999 : getDaysRemaining(a.nextDueDate);
          const daysB = b.status === 'cancelled' ? 9999 : getDaysRemaining(b.nextDueDate);
          return daysA - daysB;
        }
        if (sortBy === 'price_desc') {
          const monthlyA = getMonthlyEquivalent(a.price, a.billingCycle, a.customDays);
          const monthlyB = getMonthlyEquivalent(b.price, b.billingCycle, b.customDays);
          return monthlyB - monthlyA;
        }
        if (sortBy === 'name_asc') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [subscriptions, statusFilter, categoryFilter, searchQuery, sortBy]);

  const countByStatus = useMemo(() => {
    return {
      all: subscriptions.length,
      active: subscriptions.filter((s) => s.status === 'active').length,
      trial: subscriptions.filter((s) => s.status === 'trial').length,
      cancelled: subscriptions.filter((s) => s.status === 'cancelled').length,
    };
  }, [subscriptions]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Filter Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 space-y-3">
        {/* Row 1: Status Tabs & Add button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { id: 'all', label: 'Semua', count: countByStatus.all },
                { id: 'active', label: 'Aktif', count: countByStatus.active },
                { id: 'trial', label: 'Trial', count: countByStatus.trial },
                { id: 'cancelled', label: 'Dibatalkan', count: countByStatus.cancelled },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === tab.id
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Langganan</span>
          </button>
        </div>

        {/* Row 2: Search, Category Filter, Sort dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
          {/* Search Input */}
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama langganan, metode pembayaran, atau catatan..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-white transition-all text-slate-900"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-44 py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-44 py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
            >
              <option value="due_asc">Jatuh Tempo Terdekat</option>
              <option value="price_desc">Biaya Tertinggi</option>
              <option value="name_asc">Nama (A - Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscriptions List Items */}
      {filteredAndSorted.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-800">
            Tidak ada langganan yang cocok
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian, filter status, atau tambahkan langganan baru.
          </p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Langganan Baru</span>
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filteredAndSorted.map((sub) => {
            const daysLeft = getDaysRemaining(sub.nextDueDate);
            const statusLabel = getDueStatusLabel(daysLeft);
            const monthlyEquivalent = getMonthlyEquivalent(
              sub.price,
              sub.billingCycle,
              sub.customDays
            );
            const isCancelled = sub.status === 'cancelled';
            const isTrial = sub.status === 'trial';

            return (
              <div
                key={sub.id}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                  isCancelled ? 'bg-slate-50/70 opacity-75' : 'hover:bg-slate-50/50'
                }`}
              >
                {/* Left: Logo & Service details */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <ServiceLogo
                    name={sub.name}
                    logoKey={sub.logoKey}
                    customLogoUrl={sub.customLogoUrl}
                    color={sub.color}
                    size="lg"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm tracking-tight truncate">
                        {sub.name}
                      </h4>

                      {/* Status Badges */}
                      {isCancelled ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                          Dibatalkan / Arsip
                        </span>
                      ) : isTrial ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Trial
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Aktif
                        </span>
                      )}

                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                        {sub.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 flex-wrap">
                      {sub.paymentMethod && (
                        <span>
                          Metode: <strong className="text-slate-700">{sub.paymentMethod}</strong>
                        </span>
                      )}
                      <span>
                        Siklus:{' '}
                        <strong className="text-slate-700">
                          {sub.billingCycle === 'monthly'
                            ? 'Bulanan'
                            : sub.billingCycle === 'yearly'
                            ? 'Tahunan'
                            : `Tiap ${sub.customDays} Hari`}
                        </strong>
                      </span>
                      {sub.notes && (
                        <span className="italic truncate max-w-xs text-slate-400">
                          "{sub.notes}"
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Price, Due date badge & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 shrink-0">
                  {/* Next Due Date & Price */}
                  <div className="text-left sm:text-right">
                    <div className="font-extrabold text-slate-900 text-base">
                      {formatCurrency(sub.price, sub.currency)}
                      <span className="text-xs font-normal text-slate-500 ml-1">
                        /{sub.billingCycle === 'monthly' ? 'bln' : sub.billingCycle === 'yearly' ? 'thn' : 'siklus'}
                      </span>
                    </div>

                    {/* Normalized monthly comparison if yearly */}
                    {sub.billingCycle === 'yearly' && (
                      <p className="text-[11px] text-slate-400">
                        ≈ {formatCurrency(monthlyEquivalent, sub.currency)}/bln
                      </p>
                    )}

                    {!isCancelled ? (
                      <div className="mt-1 flex items-center sm:justify-end gap-1.5">
                        <span className="text-[11px] text-slate-500">
                          Jatuh tempo {formatDateDisplay(sub.nextDueDate)}:
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            daysLeft <= 1
                              ? 'bg-rose-100 text-rose-700'
                              : daysLeft <= 7
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {statusLabel.text}
                        </span>
                      </div>
                    ) : (
                      <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                        Hemat {formatCurrency(monthlyEquivalent, sub.currency)}/bln
                      </p>
                    )}
                  </div>

                  {/* Actions (Edit, Cancel/Keep, Delete) */}
                  <div className="relative flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(sub)}
                      className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Langganan"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {isCancelled ? (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(sub.id, 'active')}
                        className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Aktifkan Kembali"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(sub.id, 'cancelled')}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Tandai Dibatalkan (Arsip)"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onDelete(sub.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus Permanen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
