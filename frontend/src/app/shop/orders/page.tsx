'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { ShopOrder } from '@/types';
import DashboardShell from '@/components/DashboardShell';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ orders: ShopOrder[] }>('/api/shop/orders/me')
      .then((data) => setOrders(data.orders))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">My Orders</h1>
        <p className="text-ink-500 text-sm">Track your shop orders.</p>
      </div>

      {loading ? (
        <div className="neo-card p-12 text-center"><p className="text-ink-500">Loading...</p></div>
      ) : orders.length === 0 ? (
        <div className="neo-card p-12 text-center">
          <p className="text-ink-500">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="neo-card p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <span className="font-mono text-xs text-ink-400">Order #{order.id.slice(0, 8)}</span>
                  <p className="text-xs text-ink-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`neo-badge text-xs ${
                    order.status === 'PAID' ? 'bg-green-50 text-success' : 'bg-yellow-50 text-warning'
                  }`}>{order.status}</span>
                  <span className="font-mono font-bold">₹{(order.totalAmount / 100).toFixed(2)}</span>
                </div>
              </div>
              <div className="border-t-2 border-ink-100 pt-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-1">
                    <span className="text-ink-700">{item.product.name} × {item.quantity}</span>
                    <span className="font-mono text-ink-500">₹{(item.price / 100).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
