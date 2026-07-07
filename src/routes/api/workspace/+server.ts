import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { createEntity, deleteEntity, listEntities, snapshot, updateEntity } from '$lib/jarvis/core/store.js';
import type { EntityKind } from '$lib/jarvis/core/types.js';
import { nextRun } from '$lib/jarvis/automation/runtime.js';

const kinds = new Set<EntityKind>(['tasks', 'notes', 'projects', 'events', 'research', 'automations', 'learning']);
function kind(value: string | null): EntityKind {
  if (!value || !kinds.has(value as EntityKind)) throw new Error('Invalid entity kind');
  return value as EntityKind;
}

export const GET: RequestHandler = async ({ url }) => {
  try {
    const requested = url.searchParams.get('kind');
    if (!requested) {
      const data = await snapshot();
      return json({ counts: Object.fromEntries([...kinds].map((key) => [key, data[key].length])), recentAudit: data.audit.slice(0, 15) });
    }
    return json({ items: await listEntities(kind(requested)) });
  } catch (error) { return json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 }); }
};

export const POST: RequestHandler = async ({ request, url }) => {
  try { const entityKind = kind(url.searchParams.get('kind')); const body = await request.json(); if (entityKind === 'automations' && !body.nextRunAt) body.nextRunAt = nextRun(body.schedule); return json({ item: await createEntity(entityKind, body) }, { status: 201 }); }
  catch (error) { return json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 }); }
};

export const PATCH: RequestHandler = async ({ request, url }) => {
  try {
    const id = url.searchParams.get('id'); if (!id) throw new Error('id is required');
    return json({ item: await updateEntity(kind(url.searchParams.get('kind')), id, await request.json()) });
  } catch (error) { return json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 }); }
};

export const DELETE: RequestHandler = async ({ url }) => {
  try {
    const id = url.searchParams.get('id'); if (!id) throw new Error('id is required');
    await deleteEntity(kind(url.searchParams.get('kind')), id); return new Response(null, { status: 204 });
  } catch (error) { return json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 }); }
};
