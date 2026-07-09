<script lang="ts">
  import Settings from 'lucide-svelte/icons/settings';
  import Cpu from 'lucide-svelte/icons/cpu';
  import Shield from 'lucide-svelte/icons/shield';
  import Eye from 'lucide-svelte/icons/eye';
  import ChevronRight from 'lucide-svelte/icons/chevron-right';
  import X from 'lucide-svelte/icons/x';
  import CircleCheck from 'lucide-svelte/icons/circle-check';

  type ProviderStatus = 'unconfigured' | 'configured' | 'offline' | 'environment';

  interface ProviderInfo {
    id: string;
    name: string;
    description: string;
    url: string;
    status: ProviderStatus;
    privacy: 'local' | 'cloud';
    fields: ('apiKey' | 'baseUrl')[];
    defaultBaseUrl?: string;
  }

  const providers: ProviderInfo[] = [
    { id: 'ollama', name: 'Ollama', description: 'Local models via Ollama', url: 'http://localhost:11434', status: 'unconfigured', privacy: 'local', fields: ['baseUrl'] },
    { id: 'lm-studio', name: 'LM Studio', description: 'Local models via LM Studio', url: 'http://localhost:1234', status: 'unconfigured', privacy: 'local', fields: ['baseUrl'] },
    { id: 'nvidia', name: 'NVIDIA NIM', description: 'Hosted OpenAI-compatible models, including GLM 5.2', url: 'https://integrate.api.nvidia.com', status: 'environment', privacy: 'cloud', fields: ['apiKey', 'baseUrl'], defaultBaseUrl: 'https://integrate.api.nvidia.com/v1' },
    { id: 'openai', name: 'OpenAI', description: 'GPT-4o, GPT-4-turbo, etc.', url: 'https://api.openai.com', status: 'unconfigured', privacy: 'cloud', fields: ['apiKey'], defaultBaseUrl: 'https://api.openai.com/v1' },
    { id: 'anthropic', name: 'Anthropic', description: 'Claude 3.5 Sonnet, Claude 3 Opus', url: 'https://api.anthropic.com', status: 'unconfigured', privacy: 'cloud', fields: ['apiKey'], defaultBaseUrl: 'https://api.anthropic.com/v1' },
    { id: 'gemini', name: 'Google Gemini', description: 'Gemini 1.5 Pro, Gemini Flash', url: 'https://generativelanguage.googleapis.com', status: 'unconfigured', privacy: 'cloud', fields: ['apiKey'], defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta' },
    { id: 'openrouter', name: 'OpenRouter', description: 'Multi-provider gateway', url: 'https://openrouter.ai', status: 'unconfigured', privacy: 'cloud', fields: ['apiKey'], defaultBaseUrl: 'https://openrouter.ai/api/v1' },
  ];

  const sections = [
    { id: 'providers', label: 'Model Providers', icon: Cpu },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Eye },
  ];

  let activeSection = $state('providers');
  let privacyMode = $state(true);
  let allowCloud = $state(false);

  // Reactive provider config state (loaded from localStorage)
  let providerConfig = $state<Record<string, { apiKey?: string; baseUrl?: string }>>({});
  let pendingProvider: ProviderInfo | null = $state(null);
  let configForm = $state<{ apiKey?: string; baseUrl?: string }>({});
  let isLoading = $state(false);

  // Load persisted config from localStorage on mount
  $effect(() => {
    const stored = localStorage.getItem('jarvis-provider-config');
    if (stored) {
      try { providerConfig = JSON.parse(stored); } catch { /* ignore */ }
    }
    const savedPrivacy = localStorage.getItem('jarvis-privacy-mode');
    if (savedPrivacy !== null) privacyMode = savedPrivacy === 'true';
    const savedCloud = localStorage.getItem('jarvis-allow-cloud');
    if (savedCloud !== null) allowCloud = savedCloud === 'true';
  });

  function configureProvider(provider: ProviderInfo) {
    pendingProvider = provider;
    configForm = {
      apiKey: providerConfig[provider.id]?.apiKey || '',
      baseUrl: providerConfig[provider.id]?.baseUrl || provider.defaultBaseUrl || provider.url,
    };
  }

  function closeModal() {
    pendingProvider = null;
    configForm = {};
  }

  async function saveConfig(providerId: string) {
    if (!configForm.apiKey?.trim()) {
      // No API key — mark as unconfigured but keep baseUrl
      const updated = { ...providerConfig };
      delete updated[providerId];
      providerConfig = updated;
      localStorage.setItem('jarvis-provider-config', JSON.stringify(providerConfig));
      closeModal();
      return;
    }

    const updated = { ...providerConfig, [providerId]: configForm };
    providerConfig = updated;
    localStorage.setItem('jarvis-provider-config', JSON.stringify(updated));

    // Check health if we have all required fields
    const p = providers.find((pr) => pr.id === providerId);
    if (p && configForm.apiKey?.trim() && (p.fields.includes('baseUrl') ? configForm.baseUrl?.trim() : true)) {
      isLoading = true;
      try {
        const urlToCheck = configForm.baseUrl || p.defaultBaseUrl || p.url;
        const res = await fetch(`${urlToCheck}/models`, {
          headers: { 'Authorization': `Bearer ${configForm.apiKey}` },
          signal: AbortSignal.timeout(5000),
        });
        // ok or 401 means the endpoint responds (key might be valid or needs validation at chat time)
        if (res.ok || res.status === 401) {
          isLoading = false;
          closeModal();
          return;
        }
      } catch { /* health check failed, still save config */ }
    }

    isLoading = false;
    closeModal();
  }

  function isConfigured(providerId: string): boolean {
    const cfg = providerConfig[providerId];
    return !!(cfg && cfg.apiKey);
  }

  function statusText(provider: ProviderInfo): string {
    if (isConfigured(provider.id)) return 'configured';
    return provider.status;
  }
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
      {#each sections as section (section.id)}
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
            {#each providers as provider (provider.id)}
              <div class="provider-row" class:configured-border={isConfigured(provider.id)}>
                <div class="provider-info">
                  <div class="provider-name-row">
                    <span class="provider-name">{provider.name}</span>
                    <span class="privacy-badge {provider.privacy}">{provider.privacy}</span>
                  </div>
                  <span class="provider-desc">{provider.description}</span>
                </div>
                <div class="provider-actions">
                  <span class="provider-status" class:configured={isConfigured(provider.id)}>{statusText(provider)}</span>
                  {#if isConfigured(provider.id)}
                    <CircleCheck size={14} class="config-check" />
                  {/if}
                  <button
                    class="configure-btn"
                    onclick={() => configureProvider(provider)}
                  >
                    {isConfigured(provider.id) ? 'Change' : 'Configure'}
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
                onclick={() => { privacyMode = !privacyMode; localStorage.setItem('jarvis-privacy-mode', String(privacyMode)); }}
                role="switch"
                aria-checked={privacyMode}
                aria-label="Toggle privacy mode"
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
                onclick={() => { allowCloud = !allowCloud; localStorage.setItem('jarvis-allow-cloud', String(allowCloud)); }}
                role="switch"
                aria-checked={allowCloud}
                disabled={privacyMode}
                aria-label="Toggle allow cloud models"
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
          <div class="coming-soon">Appearance customization is not implemented yet.</div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Configuration Modal — positioned outside .page for full-viewport overlay -->
</div>

{#if pendingProvider}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-overlay" onclick={closeModal}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <h3 class="modal-title">Configure {pendingProvider.name}</h3>
        <button class="modal-close" onclick={closeModal} aria-label="Close">
          <X size={18} />
        </button>
      </div>
      <div class="modal-body">
        <p class="modal-desc">{pendingProvider.description}</p>

        {#if pendingProvider!.fields.includes('apiKey')}
          <div class="form-group">
            <label class="form-label" for="api-key">API Key</label>
            <input
              id="api-key"
              class="form-input"
              type="password"
              placeholder="Enter your API key..."
              bind:value={configForm.apiKey}
              onkeydown={(e) => { if (e.key === 'Escape') closeModal(); }}
            />
          </div>
        {/if}

        {#if pendingProvider!.fields.includes('baseUrl')}
          <div class="form-group">
            <label class="form-label" for="base-url">Base URL</label>
            <input
              id="base-url"
              class="form-input"
              type="url"
              placeholder="http://localhost:..."
              bind:value={configForm.baseUrl}
              onkeydown={(e) => { if (e.key === 'Escape') closeModal(); }}
            />
          </div>
        {/if}
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" onclick={closeModal}>Cancel</button>
        <button class="btn-save" onclick={() => saveConfig(pendingProvider!.id)} disabled={isLoading}>
          {#if isLoading}
            Saving...
          {:else}
            Save
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .page { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-6); }
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
  .provider-status {
    font-size: var(--text-xs); color: var(--text-tertiary);
    text-transform: capitalize;
  }
  .provider-status.configured { color: var(--color-success-700); font-weight: var(--font-medium); }

  .config-check { color: var(--color-success-700); flex-shrink: 0; }

  .configure-btn {
    display: inline-flex; align-items: center; gap: var(--space-1);
    padding: var(--space-1) var(--space-3); border: 1px solid var(--surface-border);
    border-radius: var(--radius-md); background: transparent;
    font-size: var(--text-xs); color: var(--text-primary); cursor: pointer;
    transition: background var(--transition-fast), color var(--transition-fast);
  }
  .configure-btn:hover { background: var(--surface-border-subtle); }

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

  /* Modal — viewport-level overlay */
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.15s ease;
  }

  .modal {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-lg);
    width: min(420px, 90vw);
    max-height: 80vh;
    box-shadow: var(--shadow-lg);
    animation: slideUp 0.2s ease;
    display: flex;
    flex-direction: column;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

  .modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: var(--space-4) var(--space-4) 0;
  }

  .modal-title { font-size: var(--text-base); font-weight: var(--font-semibold); color: var(--text-primary); margin: 0; }

  .modal-close {
    background: transparent; border: none; color: var(--text-secondary);
    cursor: pointer; padding: 4px; border-radius: var(--radius-sm);
    transition: color var(--transition-fast), background var(--transition-fast);
  }
  .modal-close:hover { color: var(--text-primary); background: var(--surface-border-subtle); }

  .modal-body { padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3); overflow-y: auto; }
  .modal-desc { font-size: var(--text-sm); color: var(--text-secondary); margin: 0; }

  .form-group { display: flex; flex-direction: column; gap: 4px; }
  .form-label { font-size: var(--text-xs); font-weight: var(--font-medium); color: var(--text-secondary); }
  .form-input {
    padding: var(--space-2) var(--space-3); border: 1px solid var(--surface-border);
    border-radius: var(--radius-md); background: transparent;
    font-size: var(--text-sm); color: var(--text-primary);
    transition: border-color var(--transition-fast);
  }
  .form-input:focus { outline: none; border-color: var(--color-neutral-500); }

  .modal-footer {
    display: flex; justify-content: flex-end; gap: var(--space-2);
    padding: var(--space-3) var(--space-4); border-top: 1px solid var(--surface-border);
  }

  .btn-cancel, .btn-save {
    padding: var(--space-1) var(--space-4); border-radius: var(--radius-md);
    font-size: var(--text-sm); cursor: pointer; transition: background var(--transition-fast);
  }

  .btn-cancel {
    background: transparent; border: 1px solid var(--surface-border);
    color: var(--text-secondary);
  }
  .btn-cancel:hover { background: var(--surface-border-subtle); }

  .btn-save {
    background: var(--color-neutral-700); border: 1px solid var(--color-neutral-700);
    color: var(--color-neutral-0);
  }
  .btn-save:hover:not(:disabled) { opacity: 0.85; }
  .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
