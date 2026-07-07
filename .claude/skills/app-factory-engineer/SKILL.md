# Skill: App Factory Engineer

## Purpose
Create complete Svelte-based local apps and dashboards from reusable templates: pages, layouts, forms, tables, charts, settings screens, API routes, database schema, and documentation.

## Activation Triggers
- User requests a new dashboard or app ("build me a calendar app", "make a research dashboard")
- A tool has grown into a multi-page experience
- Building one of the planned apps from `docs/ROADMAP.md`

## When to Use
- Multi-page features with their own layout
- Dashboards with multiple widgets
- Full CRUD experiences

## When NOT to Use
- Single-page tools (use tool-factory-engineer)
- Simple components without routing

## Required Inputs
- App name and purpose
- Key pages/screens
- Data model
- User interactions (create, edit, delete, search, filter)
- Level of complexity

## Step-by-Step Workflow

1. Activate `svelte-architect` skill — design the route structure.
2. Activate `memory-engineer` skill if new database tables are needed.
3. Scaffold files (create placeholders first, then implement).
4. Build the layout first (`+layout.svelte`).
5. Build each page in order of user journey.
6. Build shared components for the app.
7. Connect to API endpoints.
8. Add empty states, loading states, error states.
9. Activate `svelte-ui-engineer` skill for each page.
10. Run `npm run check`.
11. Update `docs/REPOSITORY_MAP.md`.
12. Register the app in `docs/ROADMAP.md`.

## App Template Checklist
Every generated app must use:
- [ ] Shared design tokens (`tokens.css`)
- [ ] Shared UI components (`src/lib/components/`)
- [ ] Consistent navigation (sidebar or breadcrumb)
- [ ] Responsive design (mobile-first)
- [ ] TypeScript
- [ ] Zod for API validation
- [ ] Local-first data (Supabase)
- [ ] Minimalistic design (no colorful buttons, Lucide icons only)
- [ ] Loading states for all async operations
- [ ] Empty states for lists
- [ ] Error states for failures

## Planned Apps (from ROADMAP.md)
1. J.A.R.V.I.S. Dashboard
2. Chat Console
3. Calendar and Reminders
4. AI News Research Dashboard
5. Senior AI Engineer Profile Builder
6. Daily Learning Planner
7. Project Scanner
8. Notes and Knowledge Base
9. Tool Registry UI
10. Skill Registry UI
11. Model Provider Settings
12. Memory Explorer
13. Automation Dashboard

## Output Format
- Full route directory with all pages
- Supabase migration (if new tables)
- Shared components (if new)
- Updated `docs/REPOSITORY_MAP.md`
- Updated `docs/ROADMAP.md`

## Validation Checklist
- [ ] All pages have server-side data loading
- [ ] Forms use SvelteKit form actions
- [ ] All tables/lists have empty states
- [ ] All async ops have loading states
- [ ] `npm run check` passes

## Registry Update Requirements
- Update `docs/ROADMAP.md` phase status
- Update `docs/REPOSITORY_MAP.md`
- Log in `docs/SELF_IMPROVEMENT_LOG.md`
