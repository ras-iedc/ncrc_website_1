'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardShell from '@/components/DashboardShell';

interface Product {
  id: string; name: string; description?: string; price: number;
  imageUrl?: string; stock: number; active: boolean; createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api<{ products: Product[] }>('/api/admin/products');
      setProducts(data.products);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await api(`/api/admin/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  const toggleActive = async (product: Product) => {
    await api(`/api/admin/products/${product.id}`, {
      method: 'PATCH', body: JSON.stringify({ active: !product.active }),
    });
    fetchProducts();
  };

  return (
    <DashboardShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Products</h1>
          <p className="text-ink-500 text-sm">Manage shop inventory.</p>
        </div>
        <button onClick={() => { setCreating(true); setEditing(null); }}
          className="neo-btn neo-btn-primary text-sm">+ Add Product</button>
      </div>

      {(creating || editing) && (
        <ProductForm product={editing} onClose={() => { setCreating(false); setEditing(null); }} onSaved={fetchProducts} />
      )}

      {loading ? (
        <div className="neo-card p-12 text-center"><p className="text-ink-500">Loading...</p></div>
      ) : products.length === 0 ? (
        <div className="neo-card p-12 text-center"><p className="text-ink-500">No products yet.</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="neo-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={!p.active ? 'opacity-50' : ''}>
                  <td>
                    <p className="font-semibold">{p.name}</p>
                    {p.description && <p className="text-xs text-ink-400 truncate max-w-xs">{p.description}</p>}
                  </td>
                  <td className="font-mono font-semibold">₹{p.price}</td>
                  <td>
                    <span className={`neo-badge text-xs ${p.stock > 0 ? 'bg-green-50 text-success' : 'bg-accent-light text-accent'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => toggleActive(p)}
                      className={`neo-badge text-xs cursor-pointer ${p.active ? 'bg-green-50 text-success' : 'bg-ink-100 text-ink-400'}`}>
                      {p.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditing(p); setCreating(false); }}
                        className="text-xs font-semibold px-3 py-1.5 border-2 border-ink-300 hover:border-ink-900 transition-colors">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(p.id)}
                        className="text-xs font-semibold px-3 py-1.5 border-2 border-accent text-accent hover:bg-accent-light transition-colors">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}

function ProductForm({ product, onClose, onSaved }: { product: Product | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    imageUrl: product?.imageUrl || '',
    stock: product?.stock?.toString() || '0',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (product) {
        await api(`/api/admin/products/${product.id}`, { method: 'PATCH', body: JSON.stringify(body) });
      } else {
        await api('/api/admin/products', { method: 'POST', body: JSON.stringify(body) });
      }
      onSaved();
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally { setSaving(false); }
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="neo-card p-6 mb-6 border-accent">
      <h2 className="font-display text-lg font-bold mb-4">{product ? 'Edit Product' : 'New Product'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-display font-semibold text-ink-700 mb-1.5">Name</label>
          <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} className="neo-input" required />
        </div>
        <div>
          <label className="block text-sm font-display font-semibold text-ink-700 mb-1.5">Description</label>
          <textarea value={form.description} onChange={(e) => update('description', e.target.value)} className="neo-input" rows={3} />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-display font-semibold text-ink-700 mb-1.5">Price (₹)</label>
            <input type="number" value={form.price} onChange={(e) => update('price', e.target.value)} className="neo-input" required min="0" />
          </div>
          <div>
            <label className="block text-sm font-display font-semibold text-ink-700 mb-1.5">Stock</label>
            <input type="number" value={form.stock} onChange={(e) => update('stock', e.target.value)} className="neo-input" min="0" />
          </div>
          <div>
            <label className="block text-sm font-display font-semibold text-ink-700 mb-1.5">Image URL</label>
            <input type="url" value={form.imageUrl} onChange={(e) => update('imageUrl', e.target.value)} className="neo-input" placeholder="https://..." />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="neo-btn neo-btn-primary disabled:opacity-50">
            {saving ? 'Saving...' : product ? 'Update' : 'Create Product'}
          </button>
          <button type="button" onClick={onClose} className="neo-btn neo-btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
