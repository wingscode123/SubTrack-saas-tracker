import { BillingCycle, Subscription } from '../types';

export const CURRENCY_SYMBOLS: Record<string, string> = {
  IDR: 'Rp',
  USD: '$',
  EUR: '€',
  GBP: '£',
  SGD: 'S$',
};

export const EXCHANGE_RATES_TO_IDR: Record<string, number> = {
  IDR: 1,
  USD: 16000,
  EUR: 17400,
  GBP: 20500,
  SGD: 12200,
};

/**
 * Format money with standard locale conventions
 */
export function formatCurrency(amount: number, currency: string = 'IDR'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  if (currency === 'IDR') {
    // Indonesian Rupiah: Rp 150.000
    const rounded = Math.round(amount);
    return `${symbol} ${rounded.toLocaleString('id-ID')}`;
  }

  // Western currencies with 2 decimals
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Convert an amount from one currency to target currency (simple baseline rate)
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) return amount;
  const inIDR = amount * (EXCHANGE_RATES_TO_IDR[fromCurrency] || 16000);
  const targetRate = EXCHANGE_RATES_TO_IDR[toCurrency] || 1;
  return inIDR / targetRate;
}

/**
 * Normalizes subscription price to monthly equivalent
 */
export function getMonthlyEquivalent(
  price: number,
  billingCycle: BillingCycle,
  customDays?: number
): number {
  switch (billingCycle) {
    case 'monthly':
      return price;
    case 'yearly':
      return price / 12;
    case 'custom_days':
      return customDays && customDays > 0 ? (price / customDays) * 30.4375 : price;
    default:
      return price;
  }
}

/**
 * Normalizes subscription price to yearly equivalent
 */
export function getYearlyEquivalent(
  price: number,
  billingCycle: BillingCycle,
  customDays?: number
): number {
  switch (billingCycle) {
    case 'monthly':
      return price * 12;
    case 'yearly':
      return price;
    case 'custom_days':
      return customDays && customDays > 0 ? (price / customDays) * 365 : price * 12;
    default:
      return price * 12;
  }
}

/**
 * Calculate total monthly and annual spend in user's default currency
 */
export function calculateTotals(
  subscriptions: Subscription[],
  targetCurrency: string
): {
  totalMonthly: number;
  totalYearly: number;
  activeCount: number;
  trialCount: number;
  cancelledCount: number;
  totalMonthlySaved: number;
} {
  let totalMonthly = 0;
  let totalYearly = 0;
  let activeCount = 0;
  let trialCount = 0;
  let cancelledCount = 0;
  let totalMonthlySaved = 0;

  for (const sub of subscriptions) {
    const monthlyLocal = getMonthlyEquivalent(sub.price, sub.billingCycle, sub.customDays);
    const convertedMonthly = convertCurrency(monthlyLocal, sub.currency, targetCurrency);
    const convertedYearly = convertCurrency(
      getYearlyEquivalent(sub.price, sub.billingCycle, sub.customDays),
      sub.currency,
      targetCurrency
    );

    if (sub.status === 'active') {
      totalMonthly += convertedMonthly;
      totalYearly += convertedYearly;
      activeCount++;
    } else if (sub.status === 'trial') {
      // Trial is counted in pipeline, potential spend
      totalMonthly += convertedMonthly;
      totalYearly += convertedYearly;
      trialCount++;
    } else if (sub.status === 'cancelled') {
      cancelledCount++;
      totalMonthlySaved += convertedMonthly;
    }
  }

  return {
    totalMonthly,
    totalYearly,
    activeCount,
    trialCount,
    cancelledCount,
    totalMonthlySaved,
  };
}
