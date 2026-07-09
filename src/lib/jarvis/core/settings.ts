import { getAppSetting, setAppSetting } from './store.js';

const SMTP_KEY = 'app.settings';

export interface JarvisSettings {
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpFrom?: string;
  smtpSecure?: boolean;
  dailyBriefingEnabled?: boolean;
  lastDailyBriefingSentDate?: string;
}

/**
 * Reads SMTP + briefing config from Supabase workspace_app_settings table.
 * Falls back to process.env for all fields (allows env vars as override).
 */
export async function getSettings(): Promise<JarvisSettings> {
  const penv = typeof process !== 'undefined' ? process.env : {} as Record<string, string | undefined>;

  try {
    const value = await getAppSetting(SMTP_KEY);
    if (value && typeof value === 'object') {
      const s = value as Record<string, unknown>;
      return {
        smtpHost: String(s.smtpHost || penv.SMTP_HOST || ''),
        smtpPort: Number(s.smtpPort || penv.SMTP_PORT || 587),
        smtpUser: String(s.smtpUser || penv.SMTP_USER || ''),
        smtpPass: String(s.smtpPass || penv.SMTP_PASS || ''),
        smtpFrom: String(s.smtpFrom || penv.SMTP_FROM || ''),
        smtpSecure: s.smtpSecure !== undefined ? !!s.smtpSecure : (penv.SMTP_SECURE === 'true'),
        dailyBriefingEnabled: s.dailyBriefingEnabled !== undefined ? !!s.dailyBriefingEnabled : false,
        lastDailyBriefingSentDate: String(s.lastDailyBriefingSentDate || ''),
      };
    }
  } catch {/* ignore — first boot, no row yet */}

  // No DB row found or parse error → env-only fallback
  return {
    smtpHost: penv.SMTP_HOST || '',
    smtpPort: Number(penv.SMTP_PORT || 587),
    smtpUser: penv.SMTP_USER || '',
    smtpPass: penv.SMTP_PASS || '',
    smtpFrom: penv.SMTP_FROM || '',
    smtpSecure: penv.SMTP_SECURE === 'true',
    dailyBriefingEnabled: false,
  };
}

/**
 * Updates SMTP + briefing config in Supabase.
 */
export async function saveSettings(settings: JarvisSettings): Promise<JarvisSettings> {
  const current = await getSettings();
  const merged: Record<string, unknown> = { ...current, ...settings };
  await setAppSetting(SMTP_KEY, merged);
  return merged as JarvisSettings;
}
