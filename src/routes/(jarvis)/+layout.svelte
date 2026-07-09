<script>
  import { page } from '$app/stores';
  import { resolve } from '$app/paths';
  import {
    LayoutDashboard,
    MessageSquare,
    Wrench,
    BookOpen,
    Database,
    Calendar,
    Search,
    GraduationCap,
    Settings,
    ChevronLeft,
    ChevronRight,
    Bot,
    Activity,
    Workflow,
    GitBranch,
    ShieldCheck,
    Code2,
    Bell,
    BarChart3,
    BookOpenText,
    Menu,
    X,
    Mic
  } from 'lucide-svelte';
  import Toaster from '$lib/components/Toaster.svelte';

  let { children } = $props();

  let collapsed = $state(false);
  let mobileOpen = $state(false);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/briefing', label: 'Briefing', icon: Bell },
    { href: '/chat', label: 'Chat', icon: MessageSquare },
    { href: '/voice', label: 'Voice AI', icon: Mic },
    { href: '/tools', label: 'Tools', icon: Wrench },
    { href: '/skills', label: 'Skills', icon: BookOpen },
    { href: '/memory', label: 'Memory', icon: Database },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/research', label: 'Research', icon: Search },
    { href: '/automations', label: 'Automations', icon: Workflow },
    { href: '/repository', label: 'Repository', icon: GitBranch },
    { href: '/coding', label: 'Coding', icon: Code2 },
    { href: '/safety', label: 'Safety', icon: ShieldCheck },
    { href: '/evaluation', label: 'Evaluation', icon: BarChart3 },
    { href: '/docs', label: 'Docs', icon: BookOpenText },
    { href: '/learning', label: 'Learning', icon: GraduationCap },
  ];

  function isActive(href) {
    return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
  }
</script>

