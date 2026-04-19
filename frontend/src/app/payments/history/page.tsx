'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Payment } from '@/types';

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ payments: Payment[] }>('/api/payments/history')
      .then((data) => setPayments(data.payments))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Payment History</h1>

        {payments.length === 0 ? (
          <p className="text-gray-600">No payments found.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl bg-white shadow">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-700">Date</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Description</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Amount</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(p.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{p.description || 'Payment'}</td>
                    <td className="px-4 py-3 font-medium">₹{(p.amount / 100).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs ${
                        p.status === 'CAPTURED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.invoicePath ? (
                        <a href={`/api/payments/${p.id}/invoice`} target="_blank" className="text-red-600 hover:underline">
                          Download
                        </a>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <a href="/dashboard" className="mt-4 inline-block text-sm text-gray-600 hover:underline">← Back to Dashboard</a>
      </div>
    </div>
  );
}
