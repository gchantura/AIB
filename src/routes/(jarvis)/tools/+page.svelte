<script>
  import { onMount } from 'svelte';
  import { Wrench, Play, Plus, Shield, CheckCircle, XCircle, Loader, ChevronRight, Info } from 'lucide-svelte';

  let tools = $state([]);
  let selected = $state(null);
  let inputFields = $state({});
  let output = $state(null);
  let running = $state(false);
  let error = $state('');
  let showCreate = $state(false);
  let loading = $state(true);

  // Create form
  let newId = $state('');
  let newName = $state('');
  let newDesc = $state('');
  let newSafety = $state(1);
  let newCategory = $state('generated');
  let creating = $state(false);

  const safetyColors = ['success', 'info', 'warning', 'error'];
  const safetyLabels = ['Level 0 — Read-only', 'Level 1 — Local create', 'Level 2 — One-time approval', 'Level 3 — Explicit approval'];
  const safetyDesc = [
    'Safe to run any time. No side effects.',
    'Creates local data (tasks, notes). No file modifications.',
    'Modifies files. Requires one-time approval from the Safety page.',
    'High-risk action. Requires explicit approval before execution.'
  ];

  onMount(load);

  async function load() {
    loading = true;
    const r = await fetch('/api/tools');
    const d = await r.json();
    tools = d.tools ?? [];
    if (!selected && tools.length > 0) selected = tools[0];
    loading = false;
  }

  function selectTool(tool) {
    selected = tool;
    inputFields = {};
    output = null;
    error = '';
  }

  async function run() {
    if (!selected) return;
    if (selected.safetyLevel >= 2) {
      error = `This tool (Level ${selected.safetyLevel}) requires approval before running. Go to the Safety page to request and approve it, then execute from there.`;
      return;
    }
    running = true;
    error = '';
    output = null;
    try {
      const r = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: selected.id, input: inputFields })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      output = d.output;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      running = false;
    }
  }

  async function create() {
    if (!newId || !newName) return;
    creating = true;
    error = '';
    const r = await fetch('/api/tools', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ operation: 'register', tool: { id: newId, name: newName, description: newDesc, category: newCategory, safetyLevel: Number(newSafety) } })
    });
    const d = await r.json();
    if (!r.ok) { error = d.error; creating = false; return; }
    newId = newName = newDesc = '';
    newSafety = 1;
    showCreate = false;
    creating = false;
    await load();
  }

  function safetyColor(level) {
    return safetyColors[level] ?? 'info';
  }

  function getInputHint(id) {
    if (id === 'list-directory') return { path: 'src' };
    if (id === 'read-file') return { path: 'README.md' };
    if (id === 'summarize-project') return {};
    if (id === 'create-task') return { title: 'My new task', description: '', priority: 'medium' };
    if (id === 'create-note') return { title: 'My note', content: 'Content here' };
    return {};
  }

  function formatOutput(out) {
    try { return JSON.stringify(out, null, 2); } catch { return String(out); }
  }
</script>

<svelte:head><title>Tool Registry · J.A.R.V.I.S.</title></svelte:head>

