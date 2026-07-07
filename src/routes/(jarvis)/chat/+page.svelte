<script>
  import { MessageSquare, Send, Bot, User, ChevronDown, Settings } from 'lucide-svelte';

  let messages = $state([
    {
      role: 'assistant',
      content: "Hello. I'm J.A.R.V.I.S. — your local AI operating system. I'm ready to help you build tools, research topics, manage tasks, and improve myself over time.\n\nTo get started, configure a model provider in Settings.",
      ts: new Date(),
    }
  ]);

  let input = $state('');
  let sending = $state(false);
  let selectedModel = $state('Not configured');

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;

    messages = [...messages, { role: 'user', content: text, ts: new Date() }];
    input = '';
    sending = true;

    // Placeholder: model not yet wired
    await new Promise(r => setTimeout(r, 600));
    messages = [...messages, {
      role: 'assistant',
      content: 'Model provider not configured. Please go to Settings and connect a local model (Ollama recommended) or add an API key.',
      ts: new Date(),
    }];
    sending = false;
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function formatTime(d) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
</script>

<div class="chat-page">
  <!-- Topbar -->
  <div class="chat-topbar">
    <div class="topbar-left">
      <MessageSquare size={16} />
      <h1 class="chat-title">Chat</h1>
    </div>
    <div class="topbar-right">
      <button class="model-selector">
        <Bot size={14} />
        <span>{selectedModel}</span>
        <ChevronDown size={13} />
      </button>
      <a href="/settings" class="icon-btn" title="Model settings">
        <Settings size={16} />
      </a>
    </div>
  </div>

  <!-- Messages -->
  <div class="messages-area">
    {#each messages as msg}
      <div class="message {msg.role}">
        <div class="message-avatar">
          {#if msg.role === 'assistant'}
            <Bot size={15} />
          {:else}
            <User size={15} />
          {/if}
        </div>
        <div class="message-body">
          <div class="message-header">
            <span class="message-author">{msg.role === 'assistant' ? 'J.A.R.V.I.S.' : 'You'}</span>
            <span class="message-time">{formatTime(msg.ts)}</span>
          </div>
          <div class="message-content">
            {msg.content}
          </div>
        </div>
      </div>
    {/each}

    {#if sending}
      <div class="message assistant">
        <div class="message-avatar">
          <Bot size={15} />
        </div>
        <div class="message-body">
          <div class="message-header">
            <span class="message-author">J.A.R.V.I.S.</span>
          </div>
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!-- Input area -->
  <div class="input-area">
    <div class="input-box">
      <textarea
        class="message-input"
        placeholder="Message J.A.R.V.I.S. ..."
        rows="1"
        bind:value={input}
        onkeydown={handleKeydown}
        disabled={sending}
      ></textarea>
      <button
        class="send-btn"
        onclick={sendMessage}
        disabled={!input.trim() || sending}
        aria-label="Send message"
      >
        <Send size={15} />
      </button>
    </div>
    <p class="input-hint">Press Enter to send · Shift+Enter for new line</p>
  </div>
</div>

<style>
  .chat-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-height: 100vh;
    overflow: hidden;
  }

  @media (max-width: 1023px) {
    .chat-page {
      height: calc(100vh - var(--topbar-height));
    }
  }

  /* Topbar */
  .chat-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--space-6);
    height: var(--topbar-height);
    border-bottom: 1px solid var(--surface-border);
    background: var(--surface-card);
    flex-shrink: 0;
  }

  .topbar-left {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--text-secondary);
  }

  .chat-title {
    font-size: var(--text-base);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin: 0;
  }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .model-selector {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-md);
    background: transparent;
    font-size: var(--text-xs);
    color: var(--text-secondary);
    cursor: pointer;
    transition: background var(--transition-fast);
  }

  .model-selector:hover {
    background: var(--surface-border-subtle);
  }

  .icon-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    text-decoration: none;
    transition: background var(--transition-fast), color var(--transition-fast);
  }

  .icon-btn:hover {
    background: var(--surface-border-subtle);
    color: var(--text-primary);
  }

  /* Messages */
  .messages-area {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .message {
    display: flex;
    gap: var(--space-3);
    align-items: flex-start;
  }

  .message-avatar {
    width: 28px;
    height: 28px;
    border-radius: var(--radius-full);
    border: 1px solid var(--surface-border);
    background: var(--surface-border-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    flex-shrink: 0;
    margin-top: 2px;
  }

  .message.user .message-avatar {
    background: var(--color-neutral-200);
  }

  .message-body {
    flex: 1;
    min-width: 0;
  }

  .message-header {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    margin-bottom: var(--space-1);
  }

  .message-author {
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
    color: var(--text-secondary);
  }

  .message-time {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
  }

  .message-content {
    font-size: var(--text-sm);
    color: var(--text-primary);
    line-height: var(--leading-relaxed);
    white-space: pre-wrap;
  }

  /* Typing indicator */
  .typing-indicator {
    display: flex;
    gap: 4px;
    padding: var(--space-1) 0;
  }

  .typing-indicator span {
    width: 6px;
    height: 6px;
    border-radius: var(--radius-full);
    background: var(--text-tertiary);
    animation: bounce 1.2s ease-in-out infinite;
  }

  .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
  .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-4px); }
  }

  /* Input area */
  .input-area {
    padding: var(--space-4) var(--space-6);
    border-top: 1px solid var(--surface-border);
    background: var(--surface-card);
    flex-shrink: 0;
  }

  .input-box {
    display: flex;
    align-items: flex-end;
    gap: var(--space-2);
    background: var(--surface-bg);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-lg);
    padding: var(--space-2) var(--space-3);
    transition: border-color var(--transition-fast);
  }

  .input-box:focus-within {
    border-color: var(--color-neutral-400);
  }

  .message-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    color: var(--text-primary);
    resize: none;
    line-height: var(--leading-relaxed);
    max-height: 120px;
    overflow-y: auto;
  }

  .message-input::placeholder {
    color: var(--text-tertiary);
  }

  .send-btn {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    border: none;
    background: var(--color-neutral-900);
    color: var(--color-neutral-50);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background var(--transition-fast);
    flex-shrink: 0;
  }

  .send-btn:hover:not(:disabled) {
    background: var(--color-neutral-700);
  }

  .send-btn:disabled {
    background: var(--surface-border);
    color: var(--text-disabled);
    cursor: not-allowed;
  }

  .input-hint {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    margin: var(--space-1) 0 0;
    text-align: center;
  }
</style>
