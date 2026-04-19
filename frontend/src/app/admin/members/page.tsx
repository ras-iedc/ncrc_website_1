'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  membershipId?: string;
  phone?: string;
  createdAt: string;
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleAction = async (id: string, status: string) => {
    try {
      await api(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      fetchMembers(page, filter);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Manage Members</h1>
          <select value={filter} onChange={(e) => { setFilter(e.target.value); fetchMembers(1, e.target.value); }}
            className="rounded-lg border px-3 py-2 text-sm">
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto rounded-xl bg-white shadow">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Membership ID</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {members.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-3">{m.name}</td>
                    <td className="px-4 py-3 text-gray-600">{m.email}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs ${
                        m.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        m.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>{m.status}</span>
                    </td>
                    <td className="px-4 py-3">{m.role}</td>
                    <td className="px-4 py-3">{m.membershipId || '-'}</td>
                    <td className="px-4 py-3 space-x-2">
                      {m.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleAction(m.id, 'APPROVED')}
                            className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700">Approve</button>
                          <button onClick={() => handleAction(m.id, 'REJECTED')}
                            className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700">Reject</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex gap-2 justify-center">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => fetchMembers(i + 1, filter)}
                className={`rounded px-3 py-1 text-sm ${page === i + 1 ? 'bg-red-600 text-white' : 'bg-white border'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}

        <a href="/dashboard" className="mt-4 inline-block text-sm text-gray-600 hover:underline">← Back to Dashboard</a>
      </div>
    </div>
  );
}
