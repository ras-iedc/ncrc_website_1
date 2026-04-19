'use client';

import { useState, Suspense } from 'react';
import { api } from '@/lib/api';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) });
      router.push('/login?reset=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="neo-card p-8">
      <h1 className="font-display text-2xl font-bold text-center mb-1">Reset Password</h1>
      <p className="text-center text-ink-500 text-sm mb-6">Choose a new password</p>

      {error && (
        <div className="mb-4 border-2 border-accent bg-accent-light p-3 text-sm text-accent font-medium">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-display font-semibold text-ink-700 mb-1.5">New Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="neo-input" placeholder="Min 8 characters" required minLength={8} />
        </div>
        <button type="submit" disabled={loading} className="w-full neo-btn neo-btn-primary disabled:opacity-50">
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-600">
        <Link href="/login" className="text-accent font-semibold hover:underline">← Back to login</Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="neo-card p-8 text-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
