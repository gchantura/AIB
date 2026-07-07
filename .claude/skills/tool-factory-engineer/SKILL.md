# Skill: Tool Factory Engineer

## Purpose
Create new local tools from user requests: specification, data model, API endpoint, Svelte UI, registry entry, and validation.

## Activation Triggers
- User requests a new tool ("build me a tool that...")
- A repeated manual task should become a tool
- After identifying a missing capability in the tool registry

## When to Use
- Building any new J.A.R.V.I.S. tool

## When NOT to Use
- Building a full multi-page app (use app-factory-engineer)
- Modifying an existing tool without full rewrite

## Required Inputs
- Tool purpose description
- Input data the tool needs
- Output data the tool produces
- Safety level (0–3)
- UI requirements (yes/no, complexity)

## Step-by-Step Workflow

1. Read `docs/TOOL_REGISTRY.md` — check if tool already exists.
2. Check `.claude/skills/tool-factory-engineer/SKILL.md` (this file).
3. Define tool manifest:
   - id: kebab-case
   - name: human-readable
   - description
   - category
   - safetyLevel: 0–3
   - inputs: Zod schema
   - outputs: Zod schema
4. Create data model (TypeScript types in `src/lib/jarvis/tools/`).
5. Implement tool logic in `src/lib/jarvis/tools/safe-tools/<id>.ts` (or `dangerous-tools/`).
6. Create API endpoint: `src/routes/api/tools/<id>/+server.ts`.
7. Create Svelte UI: `src/routes/(jarvis)/tools/<id>/+page.svelte`.
8. Add loading, error, and empty states to UI.
9. Register in `docs/TOOL_REGISTRY.md`.
10. Add Zod validation to the API endpoint.
11. Run `npm run check`.

## Tool File Structure

```
src/lib/jarvis/tools/
  safe-tools/
    <tool-id>.ts        # Tool implementation
  schema.ts             # Zod schemas
  types.ts              # TypeScript types
  registry.ts           # Tool registry (imports all tools)

src/routes/
  api/tools/<tool-id>/
    +server.ts          # API endpoint
  (jarvis)/tools/<tool-id>/
    +page.svelte        # UI
    +page.server.ts     # Server-side load + actions
```

## Dangerous Tool Rule
If `safetyLevel >= 2`: the API endpoint MUST return a `requires_confirmation: true` response before executing, and the UI must show a confirmation dialog.

## Output Format
- Tool implementation file
- API endpoint
- Svelte UI page
- Updated `docs/TOOL_REGISTRY.md`

## Validation Checklist
- [ ] Tool has unique id (no collision in registry)
- [ ] Zod schema validates inputs before execution
- [ ] Safety level correctly set
- [ ] Level 2+ tools have confirmation flow
- [ ] UI has loading, error, empty states
- [ ] `npm run check` passes
- [ ] Registry updated

## Failure Handling
- If a tool with that id already exists: improve the existing one
- If safety level is unclear: default to one level higher (safer)

## Examples
**Request:** "Build a tool to list project tasks."
**Output:** `list-tasks` tool, Level 0, reads from Supabase `memory_tasks` table, renders in a clean table UI.

## Registry Update Requirements
- Add to `docs/TOOL_REGISTRY.md`
- Log in `docs/SELF_IMPROVEMENT_LOG.md`
