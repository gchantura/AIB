import type { MemoryEntry, CreateMemoryEntry, MemorySearchOptions, MemoryCategory } from './types.js';
import { getServerSupabase } from '$lib/supabase.server.js';

const TABLE = 'memory_entries';

function db() {
  return getServerSupabase();
}

export async function createMemory(entry: Partial<CreateMemoryEntry> & { category: string; content: string }): Promise<MemoryEntry> {
  const { data, error } = await db()
    .from(TABLE)
    .insert({
      category: entry.category,
      content: entry.content,
      summary: entry.summary ?? null,
      source: entry.source ?? 'manual',
      is_inferred: entry.is_inferred ?? false,
      confidence: entry.confidence ?? 1.0,
      tags: entry.tags ?? [],
      project_id: entry.project_id ?? null,
      tool_id: entry.tool_id ?? null,
      expires_at: entry.expires_at ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as MemoryEntry;
}

export async function searchMemory(query: string, options: MemorySearchOptions = {}): Promise<MemoryEntry[]> {
  const { category, limit = 20, offset = 0, orderBy = 'created_at', orderDir = 'desc' } = options;

  let req = db()
    .from(TABLE)
    .select('*')
    .ilike('content', `%${query}%`)
    .order(orderBy, { ascending: orderDir === 'asc' })
    .range(offset, offset + limit - 1);

  if (category) req = req.eq('category', category);

  const { data, error } = await req;
  if (error) throw error;
  return (data ?? []) as MemoryEntry[];
}

export async function listMemory(options: MemorySearchOptions = {}): Promise<MemoryEntry[]> {
  const { category, limit = 50, offset = 0, orderBy = 'created_at', orderDir = 'desc' } = options;

  let req = db()
    .from(TABLE)
    .select('*')
    .order(orderBy, { ascending: orderDir === 'asc' })
    .range(offset, offset + limit - 1);

  if (category) req = req.eq('category', category);

  const { data, error } = await req;
  if (error) throw error;
  return (data ?? []) as MemoryEntry[];
}

export async function getMemory(id: string): Promise<MemoryEntry | null> {
  const { data, error } = await db().from(TABLE).select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as MemoryEntry | null;
}

export async function updateMemory(id: string, patch: Partial<Pick<MemoryEntry, 'content' | 'summary' | 'tags' | 'confidence' | 'expires_at'>>): Promise<MemoryEntry> {
  const { data, error } = await db()
    .from(TABLE)
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as MemoryEntry;
}

export async function deleteMemory(id: string): Promise<void> {
  const { error } = await db().from(TABLE).delete().eq('id', id);
  if (error) throw error;
}

export async function countMemory(category?: MemoryCategory): Promise<number> {
  let req = db().from(TABLE).select('id', { count: 'exact', head: true });
  if (category) req = req.eq('category', category);
  const { count, error } = await req;
  if (error) throw error;
  return count ?? 0;
}
