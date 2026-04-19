'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DashboardSidebar from '@/components/DashboardSidebar';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="neo-card p-8 text-center">
          <div className="w-8 h-8 border-3 border-ink-900 border-t-accent animate-spin mx-auto mb-3"></div>
          <p className="font-display font-semibold text-sm text-ink-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-6 lg:p-8 bg-cream-50">
          {children}
        </main>
      </div>
    </div>
  );
}
