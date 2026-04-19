'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import Link from 'next/link';
import type { User, Notification as Notif, Payment } from '@/types';
import DashboardShell from '@/components/DashboardShell';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    Promise.all([
      api<{ user: User }>('/api/auth/me').catch(() => {
        const u = session.user as Record<string, unknown>;
        return { user: { id: u.id, name: u.name, email: u.email, role: u.role, status: u.status, emailVerified: false, createdAt: '' } as User };
      }),
      api<{ notifications: Notif[] }>('/api/notifications').catch(() => ({ notifications: [] })),
      api<{ payments: Payment[] }>('/api/payments/history?limit=5').catch(() => ({ payments: [] })),
    ]).then(([userData, notifData, payData]) => {
      setUser(userData.user);
      setNotifications(notifData.notifications.slice(0, 5));
      setRecentPayments(payData.payments.slice(0, 5));
      setLoading(false);
    });
  }, [session]);

  if (loading || !user) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <p className="font-display text-ink-500">Loading...</p>
        </div>
      </DashboardShell>
    );
  }

  const isAdmin = user.role === 'ADMIN';

  return (
    <DashboardShell>
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-1">
          Welcome back, {user.name?.split(' ')[0]}
        </h1>
        <p className="text-ink-500">Here&apos;s what&apos;s happening with your account.</p>
      </div>

      {/* Status banner */}
      {user.status === 'PENDING' && (
        <div className="neo-card p-4 mb-6 bg-yellow-50 border-warning">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="font-display font-semibold text-ink-900">Membership Pending</p>
              <p className="text-sm text-ink-600">Your account is awaiting admin approval. You&apos;ll be notified once approved.</p>
            </div>
          </div>
        </div>
      )}
      {user.status === 'REJECTED' && (
        <div className="neo-card p-4 mb-6 bg-accent-light border-accent">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✗</span>
            <div>
              <p className="font-display font-semibold text-ink-900">Membership Rejected</p>
              <p className="text-sm text-ink-600">Your application was not approved. Please contact the club for more information.</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Status" value={user.status} accent={user.status === 'APPROVED' ? 'bg-green-50 text-success' : 'bg-yellow-50 text-warning'} />
        <StatCard label="Member ID" value={user.membershipId || '—'} accent="bg-cream-100 text-ink-700" />
        <StatCard label="Role" value={user.role} accent="bg-cream-100 text-ink-700" />
        <StatCard label="Notifications" value={String(notifications.filter(n => !n.read).length)} accent="bg-accent-light text-accent" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick actions */}
        <div className="neo-card p-6">
          <h2 className="font-display text-lg font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction href="/dashboard/profile" label="Edit Profile" icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            <QuickAction href="/payments/history" label="Payments" icon="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            <QuickAction href="/posts" label="News & Events" icon="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            <QuickAction href="/shop" label="Pro Shop" icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            {isAdmin && (
              <>
                <QuickAction href="/admin/members" label="Manage Members" icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                <QuickAction href="/admin/posts" label="Manage Posts" icon="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </>
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="neo-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold">Notifications</h2>
            <Link href="/notifications" className="text-sm text-accent font-semibold hover:underline">View all →</Link>
          </div>
          {notifications.length === 0 ? (
            <p className="text-ink-400 text-sm py-4 text-center">No notifications yet.</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className={`p-3 border-2 text-sm ${n.read ? 'border-ink-200 bg-white' : 'border-ink-900 bg-cream-100'}`}>
                  <p className="font-semibold text-ink-800">{n.title}</p>
                  <p className="text-ink-500 text-xs mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent payments */}
        <div className="neo-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold">Recent Payments</h2>
            <Link href="/payments/history" className="text-sm text-accent font-semibold hover:underline">View all →</Link>
          </div>
          {recentPayments.length === 0 ? (
            <p className="text-ink-400 text-sm py-4 text-center">No payments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="neo-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((p) => (
                    <tr key={p.id}>
                      <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td>{p.description || '—'}</td>
                      <td className="font-mono font-medium">₹{(p.amount / 100).toFixed(2)}</td>
                      <td>
                        <span className={`neo-badge text-xs ${p.status === 'PAID' ? 'bg-green-50 text-success' : 'bg-yellow-50 text-warning'}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="neo-card p-4">
      <p className="text-xs font-display font-semibold text-ink-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`font-display text-xl font-bold ${accent} inline-block px-2 py-0.5`}>{value}</p>
    </div>
  );
}

function QuickAction({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 p-3 border-2 border-ink-200 hover:border-ink-900 hover:shadow-[2px_2px_0_var(--color-ink-900)] transition-all text-sm font-medium text-ink-700 hover:text-ink-900">
      <svg className="w-5 h-5 shrink-0 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
      </svg>
      {label}
    </Link>
  );
}
