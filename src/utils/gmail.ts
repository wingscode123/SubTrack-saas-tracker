/**
 * Google Workspace / Gmail Integration Utility for SubTrack
 * Handles Google Identity Services (GIS) OAuth token flow and Gmail API message dispatch.
 */

declare global {
  interface Window {
    gapi?: any;
    google?: any;
  }
}

const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send';

let tokenClient: any = null;
let currentAccessToken: string | null = null;

/**
 * Check if the browser currently has an active OAuth token for Gmail
 */
export function hasGmailToken(): boolean {
  return Boolean(currentAccessToken);
}

/**
 * Disconnect or reset Gmail session
 */
export function disconnectGmail(): void {
  if (currentAccessToken && window.google?.accounts?.oauth2) {
    try {
      window.google.accounts.oauth2.revoke(currentAccessToken, () => {
        currentAccessToken = null;
      });
    } catch {
      currentAccessToken = null;
    }
  } else {
    currentAccessToken = null;
  }
}

/**
 * Helper to get the OAuth Client ID configured for this applet or environment.
 */
function getOAuthClientId(): string {
  // Check common env locations or window config
  const envClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || (window as any).__GOOGLE_CLIENT_ID__;
  if (envClientId) return envClientId;

  // If using the standard AI Studio OAuth setup in this project:
  return '588589292094-client.apps.googleusercontent.com';
}

/**
 * Request an access token from Google Identity Services
 */
export async function requestGmailAccessToken(hintEmail?: string): Promise<string> {
  if (currentAccessToken) {
    return currentAccessToken;
  }

  return new Promise((resolve, reject) => {
    // Wait for window.google to be loaded
    const checkGoogle = () => {
      if (window.google?.accounts?.oauth2) {
        try {
          const clientId = getOAuthClientId();
          tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: GMAIL_SEND_SCOPE,
            hint: hintEmail || undefined,
            callback: (resp: any) => {
              if (resp.error) {
                reject(new Error(resp.error_description || resp.error));
                return;
              }
              if (resp.access_token) {
                currentAccessToken = resp.access_token;
                resolve(resp.access_token);
              } else {
                reject(new Error('Gagal mendapatkan token otorisasi dari Google.'));
              }
            },
            error_callback: (err: any) => {
              reject(err);
            },
          });

          tokenClient.requestAccessToken({ prompt: '' });
        } catch (err) {
          reject(err);
        }
      } else {
        setTimeout(checkGoogle, 200);
      }
    };

    checkGoogle();
  });
}

/**
 * Encodes an email into RFC 2822 format and base64url encoded for Gmail API
 */
function createRawEmail(to: string, subject: string, htmlBody: string): string {
  const boundary = 'subtrack_boundary_' + Date.now();
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;

  const emailLines = [
    `To: ${to}`,
    'Subject: ' + utf8Subject,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    htmlBody.replace(/<[^>]*>?/gm, ''), // Plain text fallback
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    htmlBody,
    '',
    `--${boundary}--`,
  ];

  const email = emailLines.join('\r\n');

  // URL-safe base64 encoding
  const base64 = btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return base64;
}

export interface SendReminderResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Sends a subscription due / auto-renewal alert email directly to the user's Gmail inbox
 */
export async function sendGmailSubscriptionReminder(params: {
  recipientEmail: string;
  subject: string;
  htmlBody: string;
}): Promise<SendReminderResult> {
  try {
    const token = await requestGmailAccessToken(params.recipientEmail);

    const raw = createRawEmail(params.recipientEmail, params.subject, params.htmlBody);

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Gagal mengirim email via Gmail API: Status ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.id,
    };
  } catch (err: any) {
    console.error('Error sending reminder via Gmail API:', err);
    return {
      success: false,
      error: err?.message || 'Terjadi kesalahan saat memproses pengiriman Gmail.',
    };
  }
}
