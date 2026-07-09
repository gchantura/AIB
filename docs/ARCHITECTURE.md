# Architecture

## System Overview

Super J.A.R.V.I.S. is a SvelteKit 2.x application (Svelte 5 runes mode) that serves as the user interface and server-side logic layer for a database-backed AI operating system.

---

## Layer Diagram

```
┌─────────────────────────────────────────────────────┐
│                 Svelte/SvelteKit UI                 │
│  Dashboard · Chat · Tools · Skills · Memory · More  │
└──────────────────────┬──────────────────────────────┘
                       │ SvelteKit routes + actions
┌──────────────────────▼──────────────────────────────┐
│              J.A.R.V.I.S. Core (src/lib/jarvis/)    │
│  LLM Router · Memory · Tools · Skills · Automation  │
└──────┬──────────────┬──────────────┬────────────────┘
       │              │              │
┌──────▼───┐  ┌───────▼───┐  ┌──────▼──────┐
│  LLM     │  │  Memory   │  │  Tools      │
│Providers │  │ (Supabase) │  │  Registry   │
│(Ollama,  │  └───────────┘  │  + Factory  │
│OpenAI,   │                  └─────────────┘
│Gemini...)│
└──────▼───┘
       │
┌──────▼──────────────────────────────────────────────┐
│              Supabase Database (20 tables)           │
│  Events · Tasks · Notes · Projects · Research ·     │
│  Automations · Learning · Audit · Tools · Skills ·  │
│  Memories · Approvals · Rollbacks · Conversations · │
│  ModelRuns · Notifications · Briefings · Metrics ·   │
│  Proposals · UpgradePlans                            │
└─────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
src/
  lib/
    components/          # Shared UI — Toaster
    jarvis/
      core/              # Types, Supabase-backed store, settings
        store.ts         # snapshot(), record(), CRUD, generic row helpers
        types.ts         # All entity interfaces
        settings.ts      # SMTP settings (local file only)
      llm/               # Model provider abstraction
        providers/       # Ollama, OpenAI-compatible, Anthropic
        router.ts        # Task-based model routing
        types.ts         # Provider interface types
        config.ts        # Runtime configuration
        errors.ts        # Typed LLM errors
      memory/            # Persistent memory system
        api.ts            # Memory CRUD (Supabase)
        relevance.ts     # Offline relevance ranking
        types.ts
      tools/             # Tool system
        runtime.ts       # Registry + controlled execution
      skills/            # Skill runtime
        runtime.ts       # Discovery + generation
      safety/            # Approvals + rollback
        runtime.ts
      automation/        # Scheduler, notifications, email
        runtime.ts
        email.ts
      intelligence/      # Conversations, model runs, memory extraction
        runtime.ts
      briefing/          # Daily planning
        runtime.ts
      evaluation/        # Metrics, proposals, upgrade plans
        runtime.ts
        upgrades.ts
    styles/
      tokens.css         # Design tokens (CSS custom properties)
    supabase.server.ts  # Server-side Supabase client singleton
    supabase.ts         # Client-side Supabase client
  routes/
    (jarvis)/            # Main layout group
      +layout.svelte     # Shell: sidebar nav + main content
      dashboard/         # Daily summary, tasks, model status
      chat/              # Chat console
      tools/             # Tool list + tool pages
      skills/            # Skill list
      memory/            # Memory explorer
      calendar/          # Calendar + reminders
      research/          # AI research dashboard
      coding/            # Coding assistant
      learning/          # Learning roadmap + progress
      automations/       # Scheduler dashboard
      safety/            # Approvals + rollback
      evaluation/        # Metrics + proposals
      briefing/          # Daily briefing
      repository/        # Repository intelligence
      docs/              # System documentation
      settings/          # Providers, privacy, SMTP
    api/                 # REST API endpoints
      chat/              # Streaming chat
      conversations/     # Conversation CRUD
      memory/            # Memory REST API
      workspace/         # Entity CRUD (7 kinds)
      tools/             # Tool execution API
      skills/            # Skill API
      safety/            # Approval + rollback API
      models/            # Model listing API
      notifications/     # Notification API
      automations/       # Automation run API
      repository/        # Repository inventory API
      settings/          # Settings API
      evaluation/        # Evaluation API
      upgrades/          # Upgrade plan API
      intelligence/      # Research, coding, briefing APIs

.claude/
  skills/                # 15 skill definitions (SKILL.md)
  agents/                # Subagent definitions
  hooks/                 # Hook scripts

docs/                    # Architecture + registry docs
scripts/ai/              # Validation script
```

