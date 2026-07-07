<script>
  import { Settings, Cpu, Shield, Eye, EyeOff, ChevronRight } from 'lucide-svelte';

  const providers = [
    { id: 'ollama', name: 'Ollama', description: 'Local models via Ollama', url: 'http://localhost:11434', status: 'unconfigured', privacy: 'local' },
    { id: 'lm-studio', name: 'LM Studio', description: 'Local models via LM Studio', url: 'http://localhost:1234', status: 'unconfigured', privacy: 'local' },
    { id: 'openai', name: 'OpenAI', description: 'GPT-4o, GPT-4-turbo, etc.', url: 'https://api.openai.com', status: 'unconfigured', privacy: 'cloud' },
    { id: 'anthropic', name: 'Anthropic', description: 'Claude 3.5 Sonnet, Claude 3 Opus', url: 'https://api.anthropic.com', status: 'unconfigured', privacy: 'cloud' },
    { id: 'gemini', name: 'Google Gemini', description: 'Gemini 1.5 Pro, Gemini Flash', url: 'https://generativelanguage.googleapis.com', status: 'unconfigured', privacy: 'cloud' },
    { id: 'openrouter', name: 'OpenRouter', description: 'Multi-provider gateway', url: 'https://openrouter.ai', status: 'unconfigured', privacy: 'cloud' },
  ];

  const sections = [
    { id: 'providers', label: 'Model Providers', icon: Cpu },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Eye },
  ];

  let activeSection = $state('providers');
  let privacyMode = $state(true);
  let allowCloud = $state(false);
</script>

