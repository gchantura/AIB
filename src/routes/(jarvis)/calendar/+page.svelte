<script>
  import { onMount } from 'svelte';
  import { CalendarDays, CheckSquare, FileText, FolderKanban, Plus, Trash2, Bell, ChevronLeft, ChevronRight, Clock } from 'lucide-svelte';

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

  // Form state
  let title = $state('');
  let detail = $state('');
  let date = $state('');
  let reminderMinutes = $state(15);
  let emailReminder = $state('');

  // Calendar view state
  let viewDate = $state(new Date());
  let selectedDay = $state(null);

  const reminderOptions = [
    { value: 0, label: 'At event time' },
    { value: 5, label: '5 minutes before' },
    { value: 15, label: '15 minutes before' },
    { value: 30, label: '30 minutes before' },
    { value: 60, label: '1 hour before' },
    { value: 120, label: '2 hours before' },
    { value: 1440, label: '1 day before' },
  ];

  // Derived calendar grid
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
        if (day < 1 || day > daysInMonth) {
          row.push(null);
        } else {
          const d = new Date(year, month, day);
          const dateStr = d.toISOString().split('T')[0];
          const dayEvents = events.filter(ev => ev.startsAt?.startsWith(dateStr));
          const dayTasks = tasks.filter(t => t.dueAt?.startsWith(dateStr));
          row.push({ day, date: d, dateStr, events: dayEvents, tasks: dayTasks });
        }
      }
      grid.push(row);
      if (day > daysInMonth) break;
    }
    return grid;
  });

  const monthLabel = $derived(viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
  const todayStr = new Date().toISOString().split('T')[0];

  const selectedDayItems = $derived.by(() => {
    if (!selectedDay) return { events: [], tasks: [] };
    return {
      events: events.filter(ev => ev.startsAt?.startsWith(selectedDay)),
      tasks: tasks.filter(t => t.dueAt?.startsWith(selectedDay))
    };
  });

  onMount(loadAll);

  async function loadAll() {
    loading = true;
    const [evRes, taskRes] = await Promise.all([
      fetch('/api/workspace?kind=events'),
      fetch('/api/workspace?kind=tasks')
    ]);
    const evData = await evRes.json();
    const taskData = await taskRes.json();
    events = evData.items ?? [];
    tasks = taskData.items ?? [];
    loading = false;
  }

  async function load() {
    loading = true;
    error = '';
    const res = await fetch(`/api/workspace?kind=${active}`);
    const data = await res.json();
    items = data.items ?? [];
    error = data.error ?? '';
    loading = false;
  }

  async function changeTab(id) {
    active = id;
    title = '';
    detail = '';
    date = '';
    if (id === 'calendar') {
      await loadAll();
    } else {
      await load();
    }
  }

  async function create() {
    if (!title.trim()) return;
    let body;
    if (active === 'calendar' || active === 'events') {
      body = {
        title,
        description: detail,
        startsAt: date || new Date().toISOString(),
        reminderMinutes: Number(reminderMinutes),
        emailReminder: emailReminder.trim() || undefined
      };
    } else if (active === 'tasks') {
      body = { title, description: detail, status: 'todo', priority: 'medium', dueAt: date || undefined };
    } else if (active === 'notes') {
      body = { title, content: detail, tags: [] };
    } else {
      body = { name: title, description: detail, status: 'active' };
    }

    const kind = active === 'calendar' ? 'events' : active;
    const res = await fetch(`/api/workspace?kind=${kind}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) { error = data.error; return; }
    title = '';
    detail = '';
    date = '';
    emailReminder = '';
    await loadAll();
  }

  async function remove(id, kind) {
    const k = kind || (active === 'calendar' ? 'events' : active);
    await fetch(`/api/workspace?kind=${k}&id=${id}`, { method: 'DELETE' });
    await loadAll();
  }

  async function toggleTask(item) {
    await fetch(`/api/workspace?kind=tasks&id=${item.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: item.status === 'done' ? 'todo' : 'done' })
    });
    await loadAll();
  }

  function prevMonth() {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    selectedDay = null;
  }

  function nextMonth() {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    selectedDay = null;
  }

  function selectDay(cell) {
    if (!cell) return;
    selectedDay = selectedDay === cell.dateStr ? null : cell.dateStr;
  }

  function formatTime(iso) {
    if (!iso) return '';
    try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
  }

  function formatDate(iso) {
    if (!iso) return '';
    try { return new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }); } catch { return ''; }
  }
