'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/types';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', dob: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

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
    setMessage('');

    try {
      const data = await api<{ user: User }>('/api/users/me', {
        method: 'PATCH',
        body: JSON.stringify(form),
      });
      setUser(data.user);
      setMessage('Profile updated!');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Profile</h1>

        {message && (
          <div className={`mb-4 rounded-lg p-3 text-sm ${message.includes('updated') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border px-4 py-2" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-lg border px-4 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })}
              className="w-full rounded-lg border px-4 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full rounded-lg border px-4 py-2" rows={3} />
          </div>

          <button type="submit" disabled={saving}
            className="w-full rounded-lg bg-red-600 py-2 text-white font-medium hover:bg-red-700 disabled:opacity-50 transition">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <a href="/dashboard" className="mt-4 inline-block text-sm text-gray-600 hover:underline">← Back to Dashboard</a>
      </div>
    </div>
  );
}
