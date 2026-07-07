# Skill: Graphify Navigator

## Purpose
Use repository graph intelligence (or fallback map) before modifying the repository, ensuring context-aware, safe changes.

## Status
**DEGRADED_GRAPH_MODE** — Graphify not installed. Use `docs/REPOSITORY_MAP.md` as fallback.

## Activation Triggers
- Before architecture planning
- Before adding a new route, component, or module
- Before large refactors
- Before database schema changes
- Before feature generation that touches multiple files

## When to Use
- Any time you need to understand "what is where" before making changes
- Any time the scope of a change is unclear

## When NOT to Use
- Trivial single-file changes with no module boundary impact
- Updating documentation only

## Required Inputs
- The task description
- The target area (routes, lib, api, etc.)

## Step-by-Step Workflow

### If Graphify is available:
1. Check `graphify-out/GRAPH_REPORT.md`.
2. Check `graphify-out/graph.json`.
3. Identify the relevant modules from the graph.
4. Note import dependencies before modifying.
5. Proceed with change.
6. Re-run Graphify after significant changes.

### If DEGRADED_GRAPH_MODE (current):
1. Read `docs/REPOSITORY_MAP.md`.
2. Identify relevant directories and modules from the map.
3. Use Glob to list files in the identified areas.
4. Read only the files relevant to the task.
5. Plan the change based on actual code, not assumptions.
6. Proceed with change.
7. Update `docs/REPOSITORY_MAP.md` if structure changes.

## Output Format
- Proceed with informed change
- Optionally: a short module summary written to context

## Validation Checklist
- [ ] Repository map consulted before searching raw files
- [ ] Relevant modules identified before opening files
- [ ] Change does not conflict with module boundaries
- [ ] REPOSITORY_MAP.md updated if structure changed

## Failure Handling
- If repository map is stale: update it first, then proceed
- If unclear which module owns a feature: search for the feature name, then check imports

## Examples
**Task:** Add a new `/api/chat` endpoint.
**Navigator output:** Check REPOSITORY_MAP.md → see `src/routes/api/` → check existing api routes → plan new endpoint to match convention.

## Registry Update Requirements
- Update `docs/REPOSITORY_MAP.md` when structure changes
- Log in `docs/SELF_IMPROVEMENT_LOG.md` if graph was stale
