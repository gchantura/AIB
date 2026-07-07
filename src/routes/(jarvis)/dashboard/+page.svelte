<script>
  import {
    Activity,
    Bot,
    Cpu,
    Database,
    Wrench,
    BookOpen,
    CheckSquare,
    Clock,
    Zap,
    ArrowRight,
    TrendingUp,
    MessageSquare
  } from 'lucide-svelte';

  const modelStatus = {
    provider: 'Not configured',
    model: '—',
    status: 'offline',
    latency: null,
  };

  const quickStats = [
    { label: 'Tools', value: '0', icon: Wrench, href: '/tools' },
    { label: 'Skills', value: '15', icon: BookOpen, href: '/skills' },
    { label: 'Memories', value: '0', icon: Database, href: '/memory' },
    { label: 'Tasks', value: '0', icon: CheckSquare, href: '/calendar' },
  ];

  const recentActivity = [
    { text: 'J.A.R.V.I.S. operating layer initialized', time: 'Just now', type: 'system' },
    { text: '15 skills created in .claude/skills/', time: 'Just now', type: 'skill' },
    { text: 'Repository map generated', time: 'Just now', type: 'info' },
    { text: 'Safety policy configured', time: 'Just now', type: 'info' },
  ];

  const nextSteps = [
    { label: 'Configure a model provider', href: '/settings', description: 'Connect Ollama or an API key to start chatting' },
    { label: 'Explore your skills', href: '/skills', description: '15 skills are ready for use' },
    { label: 'Start a conversation', href: '/chat', description: 'Chat with J.A.R.V.I.S.' },
    { label: 'Build a tool', href: '/tools', description: 'Create your first local tool' },
  ];
</script>

