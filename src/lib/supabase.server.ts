import { createClient } from '@supabase/supabase-js';
import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

let _client: ReturnType<typeof createClient> | null = null;

export function getServerSupabase() {
  if (_client) return _client;

  const url = privateEnv.SUPABASE_URL || publicEnv.VITE_SUPABASE_URL || '';
  const key =
    privateEnv.SUPABASE_SERVICE_ROLE_KEY ||
    privateEnv.SUPABASE_ANON_KEY ||
    publicEnv.VITE_SUPABASE_ANON_KEY ||
    '';

  if (!url || !key) throw new Error('Supabase env vars not configured');
  _client = createClient(url, key);
  return _client;
}
