import { randomUUID } from 'node:crypto';
import type { AuditEvent, BaseEntity, EntityKind, JarvisData } from './types.js';
import { getServerSupabase } from '$lib/supabase.server.js';

// ── Table mapping ──
// EntityKind -> Supabase table name
const ENTITY_TABLES: Record<EntityKind, string> = {
  events: 'workspace_events',
  tasks: 'workspace_tasks',
  notes: 'workspace_notes',
  projects: 'workspace_projects',
  research: 'workspace_research',
  automations: 'workspace_automations',
  learning: 'workspace_learning',
};

// Collection key in JarvisData -> Supabase table name
const COLLECTION_TABLES: Record<string, string> = {
  ...ENTITY_TABLES,
  audit: 'workspace_audit',
  generatedTools: 'workspace_generated_tools',
  generatedSkills: 'workspace_generated_skills',
  appSettings: 'workspace_app_settings',
  generatedApps: 'workspace_generated_apps',
  memories: 'workspace_memories',
  approvals: 'workspace_approvals',
  rollbacks: 'workspace_rollbacks',
  conversations: 'workspace_conversations',
  modelRuns: 'workspace_model_runs',
  notifications: 'workspace_notifications',
  briefings: 'workspace_briefings',
  executionMetrics: 'workspace_execution_metrics',
  improvementProposals: 'workspace_improvement_proposals',
  upgradePlans: 'workspace_upgrade_plans',
};

// camelCase <-> snake_case field maps per table
const FIELD_MAPS: Record<string, Record<string, string>> = {
  workspace_events: { startsAt: 'starts_at', endsAt: 'ends_at', reminderMinutes: 'reminder_minutes', reminderRepeat: 'reminder_repeat', nextNotifyAt: 'next_notify_at', emailReminder: 'email_reminder', emailCc: 'email_cc', createdAt: 'created_at', updatedAt: 'updated_at' },
  workspace_tasks: { dueAt: 'due_at', reminderMinutes: 'reminder_minutes', reminderRepeat: 'reminder_repeat', nextNotifyAt: 'next_notify_at', emailReminder: 'email_reminder', emailCc: 'email_cc', emailSubject: 'email_subject', createdAt: 'created_at', updatedAt: 'updated_at' },
  workspace_notes: { projectId: 'project_id', createdAt: 'created_at', updatedAt: 'updated_at' },
  workspace_projects: { createdAt: 'created_at', updatedAt: 'updated_at' },
  workspace_research: { createdAt: 'created_at', updatedAt: 'updated_at' },
  workspace_automations: { lastRunAt: 'last_run_at', nextRunAt: 'next_run_at', createdAt: 'created_at', updatedAt: 'updated_at' },
  workspace_learning: { createdAt: 'created_at', updatedAt: 'updated_at' },
  workspace_audit: { at: 'at', entityId: 'entity_id' },
  workspace_generated_tools: { toolId: 'tool_id', safetyLevel: 'safety_level', createdAt: 'created_at' },
  workspace_generated_skills: { skillId: 'skill_id', createdAt: 'created_at' },
  workspace_memories: { isInferred: 'is_inferred', projectId: 'project_id', toolId: 'tool_id', createdAt: 'created_at', updatedAt: 'updated_at', expiresAt: 'expires_at' },
  workspace_approvals: { toolId: 'tool_id', createdAt: 'created_at', decidedAt: 'decided_at', consumedAt: 'consumed_at' },
  workspace_rollbacks: { approvalId: 'approval_id', toolId: 'tool_id', createdAt: 'created_at', rolledBackAt: 'rolled_back_at' },
  workspace_conversations: { createdAt: 'created_at', updatedAt: 'updated_at' },
  workspace_model_runs: { createdAt: 'created_at' },
  workspace_notifications: { createdAt: 'created_at', readAt: 'read_at' },
  workspace_briefings: { createdAt: 'created_at', taskIds: 'task_ids', eventIds: 'event_ids' },
  workspace_execution_metrics: { startedAt: 'started_at', durationMs: 'duration_ms' },
  workspace_improvement_proposals: { createdAt: 'created_at', decidedAt: 'decided_at' },
  workspace_upgrade_plans: { proposalId: 'proposal_id', createdAt: 'created_at', updatedAt: 'updated_at' },
};

