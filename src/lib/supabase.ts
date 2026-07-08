import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';

let _client: SupabaseClient | null = null;

export function getSupabase() {
  if (_client) return _client;

  const url = env.PUBLIC_SUPABASE_URL || '';
  const key = env.PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !key) throw new Error('Supabase env vars not set (PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY)');
  _client = createClient(url, key);
  return _client;
}
