import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { AuditEvent, BaseEntity, EntityKind, JarvisData } from './types.js';
import { getServerSupabase } from '$lib/supabase.server.js';

const dataDir = join(process.cwd(), '.jarvis');
const dataFile = join(dataDir, 'workspace.json');
const tempFile = join(dataDir, 'workspace.tmp.json');
let queue = Promise.resolve();

const emptyData = (): JarvisData => ({ version: 1, tasks: [], notes: [], projects: [], events: [], research: [], automations: [], learning: [], audit: [], generatedTools: [], generatedSkills: [], memories: [], approvals: [], rollbacks: [], conversations: [], modelRuns: [], notifications: [], briefings: [], executionMetrics: [], improvementProposals: [], upgradePlans: [] });

async function load(): Promise<JarvisData> {
  await mkdir(dataDir, { recursive: true });
  try { return { ...emptyData(), ...JSON.parse(await readFile(dataFile, 'utf8')) }; }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return emptyData();
    throw error;
  }
}

async function save(data: JarvisData) {
  await writeFile(tempFile, JSON.stringify(data, null, 2), 'utf8');
  await rename(tempFile, dataFile);
}

export function transaction<T>(work: (data: JarvisData) => T | Promise<T>): Promise<T> {
  const result = queue.then(async () => { const data = await load(); const value = await work(data); await save(data); return value; });
  queue = result.then(() => undefined, () => undefined);
  return result;
}

export async function snapshot(): Promise<JarvisData> {
  await queue;
  const local = await load();
  const supa = await loadWorkspaceFromSupabase();
  return { ...local, ...supa };
}

export function record(data: JarvisData, event: Omit<AuditEvent, 'id' | 'at'>) {
  data.audit.unshift({ id: randomUUID(), at: new Date().toISOString(), ...event });
  data.audit = data.audit.slice(0, 500);
}

// ── Supabase-backed workspace kinds ──
const SUPA_KINDS = new Set<EntityKind>(['events', 'tasks', 'notes', 'projects']);

const TABLE_MAP: Record<string, string> = {
  events: 'workspace_events',
  tasks: 'workspace_tasks',
  notes: 'workspace_notes',
  projects: 'workspace_projects',
};

// Map camelCase fields from the API to snake_case for Supabase
const FIELD_MAP: Record<string, Record<string, string>> = {
  events: { startsAt: 'starts_at', endsAt: 'ends_at', reminderMinutes: 'reminder_minutes', reminderRepeat: 'reminder_repeat', nextNotifyAt: 'next_notify_at', emailReminder: 'email_reminder', emailCc: 'email_cc', createdAt: 'created_at', updatedAt: 'updated_at' },
  tasks: { dueAt: 'due_at', reminderMinutes: 'reminder_minutes', reminderRepeat: 'reminder_repeat', nextNotifyAt: 'next_notify_at', emailReminder: 'email_reminder', emailCc: 'email_cc', emailSubject: 'email_subject', createdAt: 'created_at', updatedAt: 'updated_at' },
  notes: { projectId: 'project_id', createdAt: 'created_at', updatedAt: 'updated_at' },
  projects: { createdAt: 'created_at', updatedAt: 'updated_at' },
};

function toSnake(kind: string, obj: Record<string, unknown>): Record<string, unknown> {
  const map = FIELD_MAP[kind] ?? {};
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    result[map[key] ?? key] = val;
  }
  return result;
}

function toCamel(kind: string, obj: Record<string, unknown>): Record<string, unknown> {
  const map = FIELD_MAP[kind] ?? {};
  const reverse: Record<string, string> = {};
  for (const [camel, snake] of Object.entries(map)) reverse[snake] = camel;
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    result[reverse[key] ?? key] = val;
  }
  return result;
}

