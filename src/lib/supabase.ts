import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function getSupabase() {
  if (_client) return _client;

  const url = import.meta.env.VITE_SUPABASE_URL
    || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
    || '';

  if (!url || !key) throw new Error('Supabase env vars not set (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)');
  _client = createClient(url, key);
  return _client;
}
