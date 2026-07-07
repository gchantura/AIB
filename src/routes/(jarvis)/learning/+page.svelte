<script>
  import { GraduationCap, TrendingUp, BookOpen, CheckCircle } from 'lucide-svelte';

  const skillMap = [
    { area: 'Foundation', items: ['LLM basics', 'Prompt engineering', 'API integration', 'Embeddings'], done: 0 },
    { area: 'Intermediate', items: ['RAG', 'Vector databases', 'Agent design', 'Evaluation', 'Fine-tuning'], done: 0 },
    { area: 'Advanced', items: ['Local LLM deployment', 'Multi-agent systems', 'Observability', 'Production deployment'], done: 0 },
    { area: 'Engineering', items: ['API design', 'Svelte AI apps', 'Testing AI systems', 'TypeScript + Python stack'], done: 0 },
  ];
</script>

<div class="page">
  <div class="page-header">
    <div>
      <h1 class="page-title">Learning</h1>
      <p class="page-sub">Senior AI Engineer roadmap · Track your progress</p>
    </div>
  </div>

  <div class="skill-areas">
    {#each skillMap as area}
      <div class="area-card">
        <div class="area-header">
          <h3 class="area-title">{area.area}</h3>
          <span class="area-progress">{area.done}/{area.items.length}</span>
        </div>
        <ul class="area-items">
          {#each area.items as item}
            <li class="area-item">
              <CheckCircle size={14} style="color: var(--text-disabled); flex-shrink: 0;" />
              <span>{item}</span>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>

  <div class="coming-soon">
    <TrendingUp size={20} />
    <span>Full learning planner with daily tasks and progress tracking is coming in Phase 8.</span>
  </div>
</div>

<style>
  .page { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-6); }
  .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4); }
  .page-title { font-size: var(--text-2xl); font-weight: var(--font-semibold); color: var(--text-primary); margin: 0; }
  .page-sub { font-size: var(--text-sm); color: var(--text-secondary); margin: var(--space-1) 0 0; }

  .skill-areas {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: var(--space-4);
  }

  .area-card {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-lg);
    padding: var(--space-5);
  }

  .area-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: var(--space-4);
  }

  .area-title { font-size: var(--text-sm); font-weight: var(--font-semibold); color: var(--text-primary); margin: 0; }
  .area-progress { font-size: var(--text-xs); color: var(--text-tertiary); }

  .area-items { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--space-2); }

  .area-item {
    display: flex; align-items: center; gap: var(--space-2);
    font-size: var(--text-xs); color: var(--text-secondary);
  }

  .check-icon { color: var(--text-disabled); flex-shrink: 0; }

  .coming-soon {
    display: flex; align-items: center; gap: var(--space-3);
    padding: var(--space-4) var(--space-5);
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-lg);
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }
</style>
