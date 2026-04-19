'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Payment } from '@/types';
import DashboardShell from '@/components/DashboardShell';

export default function PaymentsHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPayments = async (p = 1) => {
    setLoading(true);
    try {
      const data = await api<{ payments: Payment[]; pages: number }>(`/api/payments/history?page=${p}&limit=15`);
      setPayments(data.payments);
      setTotalPages(data.pages);
      setPage(p);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPayments(); }, []);

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">Payment History</h1>
        <p className="text-ink-500 text-sm">View all your payment transactions.</p>
      </div>

      {loading ? (
        <div className="neo-card p-12 text-center"><p className="text-ink-500">Loading...</p></div>
      ) : payments.length === 0 ? (
        <div className="neo-card p-12 text-center">
          <p className="text-ink-500 mb-2">No payments yet.</p>
          <p className="text-ink-400 text-sm">Your payment history will appear here once you make a payment.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="neo-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="text-sm">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>{p.description || '—'}</td>
                  <td className="font-mono font-semibold">₹{(p.amount / 100).toFixed(2)}</td>
                  <td>
                    <span className={`neo-badge text-xs ${
                      p.status === 'PAID' ? 'bg-green-50 text-success' :
                      p.status === 'PENDING' ? 'bg-yellow-50 text-warning' :
                      'bg-accent-light text-accent'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    {p.status === 'PAID' ? (
                      <a href={`${process.env.NEXT_PUBLIC_API_URL}/api/payments/${p.id}/invoice`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-xs text-accent font-semibold hover:underline">
                        Download
                      </a>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => fetchPayments(p)}
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