// ── Key-value app settings helpers ──
// Stored in workspace_app_settings table as key=value pairs.
export async function getAppSetting(key: string): Promise<Record<string, unknown> | null> {
  const s = supa();
  const table = 'workspace_app_settings';
  const { data, error } = await s.from(table).select('value').eq('key', key).maybeSingle();
  if (error) throw error;
  return data?.value ?? null;
}

export async function setAppSetting(key: string, value: Record<string, unknown>): Promise<void> {
  const s = supa();
  const table = 'workspace_app_settings';
  const { data, error } = await s.from(table).upsert({ key, value }, { onConflict: 'key' }).select('value').single();
  if (error) throw error;
}

export async function deleteAppSetting(key: string): Promise<void> {
  const s = supa();
  const table = 'workspace_app_settings';
  const { error } = await s.from(table).delete().eq('key', key);
  if (error) throw error;
}

// Returns all settings whose keys start with `prefix`.
export async function getAppSettingsByPrefix(prefix: string): Promise<Record<string, unknown>> {
  const s = supa();
  const table = 'workspace_app_settings';
  const { data, error } = await s.from(table).select('key,value').like('key', `${prefix} %`);
  if (error) throw error;
  const result: Record<string, unknown> = {};
  for (const row of data ?? []) {
    result[row.key] = row.value;
  }
  // Also match the prefix itself (exact match)
  const prefixRow = await getAppSetting(prefix);
  if (prefixRow) Object.assign(result, prefixRow);
  return result;
}

// ── Generated apps helpers ──
export async function insertGeneratedApp(slug: string, title: string, description?: string, fileCount?: number): Promise<Record<string, unknown>> {
  const s = supa();
  const table = 'workspace_generated_apps';
  const now = new Date().toISOString();
  const { data, error } = await s.from(table).insert({ id: randomUUID(), slug, title, description, file_count: fileCount ?? 0, created_at: now, updated_at: now }).select('*').single();
  if (error) throw error;
  return toCamel(table, data);
}

export async function getGeneratedApps(): Promise<Record<string, unknown>[]> {
  const s = supa();
  const table = 'workspace_generated_apps';
  const { data, error } = await s.from(table).select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(r => toCamel(table, r));
}

export async function deleteGeneratedApp(slug: string): Promise<void> {
  const s = supa();
  const table = 'workspace_generated_apps';
  const { error } = await s.from(table).delete().eq('slug', slug);
  if (error) throw error;
}

function toSnake(table: string, obj: Record<string, unknown>): Record<string, unknown> {
  const map = FIELD_MAPS[table] ?? {};
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    result[map[key] ?? key] = val;
  }
  return result;
}

function toCamel(table: string, obj: Record<string, unknown>): Record<string, unknown> {
  const map = FIELD_MAPS[table] ?? {};
  const reverse: Record<string, string> = {};
  for (const [camel, snake] of Object.entries(map)) reverse[snake] = camel;
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    result[reverse[key] ?? key] = val;
  }
  return result;
}

function supa() { return getServerSupabase(); }

