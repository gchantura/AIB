/*
# J.A.R.V.I.S. Memory System — Phase 5

## Summary
Creates the persistent memory tables for the J.A.R.V.I.S. AI operating system.
This is a single-tenant, no-auth app — all policies use TO anon, authenticated with USING (true).

## New Tables

### memory_entries
Central memory store for all memory categories:
- id: UUID primary key
- category: The memory type (user-profile, project, task, research, learning, decision, codebase, conversation, daily-log, automation, contact, tool, skill)
- content: Full text content of the memory
- summary: Optional short summary for display
- source: Which tool/feature created this entry (e.g. 'chat', 'tool:create-task', 'bootstrap')
- is_inferred: Whether this was inferred vs directly stated
- confidence: 0.0–1.0 confidence score
- tags: Text array of searchable tags
- project_id: Optional link to a project memory entry
- tool_id: Optional link to a tool
- created_at / updated_at / expires_at: Temporal metadata

### memory_projects
Project-level context entries:
- id, name, description, repo_url, status, tags, created_at, updated_at

### memory_conversations
Compressed conversation summaries for context continuity:
- id, summary, message_count, model_used, created_at

## Security
- RLS enabled on all tables
- No-auth app: policies use TO anon, authenticated with USING (true)
*/

-- ============================================================
-- memory_entries: central memory store
-- ============================================================

CREATE TABLE IF NOT EXISTS memory_entries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category      text NOT NULL CHECK (category IN (
    'user-profile','project','task','research','learning','decision',
    'codebase','conversation','daily-log','automation','contact','tool','skill','note'
  )),
  content       text NOT NULL,
  summary       text,
  source        text NOT NULL DEFAULT 'manual',
  is_inferred   boolean NOT NULL DEFAULT false,
  confidence    float NOT NULL DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),
  tags          text[] NOT NULL DEFAULT '{}',
  project_id    uuid,
  tool_id       text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz
);

CREATE INDEX IF NOT EXISTS memory_entries_category_idx ON memory_entries (category);
CREATE INDEX IF NOT EXISTS memory_entries_created_at_idx ON memory_entries (created_at DESC);
CREATE INDEX IF NOT EXISTS memory_entries_tags_idx ON memory_entries USING GIN (tags);

ALTER TABLE memory_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_memory_entries" ON memory_entries;
CREATE POLICY "select_memory_entries" ON memory_entries
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_memory_entries" ON memory_entries;
CREATE POLICY "insert_memory_entries" ON memory_entries
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_memory_entries" ON memory_entries;
CREATE POLICY "update_memory_entries" ON memory_entries
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_memory_entries" ON memory_entries;
CREATE POLICY "delete_memory_entries" ON memory_entries
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- memory_projects: project-level context
-- ============================================================

CREATE TABLE IF NOT EXISTS memory_projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  repo_url    text,
  status      text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','archived')),
  tags        text[] NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE memory_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_memory_projects" ON memory_projects;
CREATE POLICY "select_memory_projects" ON memory_projects
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_memory_projects" ON memory_projects;
CREATE POLICY "insert_memory_projects" ON memory_projects
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_memory_projects" ON memory_projects;
CREATE POLICY "update_memory_projects" ON memory_projects
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_memory_projects" ON memory_projects;
CREATE POLICY "delete_memory_projects" ON memory_projects
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- memory_conversations: compressed conversation history
-- ============================================================

CREATE TABLE IF NOT EXISTS memory_conversations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  summary       text NOT NULL,
  message_count int NOT NULL DEFAULT 0,
  model_used    text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS memory_conversations_created_at_idx ON memory_conversations (created_at DESC);

ALTER TABLE memory_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_memory_conversations" ON memory_conversations;
CREATE POLICY "select_memory_conversations" ON memory_conversations
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_memory_conversations" ON memory_conversations;
CREATE POLICY "insert_memory_conversations" ON memory_conversations
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_memory_conversations" ON memory_conversations;
CREATE POLICY "update_memory_conversations" ON memory_conversations
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_memory_conversations" ON memory_conversations;
CREATE POLICY "delete_memory_conversations" ON memory_conversations
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- Seed: bootstrap codebase knowledge entries
-- ============================================================

INSERT INTO memory_entries (category, content, summary, source, tags) VALUES
(
  'codebase',
  'J.A.R.V.I.S. is built with SvelteKit 2.x + Svelte 5 (runes mode enforced). Package manager: npm. Styling: Tailwind CSS v4. Adapter: @sveltejs/adapter-vercel. Database: Supabase (PostgreSQL). Icons: lucide-svelte.',
  'Core technology stack',
  'bootstrap',
  ARRAY['sveltekit','svelte5','tailwind','supabase','architecture']
),
(
  'decision',
  'Chose SvelteKit as the UI framework because it was already in place and provides SSR, form actions, and API routes in one system. No need for a separate backend.',
  'Framework choice rationale',
  'bootstrap',
  ARRAY['architecture','framework','decision']
),
(
  'skill',
  '15 Claude Code skills created in .claude/skills/. Key skills: skill-generator, svelte-architect, svelte-ui-engineer, model-provider-engineer, memory-engineer, tool-factory-engineer, safety-guardian, validation-engineer.',
  '15 skills initialized',
  'bootstrap',
  ARRAY['skills','claude','operating-layer']
)
ON CONFLICT DO NOTHING;
