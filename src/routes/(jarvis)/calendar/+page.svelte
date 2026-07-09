<script>
  import { onMount } from 'svelte';
  import CalendarDays from 'lucide-svelte/icons/calendar-days';
  import CheckSquare from 'lucide-svelte/icons/check-square';
  import FileText from 'lucide-svelte/icons/file-text';
  import FolderKanban from 'lucide-svelte/icons/folder-kanban';
  import Plus from 'lucide-svelte/icons/plus';
  import Trash2 from 'lucide-svelte/icons/trash-2';
  import Bell from 'lucide-svelte/icons/bell';
  import ChevronLeft from 'lucide-svelte/icons/chevron-left';
  import ChevronRight from 'lucide-svelte/icons/chevron-right';
  import Clock from 'lucide-svelte/icons/clock';
  import Pencil from 'lucide-svelte/icons/pencil';
  import Save from 'lucide-svelte/icons/save';
  import X from 'lucide-svelte/icons/x';
  import Mail from 'lucide-svelte/icons/mail';
  import Repeat2 from 'lucide-svelte/icons/repeat-2';
  import ChevronDown from 'lucide-svelte/icons/chevron-down';
  import Check from 'lucide-svelte/icons/check';

  const tabs = [
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'projects', label: 'Projects', icon: FolderKanban }
  ];

  let active = $state('calendar');
  let items = $state([]);
  let events = $state([]);
  let tasks = $state([]);
  let loading = $state(true);
  let error = $state('');

  // ── Event form ──
  let evTitle = $state('');
  let evDetail = $state('');
  let evDate = $state('');
  let evReminderMin = $state(15);
  let evRepeat = $state('none');
  let evEmailTo = $state('');
  let evEmailCc = $state('');

  let evCustomReminderValue = $state(10);
  let evCustomReminderUnit = $state(1);
  let evCustomRepeatValue = $state(1);
  let evCustomRepeatUnit = $state('days');

  // ── Task form ──
  let taskTitle = $state('');
  let taskDetail = $state('');
  let taskDueAt = $state('');
  let taskReminderMin = $state(15);
  let taskRepeat = $state('none');
  let taskEmailTo = $state('');
  let taskEmailCc = $state('');
  let taskEmailSubject = $state('');
  let showTaskEmail = $state(false);

  let taskCustomReminderValue = $state(10);
  let taskCustomReminderUnit = $state(1);
  let taskCustomRepeatValue = $state(1);
  let taskCustomRepeatUnit = $state('days');

  // ── Generic form (Notes/Projects) ──
  let genTitle = $state('');
  let genDetail = $state('');

  // ── Edit/Create modal state ──
  let editingItem = $state(null);
  let creatingKind = $state(null); // 'events'
  let editTitle = $state('');
  let editDetail = $state('');
  let editDate = $state('');
  let editReminderMin = $state(15);
  let editRepeat = $state('none');
  let editEmailTo = $state('');
  let editEmailCc = $state('');
  let editEmailSubject = $state('');

  let editCustomReminderValue = $state(10);
  let editCustomReminderUnit = $state(1);
  let editCustomRepeatValue = $state(1);
  let editCustomRepeatUnit = $state('days');

  // ── Calendar state ──
  let viewDate = $state(new Date());
  let selectedDay = $state(null);
  let upcomingLimit = $state(8);

  const reminderOptions = [
    { value: 0,     label: 'At event time' },
    { value: 1,     label: '1 minute before' },
    { value: 5,     label: '5 minutes before' },
    { value: 10,    label: '10 minutes before' },
    { value: 15,    label: '15 minutes before' },
    { value: 30,    label: '30 minutes before' },
    { value: 45,    label: '45 minutes before' },
    { value: 60,    label: '1 hour before' },
    { value: 120,   label: '2 hours before' },
    { value: 180,   label: '3 hours before' },
    { value: 360,   label: '6 hours before' },
    { value: 720,   label: '12 hours before' },
    { value: 1440,  label: '1 day before' },
    { value: 2880,  label: '2 days before' },
    { value: 10080, label: '1 week before' },
    { value: 'custom', label: 'Custom...' }
  ];

  const repeatOptions = [
    { value: 'none',     label: 'No repeat' },
    { value: 'hourly',   label: 'Every hour' },
    { value: 'every2h',  label: 'Every 2 hours' },
    { value: 'every4h',  label: 'Every 4 hours' },
    { value: 'every6h',  label: 'Every 6 hours' },
    { value: 'every12h', label: 'Every 12 hours' },
    { value: 'daily',    label: 'Daily' },
    { value: 'weekly',   label: 'Weekly' },
    { value: 'biweekly', label: 'Every 2 weeks' },
    { value: 'monthly',  label: 'Monthly' },
    { value: 'custom',   label: 'Custom...' }
  ];

  function getLocalDateStr(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // Return bare local-time string — NO timezone offset.
  // Supabase stores timestamptz as UTC but keeps the original value as text;
  // our app treats all stored strings as naive local time consistently.
  function getLocalISOString(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day}T${hh}:${min}`;
  }

  // Parse ANY stored string as local time (ignores offsets).
  // This is critical: Supabase returns timestamps in UTC but the app
  // never needs timezone-awareness — all times are "naive local".
  function parseLocalISO(str) {
    if (!str) return null;
    const parts = str.replace(/[+-]\d{2}:\d{2}$/, '').split(/T/);
    const dateParts = parts[0].split('-');
    const timeParts = parts[1] ? parts[1].split(':') : ['0', '0'];
    const y   = parseInt(dateParts[0], 10);
    const mon = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    const hh  = parseInt(timeParts[0] ?? '0', 10);
    const mm  = parseInt(timeParts[1] ?? '0', 10);
    return new Date(y, mon, day, hh, mm);
  }

  // Format a local Date back to a bare ISO string matching the datetime-local format
  function dateToInputStr(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day}T${hh}:${min}`;
  }

  function formatTime(iso) {
    if (!iso) return '';
    try {
      // Always parse as local time — never UTC. The app treats all stored strings as naive.
      const d = parseLocalISO(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  }

  function formatDate(iso) {
    if (!iso) return '';
    try {
      const d = parseLocalISO(iso);
      return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    } catch { return ''; }
  }

  function repeatLabel(v) {
    if (!v || v === 'none') return 'One-time';
    const standard = repeatOptions.find(r => r.value === v);
    if (standard) return standard.label;
    if (v.startsWith('custom_')) {
      const parts = v.split('_');
      if (parts.length === 3) return `Every ${parts[1]} ${parts[2]}`;
    }
    return v;
  }

  function getReminderMinutesLabel(min) {
    if (min === undefined || min === null) return '';
    const standard = reminderOptions.find(r => r.value === min);
    if (standard) return standard.label;
    if (min % 10080 === 0) return `${min / 10080} week${min / 10080 > 1 ? 's' : ''} before`;
    if (min % 1440 === 0) return `${min / 1440} day${min / 1440 > 1 ? 's' : ''} before`;
    if (min % 60 === 0) return `${min / 60} hour${min / 60 > 1 ? 's' : ''} before`;
    return `${min} min before`;
  }

  const calendarGrid = $derived.by(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid = [];
    let day = 1 - firstDay;
    for (let week = 0; week < 6; week++) {
      const row = [];
      for (let dow = 0; dow < 7; dow++, day++) {
        if (day < 1 || day > daysInMonth) { row.push(null); }
        else {
          const d = new Date(year, month, day);
          const dateStr = getLocalDateStr(d);
          row.push({
            day, dateStr,
            events: events.filter(ev => (ev.startsAt || '').startsWith(dateStr)),
            tasks: tasks.filter(t => (t.dueAt || '').startsWith(dateStr))
          });
        }
      }
      grid.push(row);
      if (day > daysInMonth) break;
    }
    return grid;
  });

  const monthLabel = $derived(viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
  const todayStr = $derived(getLocalDateStr(new Date()));

  const selectedDayItems = $derived.by(() => {
    if (!selectedDay) return { events: [], tasks: [] };
    return {
      events: events.filter(ev => (ev.startsAt || '').startsWith(selectedDay)).sort((a,b) => parseLocalISO(a.startsAt)?.getTime() ?? 0 - parseLocalISO(b.startsAt)?.getTime() ?? 0),
      tasks: tasks.filter(t => (t.dueAt || '').startsWith(selectedDay))
    };
  });

  const upcomingEvents = $derived(
    events.filter(ev => parseLocalISO(ev.startsAt) >= new Date())
          .sort((a,b) => parseLocalISO(a.startsAt)?.getTime() ?? 0 - parseLocalISO(b.startsAt)?.getTime() ?? 0)
  );

  onMount(loadAll);

  async function loadAll() {
    loading = true; evError = '';
    try {
      const [evRes, taskRes] = await Promise.all([
        fetch('/api/workspace?kind=events'),
        fetch('/api/workspace?kind=tasks')
      ]);
      events = (await evRes.json()).items ?? [];
      tasks  = (await taskRes.json()).items ?? [];
    } catch (e) {
      evError = e instanceof Error ? e.message : 'Failed to load calendar data';
      events = []; tasks = [];
    }
    loading = false;
  }

  async function load() {
    loading = true; error = '';
    const res = await fetch(`/api/workspace?kind=${active}`);
    const data = await res.json();
    items = data.items ?? []; error = data.error ?? '';
    loading = false;
  }

  async function changeTab(id) {
    active = id; editingItem = null; creatingKind = null;
    evTitle = ''; evDetail = ''; evDate = ''; evEmailTo = ''; evEmailCc = '';
    taskTitle = ''; taskDetail = ''; taskDueAt = ''; taskEmailTo = ''; taskEmailCc = ''; taskEmailSubject = '';
    genTitle = ''; genDetail = '';
    if (id === 'calendar') await loadAll(); else await load();
  }

  function openCreateModal(kind) {
    creatingKind = kind;
    if (kind === 'events') {
      evTitle = '';
      evDetail = '';
      evDate = selectedDay ? `${selectedDay}T12:00` : getLocalISOString(new Date());
      evReminderMin = 15;
      evRepeat = 'none';
      evEmailTo = '';
      evEmailCc = '';
      evCustomReminderValue = 10;
      evCustomReminderUnit = 1;
      evCustomRepeatValue = 1;
      evCustomRepeatUnit = 'days';
    }
  }

  let evError = $state('');

  function closeCreateModal() {
    creatingKind = null;
  }

  async function submitCreateEvent() {
    try {
      await createEvent();
      evError = '';
      creatingKind = null;
    } catch (e) {
      evError = e instanceof Error ? e.message : String(e);
    }
  }

  async function createEvent() {
    if (!evTitle.trim()) return;
    let reminderMinutesVal = evReminderMin === 'custom'
      ? Math.round(Number(evCustomReminderValue) * Number(evCustomReminderUnit))
      : Math.round(evReminderMin);
    let repeatVal = evRepeat === 'custom'
      ? `custom_${evCustomRepeatValue}_${evCustomRepeatUnit}`
      : evRepeat;

    // evDate from datetime-local input is exactly the bare ISO string we want.
    // Use it directly — no transformation, no offset mangling.
    const startsAtVal = evDate || getLocalISOString(new Date());
    const startMs = (parseLocalISO(startsAtVal) || new Date()).getTime();
    const triggerTime = startMs - reminderMinutesVal * 60_000;
    const nowMs = Date.now();
    const isPast = triggerTime <= nowMs;

    const res = await fetch('/api/workspace?kind=events', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: evTitle, description: evDetail,
        startsAt: startsAtVal,
        reminderMinutes: reminderMinutesVal,
        reminderRepeat: repeatVal,
        emailReminder: evEmailTo.trim() || undefined,
        emailCc: evEmailCc.trim() || undefined,
        notified: repeatVal === 'none' ? isPast : false,
        nextNotifyAt: null
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(err.error ?? `Failed to create event (HTTP ${res.status})`);
    }

    evTitle = ''; evDetail = ''; evDate = ''; evEmailTo = ''; evEmailCc = '';
    evReminderMin = 15; evRepeat = 'none';
    await loadAll();
  }

  async function createTask() {
    if (!taskTitle.trim()) return;
    let reminderMinutesVal = taskReminderMin === 'custom'
      ? Math.round(Number(taskCustomReminderValue) * Number(taskCustomReminderUnit))
      : Math.round(taskReminderMin);
    let repeatVal = taskRepeat === 'custom'
      ? `custom_${taskCustomRepeatValue}_${taskCustomRepeatUnit}`
      : taskRepeat;

    const dueAtVal = taskDueAt || undefined;
    let isPast = false;
    if (dueAtVal) {
      const dueMs = (parseLocalISO(dueAtVal) || new Date()).getTime();
      const triggerTime = dueMs - reminderMinutesVal * 60_000;
      isPast = triggerTime <= Date.now();
    }

    await fetch('/api/workspace?kind=tasks', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: taskTitle, description: taskDetail, status: 'todo', priority: 'medium',
        dueAt: dueAtVal,
        reminderMinutes: reminderMinutesVal,
        reminderRepeat: repeatVal,
        emailReminder: taskEmailTo.trim() || undefined,
        emailCc: taskEmailCc.trim() || undefined,
        emailSubject: taskEmailSubject.trim() || undefined,
        notified: repeatVal === 'none' ? isPast : false,
        nextNotifyAt: null
      })
    });
    taskTitle = ''; taskDetail = ''; taskDueAt = ''; taskEmailTo = ''; taskEmailCc = ''; taskEmailSubject = '';
    taskReminderMin = 15; taskRepeat = 'none'; showTaskEmail = false;
    await load();
  }

  async function create() {
    if (!genTitle.trim()) return;
    let body = active === 'notes'
      ? { title: genTitle, content: genDetail, tags: [] }
      : { name: genTitle, description: genDetail, status: 'active' };
    await fetch(`/api/workspace?kind=${active}`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body)
    });
    genTitle = ''; genDetail = '';
    await load();
  }

  async function remove(id, kind) {
    await fetch(`/api/workspace?kind=${kind}&id=${id}`, { method: 'DELETE' });
    if (editingItem?.id === id) editingItem = null;
    if (active === 'calendar') await loadAll(); else await load();
  }

  async function toggleTask(item) {
    const isDone = item.status === 'done';
    await fetch(`/api/workspace?kind=tasks&id=${item.id}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: isDone ? 'todo' : 'done', notified: isDone ? false : item.notified })
    });
    if (active === 'calendar') await loadAll(); else await load();
  }

  async function toggleEventActive(ev) {
    await fetch(`/api/workspace?kind=events&id=${ev.id}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ notified: !ev.notified })
    });
    await loadAll();
  }

  function startEdit(item, kind) {
    editingItem = { ...item, _kind: kind };
    editTitle = item.title ?? item.name ?? '';
    editDetail = item.description ?? item.content ?? '';
    editDate = item.startsAt ? dateToInputStr(parseLocalISO(item.startsAt)) :
               item.dueAt    ? dateToInputStr(parseLocalISO(item.dueAt))   : '';

    const rMin = item.reminderMinutes ?? 15;
    const isPresetReminder = reminderOptions.some(o => o.value === rMin);
    if (isPresetReminder) {
      editReminderMin = rMin;
    } else {
      editReminderMin = 'custom';
      if (rMin % 10080 === 0) { editCustomReminderValue = rMin / 10080; editCustomReminderUnit = 10080; }
      else if (rMin % 1440 === 0) { editCustomReminderValue = rMin / 1440; editCustomReminderUnit = 1440; }
      else if (rMin % 60 === 0) { editCustomReminderValue = rMin / 60; editCustomReminderUnit = 60; }
      else { editCustomReminderValue = rMin; editCustomReminderUnit = 1; }
    }

    const rep = item.reminderRepeat ?? 'none';
    const isPresetRepeat = repeatOptions.some(o => o.value === rep);
    if (isPresetRepeat) {
      editRepeat = rep;
    } else if (rep.startsWith('custom_')) {
      editRepeat = 'custom';
      const parts = rep.split('_');
      if (parts.length === 3) {
        editCustomRepeatValue = parseInt(parts[1], 10) || 1;
        editCustomRepeatUnit = parts[2];
      }
    } else {
      editRepeat = 'none';
    }

    editEmailTo = item.emailReminder ?? '';
    editEmailCc = item.emailCc ?? '';
    editEmailSubject = item.emailSubject ?? '';
  }

  async function saveEdit() {
    if (!editingItem) return;
    const kind = editingItem._kind;
    let body = {};

    let reminderMinutesVal = editReminderMin === 'custom'
      ? Math.round(Number(editCustomReminderValue) * Number(editCustomReminderUnit))
      : Math.round(editReminderMin);
    let repeatVal = editRepeat === 'custom'
      ? `custom_${editCustomRepeatValue}_${editCustomRepeatUnit}`
      : editRepeat;

    if (kind === 'events') {
      const origStartsAt = editingItem.startsAt ? dateToInputStr(parseLocalISO(editingItem.startsAt)) : '';
      const newStartsAt = editDate || dateToInputStr(new Date());
      const origRemind = editingItem.reminderMinutes;
      const origRepeat = editingItem.reminderRepeat ?? 'none';
      const origEmail = editingItem.emailReminder ?? '';
      const origCc = editingItem.emailCc ?? '';

      const schedChanged = origStartsAt !== newStartsAt ||
                           origRemind !== reminderMinutesVal ||
                           origRepeat !== repeatVal ||
                           origEmail !== (editEmailTo.trim() || '') ||
                           origCc !== (editEmailCc.trim() || '');

      body = {
        title: editTitle,
        description: editDetail,
        startsAt: editDate || null,
        reminderMinutes: reminderMinutesVal,
        reminderRepeat: repeatVal,
        emailReminder: editEmailTo.trim() || null,
        emailCc: editEmailCc.trim() || null
      };

      if (schedChanged) {
        const startMs = (parseLocalISO(editDate || '')?.getTime() ?? Date.now());
        const triggerTime = startMs - reminderMinutesVal * 60_000;
        const nowMs = Date.now();
        if (repeatVal !== 'none') {
          body.nextNotifyAt = null;
        } else {
          body.notified = triggerTime <= nowMs;
        }
      }
    } else if (kind === 'tasks') {
      const origDueAt = editingItem.dueAt ? dateToInputStr(parseLocalISO(editingItem.dueAt)) : '';
      const newDueAt = editDate || '';
      const origRemind = editingItem.reminderMinutes;
      const origRepeat = editingItem.reminderRepeat ?? 'none';
      const origEmail = editingItem.emailReminder ?? '';
      const origCc = editingItem.emailCc ?? '';
      const origSubj = editingItem.emailSubject ?? '';

      const schedChanged = origDueAt !== newDueAt ||
                           origRemind !== reminderMinutesVal ||
                           origRepeat !== repeatVal ||
                           origEmail !== (editEmailTo.trim() || '') ||
                           origCc !== (editEmailCc.trim() || '') ||
                           origSubj !== (editEmailSubject.trim() || '');

      body = {
        title: editTitle,
        description: editDetail,
        dueAt: editDate ? editDate : null,
        reminderMinutes: reminderMinutesVal,
        reminderRepeat: repeatVal,
        emailReminder: editEmailTo.trim() || null,
        emailCc: editEmailCc.trim() || null,
        emailSubject: editEmailSubject.trim() || null
      };

      if (schedChanged) {
        if (editDate) {
          const dueMs = (parseLocalISO(editDate)?.getTime() ?? Date.now());
          const triggerTime = dueMs - reminderMinutesVal * 60_000;
          const nowMs = Date.now();
          if (repeatVal !== 'none') {
            body.nextNotifyAt = null;
          } else {
            body.notified = triggerTime <= nowMs;
          }
        } else {
          body.notified = false;
          body.nextNotifyAt = null;
        }
      }
    } else if (kind === 'notes') {
      body = { title: editTitle, content: editDetail };
    } else {
      body = { name: editTitle, description: editDetail };
    }

    const res = await fetch(`/api/workspace?kind=${kind}&id=${editingItem.id}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body)
    });
    if (res.ok) { editingItem = null; if (active === 'calendar') await loadAll(); else await load(); }
  }

  function prevMonth() { viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1); selectedDay = null; }
  function nextMonth() { viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1); selectedDay = null; }
  function selectDay(cell) {
    if (!cell) return;
    selectedDay = selectedDay === cell.dateStr ? null : cell.dateStr;
    editingItem = null; creatingKind = null;
  }
</script>

<svelte:head><title>Workspace · J.A.R.V.I.S.</title></svelte:head>

<div class="page">
  <div class="page-header">
    <div>
      <h1 class="page-title">Workspace</h1>
      <p class="page-sub">Tasks, calendar, notes, and projects — saved to your database.</p>
    </div>
  </div>

  <!-- Tab navigation -->
  <div class="tab-bar" role="tablist">
    {#each tabs as tab (tab.id)}
      <button
        class="tab-item"
        class:active={active === tab.id}
        onclick={() => changeTab(tab.id)}
        role="tab"
        aria-selected={active === tab.id}
      >
        <tab.icon size={15} />
        <span>{tab.label}</span>
      </button>
    {/each}
  </div>

  <!-- ═══════════════════ CALENDAR TAB ═══════════════════ -->
  {#if active === 'calendar'}
    <div class="cal-layout">
      <!-- Month Grid -->
      <div class="card">
        <div class="card-header">
          <button class="icon-btn" onclick={prevMonth} aria-label="Previous month"><ChevronLeft size={16} /></button>
          <span class="card-title">{monthLabel}</span>
          <button class="icon-btn" onclick={nextMonth} aria-label="Next month"><ChevronRight size={16} /></button>
        </div>
        <div class="cal-grid">
          {#each ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] as dow}
            <div class="dow">{dow}</div>
          {/each}
          {#each calendarGrid as week}
            {#each week as cell}
              {#if cell}
                <button
                  class="cal-day"
                  class:today={cell.dateStr === todayStr}
                  class:selected={cell.dateStr === selectedDay}
                  class:has-items={cell.events.length > 0 || cell.tasks.length > 0}
                  onclick={() => selectDay(cell)}
                >
                  <span class="day-number">{cell.day}</span>
                  {#if cell.events.length > 0 || cell.tasks.length > 0}
                    <div class="day-dots">
                      {#each cell.events.slice(0, 2) as _ev}
                        <span class="dot dot-event"></span>
                      {/each}
                      {#each cell.tasks.slice(0, 2) as _t}
                        <span class="dot dot-task"></span>
                      {/each}
                      {#if cell.events.length + cell.tasks.length > 4}
                        <span class="dot-more">+{cell.events.length + cell.tasks.length - 4}</span>
                      {/if}
                    </div>
                  {/if}
                </button>
              {:else}
                <div class="cal-day empty"></div>
              {/if}
            {/each}
          {/each}
        </div>
      </div>

      <!-- Day Detail Panel -->
      <div class="card day-detail">
        {#if selectedDay}
          <div class="card-header">
            <span class="card-title">{formatDate(selectedDay + 'T00:00:00')}</span>
            <span class="count-badge">{selectedDayItems.events.length + selectedDayItems.tasks.length} items</span>
          </div>

          <div class="day-scroll">
            {#if selectedDayItems.events.length === 0 && selectedDayItems.tasks.length === 0}
              <p class="empty-msg">Nothing scheduled for this day.</p>
            {/if}

            <!-- Day Events -->
            {#each selectedDayItems.events as ev (ev.id)}
              <div class="list-row" class:row-active={!ev.notified}>
                <div class="row-accent accent-event"></div>
                <button class="checkbox" class:checked={ev.notified} onclick={() => toggleEventActive(ev)} aria-label="Toggle reminder activation">
                  {#if ev.notified}<Check size={12} />{/if}
                </button>
                <div class="row-body">
                  <span class="row-title">{ev.title}</span>
                  <div class="row-meta">
                    <span class="meta-item"><Clock size={11} /> {formatTime(ev.startsAt)}</span>
                    {#if ev.reminderMinutes !== undefined}
                      <span class="meta-tag"><Bell size={10} /> {getReminderMinutesLabel(ev.reminderMinutes)}</span>
                    {/if}
                    {#if ev.reminderRepeat && ev.reminderRepeat !== 'none'}
                      <span class="meta-tag tag-repeat"><Repeat2 size={10} /> {repeatLabel(ev.reminderRepeat)}</span>
                    {/if}
                  </div>
                  {#if ev.description}<p class="row-desc">{ev.description}</p>{/if}
                  {#if ev.emailReminder}
                    <div class="row-chips">
                      <Mail size={10} />
                      {#each ev.emailReminder.split(',').map(e=>e.trim()).filter(Boolean) as addr}
                        <span class="chip">{addr}</span>
                      {/each}
                      {#if ev.emailCc}
                        <span class="chip chip-cc">CC: {ev.emailCc}</span>
                      {/if}
                    </div>
                  {/if}
                </div>
                <div class="row-actions">
                  <button class="icon-btn" onclick={() => startEdit(ev, 'events')} aria-label="Edit"><Pencil size={13} /></button>
                  <button class="icon-btn icon-btn-danger" onclick={() => remove(ev.id, 'events')} aria-label="Delete"><Trash2 size={13} /></button>
                </div>
              </div>
            {/each}

            <!-- Day Tasks -->
            {#each selectedDayItems.tasks as task (task.id)}
              <div class="list-row" class:row-active={task.status !== 'done'} class:row-done={task.status === 'done'}>
                <div class="row-accent accent-task"></div>
                <button class="checkbox" class:checked={task.status === 'done'} onclick={() => toggleTask(task)} aria-label="Toggle task">
                  {#if task.status === 'done'}<Check size={12} />{/if}
                </button>
                <div class="row-body">
                  <span class="row-title">{task.title}</span>
                  <div class="row-meta">
                    {#if task.dueAt}
                      <span class="meta-item"><Clock size={11} /> {formatTime(task.dueAt)}</span>
                    {/if}
                    {#if task.reminderMinutes !== undefined && task.emailReminder}
                      <span class="meta-tag"><Bell size={10} /> {getReminderMinutesLabel(task.reminderMinutes)}</span>
                    {/if}
                    {#if task.reminderRepeat && task.reminderRepeat !== 'none'}
                      <span class="meta-tag tag-repeat"><Repeat2 size={10} /> {repeatLabel(task.reminderRepeat)}</span>
                    {/if}
                  </div>
                  {#if task.description}<p class="row-desc">{task.description}</p>{/if}
                  {#if task.emailReminder}
                    <div class="row-chips"><Mail size={10} /><span class="chip">{task.emailReminder}</span></div>
                  {/if}
                </div>
                <div class="row-actions">
                  <button class="icon-btn" onclick={() => startEdit(task, 'tasks')} aria-label="Edit"><Pencil size={13} /></button>
                  <button class="icon-btn icon-btn-danger" onclick={() => remove(task.id, 'tasks')} aria-label="Delete"><Trash2 size={13} /></button>
                </div>
              </div>
            {/each}
          </div>

          <!-- Add Event button (Opens creation modal overlay) -->
          <div class="add-area">
            <button class="btn-add" onclick={() => openCreateModal('events')}>
              <Plus size={13} /> Add Event
            </button>
          </div>
        {:else}
          <div class="empty-state">
            <CalendarDays size={28} />
            <p>Select a day to view & manage events</p>
          </div>
        {/if}
      </div>
    </div>

    <!-- Upcoming Events -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">Upcoming Events</span>
        <span class="count-badge">{upcomingEvents.length}</span>
      </div>
      {#if loading}
        <p class="empty-msg">Loading…</p>
      {:else if upcomingEvents.length === 0}
        <p class="empty-msg">No upcoming events. Click a day above to add one.</p>
      {:else}
        <div class="upcoming-list">
          {#each upcomingEvents.slice(0, upcomingLimit) as ev (ev.id)}
            <div class="upcoming-row">
              <div class="upcoming-time">
                <span class="up-date">{formatDate(ev.startsAt)}</span>
                <span class="up-time"><Clock size={10} /> {formatTime(ev.startsAt)}</span>
              </div>
              <div class="upcoming-info">
                <span class="upcoming-title">{ev.title}</span>
                {#if ev.description}<span class="upcoming-desc">{ev.description}</span>{/if}
              </div>
              <div class="upcoming-badges">
                {#if ev.reminderMinutes}
                  <span class="u-badge" title={getReminderMinutesLabel(ev.reminderMinutes)}><Bell size={10} /></span>
                {/if}
                {#if ev.reminderRepeat && ev.reminderRepeat !== 'none'}
                  <span class="u-badge u-repeat" title={repeatLabel(ev.reminderRepeat)}><Repeat2 size={10} /></span>
                {/if}
                {#if ev.emailReminder}
                  <span class="u-badge u-email" title={ev.emailReminder}><Mail size={10} /></span>
                {/if}
              </div>
              <button class="icon-btn icon-btn-danger" onclick={() => remove(ev.id, 'events')} aria-label="Delete"><Trash2 size={12} /></button>
            </div>
          {/each}
        </div>
        {#if upcomingEvents.length > upcomingLimit}
          <button class="btn-more" onclick={() => upcomingLimit += 10}>
            <ChevronDown size={14} /> Show {Math.min(10, upcomingEvents.length - upcomingLimit)} more
          </button>
        {/if}
      {/if}
    </div>

  <!-- ═══════════════════ TASKS TAB ═══════════════════ -->
  {:else if active === 'tasks'}
    <div class="card task-composer">
      <div class="form-group">
        <label class="form-label" for="task-title">Task Title <span class="req">*</span></label>
        <input id="task-title" class="form-input" bind:value={taskTitle} placeholder="What needs to be done?" />
      </div>
      <div class="form-group">
        <label class="form-label" for="task-desc">Description</label>
        <input id="task-desc" class="form-input" bind:value={taskDetail} placeholder="Optional details" />
      </div>
      <div class="form-group">
        <label class="form-label" for="task-due">Due Date</label>
        <input id="task-due" class="form-input" type="datetime-local" bind:value={taskDueAt} />
      </div>
      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label" for="task-remind">Reminder</label>
          <select id="task-remind" class="form-input" bind:value={taskReminderMin}>
            {#each reminderOptions as opt}<option value={opt.value}>{opt.label}</option>{/each}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="task-repeat">Repeat</label>
          <select id="task-repeat" class="form-input" bind:value={taskRepeat}>
            {#each repeatOptions as opt}<option value={opt.value}>{opt.label}</option>{/each}
          </select>
        </div>
      </div>
      {@render customReminderFields(taskReminderMin, taskCustomReminderValue, taskCustomReminderUnit, (v) => taskCustomReminderValue = v, (v) => taskCustomReminderUnit = v)}
      {@render customRepeatFields(taskRepeat, taskCustomRepeatValue, taskCustomRepeatUnit, (v) => taskCustomRepeatValue = v, (v) => taskCustomRepeatUnit = v)}

      <button class="btn-toggle" onclick={() => showTaskEmail = !showTaskEmail}>
        <Mail size={13} /> {showTaskEmail ? 'Hide Email Options' : 'Add Email Notification'}
        <ChevronDown size={13} style="transform: rotate({showTaskEmail ? 180 : 0}deg); transition: transform .2s;" />
      </button>
      {#if showTaskEmail}
        <div class="form-group">
          <label class="form-label" for="task-email">Email To <span class="form-hint">(comma-separated)</span></label>
          <input id="task-email" class="form-input" bind:value={taskEmailTo} placeholder="to@example.com" />
        </div>
        <div class="form-group">
          <label class="form-label" for="task-cc">CC <span class="form-hint">(optional)</span></label>
          <input id="task-cc" class="form-input" bind:value={taskEmailCc} placeholder="cc@example.com" />
        </div>
        <div class="form-group">
          <label class="form-label" for="task-subj">Email Subject <span class="form-hint">(leave blank for default)</span></label>
          <input id="task-subj" class="form-input" bind:value={taskEmailSubject} placeholder="Task Reminder: {taskTitle}" />
        </div>
      {/if}
      <button class="btn-save" onclick={createTask} disabled={!taskTitle.trim()}>
        <Plus size={14} /> Add Task
      </button>
    </div>

    {#if error}<p class="error-text">{error}</p>{/if}

    <div class="items-list">
      {#if loading}
        <p class="empty-msg">Loading…</p>
      {:else if items.length === 0}
        <p class="empty-msg">No tasks yet.</p>
      {/if}
      {#each items as item (item.id)}
        <div class="list-row" class:row-active={item.status !== 'done'} class:row-done={item.status === 'done'}>
          <button class="checkbox" class:checked={item.status === 'done'} onclick={() => toggleTask(item)} aria-label="Toggle task">
            {#if item.status === 'done'}<Check size={12} />{/if}
          </button>
          <div class="row-body">
            <span class="row-title">{item.title}</span>
            {#if item.description}<p class="row-desc">{item.description}</p>{/if}
            <div class="row-meta">
              {#if item.dueAt}<span class="meta-tag"><Clock size={10} /> {formatDate(item.dueAt)}</span>{/if}
              {#if item.reminderRepeat && item.reminderRepeat !== 'none'}
                <span class="meta-tag tag-repeat"><Repeat2 size={10} /> {repeatLabel(item.reminderRepeat)}</span>
              {/if}
              {#if item.emailReminder}
                <span class="meta-tag tag-email"><Mail size={10} /> {item.emailReminder.split(',')[0]}{item.emailReminder.split(',').length > 1 ? ` +${item.emailReminder.split(',').length-1}` : ''}</span>
              {/if}
            </div>
          </div>
          <button class="icon-btn" onclick={() => startEdit(item, 'tasks')} aria-label="Edit"><Pencil size={14} /></button>
          <button class="icon-btn icon-btn-danger" onclick={() => remove(item.id, 'tasks')} aria-label="Delete"><Trash2 size={14} /></button>
        </div>
      {/each}
    </div>

  <!-- ═══════════════════ NOTES / PROJECTS TABS ═══════════════════ -->
  {:else}
    <div class="card task-composer" style="max-width: 500px;">
      <div class="form-group">
        <label class="form-label" for="gen-title">{active === 'projects' ? 'Project Name' : 'Note Title'} <span class="req">*</span></label>
        <input id="gen-title" class="form-input" bind:value={genTitle} placeholder={active === 'projects' ? 'Project name' : 'Note title'} />
      </div>
      <div class="form-group">
        <label class="form-label" for="gen-detail">Details</label>
        <input id="gen-detail" class="form-input" bind:value={genDetail} placeholder="Description or details (optional)" />
      </div>
      <button class="btn-save" onclick={create} disabled={!genTitle.trim()}>
        <Plus size={14} /> Add
      </button>
    </div>

    {#if error}<p class="error-text">{error}</p>{/if}

    <div class="items-list">
      {#if loading}
        <p class="empty-msg">Loading…</p>
      {:else if items.length === 0}
        <p class="empty-msg">Nothing here yet.</p>
      {/if}
      {#each items as item (item.id)}
        <div class="list-row">
          <div class="row-body">
            <span class="row-title">{item.title ?? item.name ?? item.topic}</span>
            <p class="row-desc">{item.description ?? item.content ?? item.notes ?? 'No details'}</p>
            {#if item.status}
              <span class="meta-tag">{item.status}</span>
            {/if}
          </div>
          <button class="icon-btn" onclick={() => startEdit(item, active)} aria-label="Edit"><Pencil size={14} /></button>
          <button class="icon-btn icon-btn-danger" onclick={() => remove(item.id, active)} aria-label="Delete"><Trash2 size={14} /></button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- ═══════════════════ CREATE MODAL OVERLAY ═══════════════════ -->
{#if creatingKind === 'events'}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-overlay" onclick={closeCreateModal}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-card" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <span class="modal-title">Add Event</span>
        <button class="icon-btn" onclick={closeCreateModal}><X size={16} /></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label" for="ev-title">Title <span class="req">*</span></label>
          <input id="ev-title" class="form-input" bind:value={evTitle} placeholder="Event title" />
        </div>
        <div class="form-group">
          <label class="form-label" for="ev-desc">Description</label>
          <textarea id="ev-desc" class="form-input form-textarea" bind:value={evDetail} placeholder="Optional details"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="ev-date">Date & Time</label>
          <input id="ev-date" class="form-input" type="datetime-local" bind:value={evDate} />
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label" for="ev-remind">Reminder</label>
            <select id="ev-remind" class="form-input" bind:value={evReminderMin}>
              {#each reminderOptions as opt}<option value={opt.value}>{opt.label}</option>{/each}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="ev-repeat">Repeat</label>
            <select id="ev-repeat" class="form-input" bind:value={evRepeat}>
              {#each repeatOptions as opt}<option value={opt.value}>{opt.label}</option>{/each}
            </select>
          </div>
        </div>
        {@render customReminderFields(evReminderMin, evCustomReminderValue, evCustomReminderUnit, (v) => evCustomReminderValue = v, (v) => evCustomReminderUnit = v)}
        {@render customRepeatFields(evRepeat, evCustomRepeatValue, evCustomRepeatUnit, (v) => evCustomRepeatValue = v, (v) => evCustomRepeatUnit = v)}
        {#if evError}<p class="error-text" style="margin-top:var(--space-2);">{evError}</p>{/if}

        <div class="form-group">
          <label class="form-label" for="ev-email">Email To <span class="form-hint">(comma-separated)</span></label>
          <input id="ev-email" class="form-input" bind:value={evEmailTo} placeholder="to@example.com, other@example.com" />
        </div>
        <div class="form-group">
          <label class="form-label" for="ev-cc">CC <span class="form-hint">(optional)</span></label>
          <input id="ev-cc" class="form-input" bind:value={evEmailCc} placeholder="cc@example.com" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" onclick={closeCreateModal}>Cancel</button>
        <button class="btn-save" onclick={submitCreateEvent} disabled={!evTitle.trim()}><Plus size={12} /> Add Event</button>
      </div>
    </div>
  </div>
{/if}

<!-- ═══════════════════ EDIT MODAL OVERLAY ═══════════════════ -->
{#if editingItem}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-overlay" onclick={() => editingItem = null}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-card" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <span class="modal-title">Edit {editingItem._kind === 'events' ? 'Event' : editingItem._kind === 'tasks' ? 'Task' : editingItem._kind === 'notes' ? 'Note' : 'Project'}</span>
        <button class="icon-btn" onclick={() => editingItem = null}><X size={16} /></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label" for="edit-title">Title <span class="req">*</span></label>
          <input id="edit-title" class="form-input" bind:value={editTitle} />
        </div>
        <div class="form-group">
          <label class="form-label" for="edit-desc">Description</label>
          <textarea id="edit-desc" class="form-input form-textarea" bind:value={editDetail}></textarea>
        </div>

        {#if editingItem._kind === 'events' || editingItem._kind === 'tasks'}
          <div class="form-group">
            <label class="form-label" for="edit-date">{editingItem._kind === 'events' ? 'Date & Time' : 'Due Date'}</label>
            <input id="edit-date" class="form-input" type="datetime-local" bind:value={editDate} />
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="edit-remind">Reminder</label>
              <select id="edit-remind" class="form-input" bind:value={editReminderMin}>
                {#each reminderOptions as opt}<option value={opt.value}>{opt.label}</option>{/each}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="edit-repeat">Repeat</label>
              <select id="edit-repeat" class="form-input" bind:value={editRepeat}>
                {#each repeatOptions as opt}<option value={opt.value}>{opt.label}</option>{/each}
              </select>
            </div>
          </div>
          {@render customReminderFields(editReminderMin, editCustomReminderValue, editCustomReminderUnit, (v) => editCustomReminderValue = v, (v) => editCustomReminderUnit = v)}
          {@render customRepeatFields(editRepeat, editCustomRepeatValue, editCustomRepeatUnit, (v) => editCustomRepeatValue = v, (v) => editCustomRepeatUnit = v)}
          
          <div class="form-group">
            <label class="form-label" for="edit-email">Email To <span class="form-hint">(comma-separated)</span></label>
            <input id="edit-email" class="form-input" bind:value={editEmailTo} placeholder="to@example.com" />
          </div>
          <div class="form-group">
            <label class="form-label" for="edit-cc">CC <span class="form-hint">(optional)</span></label>
            <input id="edit-cc" class="form-input" bind:value={editEmailCc} placeholder="cc@example.com" />
          </div>
          {#if editingItem._kind === 'tasks'}
            <div class="form-group">
              <label class="form-label" for="edit-subj">Email Subject <span class="form-hint">(optional override)</span></label>
              <input id="edit-subj" class="form-input" bind:value={editEmailSubject} placeholder="Task Reminder: {editTitle}" />
            </div>
          {/if}
        {/if}
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" onclick={() => editingItem = null}>Cancel</button>
        <button class="btn-save" onclick={saveEdit}><Save size={12} /> Save</button>
      </div>
    </div>
  </div>
{/if}

<!-- ═══════════════════ SNIPPET BLOCKS ═══════════════════ -->

{#snippet customReminderFields(currentVal, numVal, unitVal, setNum, setUnit)}
  {#if currentVal === 'custom'}
    <div class="custom-box">
      <span class="custom-box-label">Custom Reminder Interval</span>
      <div class="form-row-custom">
        <div class="form-group">
          <label class="form-label" for="custom-rem-value">Value</label>
          <input id="custom-rem-value" type="number" class="form-input" value={numVal} oninput={(e) => setNum(Number(e.target.value))} min="1" placeholder="10" />
        </div>
        <div class="form-group">
          <label class="form-label" for="custom-rem-unit">Unit</label>
          <select id="custom-rem-unit" class="form-input" value={unitVal} onchange={(e) => setUnit(Number(e.target.value))}>
            <option value={1}>Minutes</option>
            <option value={60}>Hours</option>
            <option value={1440}>Days</option>
            <option value={10080}>Weeks</option>
          </select>
        </div>
      </div>
    </div>
  {/if}
{/snippet}

{#snippet customRepeatFields(currentVal, numVal, unitVal, setNum, setUnit)}
  {#if currentVal === 'custom'}
    <div class="custom-box">
      <span class="custom-box-label">Custom Repeat Interval</span>
      <div class="form-row-custom">
        <div class="form-group">
          <label class="form-label" for="custom-rpt-interval">Every</label>
          <input id="custom-rpt-interval" type="number" class="form-input" value={numVal} oninput={(e) => setNum(Number(e.target.value))} min="1" placeholder="1" />
        </div>
        <div class="form-group">
          <label class="form-label" for="custom-rpt-unit">Unit</label>
          <select id="custom-rpt-unit" class="form-input" value={unitVal} onchange={(e) => setUnit(e.target.value)}>
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
          </select>
        </div>
      </div>
    </div>
  {/if}
{/snippet}

<style>
  /* ── STRICT SHARP BORDERS ONLY (No rounded corners anywhere) ── */
  :global(.page *), :global(.modal-overlay *) {
    border-radius: 0 !important;
  }

  /* ── Page Layout (matches settings page exactly) ── */
  .page { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-6); }
  .page-title { font-size: var(--text-2xl); font-weight: var(--font-semibold); color: var(--text-primary); margin: 0; }
  .page-sub { font-size: var(--text-sm); color: var(--text-secondary); margin: var(--space-1) 0 0; }

  /* ── Tab Bar ── */
  .tab-bar {
    display: flex;
    gap: 0;
    border-bottom: 1px solid var(--surface-border);
  }
  .tab-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    border: none;
    border-bottom: 2px solid transparent;
    background: transparent;
    font-size: var(--text-sm);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-weight: var(--font-medium);
  }
  .tab-item:hover { color: var(--text-primary); }
  .tab-item.active {
    border-bottom-color: var(--text-primary);
    color: var(--text-primary);
    font-weight: var(--font-semibold);
  }

  /* ── Card (matches settings-content) ── */
  .card {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    overflow: hidden;
  }
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--surface-border);
  }
  .card-title {
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
  }
  .count-badge {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    background: var(--surface-bg);
    border: 1px solid var(--surface-border);
    padding: 1px 8px;
  }

  /* ── Calendar Grid ── */
  .cal-layout {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: var(--space-4);
    align-items: start;
  }
  @media (max-width: 1024px) { .cal-layout { grid-template-columns: 1fr; } }

  .cal-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }
  .dow {
    text-align: center;
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
    color: var(--text-secondary);
    padding: var(--space-2) 0;
    border-bottom: 1px solid var(--surface-border);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .cal-day {
    min-height: 72px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: var(--space-1) var(--space-2);
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--surface-border-subtle);
    border-right: 1px solid var(--surface-border-subtle);
    cursor: pointer;
    transition: background var(--transition-fast);
    text-align: left;
  }
  .cal-day.empty { cursor: default; opacity: 0.3; }
  .cal-day:not(.empty):hover { background: var(--surface-border-subtle); }
  .cal-day.selected { background: color-mix(in srgb, var(--color-accent-500) 8%, var(--surface-card)); }

  .day-number {
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    line-height: 1;
    margin-bottom: var(--space-1);
  }
  .cal-day.today .day-number {
    background: var(--text-primary);
    color: var(--surface-card);
    width: 22px;
    height: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .day-dots {
    display: flex;
    gap: 3px;
    flex-wrap: wrap;
    margin-top: auto;
  }
  .dot {
    width: 6px;
    height: 6px;
  }
  .dot-event { background: var(--color-accent-500); }
  .dot-task { background: var(--color-neutral-400); }
  .dot-more {
    font-size: 9px;
    color: var(--text-tertiary);
    line-height: 1;
  }

  /* ── Day Detail Panel ── */
  .day-detail {
    display: flex;
    flex-direction: column;
    max-height: 80vh;
  }
  .day-scroll {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-3) var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    min-height: 0;
  }
  .empty-msg {
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    padding: var(--space-4);
    text-align: center;
    margin: 0;
  }
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-10) var(--space-4);
    color: var(--text-tertiary);
  }
  .empty-state p { font-size: var(--text-sm); margin: 0; }

  /* ── List Rows (items/events/tasks) ── */
  .list-row {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--surface-border);
    position: relative;
    overflow: hidden;
    transition: background var(--transition-fast);
  }
  .list-row:hover { background: var(--surface-border-subtle); }
  .row-done { opacity: 0.55; }
  .row-done .row-title { text-decoration: line-through; }

  /* Green border if item/event is active */
  .list-row.row-active {
    border: 1px solid var(--color-success-500) !important;
  }

  .row-accent {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
  }
  .accent-event { background: var(--color-accent-500); }
  .accent-task { background: var(--color-neutral-500); }

  .row-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .row-title {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--text-primary);
    line-height: var(--leading-tight);
  }
  .row-meta {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
    margin-top: 2px;
  }
  .meta-item {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: var(--text-xs);
    color: var(--text-secondary);
  }
  .meta-tag {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    color: var(--text-secondary);
    border: 1px solid var(--surface-border);
    padding: 1px 6px;
    background: var(--surface-bg);
  }
  .tag-repeat {
    border-color: var(--color-accent-500);
    color: var(--color-accent-500);
  }
  .tag-email {
    border-color: var(--color-success-500);
    color: var(--color-success-500);
  }
  .row-desc {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    margin: 2px 0 0;
    line-height: var(--leading-normal);
  }
  .row-chips {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
    margin-top: var(--space-1);
    color: var(--text-tertiary);
  }
  .chip {
    font-size: 10px;
    padding: 1px 6px;
    border: 1px solid var(--surface-border);
    color: var(--text-secondary);
    background: var(--surface-bg);
  }
  .chip-cc {
    color: var(--text-tertiary);
  }
  .row-actions {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex-shrink: 0;
  }

  /* ── Checkbox ── */
  .checkbox {
    width: 18px;
    height: 18px;
    border: 1px solid var(--surface-border);
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    color: var(--text-tertiary);
    transition: all var(--transition-fast);
    margin-top: 1px;
  }
  .checkbox:hover { border-color: var(--text-secondary); }
  .checkbox.checked {
    background: var(--color-success-500);
    border-color: var(--color-success-500);
    color: white;
  }

  /* ── Add Area ── */
  .add-area {
    padding: var(--space-3) var(--space-4);
    border-top: 1px solid var(--surface-border-subtle);
  }
  .btn-add {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    width: 100%;
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
    border: 1px dashed var(--surface-border);
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }
  .btn-add:hover { border-color: var(--text-primary); color: var(--text-primary); }

  /* ── Form Elements (matches settings page exactly) ── */
  .form-group { display: flex; flex-direction: column; gap: 4px; }
  .form-label {
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    color: var(--text-secondary);
  }
  .form-hint { font-weight: normal; color: var(--text-tertiary); }
  .req { color: var(--color-error-500); }
  .form-input {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--surface-border);
    background: transparent;
    font-size: var(--text-sm);
    color: var(--text-primary);
    transition: border-color var(--transition-fast);
    font-family: inherit;
  }
  select.form-input {
    background-color: var(--surface-bg);
  }
  select.form-input option {
    background-color: var(--surface-bg);
    color: var(--text-primary);
  }
  .form-input:focus { outline: none; border-color: var(--color-neutral-500); }
  .form-textarea { min-height: 60px; resize: vertical; }
  .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
  .form-row-custom { display: grid; grid-template-columns: 80px 1fr; gap: var(--space-3); }

  /* ── Custom Interval Box ── */
  .custom-box {
    padding: var(--space-3);
    border: 1px dashed var(--surface-border);
    background: var(--surface-bg);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .custom-box-label {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    font-weight: var(--font-semibold);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  /* ── Buttons (matches settings page exactly) ── */
  .btn-save {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    background: var(--color-neutral-700);
    border: 1px solid var(--color-neutral-700);
    color: var(--color-neutral-0);
    font-size: var(--text-sm);
    cursor: pointer;
    transition: opacity var(--transition-fast);
  }
  .btn-save:hover:not(:disabled) { opacity: 0.85; }
  .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-cancel {
    padding: var(--space-2) var(--space-4);
    background: transparent;
    border: 1px solid var(--surface-border);
    color: var(--text-secondary);
    font-size: var(--text-sm);
    cursor: pointer;
    transition: background var(--transition-fast);
  }
  .btn-cancel:hover { background: var(--surface-border-subtle); }

  .btn-toggle {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-xs);
    border: 1px solid var(--surface-border);
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }
  .btn-toggle:hover { border-color: var(--text-primary); color: var(--text-primary); }

  .btn-more {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    width: 100%;
    padding: var(--space-2);
    margin-top: var(--space-2);
    border: 1px dashed var(--surface-border);
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: var(--text-sm);
    transition: all var(--transition-fast);
  }
  .btn-more:hover { border-color: var(--text-primary); color: var(--text-primary); }

  .icon-btn {
    background: transparent;
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
    padding: var(--space-1);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color var(--transition-fast);
  }
  .icon-btn:hover { color: var(--text-primary); }
  .icon-btn-danger:hover { color: var(--color-error-500); }

  /* ── Modal Popups ── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-4);
    animation: fadeIn 0.15s ease;
  }
  .modal-card {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    width: min(460px, 95vw);
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-md);
    animation: slideUp 0.2s ease;
  }
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4);
    border-bottom: 1px solid var(--surface-border-subtle);
  }
  .modal-title {
    font-size: var(--text-base);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
  }
  .modal-body {
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    overflow-y: auto;
    flex: 1;
  }
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
    padding: var(--space-4);
    border-top: 1px solid var(--surface-border-subtle);
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

  /* ── Upcoming Section ── */
  .upcoming-list {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .upcoming-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--surface-border-subtle);
    transition: background var(--transition-fast);
  }
  .upcoming-row:last-child { border-bottom: none; }
  .upcoming-row:hover { background: var(--surface-border-subtle); }
  .upcoming-time { display: flex; flex-direction: column; min-width: 90px; }
  .up-date {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    font-weight: var(--font-medium);
  }
  .up-time {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    margin-top: 1px;
  }
  .upcoming-info { flex: 1; min-width: 0; overflow: hidden; }
  .upcoming-title {
    display: block;
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .upcoming-desc {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
  }
  .upcoming-badges { display: flex; gap: 4px; }
  .u-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border: 1px solid var(--surface-border);
    color: var(--text-tertiary);
  }
  .u-repeat { border-color: var(--color-accent-500); color: var(--color-accent-500); }
  .u-email { border-color: var(--color-success-500); color: var(--color-success-500); }

  /* ── Task Composer ── */
  .task-composer {
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    max-width: 540px;
  }

  /* ── Items List ── */
  .items-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .error-text { color: var(--color-error-500); font-size: var(--text-sm); }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .page { padding: var(--space-4); }
    .form-row-2 { grid-template-columns: 1fr; }
    .cal-day { min-height: 56px; }
  }
</style>
