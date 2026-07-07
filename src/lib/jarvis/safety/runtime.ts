import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { record, snapshot, transaction } from '../core/store.js';
import type { Approval, RollbackRecord } from '../core/types.js';

const root = process.cwd();
export async function listSafetyState() { const data = await snapshot(); return { approvals: data.approvals, rollbacks: data.rollbacks }; }
export async function requestApproval(toolId: string, input: Record<string, unknown>, reason: string) {
  return transaction((data) => { const item: Approval = { id: randomUUID(), toolId, input, reason, status: 'pending', createdAt: new Date().toISOString() }; data.approvals.unshift(item); record(data, { action: 'request-approval', entity: 'tool', entityId: item.id, outcome: 'success', detail: `${toolId}: ${reason}` }); return item; });
}
export async function decideApproval(id: string, decision: 'approved' | 'denied') {
  return transaction((data) => { const item = data.approvals.find((approval) => approval.id === id); if (!item || item.status !== 'pending') throw new Error('Pending approval not found'); item.status = decision; item.decidedAt = new Date().toISOString(); record(data, { action: `${decision}-approval`, entity: 'tool', entityId: id, outcome: decision === 'approved' ? 'success' : 'denied', detail: item.toolId }); return item; });
}
export async function consumeApproval(id: string, toolId: string, input: Record<string, unknown>) {
  return transaction((data) => { const item = data.approvals.find((approval) => approval.id === id); if (!item || item.status !== 'approved') throw new Error('A matching one-time approval is required'); if (item.toolId !== toolId || JSON.stringify(item.input) !== JSON.stringify(input)) throw new Error('Approval does not match this exact tool input'); item.status = 'consumed'; item.consumedAt = new Date().toISOString(); return item; });
}
export async function createRollback(approvalId: string, toolId: string, changes: { path: string; content: string }[]) {
  const files = await Promise.all(changes.map(async (change) => { const target = resolve(root, change.path); try { return { path: change.path, existed: true, previousContent: await readFile(target, 'utf8') }; } catch { return { path: change.path, existed: false }; } }));
  const rollback: RollbackRecord = { id: randomUUID(), approvalId, toolId, createdAt: new Date().toISOString(), status: 'available', files };
  await transaction((data) => { data.rollbacks.unshift(rollback); }); return rollback;
}
export async function applyChanges(changes: { path: string; content: string }[]) { for (const change of changes) { const target = resolve(root, change.path); await mkdir(dirname(target), { recursive: true }); await writeFile(target, change.content, { encoding: 'utf8', flag: 'wx' }); } }
export async function rollbackChange(id: string) {
  const state = await snapshot(); const rollback = state.rollbacks.find((item) => item.id === id); if (!rollback || rollback.status !== 'available') throw new Error('Rollback not available');
  for (const file of [...rollback.files].reverse()) { const target = resolve(root, file.path); if (file.existed) await writeFile(target, file.previousContent ?? '', 'utf8'); else await rm(target, { force: true }); }
  return transaction((data) => { const item = data.rollbacks.find((entry) => entry.id === id); if (!item) throw new Error('Rollback not found'); item.status = 'rolled-back'; item.rolledBackAt = new Date().toISOString(); record(data, { action: 'rollback', entity: 'tool', entityId: id, outcome: 'success', detail: item.toolId }); return item; });
}