---

## Key Design Decisions

### Decision 1: SvelteKit as the sole UI framework
Rationale: Already in place. SvelteKit provides SSR, form actions, and API routes in one coherent system. No need to introduce a separate backend framework.

### Decision 2: Supabase as the sole persistence layer
Rationale: All workspace data — events, tasks, notes, projects, research, automations, learning, audit log, memories, approvals, rollbacks, conversations, model runs, notifications, briefings, execution metrics, improvement proposals, and upgrade plans — is persisted in 20 Supabase tables with RLS enabled. The local JSON store (`.jarvis/workspace.json`) has been completely removed. The `snapshot()` function loads all collections from Supabase in a single parallel batch. Only SMTP settings remain in a local file (`.jarvis/settings.json`).

### Decision 3: Provider abstraction before first model call
Rationale: Hardcoding Anthropic, OpenAI, or Ollama creates lock-in. The router pattern allows switching providers per task without changing application code.

### Decision 4: Skills stored as SKILL.md files in .claude/skills/
Rationale: Skills are instructions for Claude Code, not runtime code. Storing them as markdown makes them readable, diffable, and improvable by the agent itself.

### Decision 5: Lucide icons, no colorful buttons
Rationale: Minimalistic design requirement. Neutral tones, clean whitespace, no visual noise.

---

## Technology Stack

| Layer | Technology |
|---|---|
| UI Framework | SvelteKit 2.x + Svelte 5 |
| Styling | Tailwind CSS v4 |
| Icons | lucide-svelte |
| Package Manager | npm |
| Database | Supabase (20 tables, all RLS-enabled) |
| RLS | Enabled on all tables (anon + authenticated, no-auth app) |
| Adapter | @sveltejs/adapter-node |
| Validation | Zod |
| Build | Vite 8 |
| Runtime | Node.js (server) / Browser (client) |

---

## Current State

- UI: Functional workspace for chat, memory, tasks, notes, projects, calendar, research, tools, skills, automations, learning, settings, and repository intelligence.
- LLM core: Local-first task router with Ollama and OpenAI-compatible adapters plus opt-in cloud providers.
- Memory: Persistent CRUD and search via Supabase, independent of cloud configuration.
- Tools: Runtime registry, boundary-checked read tools, local creation tools, and execution audit.
- Skills: Discovers `SKILL.md` files and can generate validated skill scaffolds.
- Automation: Declarative `task:` and `note:` actions with enable/disable and manual execution.
- Repository intelligence: Live file, route, dependency, extension, and command inventory.
- Safety: Repository-changing and critical actions use exact-input, one-time approvals and pre-mutation rollback journals where possible. All decisions and mutations generate audit events.
- App factory: Generates isolated Svelte 5/Vite applications under `generated-apps/` only after approval.
- Conversations: Complete sessions and model-run outcomes persist in Supabase; explicit preference and goal phrases produce source-linked memories.
- Research intelligence: Model-assisted briefs are constrained to user-supplied source excerpts and must expose uncertainty when evidence is absent.
- Coding intelligence: Repository-aware prompts read at most eight explicitly selected, boundary-checked files and never mutate them.
- Proactive runtime: A Node-side scheduler wakes every 30 seconds, executes persisted due jobs once, advances `nextRunAt`, and emits local notifications.
- Daily planning: Deterministic briefings combine open/due tasks, next-24-hour events, and actionable recommendations without requiring a model.
- Memory retrieval: Offline relevance ranking blends expanded keyword overlap with recency and returns scored, source-preserving memories.
- Evaluation: Tool and model outcomes feed per-capability reliability metrics. Repeated evidence can generate deduplicated improvement proposals; humans approve or dismiss direction before any upgrade work begins.
