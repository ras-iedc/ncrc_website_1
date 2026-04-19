'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const registered = searchParams.get('registered');
  const reset = searchParams.get('reset');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError('Invalid email or password');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="neo-card p-8">
      <h1 className="font-display text-2xl font-bold text-center mb-1">Welcome Back</h1>
      <p className="text-center text-ink-500 text-sm mb-6">Sign in to your account</p>

      {registered && (
        <div className="mb-4 border-2 border-success bg-green-50 p-3 text-sm text-success font-medium">
          Account created! Please sign in.
        </div>
      )}
      {reset && (
        <div className="mb-4 border-2 border-success bg-green-50 p-3 text-sm text-success font-medium">
          Password reset successfully. Sign in with your new password.
        </div>
      )}
      {error && (
        <div className="mb-4 border-2 border-accent bg-accent-light p-3 text-sm text-accent font-medium">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-display font-semibold text-ink-700 mb-1.5">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="neo-input" placeholder="you@example.com" required />
        </div>
        <div>
          <label className="block text-sm font-display font-semibold text-ink-700 mb-1.5">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="neo-input" placeholder="••••••••" required />
        </div>
        <button type="submit" disabled={loading} className="w-full neo-btn neo-btn-primary disabled:opacity-50">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-4">
        <button onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="w-full neo-btn neo-btn-secondary">
          Continue with Google
        </button>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="text-ink-500 hover:text-accent font-medium transition-colors">
          Forgot password?
        </Link>
        <Link href="/register" className="text-accent font-semibold hover:underline">
          Create account →
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="neo-card p-8 text-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
