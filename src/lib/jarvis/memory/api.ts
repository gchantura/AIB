import { randomUUID } from 'node:crypto';
import type { MemoryEntry, CreateMemoryEntry, MemorySearchOptions, MemoryCategory } from './types.js';
import { record, snapshot, transaction } from '../core/store.js';

export async function createMemory(entry: Partial<CreateMemoryEntry> & { category: string; content: string }): Promise<MemoryEntry> {
  return transaction((data) => {
    const now = new Date().toISOString();
    const memory = { id: randomUUID(), category: entry.category, content: entry.content, summary: entry.summary ?? null, source: entry.source ?? 'manual', is_inferred: entry.is_inferred ?? false, confidence: entry.confidence ?? 1, tags: entry.tags ?? [], project_id: entry.project_id ?? null, tool_id: entry.tool_id ?? null, expires_at: entry.expires_at ?? null, created_at: now, updated_at: now } as MemoryEntry;
    data.memories.unshift(memory);
    record(data, { action: 'create-memory', entity: 'system', entityId: memory.id, outcome: 'success', detail: `${memory.category}: ${memory.content.slice(0, 120)}` });
    return memory;
  });
}

export async function searchMemory(query: string, options: MemorySearchOptions = {}) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return (await listMemory(options)).filter((entry) => words.every((word) => `${entry.content} ${entry.summary ?? ''} ${entry.tags.join(' ')}`.toLowerCase().includes(word)));
}

export async function listMemory(options: MemorySearchOptions = {}) {
  const { category, limit = 50, offset = 0, orderDir = 'desc' } = options;
  const entries = (await snapshot()).memories.filter((entry) => !category || entry.category === category) as MemoryEntry[];
  entries.sort((a, b) => orderDir === 'asc' ? a.created_at.localeCompare(b.created_at) : b.created_at.localeCompare(a.created_at));
  return entries.slice(offset, offset + limit);
}

export async function getMemory(id: string) { return ((await snapshot()).memories.find((entry) => entry.id === id) as MemoryEntry | undefined) ?? null; }
export async function updateMemory(id: string, patch: Partial<Pick<MemoryEntry, 'content' | 'summary' | 'tags' | 'confidence' | 'expires_at'>>) {
  return transaction((data) => { const entry = data.memories.find((item) => item.id === id); if (!entry) throw new Error('Memory not found'); Object.assign(entry, patch, { updated_at: new Date().toISOString() }); return entry as MemoryEntry; });
}
export async function deleteMemory(id: string) { await transaction((data) => { const index = data.memories.findIndex((item) => item.id === id); if (index < 0) throw new Error('Memory not found'); data.memories.splice(index, 1); record(data, { action: 'delete-memory', entity: 'system', entityId: id, outcome: 'success', detail: 'Memory deleted' }); }); }
export async function countMemory(category?: MemoryCategory) { return (await snapshot()).memories.filter((entry) => !category || entry.category === category).length; }
export async function exportMemory(category?: MemoryCategory) { return { exportedAt: new Date().toISOString(), entries: await listMemory({ category, limit: Number.MAX_SAFE_INTEGER }) }; }
