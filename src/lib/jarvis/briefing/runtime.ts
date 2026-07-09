import { randomUUID } from 'node:crypto';
import { snapshot, upsertRow } from '../core/store.js';

// Parse stored naive ISO strings as local time (consistent with the rest of the app)
function parseLocal(str: string): Date {
  if (!str) return new Date(NaN);
  const clean = str.replace(/[+-]\d{2}:\d{2}$/, '');
  const [datePart, timePart] = clean.split('T');
  const [y, m, d] = datePart!.split('-').map(Number);
  const parts = timePart ? timePart.split(':').map(Number) : [0, 0];
  return new Date(y, (m || 1) - 1, d || 1, parts[0] ?? 0, parts[1] ?? 0);
}

// Format a local date back to naive ISO string (matches stored format)
function localToISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day}T${hh}:${mm}`;
}

export async function generateBriefing(date = new Date()) {
  // Use local date strings for filtering (the app treats all times as naive local)
  const dayLocal = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endLocal = new Date(dayLocal.getTime() + 86400000);
  const dayStr = dayLocal.toISOString().slice(0, 10); // YYYY-MM-DD
  const data = await snapshot();

  // Compare by calendar date string (YYYY-MM-DD) for tasks
  const todayTasks = data.tasks.filter((task) => task.status !== 'done' && task.dueAt?.startsWith(dayStr));
  // For events, compare by local date portion
  const todayEvents = data.events.filter((event) => event.startsAt?.startsWith(dayStr));

  const tasks = todayTasks;
  const events = todayEvents;
  const recommendations: string[] = [];
  if (tasks.some(task => task.priority === 'high')) recommendations.push('Start with the highest-priority task.');
  if (events.length) recommendations.push(`Prepare for ${events.length} event${events.length === 1 ? '' : 's'} in the next 24 hours.`);
  if (!tasks.length) recommendations.push('No urgent tasks: reserve a focused block for learning or project work.');
  const summary = `${tasks.length} open task${tasks.length === 1 ? '' : 's'} and ${events.length} event${events.length === 1 ? '' : 's'} in the next 24 hours.`;
  const briefing = {
    id: randomUUID(),
    date: dayStr,
    createdAt: new Date().toISOString(),
    summary,
    taskIds: tasks.map(task => task.id),
    eventIds: events.map(event => event.id),
    recommendations,
  };
  return upsertRow('briefings', { date: dayStr }, briefing);
}
