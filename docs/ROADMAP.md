# Roadmap

## Vision

Super J.A.R.V.I.S. becomes a fully operational local AI operating system accessible through a Svelte interface. The user can chat with it, build tools with it, learn from it, automate their workflow through it, and watch it improve itself over time.

---

## Phase Status

| Phase | Name | Status | Notes |
|---|---|---|---|
| 0 | Inspect | COMPLETE | Repository inspected, environment documented |
| 1 | Operating Layer | COMPLETE | CLAUDE.md, docs, skills, safety, self-improvement log |
| 2 | Repository Intelligence | COMPLETE (DEGRADED) | Graphify not installed; fallback map created |
| 3 | Validation | IN PROGRESS | ai:validate script created, needs testing |
| 4 | Model Core | PENDING | LLM provider abstraction |
| 5 | Memory Core | PENDING | Supabase schema + memory API |
| 6 | Tool Core | PENDING | Tool registry + safe tools |
| 7 | Main UI | PENDING | Dashboard, chat, navigation shell |
| 8 | First Real Tools | PENDING | Calendar, notes, research, learning |
| 9 | Automation | PENDING | Scheduler, reminders, daily digest |
| 10 | Advanced Self-Improvement | PENDING | Skill tracking, tool gen UI, eval |

---

## Phase 3 — Validation

**Goal:** Ensure the project can be validated at any point.

Tasks:
- [x] Create `scripts/ai/validate.js`
- [x] Add `ai:validate` to `package.json`
- [ ] Run `npm run check` — verify no type errors
- [ ] Run `npm run build` — verify production build passes
- [ ] Expand validation to check registry consistency

---

## Phase 4 — Model Core

**Goal:** Model-agnostic LLM calls. No hardcoded provider.

Tasks:
- [ ] Create `src/lib/jarvis/llm/types.ts`
- [ ] Create `src/lib/jarvis/llm/config.ts`
- [ ] Create `src/lib/jarvis/llm/errors.ts`
- [ ] Create Ollama provider adapter
- [ ] Create OpenAI-compatible provider adapter
- [ ] Create model router
- [ ] Create model health check API
- [ ] Add model status panel (placeholder) to dashboard

**Unblocked by:** Phase 3 validation passing.

---

## Phase 5 — Memory Core

**Goal:** Persistent memory across sessions.

Tasks:
- [ ] Create Supabase migration: all `memory_*` tables
- [ ] Enable RLS on all memory tables
- [ ] Create memory types and schema
- [ ] Create memory CRUD API
- [ ] Create memory search
- [ ] Wire to Supabase client

**Unblocked by:** Phase 4 model core (memory summaries use LLM).

---

## Phase 6 — Tool Core

**Goal:** Tool registry, tool validation, initial safe tools.

Tasks:
- [ ] Create tool manifest Zod schema
- [ ] Create tool registry
- [ ] Implement Level 0 safe tools (readFile, listDirectory, etc.)
- [ ] Create tool API endpoint
- [ ] Create tool validation

**Unblocked by:** Phase 5 memory core.

---

## Phase 7 — Main UI

**Goal:** A usable, navigable J.A.R.V.I.S. interface.

Tasks:
- [ ] Install `lucide-svelte`
- [ ] Create design tokens CSS
- [ ] Create sidebar navigation component
- [ ] Create shell layout with navigation
- [ ] Create dashboard page (model status, tasks, reminders)
- [ ] Create chat console placeholder
- [ ] Create tool list page
- [ ] Create skill list page
- [ ] Create memory explorer placeholder
- [ ] Create settings page
- [ ] Responsive layout with mobile support

**Design rules:** Minimalistic. No colorful buttons. Neutral tones. Lucide icons only.

**Unblocked by:** Phase 3 validation.

---

## Phase 8 — First Real Tools

Target tools:
1. Calendar + Reminders
2. Notes
3. AI Research Dashboard
4. Daily Learning Planner
5. Senior AI Engineer Profile Builder

---

## Phase 9 — Automation

Target automations:
1. Daily planning
2. AI research digest
3. Learning task reminders
4. Weekly review
5. Memory summaries

---

## Phase 10 — Advanced Self-Improvement

Target features:
1. Skill usage tracking
2. Skill improvement suggestions UI
3. Tool generator UI
4. App generator UI
5. Codebase knowledge graph viewer
6. Evaluation system for model outputs

---

## Long-Term Vision

```
J.A.R.V.I.S. v1.0 Milestone Checklist

[ ] Chat with any local model (Ollama)
[ ] Chat with any cloud model (OpenAI, Anthropic, Gemini)
[ ] Persistent memory across sessions
[ ] Task and calendar management
[ ] Daily AI news digest
[ ] Learning roadmap with progress tracking
[ ] Tool registry with 10+ working tools
[ ] Skill registry with 15+ skills
[ ] Automation scheduler running daily tasks
[ ] Project scanner for this codebase
[ ] Self-improvement log with 30+ entries
[ ] Validated build with no type errors
[ ] Full dark/light mode support
```
