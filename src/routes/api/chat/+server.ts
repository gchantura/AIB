import type { RequestHandler } from './$types.js';
import { json } from '@sveltejs/kit';
import { getLLMConfig } from '$lib/jarvis/llm/config.js';
import { getRouter } from '$lib/jarvis/llm/router.js';
import { LLMError } from '$lib/jarvis/llm/errors.js';
import type { ChatMessage, TaskType } from '$lib/jarvis/llm/types.js';
import { env } from '$env/dynamic/private';

function buildConfig() {
  return getLLMConfig(env as Record<string, string | undefined>);
}

export const POST: RequestHandler = async ({ request }) => {
  let body: { messages?: ChatMessage[]; model?: string; task?: TaskType; stream?: boolean };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { messages, model, task = 'chat', stream = true } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return json({ error: 'messages array is required' }, { status: 400 });
  }

  const config = buildConfig();
  const router = getRouter(config);

  if (!stream) {
    try {
      const response = await router.chat({ model: model || config.defaultLocalChatModel, messages }, task);
      return json({ content: response.content, model: response.model });
    } catch (e) {
      const msg = e instanceof LLMError ? e.message : 'No provider available';
      return json({ error: msg }, { status: 503 });
    }
  }

  const readable = new ReadableStream({
    async start(controller) {
      const encode = (data: string) => new TextEncoder().encode(data);
      try {
        const gen = router.chatStream(
          { model: model || config.defaultLocalChatModel, messages },
          task,
        );
        for await (const chunk of gen) {
          controller.enqueue(encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
        }
        controller.enqueue(encode('data: [DONE]\n\n'));
      } catch (e) {
        const msg = e instanceof LLMError ? e.message : 'Provider error';
        controller.enqueue(encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
};
