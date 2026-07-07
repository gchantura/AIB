# Skill Registry

## What is a Skill?

A skill is a structured instruction set for Claude Code that defines how to approach a specific type of task. Skills live in `.claude/skills/<skill-name>/SKILL.md`. They are not runtime code — they are operating procedures that Claude follows when activated.

---

## Skill Schema

Every skill must contain:
- `purpose` — one-line description
- `activation triggers` — when to activate this skill
- `when to use` — conditions
- `when NOT to use` — boundaries
- `required inputs` — what must be known before starting
- `step-by-step workflow` — numbered steps
- `output format` — what the skill produces
- `validation checklist` — how to verify the output is correct
- `failure handling` — what to do when steps fail
- `examples` — at least one concrete example
- `registry update requirements` — what must be updated after skill use

---

## Registered Skills

| ID | Name | Location | Status | Last Updated |
|---|---|---|---|---|
| `skill-generator` | Skill Generator | `.claude/skills/skill-generator/` | ACTIVE | 2026-07-07 |
| `graphify-navigator` | Graphify Navigator | `.claude/skills/graphify-navigator/` | ACTIVE (DEGRADED) | 2026-07-07 |
| `svelte-architect` | Svelte Architect | `.claude/skills/svelte-architect/` | ACTIVE | 2026-07-07 |
| `svelte-ui-engineer` | Svelte UI Engineer | `.claude/skills/svelte-ui-engineer/` | ACTIVE | 2026-07-07 |
| `model-provider-engineer` | Model Provider Engineer | `.claude/skills/model-provider-engineer/` | ACTIVE | 2026-07-07 |
| `memory-engineer` | Memory Engineer | `.claude/skills/memory-engineer/` | ACTIVE | 2026-07-07 |
| `tool-factory-engineer` | Tool Factory Engineer | `.claude/skills/tool-factory-engineer/` | ACTIVE | 2026-07-07 |
| `app-factory-engineer` | App Factory Engineer | `.claude/skills/app-factory-engineer/` | ACTIVE | 2026-07-07 |
| `automation-engineer` | Automation Engineer | `.claude/skills/automation-engineer/` | ACTIVE | 2026-07-07 |
| `ai-researcher` | AI Researcher | `.claude/skills/ai-researcher/` | ACTIVE | 2026-07-07 |
| `coding-agent-engineer` | Coding Agent Engineer | `.claude/skills/coding-agent-engineer/` | ACTIVE | 2026-07-07 |
| `senior-ai-engineer-coach` | Senior AI Engineer Coach | `.claude/skills/senior-ai-engineer-coach/` | ACTIVE | 2026-07-07 |
| `safety-guardian` | Safety Guardian | `.claude/skills/safety-guardian/` | ACTIVE | 2026-07-07 |
| `validation-engineer` | Validation Engineer | `.claude/skills/validation-engineer/` | ACTIVE | 2026-07-07 |
| `documentation-engineer` | Documentation Engineer | `.claude/skills/documentation-engineer/` | ACTIVE | 2026-07-07 |

---

## Skill Usage Log

See `docs/SELF_IMPROVEMENT_LOG.md` for per-task skill usage records.

---

## Skill Improvement Rules

After every major task:
1. Did this require repeated reasoning that a skill should encode?
2. Did the system miss context a skill should provide?
3. Did validation fail in a way a skill should prevent?
4. Did the agent search inefficiently in a way a skill should guide?
5. Did the user correct the direction — suggesting a skill gap?

If yes to any: create or update the relevant skill and update this registry.
