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

### Decision 2: Supabase as the local persistence layer
Rationale: Pre-configured in the environment. Provides PostgreSQL with RLS, real-time, and edge functions. All tables have RLS enabled. The memory system uses Supabase tables.

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
| Database | Supabase (PostgreSQL) |
| Adapter | @sveltejs/adapter-vercel |
| Validation | Zod |
| Build | Vite 8 |
| Runtime | Node.js (server) / Browser (client) |

---

## Current State

- UI: Minimal skeleton (layout + home page only).
- LLM Core: Not yet implemented (Phase 4).
- Memory: Not yet implemented (Phase 5).
- Tools: Not yet implemented (Phase 6).
- Main UI: Not yet implemented (Phase 7).
