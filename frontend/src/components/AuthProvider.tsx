'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface AuthContextType {
  session: Session | null;
  supabaseUser: SupabaseUser | null;
  user: AppUser | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  supabaseUser: null,
  user: null,
  status: 'loading',
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  const fetchAppUser = useCallback(async (accessToken: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch {
      // ignore — user data is optional at this stage
    }
  }, []);

  useEffect(() => {
    let supabase: ReturnType<typeof getSupabaseBrowserClient>;
    try {
      supabase = getSupabaseBrowserClient();
    } catch {
      // Env vars not set (e.g. during build)
      setStatus('unauthenticated');
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }: { data: { session: Session | null } }) => {
      setSession(initialSession);
      setSupabaseUser(initialSession?.user ?? null);
      if (initialSession) {
        setStatus('authenticated');
        fetchAppUser(initialSession.access_token);
      } else {
        setStatus('unauthenticated');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, s: Session | null) => {
      setSession(s);
      setSupabaseUser(s?.user ?? null);
      if (s) {
        setStatus('authenticated');
        fetchAppUser(s.access_token);
      } else {
        setStatus('unauthenticated');
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchAppUser]);

  const handleSignOut = useCallback(async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    session, supabaseUser, user, status, signOut: handleSignOut,
  }), [session, supabaseUser, user, status, handleSignOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
