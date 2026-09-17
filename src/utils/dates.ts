import { BillingCycle } from '../types';

/**
 * Get difference in whole calendar days between today and target date string (YYYY-MM-DD)
 */
export function getDaysRemaining(targetDateStr: string): number {
  if (!targetDateStr) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = targetDateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format date for clean UI display (e.g. "24 Sep 2026")
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '-';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Get human-readable relative label: "Hari ini", "Besok (H-1)", "3 hari lagi (H-3)", or "Lewat 2 hari"
 */
export function getDueStatusLabel(daysRemaining: number): {
  text: string;
  isCritical: boolean;
  isWarning: boolean;
  isPast: boolean;
} {
  if (daysRemaining < 0) {
    return {
      text: `Lewat ${Math.abs(daysRemaining)} hari`,
      isCritical: true,
      isWarning: true,
      isPast: true,
    };
  }
  if (daysRemaining === 0) {
    return {
      text: 'Jatuh tempo hari ini!',
      isCritical: true,
      isWarning: true,
      isPast: false,
    };
  }
  if (daysRemaining === 1) {
    return {
      text: 'Besok (H-1)',
      isCritical: true,
      isWarning: true,
      isPast: false,
    };
  }
  if (daysRemaining <= 7) {
    return {
      text: `${daysRemaining} hari lagi (H-${daysRemaining})`,
      isCritical: false,
      isWarning: true,
      isPast: false,
    };
  }
  return {
    text: `${daysRemaining} hari lagi`,
    isCritical: false,
    isWarning: false,
    isPast: false,
  };
}

/**
 * Calculate the next due date after a renewal cycle is renewed/kept
 */
export function calculateNextCycleDate(
  currentDueDateStr: string,
  cycle: BillingCycle,
  customDays?: number
): string {
  const [year, month, day] = currentDueDateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (cycle === 'monthly') {
    date.setMonth(date.getMonth() + 1);
  } else if (cycle === 'yearly') {
    date.setFullYear(date.getFullYear() + 1);
  } else if (cycle === 'custom_days' && customDays) {
    date.setDate(date.getDate() + customDays);
  } else {
    date.setMonth(date.getMonth() + 1);
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get standard today date string YYYY-MM-DD
 */
export function getTodayDateStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get date string offset by days
 */
export function getDateOffsetStr(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
