import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { insertGeneratedApp, getGeneratedApps, deleteGeneratedApp } from '$lib/jarvis/core/store.js';

export const GET: RequestHandler = async () => {
  try {
    const apps = await getGeneratedApps();
    return json({ apps });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
    const title = typeof body.title === 'string' ? body.title.trim() : (body.name ?? slug);
    if (!slug) return json({ error: 'slug is required' }, { status: 400 });
    const app = await insertGeneratedApp(slug, title, body.description, body.fileCount);
    return json({ item: app, ok: true }, { status: 201 });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
};

export const DELETE: RequestHandler = async ({ url }) => {
  try {
    const slug = url.searchParams.get('slug');
    if (!slug) return json({ error: 'slug query param required' }, { status: 400 });
    await deleteGeneratedApp(slug);
    return json({ ok: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
};
