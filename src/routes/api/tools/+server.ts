import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { executeTool, listTools, registerTool } from '$lib/jarvis/tools/runtime.js';

export const GET: RequestHandler = async () => json({ tools: await listTools() });
export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    if (body.operation === 'register') return json({ tool: await registerTool(body.tool) }, { status: 201 });
    return json({ output: await executeTool(body.id, body.input ?? {}, body.approvalId) });
  } catch (error) { return json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 }); }
};
