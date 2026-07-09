import { randomUUID } from 'node:crypto';
import { createEntity, record, snapshot, updateEntity, insertRow } from '../core/store.js';
import { sendEmailReminder } from './email.js';
import { getSettings, saveSettings } from '../core/settings.js';

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
  return insertRow('notifications', { id: randomUUID(), title, message, source, level, createdAt: new Date().toISOString() });
}

export async function runAutomation(id: string) {
  const automation = (await snapshot()).automations.find((item) => item.id === id); if (!automation) throw new Error('Automation not found'); if (!automation.enabled) throw new Error('Automation is disabled');
  const [kind, ...rest] = automation.action.split(':'); const value = rest.join(':').trim() || automation.name; let result;
  if (kind === 'task') result = await createEntity('tasks', { title: value, description: `Created by ${automation.name}`, status: 'todo', priority: 'medium' });
  else if (kind === 'note') result = await createEntity('notes', { title: automation.name, content: value, tags: ['automation'] });
  else if (kind === 'notify') result = await notify(automation.name, value, `automation:${id}`);
  else throw new Error('Supported actions are task:<title>, note:<content>, and notify:<message>');
  const now = new Date(); await updateEntity('automations', id, { lastRunAt: now.toISOString(), nextRunAt: nextRun(automation.schedule, now) }); await notify('Automation completed', automation.name, `automation:${id}`, 'success');
  await record(null, { action: 'run-automation', entity: 'automations', entityId: id, outcome: 'success', detail: automation.action }); return result;
}

export async function schedulerTick(now = new Date()) {
  void sendDailyBriefing(now);
  const results = await checkCalendarReminders(now);
  const due = (await snapshot()).automations.filter((item) => item.enabled && item.nextRunAt && new Date(item.nextRunAt) <= now); const arr: { id: string; title: string; fired: boolean; result?: unknown }[] = [...results];
  for (const item of due) { try { arr.push({ id: item.id, title: item.name, fired: true, result: await runAutomation(item.id) }); } catch (error) { await notify('Automation failed', `${item.name}: ${error instanceof Error ? error.message : String(error)}`, `automation:${item.id}`, 'error'); arr.push({ id: item.id, title: item.name, fired: false }); } }
  return arr;
}

export function startScheduler() {
  const global = globalThis as typeof globalThis & { __jarvisScheduler?: NodeJS.Timeout };
  if (global.__jarvisScheduler) return;
  void schedulerTick(); global.__jarvisScheduler = setInterval(() => void schedulerTick(), 30_000); global.__jarvisScheduler.unref?.();
}

