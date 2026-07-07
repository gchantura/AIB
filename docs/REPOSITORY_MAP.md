# Repository Map

**Status:** Manually maintained fallback (DEGRADED_GRAPH_MODE — Graphify not installed)
**Last updated:** 2026-07-07 (compliance fix — dependencies corrected, Phase 7 files noted)

---

## Project Identity

| Field | Value |
|---|---|
| Name | aib (Super J.A.R.V.I.S.) |
| Framework | SvelteKit 2.x + Svelte 5 (runes mode) |
| Package manager | npm |
| Styling | Tailwind CSS v4 |
| Adapter | @sveltejs/adapter-vercel |
| Database | Supabase (PostgreSQL) |
| Node version | (set in .npmrc: engine-strict=true) |

---

## Top-Level Structure

```
/
├── .claude/             # Claude Code operating layer
│   ├── skills/          # Skill definitions
│   ├── agents/          # Subagent definitions
│   └── hooks/           # Hook scripts
├── .cursor/             # Cursor IDE MCP config
├── .gemini/             # Gemini CLI config
├── .opencode/           # OpenCode config
├── .svelte-kit/         # SvelteKit generated (do not edit)
├── .vscode/             # VS Code settings
├── docs/                # All architecture and registry docs
├── node_modules/        # Dependencies (do not edit)
├── scripts/             # Utility scripts
│   └── ai/              # AI validation and repo tools
├── src/                 # Application source
│   ├── lib/             # Shared library code
│   └── routes/          # SvelteKit routes
├── static/              # Static assets
├── CLAUDE.md            # Claude Code operating manual
├── package.json         # Project manifest
├── vite.config.js       # Vite configuration
└── jsconfig.json        # TypeScript config
```

---

## src/lib Structure

```
src/lib/
├── components/          # Shared UI components (scaffold — Phase 7)
├── jarvis/              # J.A.R.V.I.S. core (scaffold — Phases 4–9)
│   ├── llm/             # LLM provider abstraction (Phase 4)
│   ├── memory/          # Memory system (Phase 5)
│   ├── tools/           # Tool system (Phase 6)
│   ├── skills/          # Skill runtime (Phase 6)
│   ├── automation/      # Automation scheduler (Phase 9)
│   ├── research/        # Research system (Phase 8)
│   └── coding/          # Coding agent (Phase 10)
├── styles/
│   └── tokens.css       # Design tokens
├── types/               # Global TypeScript types
├── utils/               # Utility functions
└── index.js             # Library entry point (re-exports)
```

---

## src/routes Structure

```
src/routes/
├── (jarvis)/            # [PHASE 7 — PENDING APPROVAL] Main J.A.R.V.I.S. UI
│   ├── +layout.svelte   # Shell with sidebar nav — created ahead of schedule
│   ├── dashboard/       # +page.svelte — created ahead of schedule
│   ├── chat/            # +page.svelte — created ahead of schedule
│   ├── tools/           # +page.svelte — created ahead of schedule
│   ├── skills/          # +page.svelte — created ahead of schedule
│   ├── memory/          # +page.svelte — created ahead of schedule
│   ├── calendar/        # +page.svelte — created ahead of schedule
│   ├── research/        # +page.svelte — created ahead of schedule
│   ├── learning/        # +page.svelte — created ahead of schedule
│   └── settings/        # +page.svelte — created ahead of schedule
├── api/                 # [NOT YET CREATED] SvelteKit API endpoints (Phase 4+)
├── +layout.svelte       # Root layout — modified to import tokens.css
├── +page.svelte         # Landing page — modified to redirect to /dashboard
└── layout.css           # Global CSS — modified to import tokens.css
```

**Phase 7 approval status:** All `(jarvis)/` route files require user approval. See `CLAUDE.md` Phase 1 Files section.

---

## Key Files

| File | Purpose |
|---|---|
| `CLAUDE.md` | Claude Code operating manual |
| `vite.config.js` | Build config, Tailwind, SvelteKit, adapter |
| `src/app.html` | HTML shell |
| `src/routes/+layout.svelte` | Root layout — imports global CSS |
| `src/routes/layout.css` | Tailwind + typography plugin import |
| `src/lib/index.js` | Library entry point |
| `docs/ARCHITECTURE.md` | System architecture decisions |

---

## Dependencies Summary

### Runtime (peerDependencies)
- `svelte ^5.0.0`

### Dev Dependencies
- `@sveltejs/kit ^2.63.0` — SvelteKit framework
- `@sveltejs/adapter-vercel ^6.3.3` — Deployment adapter
- `@sveltejs/package ^2.5.8` — Library packaging
- `@sveltejs/vite-plugin-svelte ^7.1.2` — Svelte Vite integration
- `@tailwindcss/vite ^4.3.0` — Tailwind v4 Vite plugin
- `@tailwindcss/typography ^0.5.19` — Typography prose styles
- `tailwindcss ^4.3.0`
- `vite ^8.0.16`
- `typescript ^6.0.3`
- `publint ^0.3.21` — Package publishing checks

### Installed Ahead of Schedule (Phase 7 deps, added during bootstrap)
- `lucide-svelte ^0.525.0` — Icons (added to devDependencies — pending Phase 7 approval)

### To Install (Phase 4+)
- `zod` — Schema validation (not yet installed)

### Already Present
- `@supabase/supabase-js ^2.50.0` — Supabase client (was already a dependency at inspection)

---

## Environment Variables

| Variable | Value | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | Set | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Set | Supabase anon key |
| `JARVIS_*` | Not set | Model routing config (Phase 4) |
| `OLLAMA_BASE_URL` | Not set | Local Ollama server |
| `OPENAI_API_KEY` | Not set | Optional cloud provider |
| `ANTHROPIC_API_KEY` | Not set | Optional cloud provider |

---

## Critical Notes

1. This is both a SvelteKit app AND an npm library (see `exports` in package.json). The library entry is `src/lib/index.js`. The app entry is `src/routes/`.
2. `vite build && npm run prepack` — builds both the app and the library package.
3. Runes mode is enforced for all non-node_modules files via `vite.config.js`.
4. No `svelte.config.js` — the adapter is configured directly in `vite.config.js`.
