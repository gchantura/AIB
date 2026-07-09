import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getLLMConfig } from '$lib/jarvis/llm/config.js';
import { getRouter, resetRouter } from '$lib/jarvis/llm/router.js';
import { env } from '$env/dynamic/private';

function buildConfig(overrides?: Record<string, unknown>) {
  return getLLMConfig(env as Record<string, string | undefined>, overrides);
}

export const GET: RequestHandler = async ({ url }) => {
  try {
    resetRouter();

    // Accept client key overrides via URL-safe base64 encoded JSON
    let overrides: Record<string, unknown> | undefined;
    const raw = url.searchParams.get('overrides');
    if (raw) {
      try {
        const decoded = Buffer.from(raw, 'base64url').toString('utf8');
        overrides = JSON.parse(decoded);
      } catch {/* ignore invalid encoding */}
    }

    // Also support individual query params for simple cases
    const apiKey = url.searchParams.get('apiKey');
    if (apiKey) {
      overrides = overrides ?? {};
      Object.assign(overrides, { nvidiaApiKey: apiKey });
    }

    const config = buildConfig(overrides);
    const router = getRouter(config);
    const health = await router.checkAllProviders();
    return json({ providers: health });
  } catch {
    return json({ providers: [], error: 'Failed to check providers' }, { status: 500 });
  }
};
