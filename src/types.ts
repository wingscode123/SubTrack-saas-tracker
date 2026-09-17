export type SubscriptionStatus = 'active' | 'trial' | 'cancelled';

export type BillingCycle = 'monthly' | 'yearly' | 'custom_days';

export type SubscriptionCategory =
  | 'Entertainment'
  | 'Productivity'
  | 'Cloud & Hosting'
  | 'Design & Creative'
  | 'Dev & AI Tools'
  | 'Communication'
  | 'Finance & Utilities'
  | 'Other';

export interface Subscription {
  id: string;
  name: string;
  category: SubscriptionCategory;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  customDays?: number;
  startDate: string;
  nextDueDate: string;
  paymentMethod: string;
  status: SubscriptionStatus;
  logoKey?: string;
  customLogoUrl?: string;
  color?: string;
  notes?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PopularService {
  name: string;
  category: SubscriptionCategory;
  defaultPriceUSD: number;
  defaultPriceIDR: number;
  billingCycle: BillingCycle;
  color: string;
  logoSvgKey: string;
  popularPlan: string;
}

export interface NotificationSettings {
  emailReminder7Days: boolean;
  emailReminder1Day: boolean;
  inAppAlerts: boolean;
  simulatedEmail: string;
  browserNotifications: boolean;
  gmailConnected?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  defaultCurrency: 'IDR' | 'USD' | 'EUR' | 'GBP' | 'SGD';
  isPro: boolean;
  notificationSettings: NotificationSettings;
}

export interface AppNotification {
  id: string;
  subscriptionId: string;
  subscriptionName: string;
  title: string;
  message: string;
  daysRemaining: number;
  type: 'due_7' | 'due_1' | 'trial_ending' | 'cancelled_saved';
  createdAt: string;
  read: boolean;
}
