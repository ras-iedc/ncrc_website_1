'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardShell from '@/components/DashboardShell';

interface Member {
  id: string; name: string; email: string; role: string; status: string;
  membershipId?: string; phone?: string; createdAt: string;
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('');

  const fetchMembers = async (p = 1, status = '') => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page: String(p), limit: '20' });
      if (status) query.set('status', status);
      const data = await api<{ users: Member[]; pages: number }>(`/api/admin/users?${query}`);
      setMembers(data.users);
      setTotalPages(data.pages);
      setPage(p);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleAction = async (id: string, status: string) => {
    try {
      await api(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      fetchMembers(page, filter);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    }
  };

  return (
    <DashboardShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Members</h1>
          <p className="text-ink-500 text-sm">Manage club membership applications.</p>
        </div>
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); fetchMembers(1, e.target.value); }}
          className="neo-input w-auto"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="neo-card p-12 text-center"><p className="text-ink-500">Loading...</p></div>
      ) : members.length === 0 ? (
        <div className="neo-card p-12 text-center"><p className="text-ink-500">No members found.</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="neo-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Member ID</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="font-semibold">{m.name}</td>
                  <td className="font-mono text-xs">{m.email}</td>
                  <td>{m.phone || '—'}</td>
                  <td>
                    <span className={`neo-badge text-xs ${
                      m.status === 'APPROVED' ? 'bg-green-50 text-success' :
                      m.status === 'PENDING' ? 'bg-yellow-50 text-warning' :
                      'bg-accent-light text-accent'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="font-mono text-xs">{m.membershipId || '—'}</td>
                  <td className="text-xs text-ink-500">{new Date(m.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-2">
                      {m.status !== 'APPROVED' && (
                        <button onClick={() => handleAction(m.id, 'APPROVED')}
                          className="text-xs font-semibold px-3 py-1 border-2 border-success text-success hover:bg-green-50 transition-colors">
                          Approve
                        </button>
                      )}
                      {m.status !== 'REJECTED' && (
                        <button onClick={() => handleAction(m.id, 'REJECTED')}
                          className="text-xs font-semibold px-3 py-1 border-2 border-accent text-accent hover:bg-accent-light transition-colors">
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => fetchMembers(p, filter)}
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
