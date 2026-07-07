import { randomUUID } from 'node:crypto';
import { createEntity, record, snapshot, transaction, updateEntity } from '../core/store.js';

export function nextRun(schedule: string, from = new Date()) {
  const normalized = schedule.trim().toLowerCase(); const next = new Date(from);
  const minuteMatch = normalized.match(/^every\s+(\d+)\s+minutes?$/);
  if (minuteMatch) { next.setMinutes(next.getMinutes() + Math.max(1, Number(minuteMatch[1]))); return next.toISOString(); }
  if (normalized === 'hourly') { next.setHours(next.getHours() + 1, 0, 0, 0); return next.toISOString(); }
  if (normalized === 'daily') { next.setDate(next.getDate() + 1); next.setHours(8, 0, 0, 0); return next.toISOString(); }
  const parsed = new Date(schedule); if (!Number.isNaN(parsed.getTime()) && parsed > from) return parsed.toISOString();
  throw new Error('Schedule must be daily, hourly, every N minutes, or a future ISO date');
}

export async function notify(title: string, message: string, source: string, level: 'info'|'success'|'warning'|'error' = 'info') {
  return transaction((data) => { const item = { id: randomUUID(), title, message, source, level, createdAt: new Date().toISOString() }; data.notifications.unshift(item); data.notifications = data.notifications.slice(0, 300); return item; });
}

export async function runAutomation(id: string) {
  const automation = (await snapshot()).automations.find((item) => item.id === id); if (!automation) throw new Error('Automation not found'); if (!automation.enabled) throw new Error('Automation is disabled');
  const [kind, ...rest] = automation.action.split(':'); const value = rest.join(':').trim() || automation.name; let result;
  if (kind === 'task') result = await createEntity('tasks', { title: value, description: `Created by ${automation.name}`, status: 'todo', priority: 'medium' });
  else if (kind === 'note') result = await createEntity('notes', { title: automation.name, content: value, tags: ['automation'] });
  else if (kind === 'notify') result = await notify(automation.name, value, `automation:${id}`);
  else throw new Error('Supported actions are task:<title>, note:<content>, and notify:<message>');
  const now = new Date(); await updateEntity('automations', id, { lastRunAt: now.toISOString(), nextRunAt: nextRun(automation.schedule, now) }); await notify('Automation completed', automation.name, `automation:${id}`, 'success');
  await transaction((data) => record(data, { action: 'run-automation', entity: 'automations', entityId: id, outcome: 'success', detail: automation.action })); return result;
}

export async function schedulerTick(now = new Date()) {
  const due = (await snapshot()).automations.filter((item) => item.enabled && item.nextRunAt && new Date(item.nextRunAt) <= now); const results = [];
  for (const item of due) { try { results.push({ id: item.id, ok: true, result: await runAutomation(item.id) }); } catch (error) { await notify('Automation failed', `${item.name}: ${error instanceof Error ? error.message : String(error)}`, `automation:${item.id}`, 'error'); results.push({ id: item.id, ok: false }); } }
  return results;
}

export function startScheduler() {
  const global = globalThis as typeof globalThis & { __jarvisScheduler?: NodeJS.Timeout };
  if (global.__jarvisScheduler) return;
  void schedulerTick(); global.__jarvisScheduler = setInterval(() => void schedulerTick(), 30_000); global.__jarvisScheduler.unref?.();
}
