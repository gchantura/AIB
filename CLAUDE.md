# Super J.A.R.V.I.S. — Claude Code Operating Manual

## Project Mission

Super J.A.R.V.I.S. (Just A Rather Very Intelligent System) is a local-first, model-agnostic, skill-driven AI operating system for personal productivity, software engineering, research, automation, tool creation, and continuous self-improvement. The Svelte/SvelteKit interface is the primary user surface. Everything else is modular, local-first, safe, and extensible.

---

## Phase 0: Repository Inspection Report

Completed: 2026-07-07. This section is the authoritative record of what was found in the repository before any changes were made.

### Package Manager

`npm`. Lock file: `package-lock.json`. Node engine-strict enforced via `.npmrc`.

### Framework

SvelteKit 2.x (`@sveltejs/kit ^2.63.0`) + Svelte 5 (`^5.56.1`). Runes mode enforced globally for all non-`node_modules` files via `vite.config.js` compiler option. No `svelte.config.js` — adapter and compiler options wired directly into `vite.config.js`.

### Existing Scripts (from package.json at inspection time)

| Script | Command | Notes |
|---|---|---|
| `dev` | `vite dev` | Development server |
| `build` | `vite build && npm run prepack` | Production build + library package |
| `preview` | `vite preview` | Preview production build locally |
| `prepare` | `svelte-kit sync \|\| echo ''` | Syncs SvelteKit types |
| `prepack` | `svelte-kit sync && svelte-package && publint` | Packages library for npm |
| `check` | `svelte-kit sync && svelte-check --tsconfig ./jsconfig.json` | Type check — **`svelte-check` binary not installed** |

**Note:** `svelte-check` was listed in the `check` script but the binary was not installed as a dev dependency. The build succeeds but `npm run check` exits silently with code 0 without actually type-checking. This is a known gap documented for Phase 3.

### Existing Routes (at inspection time)

```
src/routes/
├── +layout.svelte     # Root layout — empty shell, imports layout.css
├── +page.svelte       # Single landing page
└── layout.css         # Global CSS — imports tailwindcss and @tailwindcss/typography
```

No route groups, no API routes, no `+page.server.ts`, no `+server.ts` files existed at inspection.

### API Routes (at inspection time)

None. No `src/routes/api/` directory existed.

### Auth Usage (at inspection time)

None. No authentication system of any kind was present. No Supabase auth calls, no session management, no login pages.

### Database Usage (at inspection time)

Supabase client library present (`@supabase/supabase-js ^2.50.0` in `dependencies`). No database tables created. No Supabase client instantiation in source files. Credentials pre-populated in `.env`:
- `VITE_SUPABASE_URL` — set
- `VITE_SUPABASE_ANON_KEY` — set

### Environment Variables (at inspection time)

| Variable | Status | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | Set | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Set | Supabase anon key |
| All `JARVIS_*` vars | Optional | Runtime model-routing overrides |
| `OLLAMA_BASE_URL` | Not set | Local Ollama |
| `OPENAI_API_KEY` | Not set | Optional cloud provider |
| `ANTHROPIC_API_KEY` | Not set | Optional cloud provider |

### Styling System (at inspection time)

Tailwind CSS v4 via `@tailwindcss/vite` plugin. `@tailwindcss/typography` also installed. `layout.css` imports both. No design tokens file existed at inspection — `src/lib/styles/tokens.css` was created in Phase 1 as part of the operating layer setup.

### Current Dependencies (at inspection time)

**devDependencies:** `@sveltejs/adapter-vercel`, `@sveltejs/kit`, `@sveltejs/package`, `@sveltejs/vite-plugin-svelte`, `@tailwindcss/typography`, `@tailwindcss/vite`, `publint`, `svelte`, `tailwindcss`, `typescript`, `vite`

**dependencies:** `@supabase/supabase-js`

**peerDependencies:** `svelte ^5.0.0`

**Not installed at inspection time:** `lucide-svelte`, `zod`, `svelte-check`

### Claude Code Capability Support (as detected)

| Capability | Status | Notes |
|---|---|---|
| `CLAUDE.md` | Supported | Read on every session start |
| `.claude/skills/` | Supported | Skills activated via Skill tool |
| `.claude/agents/` | Supported | Subagent definitions |
| `.claude/hooks/` | **Partially supported** | See Hooks section below |
| `.claude/commands/` | **Not supported in this environment** | See Commands section below |
| MCP configuration | Supported | `.mcp.json` configures Svelte MCP server |
| Project memory | Session-scoped only | No persistent memory across sessions without DB |
| File editing | Supported | Full read/write/edit access |
| Terminal execution | Supported | Bash tool available |

**Multi-agent (AI-IDE) support detected:**
- `.cursor/mcp.json` — Cursor IDE MCP config present
- `.vscode/mcp.json` and `.vscode/settings.json` — VS Code MCP config present
- `.gemini/settings.json` — Gemini CLI config present
- `.opencode/opencode.json` and `.opencode/svelte.json` — OpenCode config present

The repository is configured to work with multiple AI coding agents simultaneously.

