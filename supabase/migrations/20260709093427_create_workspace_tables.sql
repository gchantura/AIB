/*
# J.A.R.V.I.S. Workspace Tables — Events, Tasks, Notes, Projects

## Summary
Migrates the workspace data from a local JSON file (.jarvis/workspace.json) to Supabase.
This is a single-tenant, no-auth app — all policies use TO anon, authenticated with USING (true).

## New Tables

### workspace_events
Calendar events with reminders, repeats, and email notification settings:
- id (uuid PK), title, description, starts_at, ends_at
- reminder_minutes, reminder_repeat, notified, next_notify_at
- email_reminder, email_cc
- created_at, updated_at

### workspace_tasks
Tasks with status, priority, due dates, reminders, and email notifications:
- id (uuid PK), title, description, status, priority
- due_at, reminder_minutes, reminder_repeat, notified, next_notify_at
- email_reminder, email_cc, email_subject
- created_at, updated_at

### workspace_notes
Simple notes with tags and optional project link:
- id (uuid PK), title, content, tags (text[]), project_id
- created_at, updated_at

### workspace_projects
Project tracking with status:
- id (uuid PK), name, description, status, path
- created_at, updated_at

## Security
- RLS enabled on all 4 tables
- No-auth app: policies use TO anon, authenticated with USING (true) / WITH CHECK (true)
*/

-- ============================================================
-- workspace_events
-- ============================================================

CREATE TABLE IF NOT EXISTS workspace_events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  description      text NOT NULL DEFAULT '',
  starts_at        timestamptz,
  ends_at          timestamptz,
  reminder_minutes int,
  reminder_repeat  text DEFAULT 'none',
  notified         boolean NOT NULL DEFAULT false,
  next_notify_at   timestamptz,
  email_reminder   text,
  email_cc         text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workspace_events_starts_at_idx ON workspace_events (starts_at);
CREATE INDEX IF NOT EXISTS workspace_events_notified_idx ON workspace_events (notified);

ALTER TABLE workspace_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_workspace_events" ON workspace_events;
CREATE POLICY "select_workspace_events" ON workspace_events
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_workspace_events" ON workspace_events;
CREATE POLICY "insert_workspace_events" ON workspace_events
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_workspace_events" ON workspace_events;
CREATE POLICY "update_workspace_events" ON workspace_events
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_workspace_events" ON workspace_events;
CREATE POLICY "delete_workspace_events" ON workspace_events
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- workspace_tasks
-- ============================================================

CREATE TABLE IF NOT EXISTS workspace_tasks (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  description      text NOT NULL DEFAULT '',
  status           text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','doing','done')),
  priority         text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  due_at           timestamptz,
  reminder_minutes int,
  reminder_repeat  text DEFAULT 'none',
  notified         boolean NOT NULL DEFAULT false,
  next_notify_at   timestamptz,
  email_reminder   text,
  email_cc         text,
  email_subject    text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workspace_tasks_status_idx ON workspace_tasks (status);
CREATE INDEX IF NOT EXISTS workspace_tasks_due_at_idx ON workspace_tasks (due_at);
CREATE INDEX IF NOT EXISTS workspace_tasks_notified_idx ON workspace_tasks (notified);

ALTER TABLE workspace_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_workspace_tasks" ON workspace_tasks;
CREATE POLICY "select_workspace_tasks" ON workspace_tasks
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_workspace_tasks" ON workspace_tasks;
CREATE POLICY "insert_workspace_tasks" ON workspace_tasks
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_workspace_tasks" ON workspace_tasks;
CREATE POLICY "update_workspace_tasks" ON workspace_tasks
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_workspace_tasks" ON workspace_tasks;
CREATE POLICY "delete_workspace_tasks" ON workspace_tasks
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- workspace_notes
-- ============================================================

CREATE TABLE IF NOT EXISTS workspace_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  content     text NOT NULL DEFAULT '',
  tags        text[] NOT NULL DEFAULT '{}',
  project_id   uuid,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workspace_notes_tags_idx ON workspace_notes USING GIN (tags);

ALTER TABLE workspace_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_workspace_notes" ON workspace_notes;
CREATE POLICY "select_workspace_notes" ON workspace_notes
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_workspace_notes" ON workspace_notes;
CREATE POLICY "insert_workspace_notes" ON workspace_notes
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_workspace_notes" ON workspace_notes;
CREATE POLICY "update_workspace_notes" ON workspace_notes
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_workspace_notes" ON workspace_notes;
CREATE POLICY "delete_workspace_notes" ON workspace_notes
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- workspace_projects
-- ============================================================

CREATE TABLE IF NOT EXISTS workspace_projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text NOT NULL DEFAULT '',
  status      text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','complete')),
  path        text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE workspace_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_workspace_projects" ON workspace_projects;
CREATE POLICY "select_workspace_projects" ON workspace_projects
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_workspace_projects" ON workspace_projects;
CREATE POLICY "insert_workspace_projects" ON workspace_projects
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_workspace_projects" ON workspace_projects;
CREATE POLICY "update_workspace_projects" ON workspace_projects
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_workspace_projects" ON workspace_projects;
CREATE POLICY "delete_workspace_projects" ON workspace_projects
  FOR DELETE TO anon, authenticated USING (true);