export async function checkCalendarReminders(now = new Date()) {
  const data = await snapshot();
  const results: { id: string; title: string; fired: boolean }[] = [];
  const GRACE_MS = 30 * 60_000;

  for (const ev of data.events) {
    const repeat = ev.reminderRepeat ?? 'none';
    const isRecurring = repeat !== 'none';
    const startMs = new Date(ev.startsAt).getTime();
    const reminderMs = (ev.reminderMinutes ?? 15) * 60_000;

    if (isRecurring) {
      if (!ev.nextNotifyAt) {
        let firstNotify = startMs - reminderMs;
        if (firstNotify <= now.getTime()) {
          const nextBase = new Date(ev.startsAt);
          let nextTime = calculateNextRun(nextBase, repeat);
          let safety = 0;
          while (nextTime.getTime() - reminderMs <= now.getTime() && safety < 1000) {
            nextTime = calculateNextRun(nextTime, repeat);
            safety++;
          }
          firstNotify = nextTime.getTime() - reminderMs;
          await updateEntity('events', ev.id, { nextNotifyAt: nextTime.toISOString() });
        } else {
          await updateEntity('events', ev.id, { nextNotifyAt: ev.startsAt });
        }
        continue;
      }

      const nextNotifyMs = new Date(ev.nextNotifyAt).getTime();
      const triggerTime = nextNotifyMs - reminderMs;
      if (now.getTime() < triggerTime) continue;

      void notify(ev.title, `Starts at ${new Date(ev.startsAt).toLocaleString()}`, 'calendar:reminder');
      if (ev.emailReminder) {
        sendEmailReminder(
          ev.emailReminder,
          `Reminder: ${ev.title}`,
          `Your event "${ev.title}" starts at ${new Date(ev.startsAt).toLocaleString()}.`,
          ev.emailCc || undefined
        ).then((success) => {
          if (!success) void notify('Email Alert Failed', `Failed to send reminder email for "${ev.title}". Check SMTP Settings.`, 'calendar:email-error', 'error');
        });
      }

      const next = calculateNextRun(new Date(ev.nextNotifyAt), repeat);
      await updateEntity('events', ev.id, { nextNotifyAt: next.toISOString() });
      results.push({ id: ev.id, title: ev.title, fired: true });

    } else {
      if (ev.notified) continue;
      const triggerTime = startMs - reminderMs;
      if (now.getTime() < triggerTime) continue;
      if (startMs + GRACE_MS < now.getTime()) {
        await updateEntity('events', ev.id, { notified: true });
        continue;
      }

      void notify(ev.title, `Starts at ${new Date(ev.startsAt).toLocaleString()}`, 'calendar:reminder');
      if (ev.emailReminder) {
        sendEmailReminder(
          ev.emailReminder,
          `Reminder: ${ev.title}`,
          `Your event "${ev.title}" starts at ${new Date(ev.startsAt).toLocaleString()}.`,
          ev.emailCc || undefined
        ).then((success) => {
          if (!success) void notify('Email Alert Failed', `Failed to send reminder email for "${ev.title}". Check SMTP Settings.`, 'calendar:email-error', 'error');
        });
      }
      await updateEntity('events', ev.id, { notified: true });
      results.push({ id: ev.id, title: ev.title, fired: true });
    }
  }

  for (const task of data.tasks) {
    if (!task.dueAt) continue;
    if (task.status === 'done') continue;

    const repeat = task.reminderRepeat ?? 'none';
    const isRecurring = repeat !== 'none';
    const dueMs = new Date(task.dueAt).getTime();
    const reminderMs = (task.reminderMinutes ?? 0) * 60_000;

    if (isRecurring) {
      if (!task.nextNotifyAt) {
        let firstNotify = dueMs - reminderMs;
        if (firstNotify <= now.getTime()) {
          const nextBase = new Date(task.dueAt);
          let nextTime = calculateNextRun(nextBase, repeat);
          let safety = 0;
          while (nextTime.getTime() - reminderMs <= now.getTime() && safety < 1000) {
            nextTime = calculateNextRun(nextTime, repeat);
            safety++;
          }
          await updateEntity('tasks', task.id, { nextNotifyAt: nextTime.toISOString() });
        } else {
          await updateEntity('tasks', task.id, { nextNotifyAt: task.dueAt });
        }
        continue;
      }

      const nextNotifyMs = new Date(task.nextNotifyAt).getTime();
      const triggerTime = nextNotifyMs - reminderMs;
      if (now.getTime() < triggerTime) continue;

      void notify(task.title, `Task due: ${new Date(task.dueAt).toLocaleString()}`, 'calendar:task-reminder');
      if (task.emailReminder) {
        const subj = task.emailSubject?.trim() || `Task Reminder: ${task.title}`;
        const body = `Your task "${task.title}" is due at ${new Date(task.dueAt).toLocaleString()}.\n\n${task.description ?? ''}`;
        sendEmailReminder(task.emailReminder, subj, body, task.emailCc || undefined).then((success) => {
          if (!success) void notify('Task Email Failed', `Failed to send task email for "${task.title}". Check SMTP Settings.`, 'calendar:email-error', 'error');
        });
      }

      const next = calculateNextRun(new Date(task.nextNotifyAt), repeat);
      await updateEntity('tasks', task.id, { nextNotifyAt: next.toISOString() });
      results.push({ id: task.id, title: task.title, fired: true });

    } else {
      if (task.notified) continue;
      const triggerTime = dueMs - reminderMs;
      if (now.getTime() < triggerTime) continue;
      if (dueMs + GRACE_MS < now.getTime()) {
        await updateEntity('tasks', task.id, { notified: true });
        continue;
      }

      void notify(task.title, `Task due: ${new Date(task.dueAt).toLocaleString()}`, 'calendar:task-reminder');
      if (task.emailReminder) {
        const subj = task.emailSubject?.trim() || `Task Reminder: ${task.title}`;
        const body = `Your task "${task.title}" is due at ${new Date(task.dueAt).toLocaleString()}.\n\n${task.description ?? ''}`;
        sendEmailReminder(task.emailReminder, subj, body, task.emailCc || undefined).then((success) => {
          if (!success) void notify('Task Email Failed', `Failed to send task email for "${task.title}". Check SMTP Settings.`, 'calendar:email-error', 'error');
        });
      }
      await updateEntity('tasks', task.id, { notified: true });
      results.push({ id: task.id, title: task.title, fired: true });
    }
  }

  return results;
}

