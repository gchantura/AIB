/*
# Fix timezone-naive storage for event times

The app treats all event/task times as naive local (no timezone awareness).
timestamptz columns caused UTC conversion on both insert and select,
making stored values shift when round-tripping.

Fix: convert user-facing time columns to text so they store exactly
what the frontend sends — no interpretation, no conversion.

Auto-managed timestamps (created_at, updated_at) stay as timestamptz.
*/

-- workspace_events
ALTER TABLE workspace_events DROP COLUMN IF EXISTS starts_at;
ALTER TABLE workspace_events ADD COLUMN starts_at text DEFAULT '';
COMMENT ON COLUMN workspace_events.starts_at IS 'Naive local ISO time: YYYY-MM-DDTHH:MM (no timezone offset)';

ALTER TABLE workspace_events DROP COLUMN IF EXISTS ends_at;
ALTER TABLE workspace_events ADD COLUMN ends_at text DEFAULT '';
COMMENT ON COLUMN workspace_events.ends_at IS 'Naive local ISO time: YYYY-MM-DDTHH:MM';

-- Rename next_notify_at to store naive strings but keep the column type.
-- It's used by the scheduler internally — can stay as timestamptz if needed,
-- but for consistency with the app's local-time model, make it text too.
ALTER TABLE workspace_events DROP COLUMN IF EXISTS next_notify_at;
ALTER TABLE workspace_events ADD COLUMN next_notify_at text DEFAULT NULL;
COMMENT ON COLUMN workspace_events.next_notify_at IS 'Naive local time of next notification';

-- Same fix for workspace_tasks: due_at should be naive local
ALTER TABLE workspace_tasks DROP COLUMN IF EXISTS due_at;
ALTER TABLE workspace_tasks ADD COLUMN due_at text DEFAULT '';
COMMENT ON COLUMN workspace_tasks.due_at IS 'Naive local ISO time: YYYY-MM-DDTHH:MM';

ALTER TABLE workspace_tasks DROP COLUMN IF EXISTS next_notify_at;
ALTER TABLE workspace_tasks ADD COLUMN next_notify_at text DEFAULT NULL;
COMMENT ON COLUMN workspace_tasks.next_notify_at IS 'Naive local time of next notification';
