import React, { useState } from 'react';
import {
  AlertCircle,
  Bell,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  Info,
  Loader2,
  Mail,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Unlink,
  X,
} from 'lucide-react';
import { AppNotification, NotificationSettings, Subscription, UserProfile } from '../types';
import { getDaysRemaining } from '../utils/dates';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  subscriptions: Subscription[];
  settings: NotificationSettings;
  profile: UserProfile;
  onUpdateSettings: (newSettings: NotificationSettings) => void;
  onMarkAllRead: () => void;
  onClearNotifications: () => void;
  onSendGmailReminder: () => Promise<{ success: boolean; message?: string; error?: string }>;
  onDisconnectGmail?: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  subscriptions,
  settings,
  profile,
  onUpdateSettings,
  onMarkAllRead,
  onClearNotifications,
  onSendGmailReminder,
  onDisconnectGmail,
}) => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'config'>('alerts');
  const [isSending, setIsSending] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  if (!isOpen) return null;

  // Subscriptions due within 7 days
  const dueSoonSubs = subscriptions
    .filter((s) => s.status !== 'cancelled')
    .map((s) => ({
      ...s,
      daysLeft: getDaysRemaining(s.nextDueDate),
    }))
    .filter((s) => s.daysLeft <= 7)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const handleSendReminderNow = async () => {
    setIsSending(true);
    setStatusFeedback({ type: null, message: '' });

    try {
      const res = await onSendGmailReminder();
      if (res.success) {
        setStatusFeedback({
          type: 'success',
          message: res.message || `Email reminder resmi berhasil dikirim ke ${settings.simulatedEmail || profile.email} via Gmail!`,
        });
      } else {
        setStatusFeedback({
          type: 'error',
          message: res.error || 'Gagal mengirim email via Gmail.',
        });
      }
    } catch (err: any) {
      setStatusFeedback({
        type: 'error',
        message: err?.message || 'Terjadi kendala koneksi Gmail.',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Pusat Pengingat &amp; Notifikasi
              </h3>
              <p className="text-xs text-slate-500">
                Reminder H-7 &amp; H-1 ke Gmail sebelum auto-charge
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

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-2 bg-slate-100 border-b border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`py-1.5 rounded-lg transition-all ${
              activeTab === 'alerts'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Notifikasi In-App ({notifications.filter((n) => !n.read).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'config'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-rose-500" />
            <span>Integrasi Gmail</span>
          </button>
        </div>

        {/* Tab 1: Alerts List */}
        {activeTab === 'alerts' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Action buttons */}
            <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                {notifications.length} peringatan aktif
              </span>
              <div className="flex items-center gap-3">
                {notifications.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={onMarkAllRead}
                      className="text-emerald-700 hover:underline font-semibold flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Tandai Sudah Dibaca</span>
                    </button>
                    <button
                      type="button"
                      onClick={onClearNotifications}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      Bersihkan
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Notification items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    Tidak ada notifikasi baru
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    SubTrack akan otomatis membuat reminder H-7 dan H-1 ketika ada langganan yang akan diperpanjang.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-xl border transition-colors ${
                      notif.read
                        ? 'bg-slate-50 border-slate-200 opacity-80'
                        : 'bg-amber-50/80 border-amber-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            notif.type === 'due_1' || notif.type === 'trial_ending'
                              ? 'bg-rose-500'
                              : 'bg-amber-500'
                          }`}
                        />
                        <h5 className="font-bold text-slate-900 text-xs tracking-tight">
                          {notif.title}
                        </h5>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {notif.createdAt}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Config Settings & Gmail Integration */}
        {activeTab === 'config' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Gmail Connection Status Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xs">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-rose-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                      <span>Pengingat Email Resmi via Gmail</span>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <ShieldCheck className="w-3 h-3" />
                        OAuth Ready
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      SubTrack terhubung ke Google Workspace OAuth untuk mengirimkan reminder langsung ke kotak masuk Anda.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  Target Inbox: <strong>{settings.simulatedEmail || profile.email}</strong>
                </span>
                {settings.gmailConnected && (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Terverifikasi
                  </span>
                )}
              </div>
            </div>

            {/* Notification Trigger Configuration */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Waktu Pemicu Pengingat
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                Kirim email reminder otomatis agar Anda memiliki waktu cukup mengevaluasi atau membatalkan langganan.
              </p>

              <div className="space-y-2.5">
                {/* H-7 switch */}
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer transition-colors">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Reminder H-7 (7 Hari Sebelum Jatuh Tempo)
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Evaluasi kebutuhan layanan sebelum diperpanjang otomatis
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailReminder7Days}
                    onChange={(e) =>
                      onUpdateSettings({ ...settings, emailReminder7Days: e.target.checked })
                    }
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                </label>

                {/* H-1 switch */}
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer transition-colors">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Reminder H-1 (Peringatan Darurat 24 Jam)
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Peringatan terakhir sebelum saldo/kartu kredit terdebit otomatis
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailReminder1Day}
                    onChange={(e) =>
                      onUpdateSettings({ ...settings, emailReminder1Day: e.target.checked })
                    }
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                </label>

                {/* In-app badge */}
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer transition-colors">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Badge &amp; Alert In-App
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Tampilkan lonceng peringatan di dalam aplikasi SubTrack
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.inAppAlerts}
                    onChange={(e) =>
                      onUpdateSettings({ ...settings, inAppAlerts: e.target.checked })
                    }
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                </label>
              </div>
            </div>

            {/* Email destination input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Alamat Email Tujuan Reminder</span>
              </label>
              <input
                type="email"
                value={settings.simulatedEmail}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, simulatedEmail: e.target.value })
                }
                placeholder="nama@email.com"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 text-slate-900"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Email pengingat dan rincian jatuh tempo akan dikirimkan ke alamat ini.
              </p>
            </div>

            {/* Real Gmail Dispatch Button */}
            <div className="pt-2 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">
                  Status Antrean Jatuh Tempo
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {dueSoonSubs.length} langganan mendekat (&le; 7 hari)
                </span>
              </div>

              <button
                type="button"
                id="send-gmail-reminder-btn"
                disabled={isSending}
                onClick={handleSendReminderNow}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors disabled:opacity-60 shadow-xs"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Menghubungi Gmail API &amp; Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kirim Pengingat Jatuh Tempo ke Gmail Sekarang</span>
                  </>
                )}
              </button>

              {statusFeedback.type === 'success' && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{statusFeedback.message}</p>
                    <p className="text-[11px] text-emerald-700 mt-1">
                      Periksa inbox Gmail Anda ({settings.simulatedEmail || profile.email}) untuk melihat tabel jadwal jatuh tempo lengkap.
                    </p>
                  </div>
                </div>
              )}

              {statusFeedback.type === 'error' && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Pengiriman Gagal</p>
                    <p className="text-[11px] text-rose-700 mt-0.5">{statusFeedback.message}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