### Repository Type

This project is **both** a SvelteKit application and an npm library package:
- Application entry: `src/routes/`
- Library entry: `src/lib/index.js` (exported as `./` in package.json `exports`)
- Both are built by `npm run build`

### Graphify Status (at inspection)

Not installed. `npx graphify --version` returned not found. System operates in `DEGRADED_GRAPH_MODE` with `docs/REPOSITORY_MAP.md` as fallback.

---

## Implementation Status

The J.A.R.V.I.S. UI and runtime are approved, integrated product code. They are not a pending scaffold and must not be removed as phase cleanup. The system includes the Svelte workspace, provider router, local persistence, memory, tools, skills, approvals, rollback, automations, repository intelligence, coding and research assistance, conversations, notifications, and briefings.

Historical phase ordering is retained only in `docs/SELF_IMPROVEMENT_LOG.md`. Current work must follow `docs/ROADMAP.md` and observed repository state, not an obsolete numeric-phase gate.

### Files That ARE Phase 0/1 Scope (correctly placed)

| File | Phase | Justified |
|---|---|---|
| `CLAUDE.md` | Phase 1 | Operating manual |
| `docs/JARVIS_CONSTITUTION.md` | Phase 1 | Yes |
| `docs/ARCHITECTURE.md` | Phase 1 | Yes |
| `docs/MODEL_PROVIDERS.md` | Phase 1 | Yes |
| `docs/MEMORY_SYSTEM.md` | Phase 1 | Yes |
| `docs/TOOL_REGISTRY.md` | Phase 1 | Yes |
| `docs/SKILL_REGISTRY.md` | Phase 1 | Yes |
| `docs/SELF_IMPROVEMENT_LOG.md` | Phase 1 | Yes |
| `docs/SAFETY_POLICY.md` | Phase 1 | Yes |
| `docs/REPOSITORY_INTELLIGENCE.md` | Phase 1 | Yes |
| `docs/REPOSITORY_MAP.md` | Phase 1/2 | Yes |
| `docs/ROADMAP.md` | Phase 1 | Yes |
| `docs/VALIDATION_REPORT.md` | Phase 3 | Created in compliance fix |
| `.claude/skills/*/SKILL.md` (×15) | Phase 1 | Yes |
| `.claude/agents/AGENTS.md` | Phase 1 | Yes |
| `.claude/hooks/*.js` (×3) | Phase 1 | Yes |
| `scripts/ai/validate.js` | Phase 3 | Yes |
| `package.json` (`ai:validate` script) | Phase 3 | Yes |

---

## Hook System

Claude Code supports `PreToolUse` hooks (run before tool calls). PostEdit and SessionEnd hooks are **not natively supported** in the current Claude Code environment.

### Active Hooks

| File | Event | Behavior |
|---|---|---|
| `.claude/hooks/pre-search-reminder.js` | PreToolUse (search tools) | Reminds agent to check REPOSITORY_MAP.md |
| `.claude/hooks/pre-command-guard.js` | PreToolUse (bash) | Detects and blocks destructive shell commands |
| `.claude/hooks/secret-guard.js` | PreToolUse (write) | Scans file content for secret patterns |

### PostEdit Hook (Not Supported — Manual Fallback)

Claude Code does not support a native PostEdit hook. The following manual fallback applies:

**After every file edit that involves:**
- New routes or components → update `docs/REPOSITORY_MAP.md`
- New tools → update `docs/TOOL_REGISTRY.md`
- New skills → update `docs/SKILL_REGISTRY.md`
- Architecture decisions → update `docs/ARCHITECTURE.md`
- Run `npm run ai:validate` and `npm run build`

This is enforced through the `documentation-engineer` and `validation-engineer` skills, not through an automated hook.

### SessionEnd Hook (Not Supported — Manual Fallback)

Claude Code does not support a native SessionEnd hook. The following manual fallback applies:

**At the end of every significant work session, Claude must:**
1. Write a new entry to `docs/SELF_IMPROVEMENT_LOG.md`.
2. Update `docs/VALIDATION_REPORT.md` with the latest validation results.
3. Update `docs/REPOSITORY_MAP.md` if structure changed.
4. List next recommended steps in the log entry.

This is enforced through the `documentation-engineer` skill activation at task completion.

---

## Commands System

`.claude/commands/` is **not supported** in the current Claude Code environment. This environment uses the Skill tool (via the `available_skills` catalog in the system prompt) rather than slash commands.

### Equivalent Capability

Skills in `.claude/skills/` provide equivalent functionality to slash commands:
- Instead of `/skill:svelte-architect` → activate the `svelte-architect` skill via the Skill tool
- Instead of `/validate` → run `npm run ai:validate`
- Instead of `/repo-map` → read `docs/REPOSITORY_MAP.md`

If slash command support is added to this environment in the future, create `.claude/commands/` with one `.md` file per command, following the pattern: `name.md` containing the command description and behavior.

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
4. Only inspect raw files after identifying relevant modules.

