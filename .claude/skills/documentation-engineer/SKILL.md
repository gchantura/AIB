# Skill: Documentation Engineer

## Purpose
Keep architecture docs, registries, decisions, changelogs, and self-improvement logs updated, accurate, and useful.

## Activation Triggers
- After any architectural change
- After adding a new tool, skill, or route
- After any significant decision is made
- At the end of every major task
- When documentation is stale or missing

## When to Use
- After every task that changes the system's structure
- When writing new architectural decisions

## When NOT to Use
- Pure UI changes with no structural impact
- Fixing a typo in a comment

## Required Inputs
- What changed
- Why it changed (rationale)
- What documentation is affected

## Documents to Maintain

| Document | Update When |
|---|---|
| `CLAUDE.md` | Project mission, policies, or conventions change |
| `docs/ARCHITECTURE.md` | New module, route group, or tech decision |
| `docs/MODEL_PROVIDERS.md` | New provider added or changed |
| `docs/MEMORY_SYSTEM.md` | New memory category or schema change |
| `docs/TOOL_REGISTRY.md` | Tool added, removed, or changed |
| `docs/SKILL_REGISTRY.md` | Skill added, improved, or deprecated |
| `docs/SELF_IMPROVEMENT_LOG.md` | End of every major task |
| `docs/SAFETY_POLICY.md` | New safety rule or incident |
| `docs/REPOSITORY_INTELLIGENCE.md` | Graphify status changes |
| `docs/REPOSITORY_MAP.md` | File/directory structure changes |
| `docs/ROADMAP.md` | Phase complete or new phase planned |
| `docs/VALIDATION_REPORT.md` | After validation runs |

## Step-by-Step Workflow

1. Identify which documents are affected by the completed task.
2. For each affected document:
   a. Read the current state of the document.
   b. Identify what is stale or missing.
   c. Write the update (add section, update table, log entry).
   d. Keep existing correct content intact.
3. Update `docs/SELF_IMPROVEMENT_LOG.md` last (it's the final reflection).
4. Do NOT rewrite entire documents — make surgical updates.
5. Do NOT add opinions or speculation — only facts and decisions.

## Documentation Quality Rules
- Write for "future Claude with no memory of this session".
- Be specific: file paths, line counts, table names, dates.
- Include rationale for non-obvious decisions.
- Do NOT write comments that say WHAT code does (use code for that).
- DO write documentation that says WHY decisions were made.
- Keep it scannable: headers, tables, bullet lists.

## Self-Improvement Log Entry Template

```markdown
## [DATE] — [Task Summary]

**Requested:** [what user asked for]
**Created/Changed:** [bullet list of files/systems changed]
**Skills Used:** [list]
**Graph Consulted:** [Yes/No/DEGRADED]
**Validation Result:** [pass/fail — details]
**Repeated Pattern:** [any pattern]
**New Skill Needed:** [Yes/No]
**Skill Improvement Needed:** [which skill and why]
**New Tool Needed:** [Yes/No]
**Docs Updated:** [list]
**Next Best Step:** [specific action]
```

## Output Format
- Updated documentation files (in-place edits)
- New sections added where appropriate

## Validation Checklist
- [ ] All affected documents updated
- [ ] Self-improvement log has new entry
- [ ] No stale references (old file paths, deleted features)
- [ ] Dates are accurate

## Registry Update Requirements
- This skill is its own documentation. Update it if the documentation workflow changes.
