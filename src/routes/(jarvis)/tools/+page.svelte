<script>
  import { Wrench, Plus, ArrowRight, Shield, CheckCircle, Clock, AlertCircle } from 'lucide-svelte';

  const tools = [
    {
      id: 'list-directory',
      name: 'List Directory',
      description: 'List files and folders in a directory.',
      category: 'file-operations',
      safetyLevel: 0,
      status: 'planned',
    },
    {
      id: 'read-file',
      name: 'Read File',
      description: 'Read the contents of a file.',
      category: 'file-operations',
      safetyLevel: 0,
      status: 'planned',
    },
    {
      id: 'create-task',
      name: 'Create Task',
      description: 'Create a new task in the task list.',
      category: 'productivity',
      safetyLevel: 1,
      status: 'planned',
    },
    {
      id: 'create-note',
      name: 'Create Note',
      description: 'Save a note to persistent memory.',
      category: 'productivity',
      safetyLevel: 1,
      status: 'planned',
    },
    {
      id: 'search-memory',
      name: 'Search Memory',
      description: 'Search across all memory categories.',
      category: 'database',
      safetyLevel: 0,
      status: 'planned',
    },
    {
      id: 'save-memory',
      name: 'Save Memory',
      description: 'Save a new entry to persistent memory.',
      category: 'database',
      safetyLevel: 1,
      status: 'planned',
    },
  ];

  const safetyLabels = { 0: 'Safe', 1: 'Inform', 2: 'Confirm', 3: 'Approval' };
  const statusIcons = { planned: Clock, passing: CheckCircle, failing: AlertCircle };
</script>

<div class="page">
  <div class="page-header">
    <div>
      <h1 class="page-title">Tools</h1>
      <p class="page-sub">{tools.length} tools registered · {tools.filter(t => t.status === 'passing').length} active</p>
    </div>
    <button class="btn-outline" disabled>
      <Plus size={14} />
      New Tool
    </button>
  </div>

  <!-- Tool grid -->
  <div class="tools-grid">
    {#each tools as tool}
      <div class="tool-card">
        <div class="tool-header">
          <div class="tool-icon">
            <Wrench size={15} />
          </div>
          <div class="tool-meta">
            <span class="tool-category">{tool.category}</span>
            <span class="safety-badge level-{tool.safetyLevel}">
              <Shield size={10} />
              {safetyLabels[tool.safetyLevel]}
            </span>
          </div>
        </div>
        <h3 class="tool-name">{tool.name}</h3>
        <p class="tool-desc">{tool.description}</p>
        <div class="tool-footer">
          <span class="status-chip {tool.status}">
            <svelte:component this={statusIcons[tool.status]} size={11} />
            {tool.status}
          </span>
          <ArrowRight size={13} class="tool-arrow" />
        </div>
      </div>
    {/each}

    <!-- Add tool placeholder -->
    <div class="tool-card add-card">
      <div class="add-inner">
        <Plus size={20} />
        <span>Create a Tool</span>
        <p>Turn any repeatable task into a registered J.A.R.V.I.S. tool</p>
      </div>
    </div>
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

  .btn-outline:hover:not(:disabled) {
    background: var(--surface-border-subtle);
    color: var(--text-primary);
  }

  .btn-outline:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: var(--space-4);
  }

  .tool-card {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-lg);
    padding: var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  }

  .tool-card:hover {
    border-color: var(--color-neutral-300);
    box-shadow: var(--shadow-xs);
  }

  .tool-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .tool-icon {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    border: 1px solid var(--surface-border);
    background: var(--surface-border-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
  }

  .tool-meta {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .tool-category {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
  }

  .safety-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    padding: 2px var(--space-2);
    border-radius: var(--radius-full);
    border: 1px solid var(--surface-border);
    color: var(--text-tertiary);
  }

  .tool-name {
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin: 0;
  }

  .tool-desc {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    margin: 0;
    flex: 1;
    line-height: var(--leading-relaxed);
  }

  .tool-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .status-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: var(--text-xs);
    color: var(--text-tertiary);
  }

  .status-chip.passing { color: var(--color-success-500); }
  .status-chip.failing { color: var(--color-error-500); }

  .tool-arrow { color: var(--text-tertiary); }

  .add-card {
    border-style: dashed;
    cursor: pointer;
  }

  .add-card:hover {
    border-style: dashed;
    border-color: var(--color-neutral-400);
  }

  .add-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: var(--space-2);
    padding: var(--space-6) 0;
    color: var(--text-tertiary);
    flex: 1;
  }

  .add-inner span {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--text-secondary);
  }

  .add-inner p {
    font-size: var(--text-xs);
    margin: 0;
    max-width: 200px;
  }
</style>
