# Repository Map

**Status:** Live manual map (Graphify remains optional)
**Last updated:** 2026-07-09 after Supabase workspace migration

## Runtime

SvelteKit 2 + Svelte 5 runs as a local Node application through `@sveltejs/adapter-node`. Workspace data (events, tasks, notes, projects) is persisted in Supabase tables (`workspace_events`, `workspace_tasks`, `workspace_notes`, `workspace_projects`) with RLS enabled. All other entity kinds (research, automations, learning, audit, conversations, notifications, etc.) remain in the local atomic JSON store at `.jarvis/workspace.json`. The `snapshot()` function in `src/lib/jarvis/core/store.ts` merges both sources.

## Core modules

| Path | Responsibility |
|---|---|
| `src/lib/jarvis/core/` | Data types, Supabase+local hybrid storage, CRUD and audit |
| `src/lib/supabase.server.ts` | Server-side Supabase client singleton (reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`) |
| `src/lib/jarvis/llm/` | Provider interfaces, Ollama/OpenAI-compatible/Anthropic adapters and router |
| `src/lib/jarvis/memory/` | Memory CRUD and relevance retrieval |
| `src/lib/jarvis/tools/` | Tool registry and controlled execution |
| `src/lib/jarvis/skills/` | On-disk skill discovery and generation |
| `src/lib/jarvis/safety/` | One-time approvals and rollback journals |
| `src/lib/jarvis/automation/` | Restart-safe scheduler and notifications |
| `src/lib/jarvis/intelligence/` | Conversations, memory extraction and model-run history |
| `src/lib/jarvis/briefing/` | Offline daily planning |
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

## Generated and private state

- `.jarvis/` contains local user data (non-workspace entities, audit log) and is ignored by Git.
- Supabase tables `workspace_events`, `workspace_tasks`, `workspace_notes`, `workspace_projects` store workspace data with RLS (anon + authenticated, no-auth app).
- `generated-apps/` is created only through an approved app-factory action.
- `.claude/skills/` contains readable skill definitions; generated skills are registered locally.

## Validation

- `npm run check`: Svelte and TypeScript diagnostics.
- `npm run build`: production Node build and package validation.
- `npm run ai:validate`: operating-document, skill-registry, safety and secret checks.

## Known limitations

- Graphify is installed; `graphify-out/` contains the generated code graph. Run `npm run graph` to refresh.
- Gemini does not yet have a native adapter.
- Critical connectors such as email and publishing are not bundled yet; when added, they must use exact-input approval and audit.
- OS-native notifications and external calendar synchronization are future connectors.
