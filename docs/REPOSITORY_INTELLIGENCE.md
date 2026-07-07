# Repository Intelligence

## Status: DEGRADED_GRAPH_MODE

Graphify is not installed. Full graph-based repository intelligence is unavailable.

Fallback: `docs/REPOSITORY_MAP.md` is used as the primary repository understanding artifact.

---

## Graphify (Not Installed)

Graphify generates a dependency and module graph for the repository, enabling agents to understand:
- Which files import which
- Which modules are critical path
- Which areas are isolated
- Circular dependency detection
- Hotspot analysis

### To Enable Full Graph Intelligence

```bash
npm install -g graphify-code
graphify --output graphify-out --format json,html,md
```

This will generate:
- `graphify-out/GRAPH_REPORT.md` — human-readable graph summary
- `graphify-out/graph.json` — machine-readable graph
- `graphify-out/graph.html` — interactive visualization

After generating, update `CLAUDE.md` graph-first policy section to reference these artifacts.

---

## Graph-First Workflow (Manual Fallback)

Since Graphify is unavailable, follow this manual process before large refactors or feature additions:

1. Read `docs/REPOSITORY_MAP.md`.
2. Identify the relevant modules from the map.
3. Use `Glob` to find specific files in identified directories.
4. Use `Grep` to find specific patterns.
5. Read the relevant files.
6. Then plan the change.

**Never** start with `grep` or `glob` on the entire codebase. Always start with the map.

---

## Recommended Graph-First Triggers

Activate graph-first workflow before:
- Adding a new route to SvelteKit
- Creating a new shared component
- Modifying the LLM provider interface
- Adding a new memory category
- Refactoring any `src/lib/jarvis/` module
- Changing database schema
- Creating a new API endpoint

---

## Repository Map Location

`docs/REPOSITORY_MAP.md`

This file is manually maintained and must be updated whenever:
- A new top-level directory is added
- A new major module is created in `src/lib/jarvis/`
- A new route group is added to `src/routes/`
- A significant dependency is added or removed
