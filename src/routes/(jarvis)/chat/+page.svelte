<script>
  import { onMount } from 'svelte';
  import { resolve } from '$app/paths';
  import { MessageSquare, Send, Bot, User, ChevronDown, Settings, AlertCircle, Plus } from 'lucide-svelte';

  let messages = $state([
    {
      role: 'assistant',
      content: "Hello. I'm J.A.R.V.I.S. — the AI operating system for this workspace. I know this repository's architecture, capabilities, local memory, tools, safety boundaries, and current roadmap. Ask me about the project or give me work to do.",
      ts: new Date(),
      error: false,
    },
  ]);

  let input = $state('');
  let sending = $state(false);
  let providers = $state([]);
  let selectedProviderId = $state('');
  let selectedModel = $state('');
  let dropdownOpen = $state(false);
  let messagesEl = $state(null);
  let conversationId = $state('');

  const activeProvider = $derived(providers.find(p => p.id === selectedProviderId));
  const displayLabel = $derived(
    activeProvider?.online
      ? `${activeProvider.name} · ${selectedModel || '—'}`
      : providers.some(p => p.online)
        ? providers.find(p => p.online).name
        : 'No provider'
  );

  onMount(async () => {
    await Promise.all([loadProviders(), loadLatestConversation()]);
  });

  async function loadLatestConversation() {
    const res = await fetch('/api/conversations'); if (!res.ok) return; const data = await res.json(); const latest = data.conversations?.[0]; if (!latest) return;
    const detail = await fetch(`/api/conversations?id=${latest.id}`).then((response) => response.json()); if (!detail.conversation) return;
    conversationId = detail.conversation.id; messages = detail.conversation.messages.map((message) => ({ ...message, ts: new Date(message.at), error: false }));
  }

  function newConversation() { conversationId = ''; messages = [{ role: 'assistant', content: 'New conversation started. Durable preferences and goals you explicitly ask me to remember will be saved locally.', ts: new Date(), error: false }]; }

  async function loadProviders() {
    try {
      const res = await fetch('/api/models');
      if (!res.ok) return;
      const data = await res.json();
      providers = data.providers ?? [];
      const first = providers.find(p => p.online);
      if (first) {
        selectedProviderId = first.id;
        selectedModel = first.models?.[0] ?? '';
      }
    } catch { /* offline */ }
  }

  function scrollToBottom() {
    if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  function messagesArea(node) { messagesEl = node; return () => { if (messagesEl === node) messagesEl = null; }; }

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;
    messages = [...messages, { role: 'user', content: text, ts: new Date(), error: false }];
    input = '';
    sending = true;
    const provider = providers.find(p => p.online);
    if (!provider) {
      messages = [...messages, { role: 'assistant', content: 'No model provider is online. Please start Ollama or configure a provider in Settings.', ts: new Date(), error: true }];
      sending = false;
      return;
    }
    const placeholderIdx = messages.length;
    messages = [...messages, { role: 'assistant', content: '', ts: new Date(), error: false }];
    setTimeout(scrollToBottom, 10);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.filter((_, i) => i < placeholderIdx).map(m => ({ role: m.role, content: m.content })),
          model: selectedModel || undefined,
          stream: true,
          conversationId: conversationId || undefined,
        }),
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        messages = messages.map((m, i) => i === placeholderIdx ? { ...m, content: err.error ?? 'Request failed', error: true } : m);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        for (const line of text.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const raw = trimmed.slice(6);
          if (raw === '[DONE]') break;
          try {
            const chunk = JSON.parse(raw);
            if (chunk.conversationId) conversationId = chunk.conversationId;
            if (chunk.error) { messages = messages.map((m, i) => i === placeholderIdx ? { ...m, content: chunk.error, error: true } : m); break; }
            if (chunk.content) { accumulated += chunk.content; messages = messages.map((m, i) => i === placeholderIdx ? { ...m, content: accumulated } : m); scrollToBottom(); }
          } catch { /* partial */ }
        }
      }
    } catch {
      messages = messages.map((m, i) => i === placeholderIdx ? { ...m, content: 'Connection error. Is the dev server running?', error: true } : m);
    } finally {
      sending = false;
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function formatTime(d) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function selectModel(providerId, model) {
    selectedProviderId = providerId;
    selectedModel = model;
    dropdownOpen = false;
  }
</script>

<div class="chat-page">
  <div class="chat-topbar">
    <div class="topbar-left">
      <MessageSquare size={16} />
      <h1 class="chat-title">Chat</h1>
    </div>
    <div class="topbar-right">
      <button class="icon-btn" onclick={newConversation} title="New conversation" aria-label="New conversation"><Plus size={16} /></button>
      <div class="model-selector-wrap">
        <button class="model-selector" onclick={() => dropdownOpen = !dropdownOpen} aria-label="Select model" aria-expanded={dropdownOpen}>
          <Bot size={14} />
          <span class="model-label">{displayLabel}</span>
          <span class="status-dot" class:online={providers.some(p => p.online)}></span>
          <ChevronDown size={12} />
        </button>
        {#if dropdownOpen}
          <div class="model-dropdown">
            {#if providers.length === 0}
              <div class="dropdown-empty"><AlertCircle size={14} />No providers detected</div>
            {:else}
              {#each providers as provider (provider.id)}
                <div class="dropdown-group">
                  <div class="dropdown-provider">
                    <span class="provider-dot" class:online={provider.online}></span>
                    {provider.name}
                    {#if provider.latencyMs}<span class="latency">{provider.latencyMs}ms</span>{/if}
                  </div>
                  {#if provider.online && provider.models?.length}
                    {#each provider.models as model (model)}
                      <button class="dropdown-model" class:selected={selectedProviderId === provider.id && selectedModel === model} onclick={() => selectModel(provider.id, model)}>{model}</button>
                    {/each}
                  {:else if !provider.online}
                    <div class="dropdown-offline">Offline</div>
                  {/if}
                </div>
              {/each}
            {/if}
            <div class="dropdown-footer">
              <a href={resolve('/settings')} onclick={() => dropdownOpen = false}>Manage providers</a>
            </div>
          </div>
        {/if}
      </div>
      <a href={resolve('/settings')} class="icon-btn" title="Settings"><Settings size={16} /></a>
    </div>
  </div>

  <div class="messages-area" {@attach messagesArea}>
    {#each messages as msg, i (msg.id ?? i)}
      <div class="message {msg.role}" class:error-msg={msg.error}>
        <div class="message-avatar">
          {#if msg.role === 'assistant'}<Bot size={15} />{:else}<User size={15} />{/if}
        </div>
        <div class="message-body">
          <div class="message-header">
            <span class="message-author">{msg.role === 'assistant' ? 'J.A.R.V.I.S.' : 'You'}</span>
            <span class="message-time">{formatTime(msg.ts)}</span>
          </div>
          <div class="message-content">
            {#if msg.content === '' && msg.role === 'assistant'}
              <div class="typing-indicator"><span></span><span></span><span></span></div>
            {:else}
              {msg.content}
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>

  <div class="input-area">
    <div class="input-box" class:disabled={sending}>
      <textarea class="message-input" placeholder="Message J.A.R.V.I.S. ..." rows="1" bind:value={input} onkeydown={handleKeydown} disabled={sending}></textarea>
      <button class="send-btn" onclick={sendMessage} disabled={!input.trim() || sending} aria-label="Send message"><Send size={15} /></button>
    </div>
    <p class="input-hint">Enter to send · Shift+Enter for new line</p>
  </div>
</div>

{#if dropdownOpen}
  <div class="dropdown-backdrop" role="button" tabindex="-1" aria-label="Close" onclick={() => dropdownOpen = false} onkeydown={() => {}}></div>
{/if}

<style>
  .chat-page { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
  @media (max-width: 1023px) { .chat-page { height: calc(100vh - var(--topbar-height)); } }
  .chat-topbar { display: flex; align-items: center; justify-content: space-between; padding: 0 var(--space-6); height: var(--topbar-height); border-bottom: 1px solid var(--surface-border); background: var(--surface-card); flex-shrink: 0; gap: var(--space-4); }
  .topbar-left { display: flex; align-items: center; gap: var(--space-2); color: var(--text-secondary); }
  .chat-title { font-size: var(--text-base); font-weight: var(--font-semibold); color: var(--text-primary); margin: 0; }
  .topbar-right { display: flex; align-items: center; gap: var(--space-2); }
  .model-selector-wrap { position: relative; }
  .model-selector { display: inline-flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-3); border: 1px solid var(--surface-border); border-radius: var(--radius-md); background: transparent; font-size: var(--text-xs); color: var(--text-secondary); cursor: pointer; transition: background var(--transition-fast); max-width: 220px; }
  .model-selector:hover { background: var(--surface-border-subtle); }
  .model-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px; }
  .status-dot { width: 6px; height: 6px; border-radius: var(--radius-full); background: var(--color-neutral-400); flex-shrink: 0; }
  .status-dot.online { background: var(--color-success-500); }
  .model-dropdown { position: absolute; top: calc(100% + 4px); right: 0; z-index: 50; background: var(--surface-card); border: 1px solid var(--surface-border); border-radius: var(--radius-lg); box-shadow: var(--shadow-md); min-width: 220px; max-width: 280px; overflow: hidden; }
  .dropdown-empty { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-4); font-size: var(--text-xs); color: var(--text-tertiary); }
  .dropdown-group { padding: var(--space-2); border-bottom: 1px solid var(--surface-border-subtle); }
  .dropdown-group:last-of-type { border-bottom: none; }
  .dropdown-provider { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-xs); font-weight: var(--font-semibold); color: var(--text-secondary); padding: var(--space-1) var(--space-2); }
  .provider-dot { width: 6px; height: 6px; border-radius: var(--radius-full); background: var(--color-neutral-400); flex-shrink: 0; }
  .provider-dot.online { background: var(--color-success-500); }
  .latency { margin-left: auto; font-size: 10px; color: var(--text-tertiary); font-weight: var(--font-normal); }
  .dropdown-model { display: block; width: 100%; text-align: left; padding: var(--space-2) var(--space-3); border: none; background: transparent; font-size: var(--text-xs); color: var(--text-primary); cursor: pointer; border-radius: var(--radius-sm); transition: background var(--transition-fast); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dropdown-model:hover { background: var(--surface-border-subtle); }
  .dropdown-model.selected { background: var(--surface-border-subtle); font-weight: var(--font-medium); }
  .dropdown-offline { font-size: var(--text-xs); color: var(--text-tertiary); padding: var(--space-2) var(--space-3); }
  .dropdown-footer { padding: var(--space-2) var(--space-3); border-top: 1px solid var(--surface-border-subtle); }
  .dropdown-footer a { font-size: var(--text-xs); color: var(--text-tertiary); text-decoration: none; transition: color var(--transition-fast); }
  .dropdown-footer a:hover { color: var(--text-primary); }
  .dropdown-backdrop { position: fixed; inset: 0; z-index: 49; }
  .icon-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--surface-border); border-radius: var(--radius-md); color: var(--text-secondary); text-decoration: none; transition: background var(--transition-fast), color var(--transition-fast); }
  .icon-btn:hover { background: var(--surface-border-subtle); color: var(--text-primary); }
  .messages-area { flex: 1; overflow-y: auto; padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-5); }
  .message { display: flex; gap: var(--space-3); align-items: flex-start; }
  .message-avatar { width: 28px; height: 28px; border-radius: var(--radius-full); border: 1px solid var(--surface-border); background: var(--surface-border-subtle); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); flex-shrink: 0; margin-top: 2px; }
  .message.user .message-avatar { background: var(--color-neutral-200); }
  .message-body { flex: 1; min-width: 0; }
  .message-header { display: flex; align-items: baseline; gap: var(--space-2); margin-bottom: var(--space-1); }
  .message-author { font-size: var(--text-xs); font-weight: var(--font-semibold); color: var(--text-secondary); }
  .message-time { font-size: var(--text-xs); color: var(--text-tertiary); }
  .message-content { font-size: var(--text-sm); color: var(--text-primary); line-height: var(--leading-relaxed); white-space: pre-wrap; }
  .error-msg .message-content { color: var(--color-error-500); }
  .typing-indicator { display: flex; gap: 4px; padding: var(--space-1) 0; }
  .typing-indicator span { width: 6px; height: 6px; border-radius: var(--radius-full); background: var(--text-tertiary); animation: bounce 1.2s ease-in-out infinite; }
  .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
  .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }
  .input-area { padding: var(--space-4) var(--space-6); border-top: 1px solid var(--surface-border); background: var(--surface-card); flex-shrink: 0; }
  .input-box { display: flex; align-items: flex-end; gap: var(--space-2); background: var(--surface-bg); border: 1px solid var(--surface-border); border-radius: var(--radius-lg); padding: var(--space-2) var(--space-3); transition: border-color var(--transition-fast); }
  .input-box:focus-within { border-color: var(--color-neutral-400); }
  .input-box.disabled { opacity: 0.6; }
  .message-input { flex: 1; background: transparent; border: none; outline: none; font-family: var(--font-sans); font-size: var(--text-sm); color: var(--text-primary); resize: none; line-height: var(--leading-relaxed); max-height: 120px; overflow-y: auto; }
  .message-input::placeholder { color: var(--text-tertiary); }
  .send-btn { width: 32px; height: 32px; border-radius: var(--radius-md); border: none; background: var(--color-neutral-900); color: var(--color-neutral-50); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background var(--transition-fast); flex-shrink: 0; }
  .send-btn:hover:not(:disabled) { background: var(--color-neutral-700); }
  .send-btn:disabled { background: var(--surface-border); color: var(--text-disabled); cursor: not-allowed; }
  .input-hint { font-size: var(--text-xs); color: var(--text-tertiary); margin: var(--space-1) 0 0; text-align: center; }
</style>
