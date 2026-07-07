# Super J.A.R.V.I.S. — Claude Code Operating Manual

## Project Mission

Super J.A.R.V.I.S. (Just A Rather Very Intelligent System) is a local-first, model-agnostic, skill-driven AI operating system for personal productivity, software engineering, research, automation, tool creation, and continuous self-improvement. The Svelte/SvelteKit interface is the primary user surface. Everything else is modular, local-first, safe, and extensible.

---

## Core Philosophy

1. Build tools, not one-off answers.
2. Convert repeated tasks into skills.
3. Convert useful skills into local tools.
4. Convert local tools into Svelte interfaces.
5. Convert results into persistent memory.
6. Convert mistakes into system improvements.
7. Verify every meaningful change.
8. Work locally first.
9. Support many models, not one model.
10. Never sacrifice safety, maintainability, or data control.

---

## Graph-First Policy

Before any architecture planning, refactoring, feature generation, route creation, or large search:

1. Check `docs/REPOSITORY_MAP.md` (fallback graph artifact).
2. Check `graphify-out/GRAPH_REPORT.md` if Graphify is installed.
3. Use repository-level understanding before raw file search.
4. Only inspect raw files after identifying relevant modules from the graph.

**Status: DEGRADED_GRAPH_MODE** — Graphify is not installed. Using `docs/REPOSITORY_MAP.md` as fallback.

To enable full graph intelligence:
```bash
npm install -g graphify-code
graphify --output graphify-out
```

---

## Skill-First Policy

Before solving any repeatable problem:
1. Check `.claude/skills/` for an existing skill.
2. If a matching skill exists, activate it and follow its workflow.
3. If no matching skill exists and the task is likely to repeat, create a skill first.
4. After every major task, evaluate whether a new skill should be created or an existing skill improved.

---

## Local-First Policy

- Prefer local databases (SQLite via Supabase local or direct) over cloud.
- Prefer local model providers (Ollama, LM Studio, llama.cpp) over cloud APIs.
- Cloud providers are optional adapters, never the default.
- Memory is stored locally. Secrets never leave the machine.

---

## Model-Agnostic Policy

- Never hardcode a model name in application logic.
- Use `src/lib/jarvis/llm/router.ts` for all model calls.
- Provider configuration lives in environment variables and `src/lib/jarvis/llm/config.ts`.
- Support Ollama, LM Studio, llama.cpp, vLLM, OpenAI-compatible, Anthropic, OpenAI, Gemini, OpenRouter.

---

## Svelte/SvelteKit Conventions

- Framework: SvelteKit 2.x with Svelte 5 (runes mode enforced).
- Package manager: `npm`.
- Styling: Tailwind CSS v4 via `@tailwindcss/vite`. Design tokens live in `src/lib/styles/tokens.css`.
- Adapter: `@sveltejs/adapter-vercel` (deployable to Vercel or local preview).
- Runes: Always use `$state`, `$derived`, `$effect`, `$props` — never legacy `writable`/`readable` stores for new code.
- File naming: kebab-case for routes, PascalCase for components.
- Components live in `src/lib/components/`.
- JARVIS core logic lives in `src/lib/jarvis/`.
- Route-level server logic uses `+page.server.ts` / `+server.ts`.
- Forms use SvelteKit form actions where possible.

---

## File Structure Conventions

```
src/
  lib/
    components/        # Shared UI components
    jarvis/
      llm/             # Model provider abstraction
      memory/          # Memory system
      tools/           # Tool registry and implementations
      skills/          # Skill system runtime
      automation/      # Scheduler and automations
      research/        # Research system
      coding/          # Coding agent tools
    styles/            # Design tokens, global styles
    utils/             # Shared utilities
    types/             # Shared TypeScript types
  routes/
    (jarvis)/          # Main JARVIS UI layout group
      +layout.svelte
      dashboard/
      chat/
      tools/
      skills/
      memory/
      calendar/
      research/
      learning/
      settings/
    api/               # SvelteKit API endpoints

.claude/
  skills/              # Skill definitions (SKILL.md per skill)
  agents/              # Subagent definitions
  hooks/               # Hook scripts

docs/
  JARVIS_CONSTITUTION.md
  ARCHITECTURE.md
  MODEL_PROVIDERS.md
  MEMORY_SYSTEM.md
  TOOL_REGISTRY.md
  SKILL_REGISTRY.md
  SELF_IMPROVEMENT_LOG.md
  SAFETY_POLICY.md
  REPOSITORY_INTELLIGENCE.md
  REPOSITORY_MAP.md
  ROADMAP.md
  VALIDATION_REPORT.md

scripts/
  ai/
    validate.js        # ai:validate script
    repo-map.js        # Repository map generator
```

