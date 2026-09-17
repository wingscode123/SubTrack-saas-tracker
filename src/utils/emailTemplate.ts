import { Subscription } from '../types';
import { formatCurrency } from './currency';
import { formatDateDisplay, getDaysRemaining } from './dates';

/**
 * Builds a clean, professional HTML email template for subscription reminders
 */
export function buildReminderEmailHtml(params: {
  userName: string;
  dueSubscriptions: Subscription[];
  defaultCurrency: string;
  appUrl?: string;
}): { subject: string; html: string } {
  const { userName, dueSubscriptions, defaultCurrency } = params;

  if (dueSubscriptions.length === 0) {
    return {
      subject: '✅ [SubTrack] Status Langganan Aman - Tidak Ada Tagihan Mendekat',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 12px;">
          <h2 style="color: #0f172a; margin-bottom: 8px;">Halo ${userName},</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">Semua langganan Anda saat ini aman. Tidak ada tagihan atau auto-renewal yang jatuh tempo dalam 7 hari ke depan.</p>
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
            SubTrack — Subscription & SaaS Spend Tracker
          </div>
        </div>
      `,
    };
  }

  const isUrgent = dueSubscriptions.some((s) => getDaysRemaining(s.nextDueDate) <= 1);
  const urgentCount = dueSubscriptions.filter((s) => getDaysRemaining(s.nextDueDate) <= 1).length;

  const subject = isUrgent
    ? `🚨 Peringatan Jatuh Tempo (${urgentCount} Langganan Auto-Debit H-1/Hari Ini) - SubTrack`
    : `⏰ Pengingat Tagihan: ${dueSubscriptions.length} Langganan Akan Jatuh Tempo - SubTrack`;

  const rowsHtml = dueSubscriptions
    .map((sub) => {
      const days = getDaysRemaining(sub.nextDueDate);
      const isDueToday = days === 0;
      const isDueTomorrow = days === 1;
      const badgeText = isDueToday
        ? 'HARI INI'
        : isDueTomorrow
        ? 'BESOK (H-1)'
        : `${days} HARI LAGI`;
      const badgeBg = days <= 1 ? '#fee2e2' : '#fef3c7';
      const badgeColor = days <= 1 ? '#991b1b' : '#92400e';

      return `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 14px 12px;">
            <div style="font-weight: 600; font-size: 14px; color: #0f172a;">${sub.name}</div>
            <div style="font-size: 12px; color: #64748b;">${sub.category} • ${sub.paymentMethod || 'Metode pembayaran'}</div>
          </td>
          <td style="padding: 14px 12px; text-align: center;">
            <span style="background-color: ${badgeBg}; color: ${badgeColor}; font-weight: 700; font-size: 11px; padding: 4px 8px; border-radius: 9999px; text-transform: uppercase;">
              ${badgeText}
            </span>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">${formatDateDisplay(sub.nextDueDate)}</div>
          </td>
          <td style="padding: 14px 12px; text-align: right; font-weight: 700; font-size: 14px; color: #0f172a;">
            ${formatCurrency(sub.price, sub.currency)}
            <div style="font-size: 11px; color: #64748b; font-weight: normal; text-transform: capitalize;">${sub.billingCycle}</div>
          </td>
        </tr>
      `;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
        <!-- Header -->
        <tr>
          <td style="background-color: #0f172a; padding: 24px; text-align: left;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td>
                  <span style="background-color: #10b981; color: #ffffff; font-weight: 900; font-size: 16px; padding: 4px 8px; border-radius: 6px; margin-right: 8px;">ST</span>
                  <span style="color: #ffffff; font-size: 18px; font-weight: 700; letter-spacing: -0.5px;">SubTrack Reminder</span>
                </td>
                <td style="text-align: right;">
                  <span style="color: #94a3b8; font-size: 12px;">Notifikasi Otomatis</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Alert Title -->
        <tr>
          <td style="padding: 24px 24px 12px 24px;">
            <h2 style="margin: 0 0 8px 0; color: #0f172a; font-size: 18px; font-weight: 700;">
              Hai ${userName},
            </h2>
            <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.5;">
              Berikut adalah daftar langganan digital &amp; SaaS Anda yang akan <strong>jatuh tempo / auto-renewal</strong> dalam 7 hari ke depan. Pastikan untuk meninjau apakah Anda ingin melanjutkan atau membatalkannya sebelum saldo atau limit kartu kredit Anda terpotong:
            </p>
          </td>
        </tr>

        <!-- Table of Subscriptions -->
        <tr>
          <td style="padding: 12px 24px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
              <thead>
                <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                  <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #475569; font-weight: 600;">Layanan</th>
                  <th style="padding: 10px 12px; text-align: center; font-size: 12px; color: #475569; font-weight: 600;">Jatuh Tempo</th>
                  <th style="padding: 10px 12px; text-align: right; font-size: 12px; color: #475569; font-weight: 600;">Biaya</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </td>
        </tr>

        <!-- Action Guide -->
        <tr>
          <td style="padding: 16px 24px 24px 24px;">
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; font-size: 13px; color: #166534; line-height: 1.5;">
              💡 <strong>Tips Hemat:</strong> Jika Anda tidak lagi memakai layanan di atas, buka akun provider terkait sekarang juga dan pilih <em>Cancel Subscription</em> untuk menghentikan tagihan otomatis berikutnya.
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #f8fafc; padding: 18px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
            SubTrack — Pengingat Tagihan &amp; Manajemen Pengeluaran SaaS Langganan.<br/>
            Email ini dikirim otomatis berdasarkan preferensi jatuh tempo akun Anda di SubTrack.
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return { subject, html };
}
