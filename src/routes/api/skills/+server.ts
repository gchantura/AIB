import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { createSkill, listSkills } from '$lib/jarvis/skills/runtime.js';

export const GET: RequestHandler = async () => json({ skills: await listSkills() });
export const POST: RequestHandler = async ({ request }) => {
  try { return json({ skill: await createSkill(await request.json()) }, { status: 201 }); }
  catch (error) { return json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 }); }
};
