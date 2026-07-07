# Repository Map

**Status:** Live manual map (Graphify remains optional)
**Last updated:** 2026-07-07 after proactive-operations milestone

## Runtime

SvelteKit 2 + Svelte 5 runs as a local Node application through `@sveltejs/adapter-node`. User state is persisted atomically in ignored `.jarvis/workspace.json`. Supabase files remain an optional adapter scaffold and are not required for local operation.

## Core modules

| Path | Responsibility |
|---|---|
| `src/lib/jarvis/core/` | Data types, atomic storage, CRUD and audit |
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

- `.jarvis/` contains local user data and is ignored by Git.
- `generated-apps/` is created only through an approved app-factory action.
- `.claude/skills/` contains readable skill definitions; generated skills are registered locally.

## Validation

- `npm run check`: Svelte and TypeScript diagnostics.
- `npm run build`: production Node build and package validation.
- `npm run ai:validate`: operating-document, skill-registry, safety and secret checks.

## Known limitations

- Graphify is not installed; `/repository` provides live inventory rather than a full dependency graph.
- Gemini does not yet have a native adapter.
- Level 3 execution remains disabled.
- OS-native notifications and external calendar synchronization are future connectors.
