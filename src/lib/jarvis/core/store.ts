import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { AuditEvent, BaseEntity, EntityKind, JarvisData } from './types.js';

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

export async function snapshot(): Promise<JarvisData> { await queue; return load(); }

export function record(data: JarvisData, event: Omit<AuditEvent, 'id' | 'at'>) {
  data.audit.unshift({ id: randomUUID(), at: new Date().toISOString(), ...event });
  data.audit = data.audit.slice(0, 500);
}

export async function listEntities(kind: EntityKind) { return (await snapshot())[kind]; }

export async function createEntity(kind: EntityKind, input: Record<string, unknown>) {
  return transaction((data) => {
    const now = new Date().toISOString();
    const entity = { ...input, id: randomUUID(), createdAt: now, updatedAt: now } as unknown as BaseEntity;
    (data[kind] as BaseEntity[]).unshift(entity);
    record(data, { action: 'create', entity: kind, entityId: entity.id, outcome: 'success', detail: `Created ${kind.slice(0, -1)}` });
    return entity;
  });
}

export async function updateEntity(kind: EntityKind, id: string, patch: Record<string, unknown>) {
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
  return transaction((data) => {
    const collection = data[kind] as BaseEntity[];
    const index = collection.findIndex((item) => item.id === id);
    if (index < 0) throw new Error('Entity not found');
    collection.splice(index, 1);
    record(data, { action: 'delete', entity: kind, entityId: id, outcome: 'success', detail: `Deleted ${kind.slice(0, -1)}` });
  });
}
