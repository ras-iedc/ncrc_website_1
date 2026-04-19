'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardShell from '@/components/DashboardShell';

interface AuditEntry {
  id: string; action: string; details: Record<string, unknown> | null; createdAt: string;
  user: { name: string; email: string } | null;
}

export default function AdminAuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEntries = async (p = 1) => {
    setLoading(true);
    try {
      const data = await api<{ logs: AuditEntry[]; pages: number }>(`/api/admin/audit?page=${p}&limit=20`);
      setEntries(data.logs);
      setTotalPages(data.pages);
      setPage(p);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchEntries(); }, []);

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">Audit Log</h1>
        <p className="text-ink-500 text-sm">Track all administrative actions.</p>
      </div>

      {loading ? (
        <div className="neo-card p-12 text-center"><p className="text-ink-500">Loading...</p></div>
      ) : entries.length === 0 ? (
        <div className="neo-card p-12 text-center"><p className="text-ink-500">No audit entries yet.</p></div>
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <div key={e.id} className="neo-card p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="neo-badge text-xs bg-cream-100 text-ink-700 mr-2">{e.action}</span>
                  <span className="text-sm text-ink-600">
                    by <span className="font-semibold text-ink-800">{e.user?.name || 'System'}</span>
                  </span>
                </div>
                <span className="text-xs text-ink-400 font-mono">{new Date(e.createdAt).toLocaleString()}</span>
              </div>
              {e.details && (
                <pre className="mt-2 text-xs bg-cream-100 p-2 border border-ink-100 overflow-x-auto font-mono text-ink-600">
                  {JSON.stringify(e.details, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => fetchEntries(p)}
              className={`w-10 h-10 border-2 font-display font-semibold text-sm transition-all ${
                p === page ? 'border-ink-900 bg-ink-900 text-white shadow-[2px_2px_0_var(--color-accent)]'
                  : 'border-ink-200 hover:border-ink-900'
              }`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
