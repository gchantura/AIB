import { randomUUID } from 'node:crypto';
import { createMemory } from '../memory/api.js';
import { record, snapshot, transaction } from '../core/store.js';
import type { ChatMessage } from '../llm/types.js';
import { recordExecution } from '../evaluation/runtime.js';

export async function listConversations() { return (await snapshot()).conversations.map(({ messages, ...conversation }) => ({ ...conversation, messageCount: messages.length, preview: messages.at(-1)?.content.slice(0, 120) ?? '' })); }
export async function getConversation(id: string) { return (await snapshot()).conversations.find((item) => item.id === id) ?? null; }
export async function ensureConversation(id: string | undefined, messages: ChatMessage[]) {
  if (id && await getConversation(id)) return id;
  return transaction((data) => { const now = new Date().toISOString(); const conversation = { id: randomUUID(), title: messages.find((message) => message.role === 'user')?.content.slice(0, 60) || 'New conversation', createdAt: now, updatedAt: now, messages: [] }; data.conversations.unshift(conversation); return conversation.id; });
}
export async function appendConversation(id: string, messages: { role: 'user' | 'assistant' | 'system'; content: string; model?: string }[]) {
  await transaction((data) => { const conversation = data.conversations.find((item) => item.id === id); if (!conversation) throw new Error('Conversation not found'); const now = new Date().toISOString(); for (const message of messages) conversation.messages.push({ id: randomUUID(), at: now, ...message }); conversation.updatedAt = now; record(data, { action: 'persist-conversation', entity: 'system', entityId: id, outcome: 'success', detail: `${messages.length} message(s)` }); });
}
export async function deleteConversation(id: string) { await transaction((data) => { const index = data.conversations.findIndex((item) => item.id === id); if (index < 0) throw new Error('Conversation not found'); data.conversations.splice(index, 1); }); }
export async function extractMemories(text: string, conversationId: string) {
  const patterns = [/(?:remember that|remember,?)\s+(.+)/i, /(?:i prefer|my preference is)\s+(.+)/i, /(?:my goal is|i want to learn)\s+(.+)/i];
  const matches = patterns.map((pattern) => text.match(pattern)?.[1]?.trim()).filter((value): value is string => Boolean(value));
  for (const content of matches) await createMemory({ category: text.toLowerCase().includes('goal') || text.toLowerCase().includes('learn') ? 'learning' : 'user-profile', content, source: `conversation:${conversationId}`, is_inferred: false, confidence: 1, tags: ['auto-extracted'] });
  return matches.length;
}
export async function recordModelRun(kind: 'chat' | 'research' | 'coding', prompt: string, result: { output?: string; model?: string; error?: string }) {
  await transaction((data) => { data.modelRuns.unshift({ id: randomUUID(), kind, prompt: prompt.slice(0, 2000), model: result.model, status: result.error ? 'failed' : 'complete', createdAt: new Date().toISOString(), output: result.output?.slice(0, 100_000), error: result.error }); data.modelRuns = data.modelRuns.slice(0, 200); });
  await recordExecution({ capability: `${kind}:${result.model ?? 'unavailable'}`, kind: 'model', startedAt: new Date().toISOString(), durationMs: 0, ok: !result.error, error: result.error });
}
