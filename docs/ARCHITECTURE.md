# Architecture

## System Overview

Super J.A.R.V.I.S. is a SvelteKit 2.x application (Svelte 5 runes mode) that serves as the user interface and server-side logic layer for a local-first AI operating system.

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
│Providers │  │  (SQLite/ │  │  Registry   │
│(Ollama,  │  │  Supabase)│  │  + Factory  │
│OpenAI,   │  └───────────┘  └─────────────┘
│Gemini...)│
└──────────┘
```

---

## Directory Structure

```
src/
  lib/
    components/          # Shared UI — buttons, cards, modals, etc.
    jarvis/
      llm/               # Model provider abstraction
        providers/       # One file per provider
        router.ts        # Task-based model routing
        types.ts         # Provider interface types
        config.ts        # Runtime configuration
        capabilities.ts  # Model capability metadata
        prompts.ts       # Shared prompt templates
        errors.ts        # Typed LLM errors
      memory/            # Persistent memory system
        schema.ts        # Database schema definitions
        api.ts           # Memory CRUD API
        search.ts        # Memory search abstraction
        types.ts
      tools/             # Tool system
        registry.ts      # Tool registry (in-memory + persisted)
        schema.ts        # Zod tool manifest schema
        types.ts
        safe-tools/      # Pre-approved safe tools
      skills/            # Skill runtime
        registry.ts      # Skill registry
        types.ts
        loader.ts        # Load skill SKILL.md files
      automation/        # Scheduler and recurring jobs
        scheduler.ts
        types.ts
      research/          # Research system
        types.ts
      coding/            # Coding agent workflows
        scanner.ts
        types.ts
    styles/
      tokens.css         # Design tokens (CSS custom properties)
    types/               # Global shared types
    utils/               # Utility functions
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
      learning/          # Learning roadmap + progress
      settings/          # Providers, privacy, theme
    api/
      chat/              # Streaming chat endpoint
      memory/            # Memory REST API
      tools/             # Tool execution API
      research/          # Research API
      models/            # Model listing API

.claude/
  skills/                # 15 mandatory skill definitions
  agents/                # Subagent definitions
  hooks/                 # Hook scripts

docs/                    # All architecture + registry docs
scripts/ai/              # Validation + utility scripts
```

---

## Key Design Decisions

### Decision 1: SvelteKit as the sole UI framework
Rationale: Already in place. SvelteKit provides SSR, form actions, and API routes in one coherent system. No need to introduce a separate backend framework.

### Decision 2: Atomic local JSON as the default persistence layer
Rationale: Local-first must work without accounts, network access, or environment variables. The server serializes mutations and atomically replaces `.jarvis/workspace.json`. Supabase remains an optional future synchronization adapter, not a runtime requirement.

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
| Database | Atomic local JSON (`.jarvis/workspace.json`) |
| Optional sync | Supabase adapter scaffold |
| Adapter | @sveltejs/adapter-node |
| Validation | Zod |
| Build | Vite 8 |
| Runtime | Node.js (server) / Browser (client) |

---

## Current State

- UI: Functional workspace for chat, memory, tasks, notes, projects, calendar, research, tools, skills, automations, learning, settings, and repository intelligence.
- LLM core: Local-first task router with Ollama and OpenAI-compatible adapters plus opt-in cloud providers.
- Memory: Persistent local CRUD and search, independent of cloud configuration.
- Tools: Runtime registry, boundary-checked read tools, local creation tools, and execution audit.
- Skills: Discovers `SKILL.md` files and can generate validated skill scaffolds.
- Automation: Declarative local `task:` and `note:` actions with enable/disable and manual execution.
- Repository intelligence: Live file, route, dependency, extension, and command inventory.
- Safety: Level 2 actions use exact-input, one-time approvals and pre-mutation rollback journals. Level 3 remains fail-closed. All decisions and mutations generate audit events.
- App factory: Generates isolated Svelte 5/Vite applications under `generated-apps/` only after approval.
- Conversations: Complete sessions and model-run outcomes persist locally; explicit preference and goal phrases produce source-linked memories.
- Research intelligence: Model-assisted briefs are constrained to user-supplied source excerpts and must expose uncertainty when evidence is absent.
- Coding intelligence: Repository-aware prompts read at most eight explicitly selected, boundary-checked files and never mutate them.
- Proactive runtime: A Node-side scheduler wakes every 30 seconds, executes persisted due jobs once, advances `nextRunAt`, and emits local notifications.
- Daily planning: Deterministic briefings combine open/due tasks, next-24-hour events, and actionable recommendations without requiring a model.
- Memory retrieval: Offline relevance ranking blends expanded keyword overlap with recency and returns scored, source-preserving memories.
- Evaluation: Tool and model outcomes feed per-capability reliability metrics. Repeated evidence can generate deduplicated improvement proposals; humans approve or dismiss direction before any upgrade work begins.
