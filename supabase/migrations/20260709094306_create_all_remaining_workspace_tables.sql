/*
# J.A.R.V.I.S. Full Database Migration — All Remaining Collections

## Summary
Migrates all remaining entity collections from the local JSON file (.jarvis/workspace.json)
to Supabase tables. After this migration, the local JSON store is completely removed.
This is a single-tenant, no-auth app — all policies use TO anon, authenticated with USING (true).

## New Tables (16)

### Entity kinds (CRUD via createEntity/updateEntity/deleteEntity)
1. `workspace_research` — research items with query, summary, sources (JSONB), status
2. `workspace_automations` — scheduled automations with action, schedule, enabled, run times
3. `workspace_learning` — learning items with topic, area, status, notes

### System collections (direct read/write via transaction/snapshot)
4. `workspace_audit` — audit event log (action, entity, outcome, detail)
5. `workspace_generated_tools` — dynamically registered tool manifests
6. `workspace_generated_skills` — dynamically generated skill manifests
7. `workspace_memories` — local memory entries with category, content, tags, confidence
8. `workspace_approvals` — tool approval requests with status lifecycle
9. `workspace_rollbacks` — rollback records with file snapshots (JSONB)
10. `workspace_conversations` — chat conversations with messages (JSONB)
11. `workspace_model_runs` — model execution logs
12. `workspace_notifications` — user-facing notifications with read tracking
13. `workspace_briefings` — daily briefing summaries
14. `workspace_execution_metrics` — execution metrics for evaluation
15. `workspace_improvement_proposals` — self-improvement proposals
16. `workspace_upgrade_plans` — upgrade plans with validation results (JSONB)

## Security
- RLS enabled on all 16 tables
- No-auth app: policies use TO anon, authenticated with USING (true) / WITH CHECK (true)
- All tables use gen_random_uuid() for primary keys
- All tables have created_at / updated_at timestamps where applicable

## Important Notes
1. JSONB columns store complex nested objects (messages, files, sources, validation results)
2. Text arrays used for tags and evidence
3. All tables are idempotent (IF NOT EXISTS)
4. Policies are dropped before create to ensure idempotency
*/

-- Helper: generate RLS policies for a table (anon + authenticated, full CRUD)
-- We'll write these out explicitly per table for clarity.

