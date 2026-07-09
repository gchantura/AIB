import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getAppSetting, setAppSetting, deleteAppSetting } from '$lib/jarvis/core/store.js';

const KEY = 'provider-config';

export const GET: RequestHandler = async () => {
  try {
    const value = await getAppSetting(KEY);
    return json({ config: (value as Record<string, unknown>) ?? {} });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const config = typeof body === 'object' && body !== null ? body : (body.config ?? {});
    // Only allow string values for apiKey/baseUrl — sanitize numeric keys
    const sanitized: Record<string, { apiKey?: string; baseUrl?: string }> = {};
    for (const [id, cfg] of Object.entries(config)) {
      if (typeof cfg === 'object' && cfg !== null) {
        sanitized[id] = {
          apiKey: typeof cfg.apiKey === 'string' ? String(cfg.apiKey).trim() : undefined,
          baseUrl: typeof cfg.baseUrl === 'string' ? String(cfg.baseUrl).trim() : undefined,
        };
      }
    }
    await setAppSetting(KEY, sanitized);
    return json({ ok: true, config: sanitized });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
};

export const DELETE: RequestHandler = async ({ url }) => {
  try {
    const providerId = url.searchParams.get('id');
    if (!providerId) return json({ error: 'id query param required' }, { status: 400 });
    const value = await getAppSetting(KEY) ?? {};
    const config = typeof value === 'object' ? value : {};
    delete (config as Record<string, unknown>)[providerId];
    await setAppSetting(KEY, config);
    return json({ ok: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
};