<!-- Mobile overlay -->
{#if mobileOpen}
  <div
    class="fixed inset-0 z-20 bg-black/50 lg:hidden"
    role="button"
    tabindex="0"
    aria-label="Close menu"
    onclick={() => mobileOpen = false}
    onkeydown={(e) => e.key === 'Enter' && (mobileOpen = false)}
  ></div>
{/if}

<div class="jarvis-shell">
  <!-- Sidebar -->
  <aside
    class="jarvis-sidebar"
    class:collapsed
    class:mobile-open={mobileOpen}
  >
    <!-- Logo area -->
    <div class="sidebar-header">
      <div class="logo-mark">
        <Bot size={20} />
      </div>
      {#if !collapsed}
        <div class="logo-text">
          <span class="logo-name">J.A.R.V.I.S.</span>
          <span class="logo-sub">AI Operating System</span>
        </div>
      {/if}
      <button
        class="collapse-btn hidden lg:flex"
        onclick={() => collapsed = !collapsed}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {#if collapsed}
          <ChevronRight size={14} />
        {:else}
          <ChevronLeft size={14} />
        {/if}
      </button>
    </div>

    <!-- Nav items -->
    <nav class="sidebar-nav">
      {#each navItems as item (item.href)}
        <a
          href={resolve(item.href)}
          class="nav-item"
          class:active={isActive(item.href)}
          onclick={() => mobileOpen = false}
          title={collapsed ? item.label : undefined}
        >
          <span class="nav-icon">
            <item.icon size={18} />
          </span>
          {#if !collapsed}
            <span class="nav-label">{item.label}</span>
          {/if}
        </a>
      {/each}
    </nav>

    <!-- Bottom: settings -->
    <div class="sidebar-footer">
      <a
        href={resolve('/settings')}
        class="nav-item"
        class:active={isActive('/settings')}
        onclick={() => mobileOpen = false}
        title={collapsed ? 'Settings' : undefined}
      >
        <span class="nav-icon">
          <Settings size={18} />
        </span>
        {#if !collapsed}
          <span class="nav-label">Settings</span>
        {/if}
      </a>
      <!-- System status dot -->
      {#if !collapsed}
        <div class="status-row">
          <Activity size={12} />
          <span class="status-text">System ready</span>
          <span class="status-dot"></span>
        </div>
      {/if}
    </div>
  </aside>

  <!-- Main area -->
  <div class="jarvis-main">
    <!-- Mobile topbar -->
    <header class="mobile-topbar lg:hidden">
      <button
        class="mobile-menu-btn"
        onclick={() => mobileOpen = !mobileOpen}
        aria-label="Toggle menu"
      >
        {#if mobileOpen}
          <X size={20} />
        {:else}
          <Menu size={20} />
        {/if}
      </button>
      <div class="mobile-logo">
        <Bot size={18} />
        <span>J.A.R.V.I.S.</span>
      </div>
    </header>

    <!-- Page content -->
    <main class="page-content">
      {@render children()}
    </main>
  </div>
</div>

<Toaster />

<style>
  .jarvis-shell {
    display: flex;
    min-height: 100vh;
    background: var(--surface-bg);
  }

  /* ---- Sidebar ---- */
  .jarvis-sidebar {
    width: var(--sidebar-width);
    min-height: 100vh;
    background: var(--surface-sidebar);
    border-right: 1px solid var(--surface-border);
    display: flex;
    flex-direction: column;
    transition: width var(--transition-slow);
    position: fixed;
    top: 0;
    left: 0;
    z-index: 30;
    overflow: hidden;

    /* Mobile: hidden by default */
    transform: translateX(-100%);
  }

  @media (min-width: 1024px) {
    .jarvis-sidebar {
      position: sticky;
      transform: translateX(0);
      flex-shrink: 0;
    }
  }

  .jarvis-sidebar.mobile-open {
    transform: translateX(0);
  }

  .jarvis-sidebar.collapsed {
    width: var(--sidebar-width-collapsed);
  }

  /* ---- Sidebar header ---- */
  .sidebar-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-4);
    border-bottom: 1px solid var(--surface-border-subtle);
    min-height: var(--topbar-height);
    position: relative;
  }

  .logo-mark {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    background: var(--color-neutral-900);
    border: 1px solid var(--surface-border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    flex-shrink: 0;
  }

  .logo-text {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1;
  }

  .logo-name {
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  .logo-sub {
    font-size: 0.65rem;
    color: var(--text-tertiary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .collapse-btn {
    width: 22px;
    height: 22px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--surface-border);
    background: transparent;
    color: var(--text-tertiary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background var(--transition-fast), color var(--transition-fast);
    flex-shrink: 0;
  }

  .collapse-btn:hover {
    background: var(--surface-border-subtle);
    color: var(--text-primary);
  }

  /* ---- Nav ---- */
  .sidebar-nav {
    flex: 1;
    padding: var(--space-2) var(--space-2);
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow-y: auto;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    text-decoration: none;
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    transition: background var(--transition-fast), color var(--transition-fast);
    white-space: nowrap;
    overflow: hidden;
  }

  .nav-item:hover {
    background: var(--surface-border-subtle);
    color: var(--text-primary);
  }

  .nav-item.active {
    background: var(--surface-border-subtle);
    color: var(--text-primary);
  }

  .nav-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 20px;
    height: 20px;
  }

  .nav-label {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ---- Footer ---- */
  .sidebar-footer {
    padding: var(--space-2) var(--space-2) var(--space-4);
    border-top: 1px solid var(--surface-border-subtle);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .status-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: 0 var(--space-3);
    color: var(--text-tertiary);
    font-size: var(--text-xs);
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: var(--radius-full);
    background: var(--color-success-500);
    margin-left: auto;
  }

  .status-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ---- Main ---- */
  .jarvis-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;

    /* On desktop, offset by sidebar width */
    margin-left: 0;
  }

  @media (min-width: 1024px) {
    .jarvis-main {
      margin-left: 0; /* sidebar is sticky, not fixed on desktop */
    }
  }

  /* ---- Mobile topbar ---- */
  .mobile-topbar {
    height: var(--topbar-height);
    background: var(--surface-card);
    border-bottom: 1px solid var(--surface-border);
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: 0 var(--space-4);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .mobile-menu-btn {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    border: 1px solid var(--surface-border);
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background var(--transition-fast);
  }

  .mobile-menu-btn:hover {
    background: var(--surface-border-subtle);
  }

  .mobile-logo {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
  }

  /* ---- Page content ---- */
  .page-content {
    flex: 1;
    overflow-y: auto;
  }
</style>
