<script>
  import { onMount } from 'svelte';
  import { X, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-svelte';

  let visibleToasts = $state([]);
  let permission = $state('default');

  onMount(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      permission = Notification.permission;
      if (permission === 'default') {
        Notification.requestPermission().then(p => permission = p);
      }
    }

    const interval = setInterval(poll, 15000);
    poll();
    return () => clearInterval(interval);
  });

  async function poll() {
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) return;
      const data = await res.json();
      
      const unread = data.notifications.filter(n => !n.readAt);
      if (unread.length === 0) return;

      const idsToMark = unread.map(n => n.id);
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ids: idsToMark })
      });

      // Show desktop notifications if permitted
      if (permission === 'granted') {
        for (const n of unread) {
          new Notification('J.A.R.V.I.S.', { body: n.title + '\\n' + n.message });
        }
      }

      // Add to visible toasts array
      visibleToasts = [...visibleToasts, ...unread];
      
      // Auto-dismiss after 6 seconds
      for (const n of unread) {
        setTimeout(() => {
          dismiss(n.id);
        }, 6000);
      }
    } catch (err) {
      // ignore
    }
  }

  function dismiss(id) {
    visibleToasts = visibleToasts.filter(t => t.id !== id);
  }

  function getIcon(level) {
    if (level === 'success') return CheckCircle;
    if (level === 'warning') return AlertTriangle;
    if (level === 'error') return XCircle;
    return Info;
  }
</script>

<div class="toaster-container">
  {#each visibleToasts as toast (toast.id)}
    {@const Icon = getIcon(toast.level)}
    <div class="toast {toast.level}" role="alert">
      <div class="toast-icon">
        <Icon size={18} />
      </div>
      <div class="toast-content">
        <strong>{toast.title}</strong>
        <p>{toast.message}</p>
      </div>
      <button class="toast-close" onclick={() => dismiss(toast.id)} aria-label="Close">
        <X size={14} />
      </button>
    </div>
  {/each}
</div>

<style>
  .toaster-container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    z-index: 9999;
    pointer-events: none;
  }

  .toast {
    width: 320px;
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    pointer-events: auto;
    animation: slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .toast-icon {
    flex-shrink: 0;
    color: var(--text-secondary);
  }
  
  .toast.success .toast-icon { color: var(--color-success-500); }
  .toast.warning .toast-icon { color: var(--color-warning-500); }
  .toast.error .toast-icon { color: var(--color-error-500); }

  .toast-content {
    flex: 1;
    min-width: 0;
  }

  .toast-content strong {
    display: block;
    font-size: var(--text-sm);
    color: var(--text-primary);
    margin-bottom: 2px;
  }

  .toast-content p {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.4;
  }

  .toast-close {
    background: transparent;
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
    padding: 4px;
    border-radius: var(--radius-sm);
    flex-shrink: 0;
  }

  .toast-close:hover {
    background: var(--surface-border-subtle);
    color: var(--text-primary);
  }

  @keyframes slide-in {
    from { transform: translateX(120%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
</style>
