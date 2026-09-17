import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Crown,
  FileSpreadsheet,
  Plus,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';
import { DueSoonAlert } from './components/DueSoonAlert';
import { Navbar } from './components/Navbar';
import { NotificationDrawer } from './components/NotificationDrawer';
import { OnboardingModal } from './components/OnboardingModal';
import { PaywallModal } from './components/PaywallModal';
import { ProfileModal } from './components/ProfileModal';
import { SpendCharts } from './components/SpendCharts';
import { SubscriptionList } from './components/SubscriptionList';
import { SubscriptionModal } from './components/SubscriptionModal';
import { SummaryCards } from './components/SummaryCards';
import { AppNotification, NotificationSettings, Subscription, SubscriptionStatus, UserProfile } from './types';
import { calculateTotals, formatCurrency } from './utils/currency';
import { calculateNextCycleDate, formatDateDisplay, getDaysRemaining } from './utils/dates';
import {
  INITIAL_PROFILE,
  INITIAL_SUBSCRIPTIONS,
  isOnboarded,
  loadNotifications,
  loadProfile,
  loadSubscriptions,
  resetAllData,
  saveNotifications,
  saveProfile,
  saveSubscriptions,
  setOnboarded,
} from './utils/storage';
import { buildReminderEmailHtml } from './utils/emailTemplate';
import { disconnectGmail, sendGmailSubscriptionReminder } from './utils/gmail';

const MAX_FREE_LIMIT = 5;

