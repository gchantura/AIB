import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getAppSetting, setAppSetting } from '$lib/jarvis/core/store.js';

const SETTINGS_KEY = 'app.settings';

// GET: return all app settings as a flat object
export const GET: RequestHandler = async () => {
  try {
    const value = await getAppSetting(SETTINGS_KEY);
    if (!value) return json({ settings: {} });
    return json({ settings: (value as Record<string, unknown>) ?? {} });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
};

// POST: save all app settings under one key
export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    // Accept both { smtpHost, smtpPort, ... } (flat) and { settings: { ... } } (wrapped)
    const settings = body.settings ?? body;
    await setAppSetting(SETTINGS_KEY, settings as Record<string, unknown>);
    return json({ settings, ok: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
};
