'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/types';
import DashboardShell from '@/components/DashboardShell';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', dob: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    api<{ user: User }>('/api/users/me')
      .then((data) => {
        setUser(data.user);
        setForm({
          name: data.user.name,
          phone: data.user.phone || '',
          dob: data.user.dob?.split('T')[0] || '',
          address: data.user.address || '',
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const data = await api<{ user: User }>('/api/users/me', { method: 'PATCH', body: JSON.stringify(form) });
      setUser(data.user);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : 'Update failed', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  if (loading) {
    return <DashboardShell><div className="flex items-center justify-center h-64"><p className="font-display text-ink-500">Loading...</p></div></DashboardShell>;
  }

  return (
    <DashboardShell>
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold mb-1">Profile</h1>
        <p className="text-ink-500 mb-8">Manage your personal information.</p>

        {/* Read-only info */}
        <div className="neo-card p-6 mb-6">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-400 mb-4">Account Info</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-ink-400 font-medium">Email</span>
              <p className="font-mono text-ink-800">{user?.email}</p>
            </div>
            <div>
              <span className="text-ink-400 font-medium">Membership ID</span>
              <p className="font-mono text-ink-800">{user?.membershipId || '—'}</p>
            </div>
            <div>
              <span className="text-ink-400 font-medium">Status</span>
              <p><span className={`neo-badge text-xs ${user?.status === 'APPROVED' ? 'bg-green-50 text-success' : user?.status === 'PENDING' ? 'bg-yellow-50 text-warning' : 'bg-accent-light text-accent'}`}>{user?.status}</span></p>
            </div>
            <div>
              <span className="text-ink-400 font-medium">Role</span>
              <p className="font-mono text-ink-800">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Editable form */}
        <div className="neo-card p-6">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-400 mb-4">Personal Details</h2>

          {message.text && (
            <div className={`mb-4 border-2 p-3 text-sm font-medium ${message.type === 'success' ? 'border-success bg-green-50 text-success' : 'border-accent bg-accent-light text-accent'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-display font-semibold text-ink-700 mb-1.5">Full Name</label>
              <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
                className="neo-input" required />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-display font-semibold text-ink-700 mb-1.5">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)}
                  className="neo-input" />
              </div>
              <div>
                <label className="block text-sm font-display font-semibold text-ink-700 mb-1.5">Date of Birth</label>
                <input type="date" value={form.dob} onChange={(e) => update('dob', e.target.value)}
                  className="neo-input" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-display font-semibold text-ink-700 mb-1.5">Address</label>
              <textarea value={form.address} onChange={(e) => update('address', e.target.value)}
                className="neo-input" rows={3} />
            </div>
            <button type="submit" disabled={saving} className="neo-btn neo-btn-primary disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
