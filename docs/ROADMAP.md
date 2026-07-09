# Roadmap

## Current milestone

Super J.A.R.V.I.S. is an operational local-first MVP, not a UI scaffold. The earlier Phase 7-versus-Phase 4 approval fork is resolved: retain the working interface and provider core.

| Capability | Status | Evidence |
|---|---|---|
| Validation | Complete | `npm run check`, `npm run build`, `npm run ai:validate` |
| Model core | Complete | Ollama, LM Studio/OpenAI-compatible, OpenAI and Anthropic adapters; task router and health API |
| Local memory | Complete | Atomic local persistence, CRUD, search, provenance and relevance ranking |
| Tool core | Complete | Registry, safe tools, approvals, audit and rollback |
| Main UI | Complete | Responsive workspace routes and navigation |
| Productivity | Complete | Tasks, notes, projects, calendar and learning records — persisted in Supabase (`workspace_events`, `workspace_tasks`, `workspace_notes`, `workspace_projects`) |
| Research and coding | Complete MVP | Evidence-bound research and selected-file repository analysis |
| Automation | Complete MVP | Restart-safe scheduler, notifications and briefings |
| App/skill generation | Complete MVP | Approval-gated Svelte app factory and on-disk skill creation |

## Evaluation and capability governance — complete MVP

- [x] Tool/model execution outcomes and tool duration metrics.
- [x] Per-capability reliability analytics and recent-failure evidence.
- [x] Deduplicated self-improvement proposals from repeated failures.
- [x] Explicit proposal approval/dismissal with audit history.
- [ ] Skill invocation and outcome instrumentation (skills are currently file-discovered, not invoked by the runtime).
- [ ] Applying approved upgrades through the existing approval, validation and rollback workflow.
- Add automated integration tests to CI beyond the existing validation script.

## Next milestone: evaluated upgrade execution

- Convert an approved proposal into a reviewable change plan.
- Run affected checks before and after a proposed upgrade.
- Store evaluation comparisons and reject regressions automatically.
- Apply changes only through one-time approval and rollback records.

## Later milestones

- Optional embedding-backed semantic memory while retaining offline lexical fallback.
- Authenticated multi-user mode and encrypted secrets storage.
- OS-native notifications and calendar connectors.
- Optional local knowledge graph and richer repository dependency analysis.
- Add privileged connectors incrementally with connector-specific authentication, exact-input approval and rollback/compensation guarantees.

## Non-goals until safety prerequisites exist

Unattended destructive changes, silent cloud uploads, and approval bypass remain forbidden. External publishing, email, and privileged execution may be added as explicit, registered capabilities with per-action approval.