// ── snapshot() — load all collections from Supabase ──
export async function snapshot(): Promise<JarvisData> {
  const s = supa();
  const [
    events, tasks, notes, projects, research, automations, learning,
    audit, generatedTools, generatedSkills, memories, approvals, rollbacks,
    conversations, modelRuns, notifications, briefings, executionMetrics,
    improvementProposals, upgradePlans,
  ] = await Promise.all([
    s.from('workspace_events').select('*').order('created_at', { ascending: false }),
    s.from('workspace_tasks').select('*').order('created_at', { ascending: false }),
    s.from('workspace_notes').select('*').order('created_at', { ascending: false }),
    s.from('workspace_projects').select('*').order('created_at', { ascending: false }),
    s.from('workspace_research').select('*').order('created_at', { ascending: false }),
    s.from('workspace_automations').select('*').order('created_at', { ascending: false }),
    s.from('workspace_learning').select('*').order('created_at', { ascending: false }),
    s.from('workspace_audit').select('*').order('at', { ascending: false }).limit(500),
    s.from('workspace_generated_tools').select('*').order('created_at', { ascending: false }),
    s.from('workspace_generated_skills').select('*').order('created_at', { ascending: false }),
    s.from('workspace_memories').select('*').order('created_at', { ascending: false }),
    s.from('workspace_approvals').select('*').order('created_at', { ascending: false }),
    s.from('workspace_rollbacks').select('*').order('created_at', { ascending: false }),
    s.from('workspace_conversations').select('*').order('updated_at', { ascending: false }),
    s.from('workspace_model_runs').select('*').order('created_at', { ascending: false }).limit(200),
    s.from('workspace_notifications').select('*').order('created_at', { ascending: false }).limit(300),
    s.from('workspace_briefings').select('*').order('created_at', { ascending: false }),
    s.from('workspace_execution_metrics').select('*').order('started_at', { ascending: false }).limit(2000),
    s.from('workspace_improvement_proposals').select('*').order('created_at', { ascending: false }),
    s.from('workspace_upgrade_plans').select('*').order('created_at', { ascending: false }),
  ]);

  return {
    version: 1,
    events: (events.data ?? []).map(r => toCamel('workspace_events', r)) as never,
    tasks: (tasks.data ?? []).map(r => toCamel('workspace_tasks', r)) as never,
    notes: (notes.data ?? []).map(r => toCamel('workspace_notes', r)) as never,
    projects: (projects.data ?? []).map(r => toCamel('workspace_projects', r)) as never,
    research: (research.data ?? []).map(r => toCamel('workspace_research', r)) as never,
    automations: (automations.data ?? []).map(r => toCamel('workspace_automations', r)) as never,
    learning: (learning.data ?? []).map(r => toCamel('workspace_learning', r)) as never,
    audit: (audit.data ?? []).map(r => toCamel('workspace_audit', r)) as never,
    generatedTools: (generatedTools.data ?? []).map(r => toCamel('workspace_generated_tools', r)) as never,
    generatedSkills: (generatedSkills.data ?? []).map(r => toCamel('workspace_generated_skills', r)) as never,
    memories: (memories.data ?? []).map(r => toCamel('workspace_memories', r)) as never,
    approvals: (approvals.data ?? []).map(r => toCamel('workspace_approvals', r)) as never,
    rollbacks: (rollbacks.data ?? []).map(r => toCamel('workspace_rollbacks', r)) as never,
    conversations: (conversations.data ?? []).map(r => toCamel('workspace_conversations', r)) as never,
    modelRuns: (modelRuns.data ?? []).map(r => toCamel('workspace_model_runs', r)) as never,
    notifications: (notifications.data ?? []).map(r => toCamel('workspace_notifications', r)) as never,
    briefings: (briefings.data ?? []).map(r => toCamel('workspace_briefings', r)) as never,
    executionMetrics: (executionMetrics.data ?? []).map(r => toCamel('workspace_execution_metrics', r)) as never,
    improvementProposals: (improvementProposals.data ?? []).map(r => toCamel('workspace_improvement_proposals', r)) as never,
    upgradePlans: (upgradePlans.data ?? []).map(r => toCamel('workspace_upgrade_plans', r)) as never,
  };
}

// ── record() — insert audit event into workspace_audit ──
export async function record(_data: JarvisData | null, event: Omit<AuditEvent, 'id' | 'at'>): Promise<void> {
  const s = supa();
  const row = toSnake('workspace_audit', {
    id: randomUUID(),
    at: new Date().toISOString(),
    action: event.action,
    entity: event.entity,
    entityId: event.entityId,
    outcome: event.outcome,
    detail: event.detail,
  });
  await s.from('workspace_audit').insert(row);
}

// ── Entity CRUD (for EntityKind collections) ──
export async function listEntities(kind: EntityKind) {
  const table = ENTITY_TABLES[kind];
  const s = supa();
  const { data, error } = await s.from(table).select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(r => toCamel(table, r));
}

