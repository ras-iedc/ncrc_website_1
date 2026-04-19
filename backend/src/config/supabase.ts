import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// Admin client — for server-side auth operations (create users, verify tokens, etc.)
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
