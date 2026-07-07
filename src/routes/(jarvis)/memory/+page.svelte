<script>
  import { onMount } from 'svelte';
  import { Database, Search, Plus, Tag, Clock, Loader, Trash2 } from 'lucide-svelte';

  let query = $state('');
  let selectedCategory = $state('all');
  let entries = $state([]);
  let loading = $state(true);
  let errorMsg = $state('');
  let totalCount = $state(0);

  const categories = [
    'all','user-profile','project','task','research','learning',
    'decision','codebase','conversation','daily-log','tool','skill','note',
  ];

  onMount(async () => {
    await loadEntries();
  });

  async function loadEntries() {
    loading = true;
    errorMsg = '';
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (query.trim()) params.set('q', query.trim());
      params.set('limit', '50');
      const res = await fetch(`/api/memory?${params}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      entries = data.entries ?? [];
      totalCount = data.total ?? entries.length;
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Failed to load memory';
    } finally {
      loading = false;
    }
  }

  async function deleteEntry(id) {
    const res = await fetch(`/api/memory/${id}`, { method: 'DELETE' });
    if (res.ok) entries = entries.filter(e => e.id !== id);
  }

  let searchTimeout;
  function onQueryChange() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(loadEntries, 300);
  }

  function onCategoryChange(cat) {
    selectedCategory = cat;
    loadEntries();
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
</script>

<div class="page">
  <div class="page-header">
    <div>
      <h1 class="page-title">Memory</h1>
      <p class="page-sub">{loading ? 'Loading...' : `${totalCount} entries · Supabase`}</p>
    </div>
  </div>

  <div class="search-bar">
    <div class="search-input-wrap">
      <Search size={14} />
      <input type="text" class="search-input" placeholder="Search memory..." bind:value={query} oninput={onQueryChange} />
    </div>
    <div class="category-tabs">
      {#each categories as cat}
        <button class="cat-tab" class:active={selectedCategory === cat} onclick={() => onCategoryChange(cat)}>{cat}</button>
      {/each}
    </div>
  </div>

  {#if loading}
    <div class="state-center">
      <Loader size={24} />
      <span>Loading memory...</span>
    </div>
  {:else if errorMsg}
    <div class="state-center error"><p>{errorMsg}</p></div>
  {:else if entries.length === 0}
    <div class="state-center">
      <Database size={32} />
      <p>No memories found.</p>
      <span>Memory populates as you use J.A.R.V.I.S.</span>
    </div>
  {:else}
    <div class="entries-list">
      {#each entries as entry}
        <div class="entry-card">
          <div class="entry-header">
            <span class="entry-category">{entry.category}</span>
            <div class="entry-meta">
              {#if entry.is_inferred}<span class="inferred-badge">inferred · {Math.round(entry.confidence * 100)}%</span>{/if}
              <span class="entry-time"><Clock size={11} />{formatDate(entry.created_at)}</span>
            </div>
          </div>
          <p class="entry-content">{entry.content}</p>
          <div class="entry-footer">
            <div class="entry-left">
              <span class="entry-source">{entry.source}</span>
              {#if entry.tags.length}
                <div class="entry-tags">
                  {#each entry.tags.slice(0, 4) as tag}
                    <span class="tag"><Tag size={10} />{tag}</span>
                  {/each}
                </div>
              {/if}
            </div>
            <button class="delete-btn" onclick={() => deleteEntry(entry.id)} aria-label="Delete memory entry" title="Delete"><Trash2 size={13} /></button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .page { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-6); }
  .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4); flex-wrap: wrap; }
  .page-title { font-size: var(--text-2xl); font-weight: var(--font-semibold); color: var(--text-primary); margin: 0; }
  .page-sub { font-size: var(--text-sm); color: var(--text-secondary); margin: var(--space-1) 0 0; }
  .search-bar { display: flex; flex-direction: column; gap: var(--space-3); }
  .search-input-wrap { display: flex; align-items: center; gap: var(--space-2); background: var(--surface-card); border: 1px solid var(--surface-border); border-radius: var(--radius-md); padding: var(--space-2) var(--space-3); max-width: 400px; color: var(--text-secondary); }
  .search-input { flex: 1; background: transparent; border: none; outline: none; font-size: var(--text-sm); color: var(--text-primary); }
  .search-input::placeholder { color: var(--text-tertiary); }
  .category-tabs { display: flex; flex-wrap: wrap; gap: var(--space-1); }
  .cat-tab { padding: var(--space-1) var(--space-3); border: 1px solid var(--surface-border); border-radius: var(--radius-full); background: transparent; font-size: var(--text-xs); color: var(--text-secondary); cursor: pointer; transition: all var(--transition-fast); text-transform: capitalize; }
  .cat-tab:hover { background: var(--surface-border-subtle); }
  .cat-tab.active { background: var(--color-neutral-900); border-color: var(--color-neutral-900); color: var(--color-neutral-50); }
  .state-center { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-2); padding: var(--space-16) 0; color: var(--text-tertiary); text-align: center; }
  .state-center p { font-size: var(--text-sm); margin: 0; color: var(--text-secondary); }
  .state-center span { font-size: var(--text-xs); }
  .state-center.error p { color: var(--color-error-500); }
  .entries-list { display: flex; flex-direction: column; gap: var(--space-3); }
  .entry-card { background: var(--surface-card); border: 1px solid var(--surface-border); border-radius: var(--radius-lg); padding: var(--space-4) var(--space-5); display: flex; flex-direction: column; gap: var(--space-2); transition: border-color var(--transition-fast); }
  .entry-card:hover { border-color: var(--color-neutral-300); }
  .entry-header { display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); flex-wrap: wrap; }
  .entry-category { font-size: var(--text-xs); color: var(--text-tertiary); text-transform: capitalize; padding: 2px var(--space-2); border: 1px solid var(--surface-border); border-radius: var(--radius-full); }
  .entry-meta { display: flex; align-items: center; gap: var(--space-3); }
  .inferred-badge { font-size: 10px; color: var(--text-tertiary); font-style: italic; }
  .entry-time { display: inline-flex; align-items: center; gap: 4px; font-size: var(--text-xs); color: var(--text-tertiary); }
  .entry-content { font-size: var(--text-sm); color: var(--text-primary); margin: 0; line-height: var(--leading-relaxed); }
  .entry-footer { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); flex-wrap: wrap; }
  .entry-left { display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; }
  .entry-source { font-size: var(--text-xs); color: var(--text-tertiary); font-family: var(--font-mono); }
  .entry-tags { display: flex; gap: var(--space-1); flex-wrap: wrap; }
  .tag { display: inline-flex; align-items: center; gap: 3px; font-size: 10px; color: var(--text-tertiary); padding: 2px var(--space-2); border: 1px solid var(--surface-border); border-radius: var(--radius-full); }
  .delete-btn { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--surface-border); border-radius: var(--radius-md); background: transparent; color: var(--text-tertiary); cursor: pointer; transition: background var(--transition-fast), color var(--transition-fast); flex-shrink: 0; }
  .delete-btn:hover { background: var(--color-error-100); color: var(--color-error-700); border-color: var(--color-error-500); }
</style>
