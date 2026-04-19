'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardShell from '@/components/DashboardShell';

interface Feedback {
  id: string; subject: string; message: string; createdAt: string;
  user: { name: string; email: string };
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ feedback: Feedback[] }>('/api/admin/feedback')
      .then((data) => setFeedback(data.feedback))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">Feedback</h1>
        <p className="text-ink-500 text-sm">Review member feedback and suggestions.</p>
      </div>

      {loading ? (
        <div className="neo-card p-12 text-center"><p className="text-ink-500">Loading...</p></div>
      ) : feedback.length === 0 ? (
        <div className="neo-card p-12 text-center"><p className="text-ink-500">No feedback received yet.</p></div>
      ) : (
        <div className="space-y-3">
          {feedback.map((f) => (
            <div key={f.id} className="neo-card p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                <h3 className="font-display font-bold text-ink-900">{f.subject}</h3>
                <span className="text-xs text-ink-400 font-mono shrink-0">{new Date(f.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-sm text-ink-700 whitespace-pre-wrap mb-3">{f.message}</p>
              <p className="text-xs text-ink-500">
                From <span className="font-semibold text-ink-700">{f.user.name}</span> ({f.user.email})
              </p>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