---

## Design Token Rules

- All colors, spacing, typography use CSS custom properties from `src/lib/styles/tokens.css`.
- Never hardcode hex colors or pixel values in component styles.
- Use Tailwind utility classes that map to design tokens.
- Dark mode: use `dark:` variants or CSS variable switching.
- Icons: Lucide icons only (`lucide-svelte`).
- No colorful button components. Neutral tones only.
- Minimalistic design: clean whitespace, subtle borders, no decorative noise.

---

## Safety Rules

### Protected Paths (Never modify without explicit approval)
- `.env*`, `.env.*`
- `secrets/**`, `credentials/**`, `keys/**`
- `auth/**`, `payments/**`, `billing/**`
- `migrations/**`
- `node_modules/**`, `.git/**`
- `private/**`, `production/**`, `backups/**`
- `customer-data/**`, `personal-data/**`

### Actions Requiring Explicit Approval
- Deleting any file
- Overwriting important files without diff review
- Modifying database migrations
- Installing npm packages
- Running destructive shell commands
- Pushing to GitHub
- Publishing content publicly
- Sending emails or messages
- Exposing secrets or env vars
- Accessing directories outside the repo
- Running scripts that affect external systems

### Safe Behavior
- Prefer dry-run mode for destructive operations.
- Show diff before risky changes.
- Use reversible operations.
- Document every significant decision.
- Validate after every meaningful change.

---

## Validation Commands

```bash
npm run check        # SvelteKit type check
npm run build        # Production build (catches TS/Svelte errors)
npm run ai:validate  # JARVIS validation suite
```

After every meaningful code change, run `npm run check` at minimum.

If validation fails:
1. Stop.
2. Explain the failure.
3. Fix the root cause.
4. Rerun validation.

---

## Self-Improvement Protocol

After every major task:
1. What was requested?
2. What was created or changed?
3. Which skills were used?
4. Was the repository map consulted?
5. Did any validation fail?
6. What repeated pattern appeared?
7. Should a new skill be created?
8. Should an existing skill be improved?
9. Should a new tool be created?
10. Should documentation be updated?
11. What is the next best step?

Write results to `docs/SELF_IMPROVEMENT_LOG.md`.

---

## Documentation Protocol

- Update `docs/ARCHITECTURE.md` when adding new systems or changing module boundaries.
- Update `docs/TOOL_REGISTRY.md` when creating or removing tools.
- Update `docs/SKILL_REGISTRY.md` when creating or modifying skills.
- Update `docs/REPOSITORY_MAP.md` when the project structure changes significantly.
- Add decisions with rationale to relevant docs — not inline code comments.

---

## Tool Generation Protocol

1. Understand user request.
2. Check `docs/TOOL_REGISTRY.md` for existing tools.
3. Check `.claude/skills/tool-factory-engineer/SKILL.md`.
4. Create tool specification (id, name, description, category, permissions, inputs, outputs).
5. Create data model.
6. Create API endpoint in `src/routes/api/`.
7. Create Svelte UI in `src/routes/(jarvis)/tools/`.
8. Register in `docs/TOOL_REGISTRY.md`.
9. Add Zod validation schema.
10. Run `npm run check`.
11. Log in `docs/SELF_IMPROVEMENT_LOG.md`.

---

## Permission Protocol

Level 0 (no approval needed): Read files, search, run `npm run check`, run `npm run build`.
Level 1 (inform user): Create new files, add new routes, update docs.
Level 2 (confirm before): Install packages, modify migrations, change auth logic.
Level 3 (explicit approval required): Delete files, push to git, publish, run destructive shell commands, expose secrets.

---

## Current Status

- Phase 0: COMPLETE — Repository inspected.
- Phase 1: COMPLETE — Operating layer created.
- Phase 2: DEGRADED_GRAPH_MODE — Graphify not installed, fallback map created.
- Phase 3: IN PROGRESS — Validation script created, needs wiring.
- Phases 4–10: PENDING.