-- ============================================================
-- 1. workspace_research
-- ============================================================
CREATE TABLE IF NOT EXISTS workspace_research (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL DEFAULT '',
  query       text NOT NULL DEFAULT '',
  summary     text NOT NULL DEFAULT '',
  sources     jsonb NOT NULL DEFAULT '[]',
  status      text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','complete')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE workspace_research ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_workspace_research" ON workspace_research;
CREATE POLICY "select_workspace_research" ON workspace_research FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_workspace_research" ON workspace_research;
CREATE POLICY "insert_workspace_research" ON workspace_research FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_workspace_research" ON workspace_research;
CREATE POLICY "update_workspace_research" ON workspace_research FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_workspace_research" ON workspace_research;
CREATE POLICY "delete_workspace_research" ON workspace_research FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 2. workspace_automations
-- ============================================================
CREATE TABLE IF NOT EXISTS workspace_automations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL DEFAULT '',
  action      text NOT NULL DEFAULT '',
  schedule    text NOT NULL DEFAULT 'daily',
  enabled     boolean NOT NULL DEFAULT true,
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS workspace_automations_enabled_idx ON workspace_automations (enabled);
CREATE INDEX IF NOT EXISTS workspace_automations_next_run_at_idx ON workspace_automations (next_run_at);
ALTER TABLE workspace_automations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_workspace_automations" ON workspace_automations;
CREATE POLICY "select_workspace_automations" ON workspace_automations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_workspace_automations" ON workspace_automations;
CREATE POLICY "insert_workspace_automations" ON workspace_automations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_workspace_automations" ON workspace_automations;
CREATE POLICY "update_workspace_automations" ON workspace_automations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_workspace_automations" ON workspace_automations;
CREATE POLICY "delete_workspace_automations" ON workspace_automations FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 3. workspace_learning
-- ============================================================
CREATE TABLE IF NOT EXISTS workspace_learning (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic       text NOT NULL DEFAULT '',
  area        text NOT NULL DEFAULT '',
  status      text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','learning','complete')),
  notes       text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE workspace_learning ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_workspace_learning" ON workspace_learning;
CREATE POLICY "select_workspace_learning" ON workspace_learning FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_workspace_learning" ON workspace_learning;
CREATE POLICY "insert_workspace_learning" ON workspace_learning FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_workspace_learning" ON workspace_learning;
CREATE POLICY "update_workspace_learning" ON workspace_learning FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_workspace_learning" ON workspace_learning;
CREATE POLICY "delete_workspace_learning" ON workspace_learning FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 4. workspace_audit
-- ============================================================
CREATE TABLE IF NOT EXISTS workspace_audit (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  at         timestamptz NOT NULL DEFAULT now(),
  action     text NOT NULL DEFAULT '',
  entity     text,
  entity_id  uuid,
  outcome    text NOT NULL DEFAULT 'success' CHECK (outcome IN ('success','denied','failed')),
  detail     text NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS workspace_audit_at_idx ON workspace_audit (at DESC);
ALTER TABLE workspace_audit ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_workspace_audit" ON workspace_audit;
CREATE POLICY "select_workspace_audit" ON workspace_audit FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_workspace_audit" ON workspace_audit;
CREATE POLICY "insert_workspace_audit" ON workspace_audit FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_workspace_audit" ON workspace_audit;
CREATE POLICY "update_workspace_audit" ON workspace_audit FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_workspace_audit" ON workspace_audit;
CREATE POLICY "delete_workspace_audit" ON workspace_audit FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 5. workspace_generated_tools
-- ============================================================
CREATE TABLE IF NOT EXISTS workspace_generated_tools (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id       text NOT NULL,
  name          text NOT NULL DEFAULT '',
  description   text NOT NULL DEFAULT '',
  category      text NOT NULL DEFAULT '',
  safety_level  int NOT NULL DEFAULT 0,
  generated     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS workspace_generated_tools_tool_id_idx ON workspace_generated_tools (tool_id);
ALTER TABLE workspace_generated_tools ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_workspace_generated_tools" ON workspace_generated_tools;
CREATE POLICY "select_workspace_generated_tools" ON workspace_generated_tools FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_workspace_generated_tools" ON workspace_generated_tools;
CREATE POLICY "insert_workspace_generated_tools" ON workspace_generated_tools FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_workspace_generated_tools" ON workspace_generated_tools;
CREATE POLICY "update_workspace_generated_tools" ON workspace_generated_tools FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_workspace_generated_tools" ON workspace_generated_tools;
CREATE POLICY "delete_workspace_generated_tools" ON workspace_generated_tools FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 6. workspace_generated_skills
-- ============================================================
CREATE TABLE IF NOT EXISTS workspace_generated_skills (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id    text NOT NULL,
  name        text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  path        text NOT NULL DEFAULT '',
  generated   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS workspace_generated_skills_skill_id_idx ON workspace_generated_skills (skill_id);
ALTER TABLE workspace_generated_skills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_workspace_generated_skills" ON workspace_generated_skills;
CREATE POLICY "select_workspace_generated_skills" ON workspace_generated_skills FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_workspace_generated_skills" ON workspace_generated_skills;
CREATE POLICY "insert_workspace_generated_skills" ON workspace_generated_skills FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_workspace_generated_skills" ON workspace_generated_skills;
CREATE POLICY "update_workspace_generated_skills" ON workspace_generated_skills FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_workspace_generated_skills" ON workspace_generated_skills;
CREATE POLICY "delete_workspace_generated_skills" ON workspace_generated_skills FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 7. workspace_memories
-- ============================================================
CREATE TABLE IF NOT EXISTS workspace_memories (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category     text NOT NULL DEFAULT '',
  content      text NOT NULL DEFAULT '',
  summary      text,
  source        text NOT NULL DEFAULT 'manual',
  is_inferred  boolean NOT NULL DEFAULT false,
  confidence   real NOT NULL DEFAULT 1,
  tags         text[] NOT NULL DEFAULT '{}',
  project_id   uuid,
  tool_id      uuid,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz
);
CREATE INDEX IF NOT EXISTS workspace_memories_category_idx ON workspace_memories (category);
CREATE INDEX IF NOT EXISTS workspace_memories_tags_idx ON workspace_memories USING GIN (tags);
ALTER TABLE workspace_memories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_workspace_memories" ON workspace_memories;
CREATE POLICY "select_workspace_memories" ON workspace_memories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_workspace_memories" ON workspace_memories;
CREATE POLICY "insert_workspace_memories" ON workspace_memories FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_workspace_memories" ON workspace_memories;
CREATE POLICY "update_workspace_memories" ON workspace_memories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_workspace_memories" ON workspace_memories;
CREATE POLICY "delete_workspace_memories" ON workspace_memories FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 8. workspace_approvals
-- ============================================================
CREATE TABLE IF NOT EXISTS workspace_approvals (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id     text NOT NULL DEFAULT '',
  input       jsonb NOT NULL DEFAULT '{}',
  reason      text NOT NULL DEFAULT '',
  status      text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','denied','consumed')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  decided_at  timestamptz,
  consumed_at timestamptz
);
CREATE INDEX IF NOT EXISTS workspace_approvals_status_idx ON workspace_approvals (status);
ALTER TABLE workspace_approvals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_workspace_approvals" ON workspace_approvals;
CREATE POLICY "select_workspace_approvals" ON workspace_approvals FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_workspace_approvals" ON workspace_approvals;
CREATE POLICY "insert_workspace_approvals" ON workspace_approvals FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_workspace_approvals" ON workspace_approvals;
CREATE POLICY "update_workspace_approvals" ON workspace_approvals FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_workspace_approvals" ON workspace_approvals;
CREATE POLICY "delete_workspace_approvals" ON workspace_approvals FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 9. workspace_rollbacks
-- ============================================================
CREATE TABLE IF NOT EXISTS workspace_rollbacks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_id   uuid,
  tool_id       text NOT NULL DEFAULT '',
  created_at    timestamptz NOT NULL DEFAULT now(),
  status        text NOT NULL DEFAULT 'available' CHECK (status IN ('available','rolled-back')),
  files         jsonb NOT NULL DEFAULT '[]',
  rolled_back_at timestamptz
);
ALTER TABLE workspace_rollbacks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_workspace_rollbacks" ON workspace_rollbacks;
CREATE POLICY "select_workspace_rollbacks" ON workspace_rollbacks FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_workspace_rollbacks" ON workspace_rollbacks;
CREATE POLICY "insert_workspace_rollbacks" ON workspace_rollbacks FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_workspace_rollbacks" ON workspace_rollbacks;
CREATE POLICY "update_workspace_rollbacks" ON workspace_rollbacks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_workspace_rollbacks" ON workspace_rollbacks;
CREATE POLICY "delete_workspace_rollbacks" ON workspace_rollbacks FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 10. workspace_conversations
-- ============================================================
CREATE TABLE IF NOT EXISTS workspace_conversations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL DEFAULT 'New conversation',
  messages    jsonb NOT NULL DEFAULT '[]',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS workspace_conversations_updated_at_idx ON workspace_conversations (updated_at DESC);
ALTER TABLE workspace_conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_workspace_conversations" ON workspace_conversations;
CREATE POLICY "select_workspace_conversations" ON workspace_conversations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_workspace_conversations" ON workspace_conversations;
CREATE POLICY "insert_workspace_conversations" ON workspace_conversations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_workspace_conversations" ON workspace_conversations;
CREATE POLICY "update_workspace_conversations" ON workspace_conversations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_workspace_conversations" ON workspace_conversations;
CREATE POLICY "delete_workspace_conversations" ON workspace_conversations FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 11. workspace_model_runs
-- ============================================================
CREATE TABLE IF NOT EXISTS workspace_model_runs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind        text NOT NULL DEFAULT 'chat' CHECK (kind IN ('chat','research','coding')),
  prompt      text NOT NULL DEFAULT '',
  model       text,
  status      text NOT NULL DEFAULT 'complete' CHECK (status IN ('complete','failed')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  output      text,
  error       text
);
CREATE INDEX IF NOT EXISTS workspace_model_runs_created_at_idx ON workspace_model_runs (created_at DESC);
ALTER TABLE workspace_model_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_workspace_model_runs" ON workspace_model_runs;
CREATE POLICY "select_workspace_model_runs" ON workspace_model_runs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_workspace_model_runs" ON workspace_model_runs;
CREATE POLICY "insert_workspace_model_runs" ON workspace_model_runs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_workspace_model_runs" ON workspace_model_runs;
CREATE POLICY "update_workspace_model_runs" ON workspace_model_runs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_workspace_model_runs" ON workspace_model_runs;
CREATE POLICY "delete_workspace_model_runs" ON workspace_model_runs FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 12. workspace_notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS workspace_notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL DEFAULT '',
  message     text NOT NULL DEFAULT '',
  level       text NOT NULL DEFAULT 'info' CHECK (level IN ('info','success','warning','error')),
  source      text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now(),
  read_at     timestamptz
);
CREATE INDEX IF NOT EXISTS workspace_notifications_created_at_idx ON workspace_notifications (created_at DESC);
ALTER TABLE workspace_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_workspace_notifications" ON workspace_notifications;
CREATE POLICY "select_workspace_notifications" ON workspace_notifications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_workspace_notifications" ON workspace_notifications;
CREATE POLICY "insert_workspace_notifications" ON workspace_notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_workspace_notifications" ON workspace_notifications;
CREATE POLICY "update_workspace_notifications" ON workspace_notifications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_workspace_notifications" ON workspace_notifications;
CREATE POLICY "delete_workspace_notifications" ON workspace_notifications FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 13. workspace_briefings
-- ============================================================
CREATE TABLE IF NOT EXISTS workspace_briefings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date            text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  summary         text NOT NULL DEFAULT '',
  task_ids        uuid[] NOT NULL DEFAULT '{}',
  event_ids       uuid[] NOT NULL DEFAULT '{}',
  recommendations text[] NOT NULL DEFAULT '{}'
);
CREATE UNIQUE INDEX IF NOT EXISTS workspace_briefings_date_idx ON workspace_briefings (date);
ALTER TABLE workspace_briefings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_workspace_briefings" ON workspace_briefings;
CREATE POLICY "select_workspace_briefings" ON workspace_briefings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_workspace_briefings" ON workspace_briefings;
CREATE POLICY "insert_workspace_briefings" ON workspace_briefings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_workspace_briefings" ON workspace_briefings;
CREATE POLICY "update_workspace_briefings" ON workspace_briefings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_workspace_briefings" ON workspace_briefings;
CREATE POLICY "delete_workspace_briefings" ON workspace_briefings FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 14. workspace_execution_metrics
-- ============================================================
CREATE TABLE IF NOT EXISTS workspace_execution_metrics (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  capability   text NOT NULL DEFAULT '',
  kind         text NOT NULL DEFAULT 'tool' CHECK (kind IN ('tool','model','automation')),
  started_at   timestamptz NOT NULL DEFAULT now(),
  duration_ms  int NOT NULL DEFAULT 0,
  ok           boolean NOT NULL DEFAULT true,
  error        text,
  metadata     jsonb
);
CREATE INDEX IF NOT EXISTS workspace_execution_metrics_started_at_idx ON workspace_execution_metrics (started_at DESC);
CREATE INDEX IF NOT EXISTS workspace_execution_metrics_capability_idx ON workspace_execution_metrics (capability);
ALTER TABLE workspace_execution_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_workspace_execution_metrics" ON workspace_execution_metrics;
CREATE POLICY "select_workspace_execution_metrics" ON workspace_execution_metrics FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_workspace_execution_metrics" ON workspace_execution_metrics;
CREATE POLICY "insert_workspace_execution_metrics" ON workspace_execution_metrics FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_workspace_execution_metrics" ON workspace_execution_metrics;
CREATE POLICY "update_workspace_execution_metrics" ON workspace_execution_metrics FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_workspace_execution_metrics" ON workspace_execution_metrics;
CREATE POLICY "delete_workspace_execution_metrics" ON workspace_execution_metrics FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 15. workspace_improvement_proposals
-- ============================================================
CREATE TABLE IF NOT EXISTS workspace_improvement_proposals (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL DEFAULT '',
  rationale   text NOT NULL DEFAULT '',
  target      text NOT NULL DEFAULT '',
  evidence    text[] NOT NULL DEFAULT '{}',
  risk        text NOT NULL DEFAULT 'low' CHECK (risk IN ('low','medium','high')),
  status      text NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','approved','dismissed')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  decided_at  timestamptz
);
CREATE INDEX IF NOT EXISTS workspace_improvement_proposals_status_idx ON workspace_improvement_proposals (status);
ALTER TABLE workspace_improvement_proposals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_workspace_improvement_proposals" ON workspace_improvement_proposals;
CREATE POLICY "select_workspace_improvement_proposals" ON workspace_improvement_proposals FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_workspace_improvement_proposals" ON workspace_improvement_proposals;
CREATE POLICY "insert_workspace_improvement_proposals" ON workspace_improvement_proposals FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_workspace_improvement_proposals" ON workspace_improvement_proposals;
CREATE POLICY "update_workspace_improvement_proposals" ON workspace_improvement_proposals FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_workspace_improvement_proposals" ON workspace_improvement_proposals;
CREATE POLICY "delete_workspace_improvement_proposals" ON workspace_improvement_proposals FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 16. workspace_upgrade_plans
-- ============================================================
CREATE TABLE IF NOT EXISTS workspace_upgrade_plans (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id   uuid,
  title         text NOT NULL DEFAULT '',
  target        text NOT NULL DEFAULT '',
  status        text NOT NULL DEFAULT 'preparing' CHECK (status IN ('preparing','ready','blocked','verified')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  steps         text[] NOT NULL DEFAULT '{}',
  validation    jsonb NOT NULL DEFAULT '[]'
);
CREATE INDEX IF NOT EXISTS workspace_upgrade_plans_status_idx ON workspace_upgrade_plans (status);
ALTER TABLE workspace_upgrade_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_workspace_upgrade_plans" ON workspace_upgrade_plans;
CREATE POLICY "select_workspace_upgrade_plans" ON workspace_upgrade_plans FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_workspace_upgrade_plans" ON workspace_upgrade_plans;
CREATE POLICY "insert_workspace_upgrade_plans" ON workspace_upgrade_plans FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_workspace_upgrade_plans" ON workspace_upgrade_plans;
CREATE POLICY "update_workspace_upgrade_plans" ON workspace_upgrade_plans FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_workspace_upgrade_plans" ON workspace_upgrade_plans;
CREATE POLICY "delete_workspace_upgrade_plans" ON workspace_upgrade_plans FOR DELETE TO anon, authenticated USING (true);
