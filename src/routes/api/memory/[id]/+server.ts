import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getMemory, updateMemory, deleteMemory } from '$lib/jarvis/memory/api.js';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const entry = await getMemory(params.id);
    if (!entry) return json({ error: 'Not found' }, { status: 404 });
    return json({ entry });
  } catch (e) {
    return json({ error: String(e) }, { status: 500 });
  }
};

export const PATCH: RequestHandler = async ({ params, request }) => {
  try {
    const patch = await request.json();
    const entry = await updateMemory(params.id, patch);
    return json({ entry });
  } catch (e) {
    return json({ error: String(e) }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params }) => {
  try {
    await deleteMemory(params.id);
    return json({ success: true });
  } catch (e) {
    return json({ error: String(e) }, { status: 500 });
  }
};
