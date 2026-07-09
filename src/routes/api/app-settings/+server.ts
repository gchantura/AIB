import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getAppSetting, setAppSetting, deleteAppSetting, getAppSettingsByPrefix } from '$lib/jarvis/core/store.js';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const key = url.searchParams.get('key');
    if (key) {
      const value = await getAppSetting(key);
      return json({ key, value });
    }
    // Return all settings matching a prefix
    const prefix = url.searchParams.get('prefix');
    if (prefix) {
      const settings = await getAppSettingsByPrefix(prefix);
      return json({ key: null, value: settings });
    }
    return json({ error: 'Provide ?key= or ?prefix=' }, { status: 400 });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const key = typeof body.key === 'string' ? body.key : null;
    if (!key) return json({ error: 'key is required' }, { status: 400 });
    const value = body.value ?? (body.settings ?? {});
    await setAppSetting(key, typeof value === 'object' && value !== null ? value : JSON.parse(String(value)));
    return json({ key, ok: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
};

export const DELETE: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const key = typeof body.key === 'string' ? body.key : null;
    if (!key) return json({ error: 'key is required' }, { status: 400 });
    await deleteAppSetting(key);
    return json({ ok: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
};
