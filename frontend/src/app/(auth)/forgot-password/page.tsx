'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="neo-card p-8 text-center">
        <div className="w-12 h-12 bg-green-50 border-2 border-success flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-bold mb-2">Check Your Email</h1>
        <p className="text-ink-500 text-sm mb-4">If an account exists with that email, we&apos;ve sent a password reset link.</p>
        <Link href="/login" className="text-accent font-semibold text-sm hover:underline">← Back to login</Link>
      </div>
    );
  }

  return (
    <div className="neo-card p-8">
      <h1 className="font-display text-2xl font-bold text-center mb-1">Forgot Password</h1>
      <p className="text-center text-ink-500 text-sm mb-6">Enter your email to reset your password</p>

      {error && (
        <div className="mb-4 border-2 border-accent bg-accent-light p-3 text-sm text-accent font-medium">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-display font-semibold text-ink-700 mb-1.5">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="neo-input" placeholder="you@example.com" required />
        </div>
        <button type="submit" disabled={loading} className="w-full neo-btn neo-btn-primary disabled:opacity-50">
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-600">
        <Link href="/login" className="text-accent font-semibold hover:underline">← Back to login</Link>
      </p>
    </div>
  );
}
