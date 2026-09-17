import React from 'react';
import {
  Bell,
  CheckCircle2,
  Crown,
  Plus,
  Settings,
  Sparkles,
  Zap,
} from 'lucide-react';
import { AppNotification, UserProfile } from '../types';

interface NavbarProps {
  profile: UserProfile;
  activeCount: number;
  maxFreeLimit: number;
  notifications: AppNotification[];
  onOpenAddModal: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenPaywall: () => void;
  onCurrencyChange: (currency: 'IDR' | 'USD' | 'EUR' | 'GBP' | 'SGD') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  activeCount,
  maxFreeLimit,
  notifications,
  onOpenAddModal,
  onOpenNotifications,
  onOpenProfile,
  onOpenPaywall,
  onCurrencyChange,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;
  const isLimitReached = !profile.isPro && activeCount >= maxFreeLimit;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
            <span className="text-emerald-400 font-extrabold text-lg tracking-tighter">S</span>
            <span className="text-slate-100 font-extrabold text-lg tracking-tighter">T</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-lg tracking-tight">SubTrack</span>
              {profile.isPro ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <Crown className="w-3 h-3 text-emerald-600" />
                  PRO
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onOpenPaywall}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors"
                >
                  <span>Free ({activeCount}/{maxFreeLimit})</span>
                  <Zap className="w-3 h-3 text-amber-500" />
                </button>
              )}
            </div>
            <p className="hidden sm:block text-xs text-slate-500">
              Subscription &amp; SaaS Spend Tracker
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Switcher */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs font-medium">
            {(['IDR', 'USD', 'EUR'] as const).map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => onCurrencyChange(curr)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  profile.defaultCurrency === curr
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          {/* Upgrade Banner Button if not pro */}
          {!profile.isPro && (
            <button
              type="button"
              onClick={onOpenPaywall}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Upgrade Pro</span>
            </button>
          )}

          {/* In-app Notification Bell */}
          <button
            type="button"
            id="notifications-bell-btn"
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Pengingat &amp; Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Profile / Settings Button */}
          <button
            type="button"
            id="profile-settings-btn"
            onClick={onOpenProfile}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Profil &amp; Pengaturan"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Add Subscription Primary Button */}
          <button
            type="button"
            id="add-subscription-header-btn"
            onClick={onOpenAddModal}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold shadow-xs transition-all ${
              isLimitReached
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah Langganan</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        </div>
      </div>
    </header>
  );
};
