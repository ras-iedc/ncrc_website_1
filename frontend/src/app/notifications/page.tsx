'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Notification as Notif } from '@/types';
import DashboardShell from '@/components/DashboardShell';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ notifications: Notif[] }>('/api/notifications')
      .then((data) => setNotifications(data.notifications))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    await api(`/api/notifications/${id}/read`, { method: 'PATCH' });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DashboardShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Notifications</h1>
          <p className="text-ink-500 text-sm">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="neo-card p-12 text-center"><p className="text-ink-500">Loading...</p></div>
      ) : notifications.length === 0 ? (
        <div className="neo-card p-12 text-center">
          <svg className="w-12 h-12 mx-auto text-ink-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="text-ink-500">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className={`neo-card p-4 transition-all ${n.read ? 'opacity-70' : 'border-ink-900'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!n.read && <span className="w-2 h-2 rounded-full bg-accent shrink-0" />}
                    <h3 className="font-display font-bold text-ink-900 truncate">{n.title}</h3>
                  </div>
                  <p className="text-sm text-ink-600">{n.message}</p>
                  <p className="text-xs text-ink-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.read && (
                  <button onClick={() => markRead(n.id)}
                    className="text-xs font-semibold px-3 py-1.5 border-2 border-ink-300 hover:border-ink-900 transition-colors shrink-0">
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