export function calculateNextRun(base: Date, repeat: string): Date {
  const next = new Date(base);
  if (repeat === 'hourly') next.setHours(next.getHours() + 1);
  else if (repeat === 'every2h') next.setHours(next.getHours() + 2);
  else if (repeat === 'every4h') next.setHours(next.getHours() + 4);
  else if (repeat === 'every6h') next.setHours(next.getHours() + 6);
  else if (repeat === 'every12h') next.setHours(next.getHours() + 12);
  else if (repeat === 'daily') next.setDate(next.getDate() + 1);
  else if (repeat === 'weekly') next.setDate(next.getDate() + 7);
  else if (repeat === 'biweekly') next.setDate(next.getDate() + 14);
  else if (repeat === 'monthly') next.setMonth(next.getMonth() + 1);
  else if (repeat.startsWith('custom_')) {
    const parts = repeat.split('_');
    if (parts.length === 3) {
      const val = parseInt(parts[1], 10);
      const unit = parts[2];
      if (!isNaN(val) && val > 0) {
        if (unit === 'minutes') next.setMinutes(next.getMinutes() + val);
        else if (unit === 'hours') next.setHours(next.getHours() + val);
        else if (unit === 'days') next.setDate(next.getDate() + val);
        else if (unit === 'weeks') next.setDate(next.getDate() + val * 7);
        else if (unit === 'months') next.setMonth(next.getMonth() + val);
      }
    }
  }
  return next;
}

function getLocalDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dayStr = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dayStr}`;
}

export async function sendDailyBriefing(now = new Date()) {
  const settings = await getSettings();
  if (!settings.dailyBriefingEnabled) return;

  const todayStr = getLocalDateStr(now);
  if (settings.lastDailyBriefingSentDate === todayStr) return;
  if (now.getHours() < 8) return;

  const data = await snapshot();
  const todayEvents = data.events.filter(e => e.startsAt?.startsWith(todayStr));
  const todayTasks = data.tasks.filter(t => t.dueAt?.startsWith(todayStr) && t.status !== 'done');
  const overdueTasks = data.tasks.filter(t => t.dueAt && t.dueAt < todayStr && t.status !== 'done');

  const recipient = settings.smtpFrom || settings.smtpUser;
  if (!recipient) return;

  let emailContent = `Good morning!\nHere is your daily J.A.R.V.I.S. schedule for today, ${now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}:\n\n`;

  if (todayEvents.length === 0 && todayTasks.length === 0 && overdueTasks.length === 0) {
    emailContent += `🎉 You have a completely clear schedule today! Enjoy your day.`;
  } else {
    if (todayEvents.length > 0) {
      emailContent += `🗓️ EVENTS TODAY:\n`;
      todayEvents.forEach(e => {
        const time = new Date(e.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        emailContent += `- [${time}] ${e.title}${e.description ? `: ${e.description}` : ''}\n`;
      });
      emailContent += `\n`;
    }

    if (todayTasks.length > 0) {
      emailContent += `✅ TASKS DUE TODAY:\n`;
      todayTasks.forEach(t => {
        emailContent += `- ${t.title}${t.description ? `: ${t.description}` : ''}\n`;
      });
      emailContent += `\n`;
    }

    if (overdueTasks.length > 0) {
      emailContent += `⚠️ OVERDUE TASKS:\n`;
      overdueTasks.forEach(t => {
        const dateStr = new Date(t.dueAt!).toLocaleDateString([], { month: 'short', day: 'numeric' });
        emailContent += `- [Due ${dateStr}] ${t.title}${t.description ? `: ${t.description}` : ''}\n`;
      });
      emailContent += `\n`;
    }
  }

  emailContent += `Have a highly productive day!\n\n— J.A.R.V.I.S.`;

  const success = await sendEmailReminder(
    recipient,
    `⏰ J.A.R.V.I.S. Daily Briefing — ${todayStr}`,
    emailContent
  );

  if (success) {
    settings.lastDailyBriefingSentDate = todayStr;
    await saveSettings(settings);
    await notify('Daily Briefing Emailed', `Successfully sent your daily briefing to ${recipient}.`, 'calendar:daily-briefing', 'success');
  } else {
    await notify('Daily Briefing Failed', 'Could not send the daily briefing email. Check SMTP settings.', 'calendar:daily-briefing-error', 'error');
  }
}
