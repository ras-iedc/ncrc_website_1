'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import type { User } from '@/types';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      setLoading(false);
      return;
    }
    api<{ user: User }>('/api/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => {
        // Fallback to session data if backend /me fails
        const u = session.user as Record<string, unknown>;
        setUser({
          id: u.id as string,
          name: u.name as string,
          email: u.email as string,
          role: u.role as 'MEMBER' | 'ADMIN',
          status: u.status as 'PENDING' | 'APPROVED' | 'REJECTED',
          emailVerified: false,
          createdAt: '',
        });
      })
      .finally(() => setLoading(false));
  }, [session, status]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Please <a href="/login" className="text-red-600 underline">sign in</a> to continue.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.name}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              user.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
              user.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {user.status}
            </span>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Profile</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Membership ID:</strong> {user.membershipId || 'Pending'}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Phone:</strong> {user.phone || 'Not set'}</p>
            </div>
            <a href="/dashboard/profile" className="mt-4 inline-block text-sm text-red-600 hover:underline">Edit Profile →</a>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Payments</h2>
            <p className="text-sm text-gray-600">View your payment history and download invoices.</p>
            <a href="/payments/history" className="mt-4 inline-block text-sm text-red-600 hover:underline">Payment History →</a>
          </div>

          {user.role === 'ADMIN' && (
            <div className="rounded-xl bg-white p-6 shadow">
              <h2 className="mb-2 text-lg font-semibold text-gray-900">Admin Panel</h2>
              <p className="text-sm text-gray-600">Manage members, view audit logs, and more.</p>
              <a href="/admin/members" className="mt-4 inline-block text-sm text-red-600 hover:underline">Manage Members →</a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
