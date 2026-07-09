import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

let _client: ReturnType<typeof createClient> | null = null;

export function getServerSupabase() {
  if (_client) return _client;

  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL || '';
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || '';

  if (!url || !key) throw new Error('Supabase env vars not configured');
  _client = createClient(url, key);
  return _client;
}