export async function createEntity(kind: EntityKind, input: Record<string, unknown>) {
  const table = ENTITY_TABLES[kind];
  const s = supa();
  const now = new Date().toISOString();
  const row = toSnake(table, { ...input, id: randomUUID(), createdAt: now, updatedAt: now });
  const { data, error } = await s.from(table).insert(row).select('*').single();
  if (error) throw error;
  const entity = toCamel(table, data) as BaseEntity;
  await record(null, { action: 'create', entity: kind, entityId: entity.id, outcome: 'success', detail: `Created ${kind.slice(0, -1)}` });
  return entity;
}

export async function updateEntity(kind: EntityKind, id: string, patch: Record<string, unknown>) {
  const table = ENTITY_TABLES[kind];
  const s = supa();
  const row = toSnake(table, { ...patch, updatedAt: new Date().toISOString() });
  delete row.id;
  const { data, error } = await s.from(table).update(row).eq('id', id).select('*').single();
  if (error) throw error;
  const entity = toCamel(table, data) as BaseEntity;
  await record(null, { action: 'update', entity: kind, entityId: id, outcome: 'success', detail: `Updated ${kind.slice(0, -1)}` });
  return entity;
}

export async function deleteEntity(kind: EntityKind, id: string) {
  const table = ENTITY_TABLES[kind];
  const s = supa();
  const { error } = await s.from(table).delete().eq('id', id);
  if (error) throw error;
  await record(null, { action: 'delete', entity: kind, entityId: id, outcome: 'success', detail: `Deleted ${kind.slice(0, -1)}` });
}

// ── Generic collection helpers (for non-EntityKind collections) ──
// These replace the old transaction() pattern with direct Supabase operations.

export async function insertRow(collection: string, row: Record<string, unknown>): Promise<Record<string, unknown>> {
  const table = COLLECTION_TABLES[collection];
  if (!table) throw new Error(`Unknown collection: ${collection}`);
  const s = supa();
  const snakeRow = toSnake(table, row);
  const { data, error } = await s.from(table).insert(snakeRow).select('*').single();
  if (error) throw error;
  return toCamel(table, data);
}

export async function updateRow(collection: string, id: string, patch: Record<string, unknown>): Promise<Record<string, unknown>> {
  const table = COLLECTION_TABLES[collection];
  if (!table) throw new Error(`Unknown collection: ${collection}`);
  const s = supa();
  const snakePatch = toSnake(table, patch);
  delete snakePatch.id;
  const { data, error } = await s.from(table).update(snakePatch).eq('id', id).select('*').single();
  if (error) throw error;
  return toCamel(table, data);
}

export async function deleteRow(collection: string, id: string): Promise<void> {
  const table = COLLECTION_TABLES[collection];
  if (!table) throw new Error(`Unknown collection: ${collection}`);
  const s = supa();
  const { error } = await s.from(table).delete().eq('id', id);
  if (error) throw error;
}

export async function upsertRow(collection: string, match: Record<string, unknown>, row: Record<string, unknown>): Promise<Record<string, unknown>> {
  const table = COLLECTION_TABLES[collection];
  if (!table) throw new Error(`Unknown collection: ${collection}`);
  const s = supa();
  const { data: existing } = await s.from(table).select('*').match(toSnake(table, match)).maybeSingle();
  if (existing) {
    const snakePatch = toSnake(table, row);
    delete snakePatch.id;
    const { data, error } = await s.from(table).update(snakePatch).eq('id', existing.id).select('*').single();
    if (error) throw error;
    return toCamel(table, data);
  }
  const snakeRow = toSnake(table, { ...row, id: randomUUID() });
  const { data, error } = await s.from(table).insert(snakeRow).select('*').single();
  if (error) throw error;
  return toCamel(table, data);
}

export async function clearTable(collection: string): Promise<void> {
  const table = COLLECTION_TABLES[collection];
  if (!table) throw new Error(`Unknown collection: ${collection}`);
  const s = supa();
  const { error } = await s.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw error;
}
