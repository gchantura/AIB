# Skill: Svelte Architect

## Purpose
Design maintainable SvelteKit architecture: routes, components, server actions, API endpoints, layouts, and state management patterns.

## Activation Triggers
- Adding a new major feature with multiple pages
- Designing a new route group
- Planning a new shared component system
- Deciding on state management strategy
- Adding a new API endpoint group

## When to Use
- Greenfield feature design
- Refactoring existing routes into a better structure
- Adding a new layout group

## When NOT to Use
- Adding a simple page with no shared state
- Fixing a bug in an existing component

## Required Inputs
- Feature description
- Expected routes and navigation
- Data requirements (what data, where it comes from)
- Current route structure (from REPOSITORY_MAP.md)

## Step-by-Step Workflow

1. Read `docs/REPOSITORY_MAP.md` — understand current route structure.
2. Identify the route group (e.g., `(jarvis)` for main UI).
3. Design the route hierarchy:
   - `/route/` — list page
   - `/route/[id]` — detail page
   - `/route/new` — creation page
   - `/route/[id]/edit` — edit page
4. Identify shared layouts (`+layout.svelte`).
5. Identify server-side data loading (`+page.server.ts` with `load()`).
6. Identify form actions (`+page.server.ts` with `actions`).
7. Identify API endpoints (`+server.ts`) for client-side fetches.
8. Identify shared components needed → add to `src/lib/components/`.
9. Identify shared state → use Svelte 5 runes (`$state`, `$derived`).
10. Document decisions in `docs/ARCHITECTURE.md`.

## SvelteKit Conventions (This Project)
- Runes mode enforced: use `$state`, `$derived`, `$effect`, `$props`.
- No legacy `writable`/`readable` stores for new code.
- Route groups in `(jarvis)` for main UI.
- Server logic in `+page.server.ts` (form actions + load).
- API routes in `src/routes/api/` as `+server.ts`.
- Components: PascalCase, in `src/lib/components/`.
- Routes: kebab-case.

## Output Format
- Route hierarchy diagram
- List of files to create
- Component inventory
- State management plan
- `docs/ARCHITECTURE.md` update

## Validation Checklist
- [ ] Route structure matches SvelteKit conventions
- [ ] Server-side data loading uses `load()` not client-side fetch-on-mount
- [ ] Forms use SvelteKit form actions
- [ ] No global mutable state (use runes or context API)
- [ ] Components are in `src/lib/components/` if shared

## Failure Handling
- If route structure conflicts with existing routes: resolve conflict first
- If data requirements are unclear: document uncertainty, build with placeholder data

## Examples
**Task:** Design the Memory Explorer feature.
**Output:** 
```
src/routes/(jarvis)/memory/
  +page.svelte          — memory list + search
  +page.server.ts       — load memory entries
  [id]/
    +page.svelte        — memory detail
    +page.server.ts     — load single entry
    +actions.ts         — delete action
```

## Registry Update Requirements
- Update `docs/ARCHITECTURE.md` with new route/module decisions
- Update `docs/REPOSITORY_MAP.md` with new structure
