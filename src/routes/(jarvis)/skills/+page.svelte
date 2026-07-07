<script>
  import { BookOpen, CheckCircle, ArrowRight } from 'lucide-svelte';

  const skills = [
    { id: 'skill-generator', name: 'Skill Generator', purpose: 'Create, improve, test, and register new skills.' },
    { id: 'graphify-navigator', name: 'Graphify Navigator', purpose: 'Use repository graph intelligence before modifying the repo.', degraded: true },
    { id: 'svelte-architect', name: 'Svelte Architect', purpose: 'Design maintainable SvelteKit architecture.' },
    { id: 'svelte-ui-engineer', name: 'Svelte UI Engineer', purpose: 'Build clean, responsive, accessible Svelte UI.' },
    { id: 'model-provider-engineer', name: 'Model Provider Engineer', purpose: 'Create model provider adapters.' },
    { id: 'memory-engineer', name: 'Memory Engineer', purpose: 'Design persistent local memory systems.' },
    { id: 'tool-factory-engineer', name: 'Tool Factory Engineer', purpose: 'Create new local tools from user requests.' },
    { id: 'app-factory-engineer', name: 'App Factory Engineer', purpose: 'Create Svelte-based local apps from templates.' },
    { id: 'automation-engineer', name: 'Automation Engineer', purpose: 'Create schedulers and safe automation flows.' },
    { id: 'ai-researcher', name: 'AI Researcher', purpose: 'Research topics, summarize sources, store digests.' },
    { id: 'coding-agent-engineer', name: 'Coding Agent Engineer', purpose: 'Build safe coding-agent workflows.' },
    { id: 'senior-ai-engineer-coach', name: 'Senior AI Engineer Coach', purpose: 'Create learning paths and career development.' },
    { id: 'safety-guardian', name: 'Safety Guardian', purpose: 'Prevent destructive actions and secret leaks.' },
    { id: 'validation-engineer', name: 'Validation Engineer', purpose: 'Create and run validation gates.' },
    { id: 'documentation-engineer', name: 'Documentation Engineer', purpose: 'Keep architecture docs and registries updated.' },
  ];
</script>

<div class="page">
  <div class="page-header">
    <div>
      <h1 class="page-title">Skills</h1>
      <p class="page-sub">{skills.length} skills active · stored in .claude/skills/</p>
    </div>
  </div>

  <div class="skills-list">
    {#each skills as skill}
      <div class="skill-row">
        <div class="skill-icon">
          <BookOpen size={15} />
        </div>
        <div class="skill-info">
          <div class="skill-name-row">
            <span class="skill-name">{skill.name}</span>
            {#if skill.degraded}
              <span class="degraded-badge">DEGRADED</span>
            {:else}
              <span class="active-badge">
                <CheckCircle size={11} />
                Active
              </span>
            {/if}
          </div>
          <p class="skill-purpose">{skill.purpose}</p>
        </div>
        <div class="skill-path">.claude/skills/{skill.id}/</div>
        <ArrowRight size={14} />
      </div>
    {/each}
  </div>
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

  .skills-list {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .skill-row {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-4) var(--space-5);
    border-bottom: 1px solid var(--surface-border-subtle);
    transition: background var(--transition-fast);
  }

  .skill-row:last-child {
    border-bottom: none;
  }

  .skill-row:hover {
    background: var(--surface-border-subtle);
  }

  .skill-icon {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    border: 1px solid var(--surface-border);
    background: var(--surface-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    flex-shrink: 0;
  }

  .skill-info {
    flex: 1;
    min-width: 0;
  }

  .skill-name-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .skill-name {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--text-primary);
  }

  .active-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    color: var(--color-success-500);
  }

  .degraded-badge {
    font-size: 10px;
    padding: 1px var(--space-2);
    border-radius: var(--radius-full);
    border: 1px solid var(--color-warning-500);
    color: var(--color-warning-700);
    background: var(--color-warning-100);
  }

  .skill-purpose {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    margin: 2px 0 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .skill-path {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    font-family: var(--font-mono);
    white-space: nowrap;
    display: none;
  }

  @media (min-width: 900px) {
    .skill-path { display: block; }
  }

  .skill-arrow { display: none; }
</style>
