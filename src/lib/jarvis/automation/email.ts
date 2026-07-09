import nodemailer from 'nodemailer';
import { getSettings } from '../core/settings.js';
import { env } from '$env/dynamic/private';

/**
 * Send an email reminder. Configure via Settings panel or environment variables:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 * If SMTP_HOST is not set, the email is silently skipped (no error thrown).
 */
export async function sendEmailReminder(
  to: string,
  subject: string,
  body: string
): Promise<boolean> {
  try {
    const settings = await getSettings();
    const host = settings.smtpHost || env.SMTP_HOST || '';
    if (!host) return false; // SMTP not configured — silently skip

    const port = Number(settings.smtpPort || env.SMTP_PORT || 587);
    const secure = settings.smtpSecure !== undefined ? settings.smtpSecure : (env.SMTP_SECURE === 'true');
    const user = settings.smtpUser || env.SMTP_USER || '';
    const pass = settings.smtpPass || env.SMTP_PASS || '';
    const from = settings.smtpFrom || env.SMTP_FROM || user || 'jarvis@localhost';

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user ? { user, pass } : undefined,
    });

    await transporter.sendMail({
      from,
      to,
      subject,
      text: body,
      html: `<p>${body.replace(/\n/g, '<br>')}</p>`,
    });

    return true;
  } catch (err) {
    console.error('[JARVIS] Email send failed:', err);
    return false;
  }
}
