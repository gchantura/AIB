import { createClient } from '@supabase/supabase-js';

let _client = null;

export function getSupabase() {
  if (_client) return _client;

  const url = (typeof window !== 'undefined' ? window.__env?.PUBLIC_SUPABASE_URL : null)
    || import.meta.env.VITE_SUPABASE_URL
    || '';
  const key = (typeof window !== 'undefined' ? window.__env?.PUBLIC_SUPABASE_ANON_KEY : null)
    || import.meta.env.VITE_SUPABASE_ANON_KEY
    || '';

  if (!url || !key) throw new Error('Supabase env vars not set (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)');
  _client = createClient(url, key);
  return _client;
}
