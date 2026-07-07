# Skill: Skill Generator

## Purpose
Create, improve, test, and register new skills for J.A.R.V.I.S.

## Activation Triggers
- User says "create a skill", "make a skill", "turn this into a skill", "save this workflow"
- A task has appeared more than once and no skill covers it
- After a major task where repeated reasoning was required

## When to Use
- Building a new repeatable capability
- Encoding a workflow the agent had to figure out from scratch
- Formalizing a decision-making pattern

## When NOT to Use
- One-off tasks that will never repeat
- Tasks fully covered by an existing skill

## Required Inputs
- The task or workflow to encode
- At least one concrete example of the workflow being performed
- The domain (svelte, llm, memory, tools, safety, etc.)

## Step-by-Step Workflow

1. Identify the repeatable core of the task.
2. Check `docs/SKILL_REGISTRY.md` — does a similar skill exist?
3. If similar exists: improve it. If not: create new.
4. Create directory: `.claude/skills/<skill-name>/`
5. Write `SKILL.md` with all required sections (see schema below).
6. Test the skill mentally against the concrete example.
7. Update `docs/SKILL_REGISTRY.md` — add row to registry table.
8. Update `docs/SELF_IMPROVEMENT_LOG.md` — log the creation.

## SKILL.md Required Sections
```
# Skill: [Name]
## Purpose
## Activation Triggers
## When to Use
## When NOT to Use
## Required Inputs
## Step-by-Step Workflow
## Output Format
## Validation Checklist
## Failure Handling
## Examples
## Registry Update Requirements
```

## Output Format
- `SKILL.md` file in `.claude/skills/<name>/`
- Updated row in `docs/SKILL_REGISTRY.md`
- Log entry in `docs/SELF_IMPROVEMENT_LOG.md`

## Validation Checklist
- [ ] SKILL.md has all required sections
- [ ] Purpose is one sentence
- [ ] Workflow steps are numbered and concrete
- [ ] At least one example is provided
- [ ] Registry updated
- [ ] Log updated

## Failure Handling
- If unsure whether to create new or improve existing: prefer improving existing
- If the skill is too broad: split into two focused skills
- If the workflow is unclear: document the uncertainty and revisit after one more use

## Examples
**Input:** Agent had to figure out Supabase RLS pattern from scratch twice.
**Output:** Create `.claude/skills/supabase-rls-engineer/SKILL.md` encoding the exact pattern.

## Registry Update Requirements
- Add to `docs/SKILL_REGISTRY.md` table
- Log in `docs/SELF_IMPROVEMENT_LOG.md`
