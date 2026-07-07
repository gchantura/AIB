import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getLLMConfig } from '$lib/jarvis/llm/config.js';
import { getRouter, resetRouter } from '$lib/jarvis/llm/router.js';
import { env } from '$env/dynamic/private';

function buildConfig() {
  return getLLMConfig(env as Record<string, string | undefined>);
}

export const GET: RequestHandler = async () => {
  try {
    resetRouter();
    const config = buildConfig();
    const router = getRouter(config);
    const health = await router.checkAllProviders();
    return json({ providers: health });
  } catch {
    return json({ providers: [], error: 'Failed to check providers' }, { status: 500 });
  }
};
