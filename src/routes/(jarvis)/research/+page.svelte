<script>
  import { Search, Rss, Plus, ExternalLink, Clock } from 'lucide-svelte';
</script>

<div class="page">
  <div class="page-header">
    <div>
      <h1 class="page-title">Research</h1>
      <p class="page-sub">AI news, model releases, papers, tools, and frameworks</p>
    </div>
    <button class="btn-outline" disabled>
      <Plus size={14} />
      New Research
    </button>
  </div>

  <div class="empty-state">
    <Rss size={40} />
    <h3>No research digests yet</h3>
    <p>The research dashboard will be available in Phase 8.</p>
    <p class="hint">Connect a model provider and web search to enable automatic AI news digests.</p>
  </div>
</div>

<style>
  .page { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-6); }
  .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4); flex-wrap: wrap; }
  .page-title { font-size: var(--text-2xl); font-weight: var(--font-semibold); color: var(--text-primary); margin: 0; }
  .page-sub { font-size: var(--text-sm); color: var(--text-secondary); margin: var(--space-1) 0 0; }
  .btn-outline {
    display: inline-flex; align-items: center; gap: var(--space-2);
    padding: var(--space-2) var(--space-4); border: 1px solid var(--surface-border);
    border-radius: var(--radius-md); background: transparent;
    font-size: var(--text-sm); font-weight: var(--font-medium); color: var(--text-secondary); cursor: pointer;
  }
  .btn-outline:disabled { opacity: 0.5; cursor: not-allowed; }
  .empty-state {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: var(--space-3); padding: var(--space-16) 0; color: var(--text-tertiary); text-align: center;
  }
  .empty-state h3 { font-size: var(--text-base); font-weight: var(--font-medium); color: var(--text-secondary); margin: 0; }
  .empty-state p { font-size: var(--text-sm); margin: 0; }
  .empty-state .hint { font-size: var(--text-xs); color: var(--text-tertiary); max-width: 320px; }
</style>
