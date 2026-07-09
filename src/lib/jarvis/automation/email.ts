import nodemailer from 'nodemailer';

/**
 * Send an email reminder. Configure via environment variables:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 * If SMTP_HOST is not set, the email is silently skipped (no error thrown).
 */
export async function sendEmailReminder(
  to: string,
  subject: string,
  body: string
): Promise<boolean> {
  const host = process.env.SMTP_HOST || '';
  if (!host) return false; // SMTP not configured — silently skip

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || '' }
        : undefined,
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'jarvis@localhost',
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