<div class="page">
  <div class="page-header">
    <div>
      <h1 class="page-title">Settings</h1>
      <p class="page-sub">Configure model providers, privacy, and system preferences</p>
    </div>
  </div>

  <div class="settings-layout">
    <!-- Left nav -->
    <nav class="settings-nav">
      {#each sections as section}
        <button
          class="settings-nav-item"
          class:active={activeSection === section.id}
          onclick={() => activeSection = section.id}
        >
          <section.icon size={15} />
          {section.label}
        </button>
      {/each}
    </nav>

    <!-- Content -->
    <div class="settings-content">
      {#if activeSection === 'providers'}
        <div class="section">
          <h2 class="section-title">Model Providers</h2>
          <p class="section-desc">Configure AI model providers. Local providers are always preferred.</p>

          <div class="providers-list">
            {#each providers as provider}
              <div class="provider-row">
                <div class="provider-info">
                  <div class="provider-name-row">
                    <span class="provider-name">{provider.name}</span>
                    <span class="privacy-badge {provider.privacy}">{provider.privacy}</span>
                  </div>
                  <span class="provider-desc">{provider.description}</span>
                </div>
                <div class="provider-actions">
                  <span class="provider-status">{provider.status}</span>
                  <button class="configure-btn" disabled>
                    Configure
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            {/each}
          </div>
        </div>

      {:else if activeSection === 'privacy'}
        <div class="section">
          <h2 class="section-title">Privacy</h2>
          <p class="section-desc">Control how J.A.R.V.I.S. handles data and external connections.</p>

          <div class="toggle-rows">
            <div class="toggle-row">
              <div class="toggle-info">
                <span class="toggle-label">Privacy Mode</span>
                <span class="toggle-desc">Only use local model providers. No cloud API calls.</span>
              </div>
              <button
                class="toggle-btn"
                class:on={privacyMode}
                onclick={() => privacyMode = !privacyMode}
                role="switch"
                aria-checked={privacyMode}
              >
                <span class="toggle-knob"></span>
              </button>
            </div>
            <div class="toggle-row">
              <div class="toggle-info">
                <span class="toggle-label">Allow Cloud Models</span>
                <span class="toggle-desc">Enable cloud providers when local models are unavailable.</span>
              </div>
              <button
                class="toggle-btn"
                class:on={allowCloud}
                onclick={() => allowCloud = !allowCloud}
                role="switch"
                aria-checked={allowCloud}
                disabled={privacyMode}
              >
                <span class="toggle-knob"></span>
              </button>
            </div>
          </div>
        </div>

      {:else if activeSection === 'appearance'}
        <div class="section">
          <h2 class="section-title">Appearance</h2>
          <p class="section-desc">Theme and display preferences. Follows system preference by default.</p>
          <div class="coming-soon">Appearance settings coming in Phase 7 completion.</div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .page { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-6); }
  .page-header {}
  .page-title { font-size: var(--text-2xl); font-weight: var(--font-semibold); color: var(--text-primary); margin: 0; }
  .page-sub { font-size: var(--text-sm); color: var(--text-secondary); margin: var(--space-1) 0 0; }

  .settings-layout {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: var(--space-6);
    align-items: start;
  }

  @media (max-width: 640px) {
    .settings-layout { grid-template-columns: 1fr; }
  }

  .settings-nav {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-lg);
    padding: var(--space-2);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .settings-nav-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    background: transparent;
    border: none;
    font-size: var(--text-sm);
    color: var(--text-secondary);
    cursor: pointer;
    text-align: left;
    transition: background var(--transition-fast), color var(--transition-fast);
  }

  .settings-nav-item:hover { background: var(--surface-border-subtle); color: var(--text-primary); }
  .settings-nav-item.active { background: var(--surface-border-subtle); color: var(--text-primary); font-weight: var(--font-medium); }

  .settings-content {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
  }

  .section { display: flex; flex-direction: column; gap: var(--space-4); }
  .section-title { font-size: var(--text-base); font-weight: var(--font-semibold); color: var(--text-primary); margin: 0; }
  .section-desc { font-size: var(--text-sm); color: var(--text-secondary); margin: 0; }

  /* Providers */
  .providers-list { display: flex; flex-direction: column; gap: var(--space-1); }

  .provider-row {
    display: flex; align-items: center; justify-content: space-between; gap: var(--space-4);
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-md);
    transition: background var(--transition-fast);
    flex-wrap: wrap;
  }

  .provider-row:hover { background: var(--surface-border-subtle); }

  .provider-info { display: flex; flex-direction: column; gap: 3px; }
  .provider-name-row { display: flex; align-items: center; gap: var(--space-2); }
  .provider-name { font-size: var(--text-sm); font-weight: var(--font-medium); color: var(--text-primary); }
  .privacy-badge {
    font-size: 10px; padding: 1px var(--space-2); border-radius: var(--radius-full);
    border: 1px solid var(--surface-border); color: var(--text-tertiary);
  }
  .privacy-badge.local { color: var(--color-success-700); border-color: var(--color-success-500); }
  .provider-desc { font-size: var(--text-xs); color: var(--text-secondary); }

  .provider-actions { display: flex; align-items: center; gap: var(--space-3); }
  .provider-status { font-size: var(--text-xs); color: var(--text-tertiary); }

  .configure-btn {
    display: inline-flex; align-items: center; gap: var(--space-1);
    padding: var(--space-1) var(--space-3); border: 1px solid var(--surface-border);
    border-radius: var(--radius-md); background: transparent;
    font-size: var(--text-xs); color: var(--text-secondary); cursor: pointer;
    transition: background var(--transition-fast);
  }
  .configure-btn:hover:not(:disabled) { background: var(--surface-border-subtle); }
  .configure-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Toggles */
  .toggle-rows { display: flex; flex-direction: column; gap: var(--space-4); }

  .toggle-row {
    display: flex; align-items: center; justify-content: space-between; gap: var(--space-4);
    padding: var(--space-4);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-md);
  }

  .toggle-info { display: flex; flex-direction: column; gap: 3px; }
  .toggle-label { font-size: var(--text-sm); font-weight: var(--font-medium); color: var(--text-primary); }
  .toggle-desc { font-size: var(--text-xs); color: var(--text-secondary); }

  .toggle-btn {
    width: 40px; height: 22px; border-radius: var(--radius-full);
    background: var(--surface-border); border: 1px solid var(--surface-border);
    cursor: pointer; position: relative; transition: background var(--transition-base);
    flex-shrink: 0;
  }

  .toggle-btn.on { background: var(--color-neutral-700); border-color: var(--color-neutral-700); }
  .toggle-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .toggle-knob {
    position: absolute; top: 2px; left: 2px;
    width: 16px; height: 16px; border-radius: var(--radius-full);
    background: var(--color-neutral-0);
    transition: transform var(--transition-base);
    box-shadow: var(--shadow-xs);
  }

  .toggle-btn.on .toggle-knob { transform: translateX(18px); }

  .coming-soon {
    font-size: var(--text-sm); color: var(--text-tertiary);
    padding: var(--space-4); border: 1px dashed var(--surface-border);
    border-radius: var(--radius-md); text-align: center;
  }
</style>
