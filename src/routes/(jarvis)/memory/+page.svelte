<script>
  import { Database, Search, Plus, Tag, Clock } from 'lucide-svelte';

  let query = $state('');
  let selectedCategory = $state('all');

  const categories = [
    'all', 'user-profile', 'project', 'task', 'research', 'learning', 'decision', 'codebase'
  ];

  const sampleEntries = [
    {
      id: '1',
      category: 'codebase',
      content: 'J.A.R.V.I.S. is a SvelteKit 2.x + Svelte 5 project. It uses Tailwind CSS v4, Supabase, and adapter-vercel.',
      source: 'bootstrap',
      created_at: new Date(),
      tags: ['sveltekit', 'architecture'],
    },
    {
      id: '2',
      category: 'decision',
      content: 'Chose SvelteKit as the sole UI framework because it is already in place and provides SSR, form actions, and API routes.',
      source: 'bootstrap',
      created_at: new Date(),
      tags: ['framework', 'architecture'],
    },
  ];

  let filteredEntries = $derived(
    sampleEntries.filter(e => {
      const matchCat = selectedCategory === 'all' || e.category === selectedCategory;
      const matchQ = !query || e.content.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQ;
    })
  );
</script>

<div class="page">
  <div class="page-header">
    <div>
      <h1 class="page-title">Memory</h1>
      <p class="page-sub">{sampleEntries.length} entries · Supabase storage</p>
    </div>
    <button class="btn-outline" disabled>
      <Plus size={14} />
      Add Entry
    </button>
  </div>

  <!-- Search + filter -->
  <div class="search-bar">
    <div class="search-input-wrap">
      <Search size={14} class="search-icon" />
      <input
        type="text"
        class="search-input"
        placeholder="Search memory..."
        bind:value={query}
      />
    </div>
    <div class="category-tabs">
      {#each categories as cat}
        <button
          class="cat-tab"
          class:active={selectedCategory === cat}
          onclick={() => selectedCategory = cat}
        >
          {cat}
        </button>
      {/each}
    </div>
  </div>

  <!-- Results -->
  {#if filteredEntries.length === 0}
    <div class="empty-state">
      <Database size={32} />
      <p>No memories found.</p>
      <span>Memory will populate as you use J.A.R.V.I.S.</span>
    </div>
  {:else}
    <div class="entries-list">
      {#each filteredEntries as entry}
        <div class="entry-card">
          <div class="entry-header">
            <span class="entry-category">{entry.category}</span>
            <span class="entry-time">
              <Clock size={11} />
              {entry.created_at.toLocaleDateString()}
            </span>
          </div>
          <p class="entry-content">{entry.content}</p>
          <div class="entry-footer">
            <span class="entry-source">via {entry.source}</span>
            <div class="entry-tags">
              {#each entry.tags as tag}
                <span class="tag">
                  <Tag size={10} />
                  {tag}
                </span>
              {/each}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .page {
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-4);
    flex-wrap: wrap;
  }

  .page-title {
    font-size: var(--text-2xl);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin: 0;
  }

  .page-sub {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: var(--space-1) 0 0;
  }

  .btn-outline {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-md);
    background: transparent;
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--text-secondary);
    cursor: pointer;
    transition: background var(--transition-fast), color var(--transition-fast);
  }

  .btn-outline:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Search */
  .search-bar {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .search-input-wrap {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-3);
    max-width: 400px;
  }

  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: var(--text-sm);
    color: var(--text-primary);
  }

  .search-input::placeholder { color: var(--text-tertiary); }

  .category-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
  }

  .cat-tab {
    padding: var(--space-1) var(--space-3);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-full);
    background: transparent;
    font-size: var(--text-xs);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
    text-transform: capitalize;
  }

  .cat-tab:hover { background: var(--surface-border-subtle); }
  .cat-tab.active {
    background: var(--color-neutral-900);
    border-color: var(--color-neutral-900);
    color: var(--color-neutral-50);
  }

  /* Empty */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-16) 0;
    color: var(--text-tertiary);
    text-align: center;
  }

  .empty-state p { font-size: var(--text-sm); margin: 0; color: var(--text-secondary); }
  .empty-state span { font-size: var(--text-xs); }

  /* Entries */
  .entries-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .entry-card {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-lg);
    padding: var(--space-4) var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .entry-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .entry-category {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    text-transform: capitalize;
    padding: 2px var(--space-2);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-full);
  }

  .entry-time {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: var(--text-xs);
    color: var(--text-tertiary);
  }

  .entry-content {
    font-size: var(--text-sm);
    color: var(--text-primary);
    margin: 0;
    line-height: var(--leading-relaxed);
  }

  .entry-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .entry-source {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    font-family: var(--font-mono);
  }

  .entry-tags {
    display: flex;
    gap: var(--space-1);
    flex-wrap: wrap;
  }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    color: var(--text-tertiary);
    padding: 2px var(--space-2);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-full);
  }
</style>
