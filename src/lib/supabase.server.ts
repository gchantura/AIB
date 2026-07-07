import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { env as pubenv } from '$env/dynamic/public';

export function getServerSupabase() {
  const url = env.SUPABASE_URL || pubenv.PUBLIC_SUPABASE_URL || env.VITE_SUPABASE_URL || '';
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || pubenv.PUBLIC_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || '';

  if (!url || !key) throw new Error('Supabase env vars not configured');
  return createClient(url, key);
}
