import { AppNotification, Subscription, UserProfile } from '../types';
import { getDateOffsetStr, getTodayDateStr } from './dates';

const STORAGE_KEYS = {
  SUBSCRIPTIONS: 'subtrack_subscriptions_v1',
  PROFILE: 'subtrack_profile_v1',
  NOTIFICATIONS: 'subtrack_notifications_v1',
  ONBOARDED: 'subtrack_onboarded_v1',
};

export const INITIAL_PROFILE: UserProfile = {
  id: 'usr_dina_01',
  name: 'Dina (Freelancer)',
  email: 'dina.freelance@example.com',
  defaultCurrency: 'IDR',
  isPro: false,
  notificationSettings: {
    emailReminder7Days: true,
    emailReminder1Day: true,
    inAppAlerts: true,
    simulatedEmail: 'dina.freelance@example.com',
    browserNotifications: false,
  },
};

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub_netflix',
    name: 'Netflix',
    category: 'Entertainment',
    price: 186000,
    currency: 'IDR',
    billingCycle: 'monthly',
    startDate: '2025-09-20',
    nextDueDate: getDateOffsetStr(3), // Due in 3 days (H-3 alert!)
    paymentMethod: 'BCA Jenius Debit',
    status: 'active',
    logoKey: 'netflix',
    color: '#E50914',
    notes: 'Paket Standard HD untuk nonton film akhir pekan.',
    createdAt: '2025-09-20T10:00:00.000Z',
    updatedAt: '2026-09-17T00:00:00.000Z',
  },
  {
    id: 'sub_chatgpt',
    name: 'ChatGPT Plus',
    category: 'Dev & AI Tools',
    price: 320000,
    currency: 'IDR',
    billingCycle: 'monthly',
    startDate: '2026-01-10',
    nextDueDate: getDateOffsetStr(5), // Due in 5 days (H-5 alert!)
    paymentMethod: 'Mandiri Kartu Kredit',
    status: 'active',
    logoKey: 'chatgpt',
    color: '#10A37F',
    notes: 'Akses GPT-4o & reasoning untuk coding freelance.',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-09-17T00:00:00.000Z',
  },
  {
    id: 'sub_spotify',
    name: 'Spotify Premium',
    category: 'Entertainment',
    price: 54990,
    currency: 'IDR',
    billingCycle: 'monthly',
    startDate: '2024-03-01',
    nextDueDate: getDateOffsetStr(14), // Due in 14 days
    paymentMethod: 'GoPay Auto-Debit',
    status: 'active',
    logoKey: 'spotify',
    color: '#1DB954',
    notes: 'Lagu fokus kerja & playlist podcast.',
    createdAt: '2024-03-01T10:00:00.000Z',
    updatedAt: '2026-09-17T00:00:00.000Z',
  },
  {
    id: 'sub_figma',
    name: 'Figma Professional',
    category: 'Design & Creative',
    price: 235000,
    currency: 'IDR',
    billingCycle: 'monthly',
    startDate: '2025-06-15',
    nextDueDate: getDateOffsetStr(1), // Due tomorrow (H-1 alert!)
    paymentMethod: 'BCA Jenius Debit',
    status: 'active',
    logoKey: 'figma',
    color: '#F24E1E',
    notes: 'Kebutuhan desain UI/UX klien.',
    createdAt: '2025-06-15T10:00:00.000Z',
    updatedAt: '2026-09-17T00:00:00.000Z',
  },
  {
    id: 'sub_adobe',
    name: 'Adobe Creative Cloud',
    category: 'Design & Creative',
    price: 780000,
    currency: 'IDR',
    billingCycle: 'monthly',
    startDate: '2026-09-03',
    nextDueDate: getDateOffsetStr(2), // Trial ends in 2 days!
    paymentMethod: 'Mandiri Kartu Kredit',
    status: 'trial',
    logoKey: 'adobe',
    color: '#FF0000',
    notes: 'Free trial 14 hari, evaluasi apakah benar-benar dibutuhkan atau cancel sebelum auto-charge.',
    createdAt: '2026-09-03T10:00:00.000Z',
    updatedAt: '2026-09-17T00:00:00.000Z',
  },
  {
    id: 'sub_notion',
    name: 'Notion Plus',
    category: 'Productivity',
    price: 155000,
    currency: 'IDR',
    billingCycle: 'monthly',
    startDate: '2025-02-01',
    nextDueDate: getDateOffsetStr(28),
    paymentMethod: 'Wise Virtual Card',
    status: 'cancelled',
    logoKey: 'notion',
    color: '#000000',
    notes: 'Dibatalkan lewat SubTrack karena sudah cukup pakai free tier. Berhasil hemat Rp 155.000/bln!',
    createdAt: '2025-02-01T10:00:00.000Z',
    updatedAt: '2026-09-17T00:00:00.000Z',
  },
];

export function loadSubscriptions(): Subscription[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    if (!raw) {
      saveSubscriptions(INITIAL_SUBSCRIPTIONS);
      return INITIAL_SUBSCRIPTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SUBSCRIPTIONS;
  }
}

export function saveSubscriptions(subs: Subscription[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subs));
  } catch (err) {
    console.error('Failed to save subscriptions:', err);
  }
}

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) {
      saveProfile(INITIAL_PROFILE);
      return INITIAL_PROFILE;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile:', err);
  }
}

export function loadNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveNotifications(notifs: AppNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  } catch (err) {
    console.error('Failed to save notifications:', err);
  }
}

export function isOnboarded(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDED) === 'true';
  } catch {
    return false;
  }
}

export function setOnboarded(val: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ONBOARDED, val ? 'true' : 'false');
  } catch (err) {
    console.error('Failed to set onboarded:', err);
  }
}

export function resetAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTIONS);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.ONBOARDED);
  } catch (err) {
    console.error('Failed to reset data:', err);
  }
}
