import nodemailer from 'nodemailer';
import { getSettings } from '../core/settings.js';

/**
 * Send an email reminder. Reads SMTP config from .jarvis/settings.json (primary)
 * with process.env fallback (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM).
 * If no SMTP host is configured anywhere, the email is silently skipped.
 */
export async function sendEmailReminder(
  to: string,
  subject: string,
  body: string,
  cc?: string
): Promise<boolean> {
  try {
    const settings = await getSettings();
    const penv = typeof process !== 'undefined' ? process.env : {} as Record<string, string | undefined>;

    const host = settings.smtpHost || penv.SMTP_HOST || '';
    if (!host) {
      console.warn('[JARVIS] Email skipped: No SMTP host configured.');
      return false;
    }

    const port = Number(settings.smtpPort || penv.SMTP_PORT || 587);
    const secure = settings.smtpSecure !== undefined ? settings.smtpSecure : (penv.SMTP_SECURE === 'true');
    const user = settings.smtpUser || penv.SMTP_USER || '';
    const pass = settings.smtpPass || penv.SMTP_PASS || '';
    const from = settings.smtpFrom || penv.SMTP_FROM || user || 'jarvis@localhost';

    if (!user || !pass) {
      console.warn('[JARVIS] Email skipped: No SMTP user/pass configured.');
      return false;
    }

    console.log(`[JARVIS] Sending email to ${to} via ${host}:${port}...`);

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });

    const info = await transporter.sendMail({
      from,
      to,
      ...(cc ? { cc } : {}),
      subject,
      text: body,
      html: `<p>${body.replace(/\n/g, '<br>')}</p>`,
    });

    console.log(`[JARVIS] Email sent successfully: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error('[JARVIS] Email send FAILED:', err);
    return false;
  }
}