**Status: DEGRADED_GRAPH_MODE** — Graphify not installed. Using `docs/REPOSITORY_MAP.md` as fallback.

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

- Prefer local databases (Supabase local / SQLite) over cloud.
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

- Framework: SvelteKit 2.x with Svelte 5 (runes mode enforced via `vite.config.js`).
- Package manager: `npm`.
- Styling: Tailwind CSS v4 via `@tailwindcss/vite`. Design tokens in `src/lib/styles/tokens.css`.
- Adapter: `@sveltejs/adapter-vercel`.
- Runes: Always use `$state`, `$derived`, `$effect`, `$props` — never legacy `writable`/`readable` stores.
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
  commands/            # NOT SUPPORTED — see Commands section above

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

### Protected Paths — Never Modify Without Explicit Approval

```
.env
.env.*
.env.local
.env.production
secrets/
credentials/
keys/
auth/
payments/
billing/
migrations/
node_modules/
.git/
private/
production/
backups/
customer-data/
personal-data/
```

### Requires Approval

The following actions require explicit user approval before Claude proceeds. Claude must stop, describe the action, and wait for the user to type a confirmation response before continuing.

#### Level 2 — Confirm before performing

- Overwriting existing files with significant changes
- Installing npm packages (`npm install`, `npm i`, `npx <unknown>`)
- Creating or modifying Supabase database migrations
- Changing any authentication or session logic
- Writing to the filesystem from an automated/scheduled action
- Running any shell command that modifies system state

**Required behavior:** State the action, state what it will affect, ask "Shall I proceed?". Do not proceed until the user confirms.

#### Level 3 — Explicit approval required — Block until confirmed

- **Deleting any file** (including via `rm`, `unlink`, destructive shell commands)
- **Pushing to git** (`git push`, including force push)
- **Publishing content** (`npm publish`, deploying to production)
- **Running destructive shell commands** (`rm -rf`, `DROP TABLE`, `TRUNCATE`, `git reset --hard`)
- **Sending emails or external messages**
- **Exposing secrets or environment variable values**
- **Accessing directories outside the repository**
- **Running scripts that affect external systems** (webhooks, APIs with side effects)
- **Modifying CI/CD pipelines**

**Required behavior:** Stop completely. Write: "This action requires explicit approval: [exact description of what will happen]. To confirm, please reply 'yes, proceed with [action]'." Do not proceed until the exact confirmation phrase is received.

### Safe Behavior

- Prefer dry-run mode for destructive operations.
- Show diff before risky changes.
- Use reversible operations.
- Document every significant decision.
- Validate after every meaningful change.

---

## Validation Commands

```bash
npm run build        # Production build — catches Svelte/TS compile errors
npm run ai:validate  # JARVIS validation suite — checks registries, docs, secrets
```

**Note:** `npm run check` invokes `svelte-check` which is not installed. It exits silently with code 0 but performs no type checking. Use `npm run build` as the primary validation gate.

After every meaningful code change, run `npm run build` and `npm run ai:validate`.

If validation fails:
1. Stop.
2. Read the error output carefully.
3. Identify the root cause (not just the symptom).
4. Fix the root cause.
5. Rerun validation.
6. Do NOT suppress errors with `// @ts-ignore` or type casts.

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
- Update `docs/VALIDATION_REPORT.md` after every validation run.
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
10. Run `npm run build` and `npm run ai:validate`.
11. Log in `docs/SELF_IMPROVEMENT_LOG.md`.

---

## Permission Protocol

| Level | Approval | Examples |
|---|---|---|
| 0 | None | Read files, search codebase, `npm run build`, `npm run ai:validate` |
| 1 | Inform user | Create new files, add new routes, update docs |
| 2 | Confirm before | Install packages, modify migrations, change auth logic |
| 3 | Explicit approval required | Delete files, push to git, publish, destructive shell commands, expose secrets |

---

## Current Phase Status

| Phase | Name | Status | Notes |
|---|---|---|---|
| 0 | Inspect | COMPLETE | See Phase 0 section above |
| 1 | Operating Layer | COMPLETE | CLAUDE.md, docs, skills, safety, improvement log |
| 2 | Repository Intelligence | COMPLETE (DEGRADED) | Graphify not installed; fallback map in docs/ |
| 3 | Validation | COMPLETE | ai:validate 41/41 pass; build passes |
| 4 | Model Core | COMPLETE | Local-first router; Ollama, OpenAI-compatible and Anthropic adapters |
| 5 | Memory Core | COMPLETE | Local persistence, CRUD, provenance and relevance retrieval |
| 6 | Tool Core | COMPLETE | Runtime registry, safe tools, approvals and rollback |
| 7 | Main UI | COMPLETE | Approved responsive workspace and functional pages |
| 8 | First Real Tools | COMPLETE MVP | Calendar, notes, research, coding and learning |
| 9 | Automation | COMPLETE MVP | Restart-safe scheduler, notifications and briefings |
| 10 | Advanced Self-Improvement | COMPLETE MVP | Generation, evaluation analytics and governed proposals; evaluated upgrade application remains future work |
