'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import DashboardShell from '@/components/DashboardShell';

export default function FeedbackPage() {
  const [form, setForm] = useState({ subject: '', message: '' });
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api('/api/feedback', { method: 'POST', body: JSON.stringify(form) });
      setSubmitted(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Submission failed');
    } finally { setSaving(false); }
  };

  if (submitted) {
    return (
      <DashboardShell>
        <div className="max-w-xl mx-auto neo-card p-8 text-center">
          <div className="text-4xl mb-4">✓</div>
          <h1 className="font-display text-2xl font-bold mb-2">Thank you!</h1>
          <p className="text-ink-500 mb-6">Your feedback has been submitted. We appreciate your input.</p>
          <button onClick={() => { setSubmitted(false); setForm({ subject: '', message: '' }); }}
            className="neo-btn neo-btn-secondary">Submit another</button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="max-w-xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-1">Feedback</h1>
        <p className="text-ink-500 mb-8">Share your thoughts, suggestions, or concerns with the club management.</p>

        <div className="neo-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-display font-semibold text-ink-700 mb-1.5">Subject</label>
              <input type="text" value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                className="neo-input" placeholder="Brief topic" required />
            </div>
            <div>
              <label className="block text-sm font-display font-semibold text-ink-700 mb-1.5">Message</label>
              <textarea value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                className="neo-input" rows={6} placeholder="Your feedback..." required />
            </div>
            <button type="submit" disabled={saving} className="neo-btn neo-btn-primary disabled:opacity-50">
              {saving ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
