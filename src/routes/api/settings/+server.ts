import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getSettings, saveSettings } from '$lib/jarvis/core/settings.js';

export const GET: RequestHandler = async () => {
  try {
    const settings = await getSettings();
    return json({ settings });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const settings = await saveSettings(body);
    return json({ settings, ok: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
};
