# Self-Improvement Log

## 2026-07-07 — Evaluation and capability governance

- Added persisted execution metrics for tools and model-powered capabilities.
- Added improvement proposal generation from accumulated evidence.
- Added governed upgrade plans with validation gates.
- Updated `docs/ARCHITECTURE.md` with evaluation and upgrade-plan layers.
- Updated `docs/ROADMAP.md` to reflect Phase 10 completion.
- Updated `docs/TOOL_REGISTRY.md` with new tool categories.
- Updated `docs/REPOSITORY_MAP.md` with evaluation modules.
- Updated `docs/VALIDATION_REPORT.md` with latest validation results.
- Updated `docs/SELF_IMPROVEMENT_LOG.md` with this entry.
- Updated `CLAUDE.md` with Phase 10 status.
- Updated `docs/JARVIS_CONSTITUTION.md` with evaluation principles.
- Updated `docs/SAFETY_POLICY.md` with upgrade-plan safety requirements.
- Updated `docs/MEMORY_SYSTEM.md` with evaluation memory integration.
- Updated `docs/MODEL_PROVIDERS.md` with evaluation metrics.
- Updated `docs/TOOL_REGISTRY.md` with evaluation tools.
- Updated `docs/SKILL_REGISTRY.md` with evaluation skills.
- Updated `docs/REPOSITORY_INTELLIGENCE.md` with evaluation intelligence.
- Updated `docs/REPOSITORY_MAP.md` with evaluation modules.
- Updated `docs/VALIDATION_REPORT.md` with latest validation results.
- Updated `docs/SELF_IMPROVEMENT_LOG.md` with this entry.

## 2026-07-08 — Proactive operations and daily planning

- Added restart-safe scheduler that wakes every 30 seconds and executes due automations.
- Added daily briefing generation that combines tasks, events, and recommendations.
- Added email reminder support for calendar events and tasks with SMTP configuration.
- Added recurring reminder support (hourly, daily, weekly, biweekly, monthly, custom intervals).
- Added daily briefing email delivery with per-day deduplication.
- Updated `docs/ARCHITECTURE.md` with proactive runtime layer.
- Updated `docs/ROADMAP.md` to reflect Phase 9 completion.
- Updated `docs/REPOSITORY_MAP.md` with automation and briefing modules.
- Updated `docs/VALIDATION_REPORT.md` with latest validation results.
- Updated `docs/SELF_IMPROVEMENT_LOG.md` with this entry.

## 2026-07-09 — Supabase workspace migration (initial)

- Created 4 Supabase tables (workspace_events, workspace_tasks, workspace_notes, workspace_projects) with RLS.
- Rewrote store.ts to use hybrid model — Supabase for 4 workspace kinds, local JSON for rest.
- Fixed supabase.server.ts to read VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
- Updated docs: REPOSITORY_MAP, ARCHITECTURE, ROADMAP, VALIDATION_REPORT, SELF_IMPROVEMENT_LOG.
- Refreshed Graphify code graph.

## 2026-07-09 — Full Supabase migration (all collections)

**Requested:** Remove the old local JSON store entirely; all data goes to the database only.
**Created/Changed:**
- Created 16 new Supabase tables (research, automations, learning, audit, generatedTools, generatedSkills, memories, approvals, rollbacks, conversations, modelRuns, notifications, briefings, executionMetrics, improvementProposals, upgradePlans) with full RLS.
- Rewrote `src/lib/jarvis/core/store.ts` — removed all local JSON file code. `snapshot()` loads all 20 collections from Supabase in parallel. `record()` inserts directly to `workspace_audit`. New generic helpers: `insertRow`, `updateRow`, `deleteRow`, `upsertRow`, `clearTable`.
- Updated all 10 runtime modules (automation, briefing, evaluation, upgrades, intelligence, memory, safety, skills, tools) and 2 API routes (notifications, chat) to use direct Supabase operations instead of `transaction()`.
- Removed `transaction()` export entirely — no more load-mutate-save pattern.
- Updated UI text: docs page and calendar page no longer reference "local" or ".jarvis/workspace.json".
- Updated docs: REPOSITORY_MAP, ARCHITECTURE, ROADMAP, VALIDATION_REPORT, SELF_IMPROVEMENT_LOG.
**Skills Used:** bolt-database
**Graph Consulted:** Yes (graphify-out)
**Validation Result:** pass (`npm run build` exit 0, `npm run ai:validate` 41/41).
**Repeated Pattern:** The `transaction()` to direct-Supabase-operations migration touched every runtime module. The pattern is now: `snapshot()` for reads, `insertRow`/`updateRow`/`deleteRow`/`upsertRow` for writes, `record(null, ...)` for audit.
**New Skill Needed:** No.
**Skill Improvement Needed:** No.
**New Tool Needed:** No.
**Docs Updated:** REPOSITORY_MAP, ARCHITECTURE, ROADMAP, VALIDATION_REPORT, SELF_IMPROVEMENT_LOG.
**Next Best Step:** Run the app in the browser to verify end-to-end CRUD flows (create task, add event, save note) work against the live Supabase tables.

---

*Future entries will be appended here.*

## 2026-07-09T09:50:43.195Z — Automated Post-Build

- Build: ✅
- Graphify: ⚠ skipped

## 2026-07-09T10:06:44.231Z — Automated Post-Build

- Build: ✅
- Graphify: ⚠ skipped

## 2026-07-09T10:25:15.177Z — Automated Post-Build

- Build: ✅
- Graphify: ⚠ skipped

## 2026-07-09T10:30:20.776Z — Automated Post-Build

- Build: ✅
- Graphify: ⚠ skipped
