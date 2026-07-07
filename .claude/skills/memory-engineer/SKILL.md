# Skill: Memory Engineer

## Purpose
Design and implement persistent local memory: database schema, memory API, search, context retrieval, and memory policies for J.A.R.V.I.S.

## Activation Triggers
- Adding a new memory category
- Building the memory search feature
- Implementing context injection into LLM prompts
- Adding memory deletion or export
- Building the Memory Explorer UI

## When to Use
- Any work in `src/lib/jarvis/memory/`
- Any Supabase migration for memory tables
- Any API endpoint under `src/routes/api/memory/`

## When NOT to Use
- Tool or skill storage (those have separate registries)
- User authentication (separate system)

## Required Inputs
- Memory category to implement
- Expected query patterns (search by content, by tag, by project, by date)
- Whether the category needs vector search

## Step-by-Step Workflow

1. Read `docs/MEMORY_SYSTEM.md` — understand existing categories and schema.
2. Check existing Supabase tables with `mcp__supabase__list_tables`.
3. Design the table schema (follow existing memory table patterns).
4. Create a Supabase migration using `mcp__supabase__apply_migration`.
5. Enable RLS: `ALTER TABLE <name> ENABLE ROW LEVEL SECURITY`.
6. Add 4 RLS policies (SELECT, INSERT, UPDATE, DELETE) scoped to `anon, authenticated` (no-auth app).
7. Create TypeScript types in `src/lib/jarvis/memory/types.ts`.
8. Implement CRUD in `src/lib/jarvis/memory/api.ts`.
9. Add search to `src/lib/jarvis/memory/search.ts`.
10. Create API endpoint in `src/routes/api/memory/+server.ts`.
11. Update `docs/MEMORY_SYSTEM.md` with new category.

## RLS Pattern (No-Auth App)

```sql
ALTER TABLE memory_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_memory_tasks" ON memory_tasks FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "insert_memory_tasks" ON memory_tasks FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_memory_tasks" ON memory_tasks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_memory_tasks" ON memory_tasks FOR DELETE
  TO anon, authenticated USING (true);
```

## Memory Entry Required Columns
```sql
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
category TEXT NOT NULL,
content TEXT NOT NULL,
summary TEXT,
source TEXT NOT NULL,
is_inferred BOOLEAN DEFAULT FALSE,
confidence FLOAT DEFAULT 1.0,
tags TEXT[] DEFAULT '{}',
project_id UUID,
tool_id TEXT,
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW(),
expires_at TIMESTAMPTZ
```

## Output Format
- Supabase migration applied
- `src/lib/jarvis/memory/types.ts` updated
- `src/lib/jarvis/memory/api.ts` updated
- Updated `docs/MEMORY_SYSTEM.md`

## Validation Checklist
- [ ] RLS enabled on all new tables
- [ ] 4 separate RLS policies (not FOR ALL)
- [ ] TypeScript types match DB schema
- [ ] `npm run check` passes
- [ ] No secrets stored in memory tables

## Failure Handling
- If migration fails: read error, fix SQL, do not use DROP/ALTER destructive ops
- If RLS blocks reads: check policy uses correct role (`anon` vs `authenticated`)

## Registry Update Requirements
- Update `docs/MEMORY_SYSTEM.md`
- Log in `docs/SELF_IMPROVEMENT_LOG.md`
