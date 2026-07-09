import type { RequestHandler } from './$types.js';
import { json } from '@sveltejs/kit';
import { getLLMConfig } from '$lib/jarvis/llm/config.js';
import { getRouter, resetRouter } from '$lib/jarvis/llm/router.js';
import { LLMError } from '$lib/jarvis/llm/errors.js';
import type { ChatMessage, TaskType } from '$lib/jarvis/llm/types.js';
import { env } from '$env/dynamic/private';
import { appendConversation, ensureConversation, extractMemories, recordModelRun } from '$lib/jarvis/intelligence/runtime.js';
import { snapshot } from '$lib/jarvis/core/store.js';
import { retrieveRelevant } from '$lib/jarvis/memory/relevance.js';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

function buildConfig() {
  return getLLMConfig(env as Record<string, string | undefined>);
}

async function buildProjectContext(prompt: string) {
  const [data, memories, readme] = await Promise.all([
    snapshot(),
    retrieveRelevant(prompt, 6),
    readFile(join(process.cwd(), 'README.md'), 'utf8').catch(() => '')
  ]);
  const memoryText = memories.length ? memories.map((memory) => `- [${memory.category}] ${memory.content}`).join('\n') : '- No directly relevant saved memories.';
  return `You are J.A.R.V.I.S., the AI operating system embedded in the current Super J.A.R.V.I.S. repository (package: aib). Never claim you do not know which project the user means when they say "this project". They mean this workspace unless they explicitly name another project.

PROJECT IDENTITY
This is a local-first SvelteKit 2 / Svelte 5 personal AI operating system. It includes model-agnostic chat, atomic local persistence, memory, tasks, notes, projects, calendar events, research, coding assistance, tool and skill generation, approval-gated file/app generation, rollback, automations, notifications, repository intelligence, evaluation, and governed upgrade plans. Local user data is stored in .jarvis/workspace.json. Ollama is the preferred local model provider.

LIVE WORKSPACE STATE
- Tasks: ${data.tasks.length}; projects: ${data.projects.length}; notes: ${data.notes.length}; memories: ${data.memories.length}
- Tools: ${data.generatedTools.length + 7}; skills generated: ${data.generatedSkills.length}; automations: ${data.automations.length}
- Conversations: ${data.conversations.length}; open improvement proposals: ${data.improvementProposals.filter((item) => item.status === 'proposed').length}

RELEVANT LOCAL MEMORY
${memoryText}

README EXCERPT
${readme.slice(0, 1800)}

BEHAVIOR
Answer concretely about this repository. Distinguish implemented capabilities from future work. Do not invent files, successful actions, memories, or provider state. When the user asks what the project is, explain the project directly rather than asking for context.`;
}

export const POST: RequestHandler = async ({ request }) => {
  let body: { messages?: ChatMessage[]; model?: string; task?: TaskType; stream?: boolean; conversationId?: string; temperature?: number; top_p?: number; max_tokens?: number; seed?: number; providerKeyOverrides?: Record<string, { apiKey?: string; baseUrl?: string }> };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { messages, model, task = 'chat', stream = true, conversationId, temperature, top_p, max_tokens, seed, providerKeyOverrides } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return json({ error: 'messages array is required' }, { status: 400 });
  }

  const overrides = providerKeyOverrides as Partial<import('$lib/jarvis/llm/types.js').LLMConfig> | undefined;
  const config = buildConfig();
  const mergedConfig = getLLMConfig(env as Record<string, string | undefined>, overrides);
  resetRouter();
  const router = getRouter(mergedConfig);
  const lastUser = [...messages].reverse().find((message) => message.role === 'user');
  const augmentedMessages: ChatMessage[] = [{ role: 'system', content: await buildProjectContext(lastUser?.content ?? '') }, ...messages.filter((message) => message.role !== 'system')];
  const savedConversationId = await ensureConversation(conversationId, messages);
  if (lastUser) { await appendConversation(savedConversationId, [lastUser]); await extractMemories(lastUser.content, savedConversationId); }

  if (!stream) {
    try {
      const response = await router.chat({ model: model || '', messages: augmentedMessages, temperature: body.temperature, top_p: body.top_p, max_tokens: body.max_tokens, seed: body.seed }, task);
      await appendConversation(savedConversationId, [{ role: 'assistant', content: response.content, model: response.model }]);
      await recordModelRun('chat', lastUser?.content ?? '', { output: response.content, model: response.model });
      return json({ content: response.content, model: response.model, conversationId: savedConversationId });
    } catch (e) {
      const msg = e instanceof LLMError ? e.message : 'No provider available';
      await recordModelRun('chat', lastUser?.content ?? '', { error: msg });
      return json({ error: msg, conversationId: savedConversationId }, { status: 503 });
    }
  }

  const readable = new ReadableStream({
    async start(controller) {
      const encode = (data: string) => new TextEncoder().encode(data);
      try {
        controller.enqueue(encode(`data: ${JSON.stringify({ conversationId: savedConversationId })}\n\n`));
        let accumulated = '';
        const gen = router.chatStream(
          { model: model || '', messages: augmentedMessages, temperature: body.temperature, top_p: body.top_p, max_tokens: body.max_tokens, seed: body.seed },
          task,
        );
        for await (const chunk of gen) {
          accumulated += chunk;
          controller.enqueue(encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
        }
        await appendConversation(savedConversationId, [{ role: 'assistant', content: accumulated, model: model || config.defaultLocalChatModel }]);
        await recordModelRun('chat', lastUser?.content ?? '', { output: accumulated, model: model || config.defaultLocalChatModel });
        controller.enqueue(encode('data: [DONE]\n\n'));
      } catch (e) {
        const msg = e instanceof LLMError ? e.message : 'Provider error';
        await recordModelRun('chat', lastUser?.content ?? '', { error: msg });
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