async function loadWorkspaceFromSupabase(): Promise<Partial<JarvisData>> {
  try {
    const supa = getServerSupabase();
    const [ev, tk, nt, pr] = await Promise.all([
      supa.from('workspace_events').select('*').order('created_at', { ascending: false }),
      supa.from('workspace_tasks').select('*').order('created_at', { ascending: false }),
      supa.from('workspace_notes').select('*').order('created_at', { ascending: false }),
      supa.from('workspace_projects').select('*').order('created_at', { ascending: false }),
    ]);

    return {
      events: (ev.data ?? []).map(r => toCamel('events', r)) as never,
      tasks: (tk.data ?? []).map(r => toCamel('tasks', r)) as never,
      notes: (nt.data ?? []).map(r => toCamel('notes', r)) as never,
      projects: (pr.data ?? []).map(r => toCamel('projects', r)) as never,
    };
  } catch {
    return {};
  }
}

export async function listEntities(kind: EntityKind) {
  if (SUPA_KINDS.has(kind)) {
    const supa = getServerSupabase();
    const table = TABLE_MAP[kind];
    const { data, error } = await supa.from(table).select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(r => toCamel(kind, r));
  }
  return (await snapshot())[kind];
}

export async function createEntity(kind: EntityKind, input: Record<string, unknown>) {
  if (SUPA_KINDS.has(kind)) {
    const supa = getServerSupabase();
    const table = TABLE_MAP[kind];
    const now = new Date().toISOString();
    const row = toSnake(kind, { ...input, id: randomUUID(), createdAt: now, updatedAt: now });
    const { data, error } = await supa.from(table).insert(row).select('*').single();
    if (error) throw error;
    const entity = toCamel(kind, data) as BaseEntity;
    // Record audit locally
    await transaction((d) => { record(d, { action: 'create', entity: kind, entityId: entity.id, outcome: 'success', detail: `Created ${kind.slice(0, -1)}` }); });
    return entity;
  }
  return transaction((data) => {
    const now = new Date().toISOString();
    const entity = { ...input, id: randomUUID(), createdAt: now, updatedAt: now } as unknown as BaseEntity;
    (data[kind] as BaseEntity[]).unshift(entity);
    record(data, { action: 'create', entity: kind, entityId: entity.id, outcome: 'success', detail: `Created ${kind.slice(0, -1)}` });
    return entity;
  });
}

export async function updateEntity(kind: EntityKind, id: string, patch: Record<string, unknown>) {
  if (SUPA_KINDS.has(kind)) {
    const supa = getServerSupabase();
    const table = TABLE_MAP[kind];
    const row = toSnake(kind, { ...patch, updatedAt: new Date().toISOString() });
    delete row.id;
    const { data, error } = await supa.from(table).update(row).eq('id', id).select('*').single();
    if (error) throw error;
    const entity = toCamel(kind, data) as BaseEntity;
    await transaction((d) => { record(d, { action: 'update', entity: kind, entityId: id, outcome: 'success', detail: `Updated ${kind.slice(0, -1)}` }); });
    return entity;
  }
  return transaction((data) => {
    const collection = data[kind] as BaseEntity[];
    const index = collection.findIndex((item) => item.id === id);
    if (index < 0) throw new Error('Entity not found');
    collection[index] = { ...collection[index], ...patch, id, updatedAt: new Date().toISOString() };
    record(data, { action: 'update', entity: kind, entityId: id, outcome: 'success', detail: `Updated ${kind.slice(0, -1)}` });
    return collection[index];
  });
}

export async function deleteEntity(kind: EntityKind, id: string) {
  if (SUPA_KINDS.has(kind)) {
    const supa = getServerSupabase();
    const table = TABLE_MAP[kind];
    const { error } = await supa.from(table).delete().eq('id', id);
    if (error) throw error;
    await transaction((d) => { record(d, { action: 'delete', entity: kind, entityId: id, outcome: 'success', detail: `Deleted ${kind.slice(0, -1)}` }); });
    return;
  }
  return transaction((data) => {
    const collection = data[kind] as BaseEntity[];
    const index = collection.findIndex((item) => item.id === id);
    if (index < 0) throw new Error('Entity not found');
    collection.splice(index, 1);
    record(data, { action: 'delete', entity: kind, entityId: id, outcome: 'success', detail: `Deleted ${kind.slice(0, -1)}` });
  });
}
