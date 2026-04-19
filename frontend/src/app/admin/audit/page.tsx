'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface AuditEntry {
  id: string;
  action: string;
  createdAt: string;
  admin: { name: string; email: string };
  target?: { name: string; email: string } | null;
  metadata?: Record<string, unknown>;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ logs: AuditEntry[] }>('/api/admin/audit')
      .then((data) => setLogs(data.logs))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Audit Log</h1>

        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Admin</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(log.createdAt).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3">{log.admin.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{log.action}</td>
                  <td className="px-4 py-3 text-gray-600">{log.target?.name || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <a href="/dashboard" className="mt-4 inline-block text-sm text-gray-600 hover:underline">← Back to Dashboard</a>
      </div>
    </div>
  );
}