export default function App() {
  // Core application state
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(loadSubscriptions);
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [notifications, setNotifications] = useState<AppNotification[]>(loadNotifications);

  // Modals visibility
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Toast / feedback alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Check onboarding on initial mount
  useEffect(() => {
    if (!isOnboarded() && subscriptions.length === 0) {
      setIsOnboardingOpen(true);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    saveSubscriptions(subscriptions);
  }, [subscriptions]);

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  // Sync notifications based on subscriptions due dates
  useEffect(() => {
    const newNotifs: AppNotification[] = [];
    const nowStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    });

    for (const sub of subscriptions) {
      if (sub.status === 'cancelled') continue;
      const days = getDaysRemaining(sub.nextDueDate);

      if (days <= 7 && days >= 0) {
        const isEmergency = days <= 1;
        const isTrial = sub.status === 'trial';

        newNotifs.push({
          id: `notif_${sub.id}_${sub.nextDueDate}`,
          subscriptionId: sub.id,
          subscriptionName: sub.name,
          title: isTrial
            ? `Masa Trial ${sub.name} akan berakhir (${days === 0 ? 'Hari ini' : days + ' hari lagi'})`
            : isEmergency
            ? `Tagihan ${sub.name} jatuh tempo ${days === 0 ? 'Hari ini' : 'Besok (H-1)'}`
            : `Reminder H-${days}: ${sub.name} akan diperpanjang`,
          message: `Biaya sebesar ${formatCurrency(sub.price, sub.currency)} dijadwalkan auto-debit pada ${formatDateDisplay(
            sub.nextDueDate
          )} via ${sub.paymentMethod || 'metode pembayaran'}.`,
          daysRemaining: days,
          type: isTrial ? 'trial_ending' : isEmergency ? 'due_1' : 'due_7',
          createdAt: nowStr,
          read: false,
        });
      }
    }

    // Merge with existing notifications to keep read states
    if (newNotifs.length > 0) {
      setNotifications((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const freshlyAdded = newNotifs.filter((n) => !existingIds.has(n.id));
        return [...freshlyAdded, ...prev];
      });
    }
  }, [subscriptions]);

  // Metric Totals
  const totals = useMemo(() => {
    return calculateTotals(subscriptions, profile.defaultCurrency);
  }, [subscriptions, profile.defaultCurrency]);

  // Handlers for Subscriptions
  const handleSaveSubscription = (
    data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>,
    editId?: string
  ) => {
    const timestamp = new Date().toISOString();

    if (editId) {
      setSubscriptions((prev) =>
        prev.map((item) =>
          item.id === editId
            ? { ...item, ...data, updatedAt: timestamp }
            : item
        )
      );
      showToast(`Langganan "${data.name}" berhasil diperbarui.`);
    } else {
      const newSub: Subscription = {
        id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      setSubscriptions((prev) => [newSub, ...prev]);
      showToast(`Langganan "${data.name}" berhasil ditambahkan.`);
    }
    setEditingSubscription(null);
  };

  const handleDeleteSubscription = (id: string) => {
    const target = subscriptions.find((s) => s.id === id);
    if (!target) return;

    if (confirm(`Hapus langganan "${target.name}" secara permanen?`)) {
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
      showToast(`Langganan "${target.name}" telah dihapus.`);
    }
  };

  const handleToggleStatus = (id: string, newStatus: SubscriptionStatus) => {
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      })
    );

    const sub = subscriptions.find((s) => s.id === id);
    if (newStatus === 'cancelled') {
      showToast(
        `Berhasil membatalkan "${sub?.name}". Biaya tidak lagi dihitung dalam total pengeluaran!`
      );
    } else {
      showToast(`Langganan "${sub?.name}" diaktifkan kembali.`);
    }
  };

  // Quick Action: Renew / Advance next cycle date
  const handleRenewCycle = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const newDate = calculateNextCycleDate(s.nextDueDate, s.billingCycle, s.customDays);
          return {
            ...s,
            nextDueDate: newDate,
            status: 'active', // If it was trial, it becomes active
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      })
    );
    const sub = subscriptions.find((s) => s.id === id);
    showToast(`Langganan "${sub?.name}" diperpanjang ke siklus berikutnya.`);
  };

  // Batch add from Onboarding
  const handleAddBatchFromOnboarding = (
    items: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>[]
  ) => {
    const now = new Date().toISOString();
    const createdList: Subscription[] = items.map((item, idx) => ({
      id: `sub_onboard_${Date.now()}_${idx}`,
      ...item,
      createdAt: now,
      updatedAt: now,
    }));

    setSubscriptions((prev) => [...createdList, ...prev]);
    setOnboarded(true);
    showToast(`Berhasil menambahkan ${items.length} langganan!`);
  };

  // Upgrade / Downgrade Pro simulation
  const handleUpgradePro = () => {
    setProfile((prev) => ({ ...prev, isPro: true }));
    showToast('Selamat! Paket Pro berhasil diaktifkan dengan kuota unlimited.');
  };

  const handleDowngradeFree = () => {
    setProfile((prev) => ({ ...prev, isPro: false }));
    showToast('Paket diturunkan ke versi gratis (Limit 5 langganan).');
  };

  // Notification Drawer Actions
  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleSendGmailReminder = async (): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> => {
    const dueSoonSubs = subscriptions
      .filter((s) => s.status !== 'cancelled')
      .map((s) => ({
        ...s,
        daysLeft: getDaysRemaining(s.nextDueDate),
      }))
      .filter((s) => s.daysLeft <= 7)
      .sort((a, b) => a.daysLeft - b.daysLeft);

    const targetEmail = profile.notificationSettings.simulatedEmail || profile.email;

    const emailContent = buildReminderEmailHtml({
      userName: profile.name,
      dueSubscriptions: dueSoonSubs,
      defaultCurrency: profile.defaultCurrency,
    });

    const result = await sendGmailSubscriptionReminder({
      recipientEmail: targetEmail,
      subject: emailContent.subject,
      htmlBody: emailContent.html,
    });

    if (result.success) {
      setProfile((prev) => ({
        ...prev,
        notificationSettings: {
          ...prev.notificationSettings,
          gmailConnected: true,
        },
      }));
      showToast(`Email pengingat jatuh tempo berhasil dikirim ke ${targetEmail} via Gmail!`);
      return {
        success: true,
        message: `Email pengingat berhasil dikirim ke ${targetEmail} via Gmail.`,
      };
    } else {
      return {
        success: false,
        error: result.error || 'Gagal mengirim email via Gmail.',
      };
    }
  };

  const handleDisconnectGmail = () => {
    disconnectGmail();
    setProfile((prev) => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        gmailConnected: false,
      },
    }));
    showToast('Koneksi sesi Gmail telah diputus.');
  };

  // Reset to default sample data
  const handleResetData = () => {
    resetAllData();
    setSubscriptions(INITIAL_SUBSCRIPTIONS);
    setProfile(INITIAL_PROFILE);
    setNotifications([]);
    setOnboarded(true);
    showToast('Data dikembalikan ke data demo awal Dina (Freelancer).');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Navigation */}
      <Navbar
        profile={profile}
        activeCount={totals.activeCount}
        maxFreeLimit={MAX_FREE_LIMIT}
        notifications={notifications}
        onOpenAddModal={() => {
          setEditingSubscription(null);
          setIsAddModalOpen(true);
        }}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenPaywall={() => setIsPaywallOpen(true)}
        onCurrencyChange={(curr) => setProfile((p) => ({ ...p, defaultCurrency: curr }))}
      />

      {/* Main Content Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Header Banner: Persona context & Quick Setup prompt if needed */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Ringkasan Pengeluaran Langganan
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                Personal MVP
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Hai <strong>{profile.name}</strong>, pantau siklus billing SaaS dan streaming Anda untuk cegah auto-charge yang bocor.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Katalog Cepat</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingSubscription(null);
                setIsAddModalOpen(true);
              }}
              className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Baru</span>
            </button>
          </div>
        </div>

        {/* 1. Summary Cards (Monthly, Annual, Freemium Limit, Value Signal Savings) */}
        <SummaryCards
          totalMonthly={totals.totalMonthly}
          totalYearly={totals.totalYearly}
          activeCount={totals.activeCount}
          trialCount={totals.trialCount}
          cancelledCount={totals.cancelledCount}
          totalMonthlySaved={totals.totalMonthlySaved}
          currency={profile.defaultCurrency}
          isPro={profile.isPro}
          maxFreeLimit={MAX_FREE_LIMIT}
          onOpenPaywall={() => setIsPaywallOpen(true)}
        />

        {/* 2. Due Soon Alert Section (PRD 5.2: Jatuh tempo 7 hari ke depan + Keep/Cancel actions) */}
        <DueSoonAlert
          subscriptions={subscriptions}
          currency={profile.defaultCurrency}
          onMarkCancelled={(id) => handleToggleStatus(id, 'cancelled')}
          onRenewCycle={handleRenewCycle}
          onOpenAddModal={() => {
            setEditingSubscription(null);
            setIsAddModalOpen(true);
          }}
          onOpenGmailReminder={() => setIsNotificationsOpen(true)}
        />

        {/* 3. Spend Breakdown Charts (PRD 5.2: Recharts Bar / Donut) */}
        <SpendCharts subscriptions={subscriptions} currency={profile.defaultCurrency} />

        {/* 4. Core Subscription Management Table / List (PRD 5.1) */}
        <SubscriptionList
          subscriptions={subscriptions}
          currency={profile.defaultCurrency}
          onEdit={(sub) => {
            setEditingSubscription(sub);
            setIsAddModalOpen(true);
          }}
          onDelete={handleDeleteSubscription}
          onToggleStatus={handleToggleStatus}
          onOpenAddModal={() => {
            setEditingSubscription(null);
            setIsAddModalOpen(true);
          }}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            <strong>SubTrack</strong> — Subscription &amp; SaaS Spend Tracker • MVP v1.0
          </p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Privasi Offline-First</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="hover:text-slate-700"
            >
              Ekspor Cadangan
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={handleResetData}
              className="hover:text-rose-600"
            >
              Reset Data Demo
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <SubscriptionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingSubscription(null);
        }}
        onSave={handleSaveSubscription}
        editSubscription={editingSubscription}
        defaultCurrency={profile.defaultCurrency}
        isPro={profile.isPro}
        activeCount={totals.activeCount}
        maxFreeLimit={MAX_FREE_LIMIT}
        onOpenPaywall={() => {
          setIsAddModalOpen(false);
          setIsPaywallOpen(true);
        }}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onAddBatch={handleAddBatchFromOnboarding}
        defaultCurrency={profile.defaultCurrency}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        subscriptions={subscriptions}
        settings={profile.notificationSettings}
        profile={profile}
        onUpdateSettings={(newSettings) =>
          setProfile((prev) => ({ ...prev, notificationSettings: newSettings }))
        }
        onMarkAllRead={handleMarkAllNotificationsRead}
        onClearNotifications={handleClearNotifications}
        onSendGmailReminder={handleSendGmailReminder}
        onDisconnectGmail={handleDisconnectGmail}
      />

      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        isPro={profile.isPro}
        activeCount={totals.activeCount}
        maxFreeLimit={MAX_FREE_LIMIT}
        defaultCurrency={profile.defaultCurrency}
        onUpgradePro={handleUpgradePro}
        onDowngradeFree={handleDowngradeFree}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        subscriptions={subscriptions}
        onSaveProfile={(updated) => setProfile(updated)}
        onImportData={(imported) => {
          setSubscriptions(imported);
          showToast(`Berhasil mengimpor ${imported.length} langganan.`);
        }}
        onResetData={handleResetData}
      />
    </div>
  );
}