<div class="dashboard">
  <!-- Header -->
  <div class="page-header">
    <div class="header-left">
      <h1 class="page-title">Dashboard</h1>
      <p class="page-sub">Good to have you back. Here's your system overview.</p>
    </div>
    <div class="header-right">
      <a href="/chat" class="btn-primary">
        <MessageSquare size={15} />
        New Chat
      </a>
    </div>
  </div>

  <!-- Model status banner -->
  <div class="model-banner">
    <div class="model-info">
      <div class="model-icon">
        <Bot size={18} />
      </div>
      <div class="model-details">
        <span class="model-label">AI Core</span>
        <span class="model-value">{modelStatus.provider} · {modelStatus.model}</span>
      </div>
    </div>
    <div class="model-status">
      <span class="status-badge offline">Offline — Configure in Settings</span>
      <a href="/settings" class="text-link">
        Configure
        <ArrowRight size={13} />
      </a>
    </div>
  </div>

  <!-- Quick stats -->
  <div class="stats-grid">
    {#each quickStats as stat}
      <a href={stat.href} class="stat-card">
        <div class="stat-icon">
          <stat.icon size={18} />
        </div>
        <div class="stat-body">
          <span class="stat-value">{stat.value}</span>
          <span class="stat-label">{stat.label}</span>
        </div>
      </a>
    {/each}
  </div>

  <!-- Two-column layout -->
  <div class="dashboard-cols">
    <!-- Left: Next steps -->
    <section class="card">
      <div class="card-header">
        <Zap size={16} />
        <h2 class="card-title">Next Steps</h2>
      </div>
      <div class="card-body">
        <ul class="step-list">
          {#each nextSteps as step, i}
            <li class="step-item">
              <span class="step-num">{i + 1}</span>
              <div class="step-content">
                <a href={step.href} class="step-label">{step.label}</a>
                <p class="step-desc">{step.description}</p>
              </div>
              <ArrowRight size={14} class="step-arrow" />
            </li>
          {/each}
        </ul>
      </div>
    </section>

    <!-- Right: Recent activity -->
    <section class="card">
      <div class="card-header">
        <Activity size={16} />
        <h2 class="card-title">Recent Activity</h2>
      </div>
      <div class="card-body">
        <ul class="activity-list">
          {#each recentActivity as item}
            <li class="activity-item">
              <div class="activity-dot {item.type}"></div>
              <div class="activity-content">
                <p class="activity-text">{item.text}</p>
                <span class="activity-time">
                  <Clock size={11} />
                  {item.time}
                </span>
              </div>
            </li>
          {/each}
        </ul>
      </div>
    </section>
  </div>

  <!-- Phase progress -->
  <section class="card phase-card">
    <div class="card-header">
      <TrendingUp size={16} />
      <h2 class="card-title">Build Progress</h2>
      <span class="phase-badge">Phase 1 Complete</span>
    </div>
    <div class="card-body">
      <div class="phase-grid">
        {#each [
          { num: 0, label: 'Inspect', done: true },
          { num: 1, label: 'Operating Layer', done: true },
          { num: 2, label: 'Repository Intelligence', done: true },
          { num: 3, label: 'Validation', done: true },
          { num: 4, label: 'Model Core', done: false },
          { num: 5, label: 'Memory Core', done: false },
          { num: 6, label: 'Tool Core', done: false },
          { num: 7, label: 'Main UI', done: false },
          { num: 8, label: 'First Tools', done: false },
          { num: 9, label: 'Automation', done: false },
          { num: 10, label: 'Self-Improvement', done: false },
        ] as phase}
          <div class="phase-item" class:done={phase.done}>
            <span class="phase-num">{phase.num}</span>
            <span class="phase-label">{phase.label}</span>
          </div>
        {/each}
      </div>
    </div>
  </section>
</div>

<style>
  .dashboard {
    padding: var(--space-6) var(--space-6);
    max-width: 1200px;
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  @media (max-width: 640px) {
    .dashboard {
      padding: var(--space-4);
    }
  }

  /* Header */
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
    line-height: var(--leading-tight);
  }

  .page-sub {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: var(--space-1) 0 0;
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    background: var(--color-neutral-900);
    color: var(--color-neutral-50);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    text-decoration: none;
    transition: background var(--transition-fast);
    border: 1px solid var(--color-neutral-800);
  }

  .btn-primary:hover {
    background: var(--color-neutral-800);
  }

  /* Model banner */
  .model-banner {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-lg);
    padding: var(--space-4) var(--space-5);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    flex-wrap: wrap;
  }

  .model-info {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .model-icon {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    background: var(--surface-border-subtle);
    border: 1px solid var(--surface-border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
  }

  .model-label {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    display: block;
  }

  .model-value {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--text-primary);
  }

  .model-status {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .status-badge {
    font-size: var(--text-xs);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-full);
    border: 1px solid var(--surface-border);
    color: var(--text-tertiary);
  }

  .text-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  .text-link:hover {
    color: var(--text-primary);
  }

  /* Stats */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-4);
  }

  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .stat-card {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-lg);
    padding: var(--space-4) var(--space-5);
    display: flex;
    align-items: center;
    gap: var(--space-3);
    text-decoration: none;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  }

  .stat-card:hover {
    border-color: var(--color-neutral-400);
    box-shadow: var(--shadow-xs);
  }

  .stat-icon {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    background: var(--surface-border-subtle);
    border: 1px solid var(--surface-border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    flex-shrink: 0;
  }

  .stat-body {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: var(--text-2xl);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    line-height: 1;
  }

  .stat-label {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    margin-top: 2px;
  }

  /* Dashboard columns */
  .dashboard-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
  }

  @media (max-width: 900px) {
    .dashboard-cols {
      grid-template-columns: 1fr;
    }
  }

  /* Card */
  .card {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-lg);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-4) var(--space-5);
    border-bottom: 1px solid var(--surface-border-subtle);
    color: var(--text-secondary);
  }

  .card-title {
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin: 0;
    flex: 1;
  }

  .card-body {
    padding: var(--space-4) var(--space-5);
  }

  /* Step list */
  .step-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .step-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .step-num {
    width: 24px;
    height: 24px;
    border-radius: var(--radius-full);
    border: 1px solid var(--surface-border);
    background: var(--surface-border-subtle);
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .step-content {
    flex: 1;
    min-width: 0;
  }

  .step-label {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--text-primary);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  .step-label:hover {
    color: var(--text-secondary);
  }

  .step-desc {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    margin: 2px 0 0;
  }

  .step-arrow {
    color: var(--text-tertiary);
    flex-shrink: 0;
  }

  /* Activity list */
  .activity-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .activity-item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .activity-dot {
    width: 8px;
    height: 8px;
    border-radius: var(--radius-full);
    flex-shrink: 0;
    margin-top: 5px;
    background: var(--color-neutral-400);
  }

  .activity-dot.system { background: var(--color-accent-500); }
  .activity-dot.skill { background: var(--color-neutral-500); }
  .activity-dot.info { background: var(--color-neutral-400); }

  .activity-text {
    font-size: var(--text-sm);
    color: var(--text-primary);
    margin: 0;
    line-height: var(--leading-tight);
  }

  .activity-time {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    margin-top: 3px;
  }

  /* Phase grid */
  .phase-card {}

  .phase-badge {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    padding: var(--space-1) var(--space-2);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-full);
  }

  .phase-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--space-2);
  }

  .phase-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    border: 1px solid var(--surface-border);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    transition: border-color var(--transition-fast);
  }

  .phase-item.done {
    border-color: var(--color-accent-500);
    color: var(--text-secondary);
    background: rgba(20, 184, 166, 0.04);
  }

  .phase-num {
    width: 18px;
    height: 18px;
    border-radius: var(--radius-full);
    border: 1px solid currentColor;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    flex-shrink: 0;
  }

  .phase-item.done .phase-num {
    background: var(--color-accent-500);
    border-color: var(--color-accent-500);
    color: white;
  }
</style>
