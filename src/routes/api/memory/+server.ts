import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { listMemory, searchMemory, createMemory, countMemory } from '$lib/jarvis/memory/api.js';
import type { MemoryCategory } from '$lib/jarvis/memory/types.js';

export const GET: RequestHandler = async ({ url }) => {
  const q = url.searchParams.get('q') ?? '';
  const category = url.searchParams.get('category') as MemoryCategory | null;
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50'), 200);
  const offset = parseInt(url.searchParams.get('offset') ?? '0');

  try {
    const opts = { category: category ?? undefined, limit, offset };
    const entries = q.trim()
      ? await searchMemory(q.trim(), opts)
      : await listMemory(opts);
    const total = await countMemory(category ?? undefined);
    return json({ entries, total });
  } catch (e) {
    return json({ error: String(e) }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    if (!body.category || !body.content) {
      return json({ error: 'category and content are required' }, { status: 400 });
    }
    const entry = await createMemory(body);
    return json({ entry }, { status: 201 });
  } catch (e) {
    return json({ error: String(e) }, { status: 500 });
  }
};
