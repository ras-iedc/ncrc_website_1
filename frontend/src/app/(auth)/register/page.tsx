'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', dob: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api('/api/auth/register', { method: 'POST', body: JSON.stringify(form) });
      router.push('/login?registered=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="neo-card p-8">
      <h1 className="font-display text-2xl font-bold text-center mb-1">Join the Club</h1>
      <p className="text-center text-ink-500 text-sm mb-6">Create your membership account</p>

      {error && (
        <div className="mb-4 border-2 border-accent bg-accent-light p-3 text-sm text-accent font-medium">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-display font-semibold text-ink-700 mb-1.5">Full Name *</label>
          <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
            className="neo-input" placeholder="John Doe" required />
        </div>
        <div>
          <label className="block text-sm font-display font-semibold text-ink-700 mb-1.5">Email *</label>
          <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
            className="neo-input" placeholder="you@example.com" required />
        </div>
        <div>
          <label className="block text-sm font-display font-semibold text-ink-700 mb-1.5">Password *</label>
          <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)}
            className="neo-input" placeholder="Min 8 characters" required minLength={8} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-display font-semibold text-ink-700 mb-1.5">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)}
              className="neo-input" placeholder="9876543210" />
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
            className="neo-input" rows={2} placeholder="Your address" />
        </div>
        <button type="submit" disabled={loading} className="w-full neo-btn neo-btn-primary disabled:opacity-50">
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-600">
        Already a member? <Link href="/login" className="text-accent font-semibold hover:underline">Sign in →</Link>
      </p>
    </div>
  );
}
