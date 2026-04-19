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
      await api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      router.push('/login?registered=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-2xl font-bold text-center text-gray-900">Create Account</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none" required minLength={8} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input type="date" value={form.dob} onChange={(e) => update('dob', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea value={form.address} onChange={(e) => update('address', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none" rows={2} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-red-600 py-2 text-white font-medium hover:bg-red-700 disabled:opacity-50 transition">
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link href="/login" className="text-red-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
