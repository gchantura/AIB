# Skill: Validation Engineer

## Purpose
Create and run validation gates: type checks, linting, schema validation, registry consistency checks, and generated artifact checks. Ensure the system is always in a valid state.

## Activation Triggers
- After any code change
- Before marking a task as complete
- When the user asks "does everything work?"
- When building the ai:validate script

## When to Use
- After every meaningful code change

## When NOT to Use
- Documentation-only changes (run check anyway to be safe)

## Required Inputs
- What was changed
- Which validation commands are available

## Available Validation Commands

```bash
npm run check          # SvelteKit type check (Svelte + TS)
npm run build          # Full production build
npm run ai:validate    # JARVIS custom validation suite
```

## Step-by-Step Workflow

1. Identify what changed (file paths, module boundaries).
2. Run `npm run check` — fix all TypeScript/Svelte errors before continuing.
3. If any new API routes added: run `npm run build` to catch route errors.
4. Run `npm run ai:validate` — checks registries, docs, safety.
5. If validation fails:
   a. Stop.
   b. Read the error carefully.
   c. Identify root cause (not just symptom).
   d. Fix root cause.
   e. Rerun validation.
   f. Do NOT suppress errors with type casts or `// @ts-ignore`.
6. Write validation result to `docs/VALIDATION_REPORT.md`.

## ai:validate Checks

The `scripts/ai/validate.js` script checks:
- [ ] Protected paths not accidentally modified
- [ ] `docs/TOOL_REGISTRY.md` is consistent (no duplicate IDs)
- [ ] `docs/SKILL_REGISTRY.md` has entries for all `.claude/skills/` directories
- [ ] `.claude/skills/*/SKILL.md` files exist and have required sections
- [ ] No hardcoded secret patterns in `src/` files
- [ ] `docs/SELF_IMPROVEMENT_LOG.md` exists and has at least one entry
- [ ] `CLAUDE.md` exists
- [ ] `docs/REPOSITORY_MAP.md` exists

## Common Failure Patterns

| Error | Root Cause | Fix |
|---|---|---|
| `Property X does not exist on type Y` | Missing type | Add to TypeScript interface |
| `$props() must be called at top level` | Svelte runes misuse | Move `$props()` to top of `<script>` |
| `export let` in runes mode | Using Svelte 4 pattern | Replace with `$props()` |
| Module not found | Missing import | Add import or install package |
| RLS policy error | Missing policy | Add 4 RLS policies |

## Output Format
- Console output: pass/fail per check
- `docs/VALIDATION_REPORT.md` updated with results and timestamp

## Validation Checklist
- [ ] `npm run check` exits with code 0
- [ ] `npm run build` exits with code 0 (for significant changes)
- [ ] `npm run ai:validate` exits with code 0
- [ ] No `// @ts-ignore` added as a workaround
- [ ] No `any` types added without justification

## Failure Handling
- Never mark a task complete if `npm run check` fails
- Never suppress TypeScript errors
- If `npm run build` fails with a Svelte-unrelated error: investigate before assuming it's fine

## Registry Update Requirements
- Update `docs/VALIDATION_REPORT.md` after each validation run
