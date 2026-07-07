import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { decideApproval, listSafetyState, requestApproval, rollbackChange } from '$lib/jarvis/safety/runtime.js';
import { listTools } from '$lib/jarvis/tools/runtime.js';

export const GET: RequestHandler = async () => json(await listSafetyState());
export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    if (body.operation === 'request') {
      const tool = (await listTools()).find((item) => item.id === body.toolId); if (!tool || tool.safetyLevel < 2) throw new Error('Only approval-gated tools can be requested');
      return json({ approval: await requestApproval(body.toolId, body.input ?? {}, body.reason ?? 'User-requested operation') }, { status: 201 });
    }
    if (body.operation === 'decide') return json({ approval: await decideApproval(body.id, body.decision) });
    if (body.operation === 'rollback') return json({ rollback: await rollbackChange(body.id) });
    throw new Error('Unknown safety operation');
  } catch (error) { return json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 }); }
};
