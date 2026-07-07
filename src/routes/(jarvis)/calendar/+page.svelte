<script>
  import { onMount } from 'svelte';
  import { CalendarDays, CheckSquare, FileText, FolderKanban, Plus, Trash2 } from 'lucide-svelte';

  const tabs = [
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'events', label: 'Calendar', icon: CalendarDays },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'projects', label: 'Projects', icon: FolderKanban }
  ];
  let active = $state('tasks'); let items = $state([]); let loading = $state(true); let error = $state('');
  let title = $state(''); let detail = $state(''); let date = $state('');

  onMount(load);
  async function load() { loading = true; error = ''; const res = await fetch(`/api/workspace?kind=${active}`); const data = await res.json(); items = data.items ?? []; error = data.error ?? ''; loading = false; }
  async function changeTab(id) { active = id; title = ''; detail = ''; date = ''; await load(); }
  async function create() {
    if (!title.trim()) return;
    const body = active === 'tasks' ? { title, description: detail, status: 'todo', priority: 'medium', dueAt: date || undefined }
      : active === 'events' ? { title, description: detail, startsAt: date || new Date().toISOString(), reminderMinutes: 15 }
      : active === 'notes' ? { title, content: detail, tags: [] }
      : { name: title, description: detail, status: 'active' };
    const res = await fetch(`/api/workspace?kind=${active}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json(); if (!res.ok) { error = data.error; return; } title = ''; detail = ''; date = ''; await load();
  }
  async function remove(id) { await fetch(`/api/workspace?kind=${active}&id=${id}`, { method: 'DELETE' }); await load(); }
  async function toggle(item) { if (active !== 'tasks') return; await fetch(`/api/workspace?kind=tasks&id=${item.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: item.status === 'done' ? 'todo' : 'done' }) }); await load(); }
  function itemTitle(item) { return item.title ?? item.name ?? item.topic; }
  function itemDetail(item) { return item.description ?? item.content ?? item.notes ?? ''; }
</script>

<svelte:head><title>Workspace · J.A.R.V.I.S.</title></svelte:head>
<div class="page">
  <header><div><h1>Workspace</h1><p>Tasks, calendar, notes, and projects—stored locally.</p></div></header>
  <nav aria-label="Workspace sections">{#each tabs as tab (tab.id)}<button class:active={active === tab.id} onclick={() => changeTab(tab.id)}><tab.icon size={15}/>{tab.label}</button>{/each}</nav>
  <section class="composer">
    <input bind:value={title} placeholder={active === 'projects' ? 'Project name' : `${tabs.find((tab) => tab.id === active)?.label.slice(0, -1)} title`} aria-label="Title" />
    <input bind:value={detail} placeholder="Description or details" aria-label="Details" />
    {#if active === 'tasks' || active === 'events'}<input bind:value={date} type="datetime-local" aria-label="Date and time" />{/if}
    <button class="primary" onclick={create} disabled={!title.trim()}><Plus size={15}/>Add</button>
  </section>
  {#if error}<p class="error">{error}</p>{/if}
  <section class="list" aria-busy={loading}>
    {#if loading}<p class="empty">Loading…</p>{:else if items.length === 0}<p class="empty">Nothing here yet. Add the first item above.</p>{/if}
    {#each items as item (item.id)}
      <article class:done={item.status === 'done'}>
        {#if active === 'tasks'}<button class="check" onclick={() => toggle(item)} aria-label="Toggle task">{item.status === 'done' ? '✓' : ''}</button>{/if}
        <div><h2>{itemTitle(item)}</h2><p>{itemDetail(item) || 'No details'}</p><small>{item.dueAt ?? item.startsAt ?? item.status ?? ''}</small></div>
        <button class="icon" onclick={() => remove(item.id)} aria-label="Delete item"><Trash2 size={15}/></button>
      </article>
    {/each}
  </section>
</div>

<style>
  .page{padding:var(--space-6);max-width:1100px;display:grid;gap:var(--space-5)} h1{margin:0;color:var(--text-primary);font-size:var(--text-2xl)} header p,.empty{color:var(--text-secondary);font-size:var(--text-sm);margin:.3rem 0 0} nav{display:flex;gap:.4rem;flex-wrap:wrap} nav button,.primary,.icon,.check{border:1px solid var(--surface-border);background:var(--surface-card);color:var(--text-secondary);border-radius:var(--radius-md);cursor:pointer} nav button{display:flex;gap:.45rem;align-items:center;padding:.55rem .8rem} nav button.active{background:var(--color-neutral-900);color:white}.composer{display:flex;gap:.6rem;flex-wrap:wrap}.composer input{flex:1;min-width:180px;border:1px solid var(--surface-border);background:var(--surface-card);color:var(--text-primary);border-radius:var(--radius-md);padding:.7rem}.primary{display:flex;align-items:center;gap:.35rem;padding:.65rem 1rem;background:var(--color-neutral-900);color:white}.primary:disabled{opacity:.4}.list{display:grid;gap:.6rem}article{display:flex;align-items:center;gap:.8rem;padding:1rem;background:var(--surface-card);border:1px solid var(--surface-border);border-radius:var(--radius-lg)}article>div{flex:1;min-width:0}article h2{font-size:var(--text-sm);margin:0;color:var(--text-primary)}article p,article small{display:block;margin:.25rem 0 0;color:var(--text-secondary);font-size:var(--text-xs)}article.done h2{text-decoration:line-through;color:var(--text-tertiary)}.icon,.check{width:32px;height:32px;display:grid;place-items:center}.check{border-radius:50%}.error{color:var(--color-error-500)}@media(max-width:640px){.page{padding:var(--space-4)}.composer{flex-direction:column}.composer input{min-width:0}}
</style>
