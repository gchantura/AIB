# Repository Map

**Status:** Live manual map (Graphify remains optional)
**Last updated:** 2026-07-09 after full Supabase migration

## Runtime

SvelteKit 2 + Svelte 5 runs as a local Node application through `@sveltejs/adapter-node`. All workspace data is persisted in Supabase database tables (20 tables total) with RLS enabled. The local JSON store has been completely removed. The `snapshot()` function in `src/lib/jarvis/core/store.ts` loads all collections from Supabase in parallel. SMTP settings remain in `.jarvis/settings.json` (a local config file, not workspace data).

## Core modules

| Path | Responsibility |
|---|---|
| `src/lib/jarvis/core/` | Data types, Supabase-backed storage (snapshot, CRUD, audit, generic row helpers) |
| `src/lib/supabase.server.ts` | Server-side Supabase client singleton (reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`) |
| `src/lib/jarvis/llm/` | Provider interfaces, Ollama/OpenAI-compatible/Anthropic adapters and router |
| `src/lib/jarvis/memory/` | Memory CRUD and relevance retrieval |
| `src/lib/jarvis/tools/` | Tool registry and controlled execution |
| `src/lib/jarvis/skills/` | On-disk skill discovery and generation |
| `src/lib/jarvis/safety/` | One-time approvals and rollback journals |
| `src/lib/jarvis/automation/` | Restart-safe scheduler and notifications |
| `src/lib/jarvis/intelligence/` | Conversations, memory extraction and model-run history |
| `src/lib/jarvis/briefing/` | Offline daily planning |
| `src/lib/jarvis/core/settings.ts` | SMTP settings (local file `.jarvis/settings.json`) |
| `src/hooks.server.ts` | Starts the Node scheduler once per process |

## User interface

`src/routes/(jarvis)/` contains functional pages for dashboard, briefing, chat, workspace/calendar, memory, research, coding, repository intelligence, tools, skills, automations, safety, learning and settings. `+layout.svelte` owns responsive navigation.

## APIs

| Route family | Responsibility |
|---|---|
| `/api/chat`, `/api/models` | Streaming chat and provider health |
| `/api/conversations`, `/api/memory` | Durable conversations and memory |
| `/api/workspace` | Tasks, notes, projects, events, research, automation and learning CRUD |
| `/api/tools`, `/api/skills`, `/api/safety` | Capability registry, generation, approvals and rollback |
| `/api/automations`, `/api/notifications` | Scheduled execution and local alerts |
| `/api/repository` | Live repository inventory |
| `/api/intelligence/*` | Evidence-bound research, coding and briefings |

## Database tables (Supabase)

All tables use RLS with `TO anon, authenticated` (no-auth app, single-tenant).

| Table | Collection |
|---|---|
| `workspace_events` | Calendar events |
| `workspace_tasks` | Tasks |
| `workspace_notes` | Notes |
| `workspace_projects` | Projects |
| `workspace_research` | Research items |
| `workspace_automations` | Scheduled automations |
| `workspace_learning` | Learning items |
| `workspace_audit` | Audit event log |
| `workspace_generated_tools` | Dynamically registered tools |
| `workspace_generated_skills` | Dynamically generated skills |
| `workspace_memories` | Local memory entries |
| `workspace_approvals` | Tool approval requests |
| `workspace_rollbacks` | Rollback records |
| `workspace_conversations` | Chat conversations |
| `workspace_model_runs` | Model execution logs |
| `workspace_notifications` | User notifications |
| `workspace_briefings` | Daily briefings |
| `workspace_execution_metrics` | Execution metrics |
| `workspace_improvement_proposals` | Self-improvement proposals |
| `workspace_upgrade_plans` | Upgrade plans |

## Generated and private state

- `.jarvis/settings.json` stores SMTP configuration only (ignored by Git).
- `generated-apps/` is created only through an approved app-factory action.
- `.claude/skills/` contains readable skill definitions; generated skills are registered in the database.

## Validation

- `npm run check`: Svelte and TypeScript diagnostics.
- `npm run build`: production Node build and package validation.
- `npm run ai:validate`: operating-document, skill-registry, safety and secret checks.

## Known limitations

- Graphify is installed; `graphify-out/` contains the generated code graph. Run `npm run graph` to refresh.
- Gemini does not yet have a native adapter.
- Critical connectors such as email and publishing are not bundled yet; when added, they must use exact-input approval and audit.
- OS-native notifications and external calendar synchronization are future connectors.