</script>

<svelte:head><title>Workspace · J.A.R.V.I.S.</title></svelte:head>

<div class="page">
  <header>
    <div>
      <h1>Workspace</h1>
      <p>Tasks, calendar, notes, and projects — stored locally.</p>
    </div>
  </header>

  <nav aria-label="Workspace sections">
    {#each tabs as tab (tab.id)}
      <button class:active={active === tab.id} onclick={() => changeTab(tab.id)}>
        <tab.icon size={15}/>{tab.label}
      </button>
    {/each}
  </nav>

  {#if active === 'calendar'}
    <!-- CALENDAR VIEW -->
    <div class="calendar-layout">
      <!-- Left: Month Grid -->
      <div class="calendar-panel">
        <div class="cal-header">
          <button class="nav-btn" onclick={prevMonth} aria-label="Previous month"><ChevronLeft size={16}/></button>
          <span class="month-label">{monthLabel}</span>
          <button class="nav-btn" onclick={nextMonth} aria-label="Next month"><ChevronRight size={16}/></button>
        </div>
        <div class="cal-grid">
          {#each ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] as dow}
            <div class="dow-label">{dow}</div>
          {/each}
          {#each calendarGrid as week}
            {#each week as cell}
              {#if cell}
                <button
                  class="cal-cell"
                  class:today={cell.dateStr === todayStr}
                  class:selected={cell.dateStr === selectedDay}
                  class:has-events={cell.events.length > 0 || cell.tasks.length > 0}
                  onclick={() => selectDay(cell)}
                >
                  <span class="day-num">{cell.day}</span>
                  <div class="day-dots">
                    {#each cell.events.slice(0, 3) as ev}
                      <span class="dot event-dot" title={ev.title}></span>
                    {/each}
                    {#each cell.tasks.slice(0, 2) as t}
                      <span class="dot task-dot" title={t.title}></span>
                    {/each}
                  </div>
                </button>
              {:else}
                <div class="cal-cell empty"></div>
              {/if}
            {/each}
          {/each}
        </div>
      </div>

      <!-- Right: Day Detail + Add Event -->
      <div class="day-panel">
        {#if selectedDay}
          <div class="day-header">
            <h2>{formatDate(selectedDay + 'T00:00:00')}</h2>
          </div>
          {#if selectedDayItems.events.length === 0 && selectedDayItems.tasks.length === 0}
            <p class="empty-day">Nothing scheduled. Add an event below.</p>
          {/if}
          {#each selectedDayItems.events as ev (ev.id)}
            <article class="day-item event-item">
              <Bell size={14} class="item-icon"/>
              <div class="item-body">
                <strong>{ev.title}</strong>
                <small>{formatTime(ev.startsAt)}{ev.reminderMinutes ? ` · Reminder ${ev.reminderMinutes}min before` : ''}</small>
                {#if ev.description}<p>{ev.description}</p>{/if}
              </div>
              <button class="del-btn" onclick={() => remove(ev.id, 'events')} aria-label="Delete event"><Trash2 size={13}/></button>
            </article>
          {/each}
          {#each selectedDayItems.tasks as task (task.id)}
            <article class="day-item task-item" class:done={task.status === 'done'}>
              <button class="check-btn" onclick={() => toggleTask(task)} aria-label="Toggle task">
                <CheckSquare size={14}/>
              </button>
              <div class="item-body">
                <strong>{task.title}</strong>
                {#if task.description}<p>{task.description}</p>{/if}
              </div>
              <button class="del-btn" onclick={() => remove(task.id, 'tasks')} aria-label="Delete task"><Trash2 size={13}/></button>
            </article>
          {/each}
        {:else}
          <div class="no-selection">
            <CalendarDays size={32} class="no-sel-icon"/>
            <p>Select a day to view events and tasks</p>
          </div>
        {/if}

        <!-- Add Event Form -->
        <div class="add-form">
          <h3><Plus size={14}/> Add Event</h3>
          <input bind:value={title} placeholder="Event title" aria-label="Event title"/>
          <input bind:value={detail} placeholder="Description (optional)" aria-label="Description"/>
          <input bind:value={date} type="datetime-local" aria-label="Date and time"/>
          <div class="form-row">
            <Bell size={13}/>
            <select bind:value={reminderMinutes} aria-label="Reminder time">
              {#each reminderOptions as opt}
                <option value={opt.value}>{opt.label}</option>
              {/each}
            </select>
          </div>
          <input bind:value={emailReminder} type="email" placeholder="Email for reminder (optional)" aria-label="Email reminder"/>
          <button class="primary" onclick={create} disabled={!title.trim()}>
            <Plus size={14}/> Add Event
          </button>
        </div>
      </div>
    </div>

    <!-- Upcoming events list -->
    <section class="upcoming">
      <h2>Upcoming Events</h2>
      {#if loading}
        <p class="empty">Loading…</p>
      {:else}
        {@const upcoming = events.filter(ev => new Date(ev.startsAt) >= new Date()).sort((a,b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()).slice(0, 10)}
        {#each upcoming as ev (ev.id)}
          <article class="event-row">
            <div class="event-time">
              <span class="event-date">{formatDate(ev.startsAt)}</span>
              <span class="event-clock"><Clock size={11}/>{formatTime(ev.startsAt)}</span>
            </div>
            <div class="event-info">
              <strong>{ev.title}</strong>
              {#if ev.description}<span>{ev.description}</span>{/if}
            </div>
            {#if ev.reminderMinutes}
              <span class="reminder-badge"><Bell size={11}/>{ev.reminderMinutes}min</span>
            {/if}
            <button class="del-btn" onclick={() => remove(ev.id, 'events')} aria-label="Delete"><Trash2 size={13}/></button>
          </article>
        {/each}
        {#if upcoming.length === 0}
          <p class="empty">No upcoming events. Add one above.</p>
        {/if}
      {/if}
    </section>

  {:else}
    <!-- OTHER TABS: Tasks / Notes / Projects -->
    <section class="composer">
      <input bind:value={title} placeholder={active === 'projects' ? 'Project name' : `${tabs.find(t => t.id === active)?.label.slice(0,-1) || 'Item'} title`} aria-label="Title"/>
      <input bind:value={detail} placeholder="Description or details" aria-label="Details"/>
      {#if active === 'tasks'}
        <input bind:value={date} type="datetime-local" aria-label="Due date"/>
      {/if}
      <button class="primary" onclick={create} disabled={!title.trim()}><Plus size={15}/>Add</button>
    </section>
    {#if error}<p class="error">{error}</p>{/if}
    <section class="list" aria-busy={loading}>
      {#if loading}
        <p class="empty">Loading…</p>
      {:else if items.length === 0}
        <p class="empty">Nothing here yet. Add the first item above.</p>
      {/if}
      {#each items as item (item.id)}
        <article class:done={item.status === 'done'}>
          {#if active === 'tasks'}
            <button class="check" onclick={() => toggleTask(item)} aria-label="Toggle task">
              {item.status === 'done' ? '✓' : ''}
            </button>
          {/if}
          <div>
            <h2>{item.title ?? item.name ?? item.topic}</h2>
            <p>{item.description ?? item.content ?? item.notes ?? 'No details'}</p>
            <small>{item.dueAt ? `Due: ${formatDate(item.dueAt)}` : item.status ?? ''}</small>
          </div>
          <button class="icon" onclick={() => remove(item.id, active)} aria-label="Delete item"><Trash2 size={15}/></button>
        </article>
      {/each}
    </section>
  {/if}
</div>

<style>
  .page { padding: var(--space-6); max-width: 1200px; display: grid; gap: var(--space-5); }
  h1 { margin: 0; color: var(--text-primary); font-size: var(--text-2xl); }
  header p,.empty { color: var(--text-secondary); font-size: var(--text-sm); margin:.3rem 0 0; }
  nav { display: flex; gap: .4rem; flex-wrap: wrap; }
  nav button { display: flex; gap: .45rem; align-items: center; border: 1px solid var(--surface-border); background: var(--surface-card); color: var(--text-secondary); border-radius: var(--radius-md); cursor: pointer; padding: .55rem .8rem; font-size: var(--text-sm); transition: background var(--transition-fast); }
  nav button.active { background: var(--color-neutral-900); color: white; border-color: transparent; }

  /* Calendar Layout */
  .calendar-layout { display: grid; grid-template-columns: 1fr 320px; gap: var(--space-4); align-items: start; }
  @media (max-width: 900px) { .calendar-layout { grid-template-columns: 1fr; } }

  .calendar-panel { background: var(--surface-card); border: 1px solid var(--surface-border); border-radius: var(--radius-lg); overflow: hidden; }
  .cal-header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--surface-border); }
  .month-label { font-size: var(--text-base); font-weight: var(--font-semibold); color: var(--text-primary); }
  .nav-btn { background: transparent; border: 1px solid var(--surface-border); border-radius: var(--radius-sm); color: var(--text-secondary); cursor: pointer; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; transition: background var(--transition-fast); }
  .nav-btn:hover { background: var(--surface-border-subtle); }

  .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); }
  .dow-label { text-align: center; font-size: 10px; font-weight: var(--font-semibold); color: var(--text-tertiary); padding: .4rem 0; border-bottom: 1px solid var(--surface-border-subtle); text-transform: uppercase; letter-spacing: .05em; }
  .cal-cell { aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: .3rem; border: none; background: transparent; cursor: pointer; transition: background var(--transition-fast); position: relative; border-radius: 0; }
  .cal-cell.empty { cursor: default; }
  .cal-cell:not(.empty):hover { background: var(--surface-border-subtle); }
  .cal-cell.today .day-num { background: var(--color-accent-500); color: white; border-radius: var(--radius-full); width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; }
  .cal-cell.selected { background: var(--surface-border-subtle); }
  .day-num { font-size: var(--text-xs); color: var(--text-secondary); width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; }
  .day-dots { display: flex; gap: 2px; flex-wrap: wrap; justify-content: center; margin-top: 2px; }
  .dot { width: 5px; height: 5px; border-radius: var(--radius-full); }
  .event-dot { background: var(--color-accent-500); }
  .task-dot { background: var(--color-neutral-400); }

  /* Day Panel */
  .day-panel { background: var(--surface-card); border: 1px solid var(--surface-border); border-radius: var(--radius-lg); padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3); }
  .day-header h2 { margin: 0; font-size: var(--text-base); color: var(--text-primary); font-weight: var(--font-semibold); }
  .no-selection { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); padding: var(--space-6) var(--space-4); color: var(--text-tertiary); text-align: center; }
  .no-selection p { font-size: var(--text-sm); margin: 0; }
  .empty-day { font-size: var(--text-sm); color: var(--text-tertiary); margin: 0; }

  .day-item { display: flex; align-items: flex-start; gap: var(--space-2); padding: var(--space-2) var(--space-3); border: 1px solid var(--surface-border); border-radius: var(--radius-md); background: var(--surface-bg); }
  .event-item { border-left: 3px solid var(--color-accent-500); }
  .task-item { border-left: 3px solid var(--color-neutral-400); }
  .task-item.done { opacity: .6; }
  .task-item.done strong { text-decoration: line-through; }
  .item-body { flex: 1; min-width: 0; }
  .item-body strong { display: block; font-size: var(--text-sm); color: var(--text-primary); }
  .item-body small { font-size: var(--text-xs); color: var(--text-tertiary); }
  .item-body p { font-size: var(--text-xs); color: var(--text-secondary); margin: .2rem 0 0; }
  .check-btn,.del-btn { background: transparent; border: none; color: var(--text-tertiary); cursor: pointer; padding: 2px; border-radius: var(--radius-sm); display: flex; transition: color var(--transition-fast); }
  .check-btn:hover { color: var(--color-success-500); }
  .del-btn:hover { color: var(--color-error-500); }

  /* Add Event Form */
  .add-form { border-top: 1px solid var(--surface-border-subtle); padding-top: var(--space-3); display: flex; flex-direction: column; gap: .5rem; }
  .add-form h3 { margin: 0; font-size: var(--text-sm); color: var(--text-secondary); display: flex; align-items: center; gap: .4rem; }
  .add-form input,.add-form select { border: 1px solid var(--surface-border); background: var(--surface-bg); color: var(--text-primary); border-radius: var(--radius-md); padding: .55rem .7rem; font-size: var(--text-sm); }
  .form-row { display: flex; align-items: center; gap: .5rem; color: var(--text-tertiary); }
  .form-row select { flex: 1; }
  .primary { display: flex; align-items: center; justify-content: center; gap: .4rem; padding: .65rem 1rem; background: var(--color-neutral-900); color: white; border: 1px solid transparent; border-radius: var(--radius-md); cursor: pointer; font-size: var(--text-sm); }
  .primary:disabled { opacity: .4; cursor: not-allowed; }

  /* Upcoming */
  .upcoming { border: 1px solid var(--surface-border); background: var(--surface-card); border-radius: var(--radius-lg); padding: var(--space-4); display: grid; gap: .6rem; }
  .upcoming h2 { margin: 0 0 .4rem; font-size: var(--text-base); color: var(--text-primary); }
  .event-row { display: flex; align-items: center; gap: var(--space-3); padding: .6rem var(--space-3); border: 1px solid var(--surface-border-subtle); border-radius: var(--radius-md); background: var(--surface-bg); }
  .event-time { display: flex; flex-direction: column; align-items: flex-start; min-width: 90px; }
  .event-date { font-size: 10px; color: var(--text-tertiary); font-weight: var(--font-semibold); text-transform: uppercase; letter-spacing: .04em; }
  .event-clock { display: flex; align-items: center; gap: 3px; font-size: var(--text-xs); color: var(--text-secondary); margin-top: 2px; }
  .event-info { flex: 1; min-width: 0; }
  .event-info strong { display: block; font-size: var(--text-sm); color: var(--text-primary); }
  .event-info span { font-size: var(--text-xs); color: var(--text-tertiary); }
  .reminder-badge { display: flex; align-items: center; gap: 3px; font-size: 10px; color: var(--color-accent-500); border: 1px solid var(--color-accent-500); border-radius: var(--radius-full); padding: 1px 6px; white-space: nowrap; }

  /* Other tabs */
  .composer { display: flex; gap: .6rem; flex-wrap: wrap; }
  .composer input { flex: 1; min-width: 180px; border: 1px solid var(--surface-border); background: var(--surface-card); color: var(--text-primary); border-radius: var(--radius-md); padding: .7rem; }
  .list { display: grid; gap: .6rem; }
  article { display: flex; align-items: center; gap: .8rem; padding: 1rem; background: var(--surface-card); border: 1px solid var(--surface-border); border-radius: var(--radius-lg); }
  article > div { flex: 1; min-width: 0; }
  article h2 { font-size: var(--text-sm); margin: 0; color: var(--text-primary); }
  article p, article small { display: block; margin: .25rem 0 0; color: var(--text-secondary); font-size: var(--text-xs); }
  article.done h2 { text-decoration: line-through; color: var(--text-tertiary); }
  .icon,.check { width: 32px; height: 32px; display: grid; place-items: center; border: 1px solid var(--surface-border); background: var(--surface-card); border-radius: var(--radius-md); color: var(--text-secondary); cursor: pointer; }
  .check { border-radius: 50%; }
  .error { color: var(--color-error-500); }
  @media (max-width: 640px) { .page { padding: var(--space-4); } .composer { flex-direction: column; } }
</style>
