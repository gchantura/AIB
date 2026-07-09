-- Migration: workspace_app_settings (replaces .jarvis/settings.json + localStorage)
-- Run in Supabase SQL Editor. This table stores all app-level settings as key-value pairs.
-- It replaces file-system-only settings and insecure localStorage provider config.

CREATE TABLE IF NOT EXISTS workspace_app_settings (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key          text UNIQUE NOT NULL,   -- e.g., 'provider:openai', 'smtp', 'app.privacyMode'
  value        jsonb DEFAULT '{}'::jsonb,
  updated_at   timestamptz DEFAULT now()
);

COMMENT ON TABLE workspace_app_settings IS 'App-level settings: SMTP, privacy toggles, provider config (encrypted in transit)';

-- Index lookups by prefix (used by getKey/setKey helpers)
CREATE INDEX IF NOT EXISTS idx_app_settings_key_prefix ON workspace_app_settings ((left(key, 32)));

-- Migration: workspace_generated_apps (provenance for generated Svelte apps)
-- Replaces orphaned filesystem-only artifacts with DB-backed provenance.

CREATE TABLE IF NOT EXISTS workspace_generated_apps (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text UNIQUE NOT NULL,
  title        text NOT NULL,
  description  text,
  file_count   int DEFAULT 0,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

COMMENT ON TABLE workspace_generated_apps IS 'Provenance tracking for apps generated under generated-apps/';