<div class="page">
  <div class="page-header">
    <div class="header-left">
      <Wrench size={20} class="header-icon" />
      <div>
        <h1>Tool Registry</h1>
        <p>Boundary-checked capabilities with explicit safety levels and audit trails.</p>
      </div>
    </div>
    <button class="btn-outline" onclick={() => showCreate = !showCreate}>
      <Plus size={14}/> {showCreate ? 'Cancel' : 'Register Tool'}
    </button>
  </div>

  {#if showCreate}
    <div class="create-panel">
      <h2>Register a Tool Manifest</h2>
      <p>Tool manifests describe capabilities. Built-in logic handles execution; manifests control discovery and safety gating.</p>
      <div class="create-form">
        <div class="field">
          <label for="tool-id">Tool ID <span class="hint">lowercase, hyphens only</span></label>
          <input id="tool-id" bind:value={newId} placeholder="my-custom-tool"/>
        </div>
        <div class="field">
          <label for="tool-name">Display Name</label>
          <input id="tool-name" bind:value={newName} placeholder="My Custom Tool"/>
        </div>
        <div class="field full">
          <label for="tool-desc">Description</label>
          <input id="tool-desc" bind:value={newDesc} placeholder="What this tool does"/>
        </div>
        <div class="field">
          <label for="tool-cat">Category</label>
          <select id="tool-cat" bind:value={newCategory}>
            <option value="generated">Generated</option>
            <option value="file-operations">File Operations</option>
            <option value="productivity">Productivity</option>
            <option value="coding">Coding</option>
            <option value="meta">Meta</option>
          </select>
        </div>
        <div class="field">
          <label for="tool-safety">Safety Level</label>
          <select id="tool-safety" bind:value={newSafety}>
            {#each safetyLabels as label, i}
              <option value={i}>{label}</option>
            {/each}
          </select>
        </div>
        <div class="create-actions">
          <button class="btn-primary" onclick={create} disabled={!newId || !newName || creating}>
            {creating ? 'Registering…' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  {/if}

  {#if error}<div class="error-banner"><XCircle size={15}/>{error}</div>{/if}

  <div class="main-layout">
    <!-- Tool list -->
    <aside class="tool-list">
      {#if loading}
        <div class="loading"><Loader size={16}/> Loading tools…</div>
      {:else}
        {#each tools as tool (tool.id)}
          <button
            class="tool-item"
            class:active={selected?.id === tool.id}
            onclick={() => selectTool(tool)}
          >
            <div class="tool-header-row">
              <span class="tool-name">{tool.name}</span>
              <span class="safety-badge level-{tool.safetyLevel}">L{tool.safetyLevel}</span>
            </div>
            <span class="tool-desc">{tool.description}</span>
            <span class="tool-cat">{tool.category}</span>
          </button>
        {/each}
      {/if}
    </aside>

    <!-- Runner panel -->
    {#if selected}
      <div class="runner-panel">
        <div class="runner-header">
          <div>
            <h2>{selected.name}</h2>
            <p>{selected.description}</p>
          </div>
          <div class="safety-info level-{selected.safetyLevel}">
            <Shield size={14}/>
            <div>
              <strong>{safetyLabels[selected.safetyLevel]}</strong>
              <span>{safetyDesc[selected.safetyLevel]}</span>
            </div>
          </div>
        </div>

        {#if selected.safetyLevel >= 2}
          <div class="approval-notice">
            <Info size={15}/>
            <div>
              <strong>Approval Required</strong>
              <p>This tool requires a one-time approval. Go to <a href="/safety">Safety & Approvals</a> to request it, approve it, then execute from there.</p>
            </div>
          </div>
        {:else}
          <!-- Input section -->
          <div class="input-section">
            <h3>Input Parameters</h3>
            {#if Object.keys(getInputHint(selected.id)).length === 0}
              <p class="no-params">This tool takes no input parameters.</p>
            {:else}
              {#each Object.entries(getInputHint(selected.id)) as [key, defaultVal]}
                <div class="input-row">
                  <label for="param-{key}">{key}</label>
                  <input
                    id="param-{key}"
                    value={inputFields[key] ?? defaultVal}
                    oninput={(e) => inputFields[key] = e.target.value}
                    placeholder={String(defaultVal)}
                  />
                </div>
              {/each}
            {/if}
            <button class="btn-run" onclick={run} disabled={running}>
              {#if running}<Loader size={14}/>{:else}<Play size={14}/>{/if}
              {running ? 'Running…' : 'Run Tool'}
            </button>
          </div>

          {#if output !== null}
            <div class="output-section">
              <div class="output-header">
                <CheckCircle size={14} class="success-icon"/>
                <h3>Output</h3>
              </div>
              <pre class="output-pre">{formatOutput(output)}</pre>
            </div>
          {/if}
        {/if}
      </div>
    {:else if !loading}
      <div class="no-selection">
        <Wrench size={32}/>
        <p>Select a tool to run it</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .page { padding: var(--space-6); max-width: 1200px; display: flex; flex-direction: column; gap: var(--space-5); }
  .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4); flex-wrap: wrap; }
  .header-left { display: flex; align-items: flex-start; gap: var(--space-3); }
  h1 { margin: 0; font-size: var(--text-2xl); color: var(--text-primary); }
  .page-header p { margin: .3rem 0 0; color: var(--text-secondary); font-size: var(--text-sm); }

  .btn-outline { display: flex; align-items: center; gap: .4rem; padding: .55rem 1rem; border: 1px solid var(--surface-border); background: transparent; color: var(--text-secondary); border-radius: var(--radius-md); cursor: pointer; font-size: var(--text-sm); transition: background var(--transition-fast); }
  .btn-outline:hover { background: var(--surface-border-subtle); color: var(--text-primary); }

  .create-panel { background: var(--surface-card); border: 1px solid var(--surface-border); border-radius: var(--radius-lg); padding: var(--space-5); }
  .create-panel h2 { margin: 0 0 .3rem; font-size: var(--text-base); color: var(--text-primary); }
  .create-panel p { margin: 0 0 var(--space-4); font-size: var(--text-sm); color: var(--text-secondary); }
  .create-form { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
  .field { display: flex; flex-direction: column; gap: .4rem; }
  .field.full { grid-column: 1 / -1; }
  .field label { font-size: var(--text-xs); font-weight: var(--font-semibold); color: var(--text-secondary); }
  .hint { font-weight: var(--font-normal); color: var(--text-tertiary); margin-left: .3rem; }
  .field input,.field select { border: 1px solid var(--surface-border); background: var(--surface-bg); color: var(--text-primary); border-radius: var(--radius-md); padding: .6rem .8rem; font-size: var(--text-sm); }
  .create-actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; }
  .btn-primary { display: flex; align-items: center; gap: .4rem; padding: .6rem 1.2rem; background: var(--color-neutral-900); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; font-size: var(--text-sm); }
  .btn-primary:disabled { opacity: .5; cursor: not-allowed; }

  .error-banner { display: flex; align-items: flex-start; gap: .5rem; padding: var(--space-3) var(--space-4); background: rgba(239,68,68,.08); border: 1px solid var(--color-error-500); border-radius: var(--radius-md); color: var(--color-error-500); font-size: var(--text-sm); }

  .main-layout { display: grid; grid-template-columns: 300px 1fr; gap: var(--space-4); min-height: 400px; }
  @media (max-width: 800px) { .main-layout { grid-template-columns: 1fr; } }

  .tool-list { display: flex; flex-direction: column; gap: .3rem; }
  .loading { display: flex; align-items: center; gap: .5rem; color: var(--text-tertiary); font-size: var(--text-sm); padding: var(--space-4); }
  .tool-item { display: flex; flex-direction: column; gap: .2rem; text-align: left; padding: .75rem; border: 1px solid var(--surface-border); background: var(--surface-card); border-radius: var(--radius-md); cursor: pointer; transition: background var(--transition-fast), border-color var(--transition-fast); }
  .tool-item:hover { background: var(--surface-border-subtle); }
  .tool-item.active { border-color: var(--text-tertiary); background: var(--surface-border-subtle); }
  .tool-header-row { display: flex; align-items: center; justify-content: space-between; gap: .5rem; }
  .tool-name { font-size: var(--text-sm); font-weight: var(--font-medium); color: var(--text-primary); }
  .tool-desc { font-size: var(--text-xs); color: var(--text-secondary); }
  .tool-cat { font-size: 10px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: .05em; }
  .safety-badge { font-size: 10px; font-weight: var(--font-semibold); padding: 2px 6px; border-radius: var(--radius-full); border: 1px solid; }
  .safety-badge.level-0 { color: var(--color-success-700); border-color: var(--color-success-500); }
  .safety-badge.level-1 { color: var(--color-accent-500); border-color: var(--color-accent-500); }
  .safety-badge.level-2 { color: var(--color-warning-500, #f59e0b); border-color: var(--color-warning-500, #f59e0b); }
  .safety-badge.level-3 { color: var(--color-error-500); border-color: var(--color-error-500); }

  .runner-panel { background: var(--surface-card); border: 1px solid var(--surface-border); border-radius: var(--radius-lg); padding: var(--space-5); display: flex; flex-direction: column; gap: var(--space-4); }
  .runner-header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4); flex-wrap: wrap; }
  .runner-header h2 { margin: 0 0 .2rem; font-size: var(--text-lg); color: var(--text-primary); }
  .runner-header p { margin: 0; font-size: var(--text-sm); color: var(--text-secondary); }
  .safety-info { display: flex; align-items: flex-start; gap: .5rem; padding: .5rem .8rem; border-radius: var(--radius-md); border: 1px solid; font-size: var(--text-xs); max-width: 280px; }
  .safety-info strong { display: block; font-weight: var(--font-semibold); margin-bottom: 2px; }
  .safety-info span { color: var(--text-tertiary); }
  .safety-info.level-0 { color: var(--color-success-700); border-color: var(--color-success-500); background: rgba(34,197,94,.05); }
  .safety-info.level-1 { color: var(--color-accent-500); border-color: var(--color-accent-500); background: rgba(20,184,166,.05); }
  .safety-info.level-2 { color: var(--color-warning-500, #f59e0b); border-color: var(--color-warning-500, #f59e0b); background: rgba(245,158,11,.05); }
  .safety-info.level-3 { color: var(--color-error-500); border-color: var(--color-error-500); background: rgba(239,68,68,.05); }

  .approval-notice { display: flex; align-items: flex-start; gap: var(--space-3); padding: var(--space-4); background: rgba(245,158,11,.08); border: 1px solid var(--color-warning-500, #f59e0b); border-radius: var(--radius-md); color: var(--color-warning-500, #f59e0b); }
  .approval-notice div { flex: 1; }
  .approval-notice strong { display: block; font-size: var(--text-sm); margin-bottom: .3rem; }
  .approval-notice p { margin: 0; font-size: var(--text-sm); color: var(--text-secondary); }
  .approval-notice a { color: var(--color-accent-500); }

  .input-section { display: flex; flex-direction: column; gap: var(--space-3); }
  .input-section h3 { margin: 0; font-size: var(--text-sm); font-weight: var(--font-semibold); color: var(--text-secondary); text-transform: uppercase; letter-spacing: .04em; }
  .no-params { margin: 0; font-size: var(--text-sm); color: var(--text-tertiary); }
  .input-row { display: grid; grid-template-columns: 120px 1fr; align-items: center; gap: var(--space-3); }
  .input-row label { font-size: var(--text-xs); font-weight: var(--font-semibold); color: var(--text-secondary); font-family: var(--font-mono); }
  .input-row input { border: 1px solid var(--surface-border); background: var(--surface-bg); color: var(--text-primary); border-radius: var(--radius-md); padding: .55rem .8rem; font-size: var(--text-sm); font-family: var(--font-mono); }
  .btn-run { display: flex; align-items: center; justify-content: center; gap: .5rem; padding: .7rem 1.5rem; background: var(--color-neutral-900); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; font-size: var(--text-sm); font-weight: var(--font-medium); align-self: flex-start; transition: background var(--transition-fast); }
  .btn-run:hover:not(:disabled) { background: var(--color-neutral-700); }
  .btn-run:disabled { opacity: .5; cursor: not-allowed; }

  .output-section { display: flex; flex-direction: column; gap: var(--space-2); }
  .output-header { display: flex; align-items: center; gap: .5rem; }
  .output-header h3 { margin: 0; font-size: var(--text-sm); font-weight: var(--font-semibold); color: var(--text-secondary); }
  .output-pre { background: var(--surface-bg); border: 1px solid var(--surface-border); border-radius: var(--radius-md); padding: var(--space-4); font-family: var(--font-mono); font-size: var(--text-xs); line-height: 1.6; white-space: pre-wrap; word-break: break-word; max-height: 400px; overflow-y: auto; color: var(--text-primary); margin: 0; }

  .no-selection { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-3); color: var(--text-tertiary); background: var(--surface-card); border: 1px solid var(--surface-border); border-radius: var(--radius-lg); }
  .no-selection p { font-size: var(--text-sm); margin: 0; }
  @media (max-width: 640px) { .page { padding: var(--space-4); } .create-form { grid-template-columns: 1fr; } .input-row { grid-template-columns: 1fr; } }
</style>
