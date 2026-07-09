import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const dataDir = join(process.cwd(), '.jarvis');
const settingsFile = join(dataDir, 'settings.json');

export interface JarvisSettings {
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpFrom?: string;
  smtpSecure?: boolean;
  lastDailyBriefingSentDate?: string;
  dailyBriefingEnabled?: boolean;
}

export async function getSettings(): Promise<JarvisSettings> {
  await mkdir(dataDir, { recursive: true });
  try {
    const text = await readFile(settingsFile, 'utf8');
    return JSON.parse(text) || {};
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return {};
    }
    throw err;
  }
}

export async function saveSettings(settings: JarvisSettings): Promise<JarvisSettings> {
  await mkdir(dataDir, { recursive: true });
  await writeFile(settingsFile, JSON.stringify(settings, null, 2), 'utf8');
  return settings;
}
