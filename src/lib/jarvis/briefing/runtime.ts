import { randomUUID } from 'node:crypto';
import { snapshot, upsertRow } from '../core/store.js';

export async function generateBriefing(date = new Date()) {
  const data = await snapshot();
  const day = date.toISOString().slice(0, 10);
  const end = new Date(date.getTime() + 86400000);
  const tasks = data.tasks.filter((task) => task.status !== 'done' && (!task.dueAt || new Date(task.dueAt) <= end));
  const events = data.events.filter((event) => new Date(event.startsAt) >= date && new Date(event.startsAt) <= end);
  const recommendations: string[] = [];
  if (tasks.some(task => task.priority === 'high')) recommendations.push('Start with the highest-priority task.');
  if (events.length) recommendations.push(`Prepare for ${events.length} event${events.length === 1 ? '' : 's'} in the next 24 hours.`);
  if (!tasks.length) recommendations.push('No urgent tasks: reserve a focused block for learning or project work.');
  const summary = `${tasks.length} open task${tasks.length === 1 ? '' : 's'} and ${events.length} event${events.length === 1 ? '' : 's'} in the next 24 hours.`;
  const briefing = {
    id: randomUUID(),
    date: day,
    createdAt: new Date().toISOString(),
    summary,
    taskIds: tasks.map(task => task.id),
    eventIds: events.map(event => event.id),
    recommendations,
  };
  return upsertRow('briefings', { date: day }, briefing);
}
