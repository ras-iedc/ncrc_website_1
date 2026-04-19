// Auth is now handled by Supabase. See:
// - src/lib/supabase.ts  (browser client)
// - src/components/AuthProvider.tsx  (auth context + useAuth hook)
// This file is kept as a re-export convenience.

export { useAuth } from '@/components/AuthProvider';
export { getSupabaseBrowserClient } from '@/lib/supabase';
