import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import nodemailer from 'nodemailer';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom, smtpSecure } = await request.json();
    
    if (!smtpHost || !smtpUser || !smtpPass) {
      throw new Error('Host, Username, and Password are required to test.');
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort || 587),
      secure: smtpSecure === true,
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized: false } // Avoid self-signed certificate rejection
    });

    // 1. Verify connection
    await transporter.verify();

    // 2. Send test email
    await transporter.sendMail({
      from: smtpFrom || smtpUser,
      to: smtpFrom || smtpUser,
      subject: '⏰ J.A.R.V.I.S. SMTP Connection Test',
      text: 'Congratulations! Your J.A.R.V.I.S. email notification integration is now fully online and verified.',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
          <h2 style="color: #0f172a; margin-top: 0;">⏰ J.A.R.V.I.S. Online</h2>
          <p style="color: #334155; line-height: 1.6;">Congratulations! Outgoing email notifications for calendar reminders, task alerts, and daily briefings are now fully active.</p>
          <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <small style="color: #64748b;">This was a system test triggered from your Settings dashboard.</small>
        </div>
      `
    });

    return json({ success: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
};
