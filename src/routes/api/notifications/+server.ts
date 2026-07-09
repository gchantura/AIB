import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { snapshot, updateRow, clearTable } from '$lib/jarvis/core/store.js';

export const GET: RequestHandler = async () => {
  const data = await snapshot();
  return json({ notifications: data.notifications });
};

export const PATCH: RequestHandler = async ({ request }) => {
  const { ids } = await request.json();
  const data = await snapshot();
  const now = new Date().toISOString();
  const toUpdate = ids ? data.notifications.filter(n => ids.includes(n.id)) : data.notifications;
  for (const item of toUpdate) {
    await updateRow('notifications', item.id, { readAt: now });
  }
  return json({ ok: true });
};

export const DELETE: RequestHandler = async () => {
  await clearTable('notifications');
  return new Response(null, { status: 204 });
};
