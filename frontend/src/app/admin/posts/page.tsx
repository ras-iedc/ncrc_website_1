'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Post } from '@/types';
import DashboardShell from '@/components/DashboardShell';

type PostType = 'NEWS' | 'NOTICE' | 'TOURNAMENT';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Post | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await api<{ posts: Post[] }>('/api/posts?limit=100');
      setPosts(data.posts);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    await api(`/api/posts/${id}`, { method: 'DELETE' });
    fetchPosts();
  };

  return (
    <DashboardShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Posts</h1>
          <p className="text-ink-500 text-sm">Manage news, notices, and tournaments.</p>
        </div>
        <button onClick={() => { setCreating(true); setEditing(null); }}
          className="neo-btn neo-btn-primary text-sm">+ New Post</button>
      </div>

      {(creating || editing) && (
        <PostForm post={editing} onClose={() => { setCreating(false); setEditing(null); }} onSaved={fetchPosts} />
      )}

      {loading ? (
        <div className="neo-card p-12 text-center"><p className="text-ink-500">Loading...</p></div>
      ) : posts.length === 0 ? (
        <div className="neo-card p-12 text-center"><p className="text-ink-500">No posts yet.</p></div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="neo-card p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`neo-badge text-xs ${
                      post.type === 'NEWS' ? 'bg-blue-50 text-blue-700' :
                      post.type === 'NOTICE' ? 'bg-yellow-50 text-warning' :
                      'bg-green-50 text-success'
                    }`}>{post.type}</span>
                    {!post.published && <span className="neo-badge text-xs bg-ink-100 text-ink-500">Draft</span>}
                  </div>
                  <h3 className="font-display font-bold text-ink-900 truncate">{post.title}</h3>
                  <p className="text-xs text-ink-400 mt-1">
                    by {post.author?.name} · {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => { setEditing(post); setCreating(false); }}
                    className="text-xs font-semibold px-3 py-1.5 border-2 border-ink-300 hover:border-ink-900 transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(post.id)}
                    className="text-xs font-semibold px-3 py-1.5 border-2 border-accent text-accent hover:bg-accent-light transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}

function PostForm({ post, onClose, onSaved }: { post: Post | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: post?.title || '',
    content: post?.content || '',
    type: (post?.type || 'NEWS') as PostType,
    published: post?.published ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (post) {
        await api(`/api/posts/${post.id}`, { method: 'PATCH', body: JSON.stringify(form) });
      } else {
        await api('/api/posts', { method: 'POST', body: JSON.stringify(form) });
      }
      onSaved();
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally { setSaving(false); }
  };

  const update = (field: string, value: unknown) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="neo-card p-6 mb-6 border-accent">
      <h2 className="font-display text-lg font-bold mb-4">{post ? 'Edit Post' : 'New Post'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-display font-semibold text-ink-700 mb-1.5">Title</label>
          <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)}
            className="neo-input" required />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-display font-semibold text-ink-700 mb-1.5">Type</label>
            <select value={form.type} onChange={(e) => update('type', e.target.value)} className="neo-input">
              <option value="NEWS">News</option>
              <option value="NOTICE">Notice</option>
              <option value="TOURNAMENT">Tournament</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.published} onChange={(e) => update('published', e.target.checked)}
                className="w-5 h-5 border-2 border-ink-900 accent-accent" />
              <span className="text-sm font-display font-semibold text-ink-700">Published</span>
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-display font-semibold text-ink-700 mb-1.5">Content</label>
          <textarea value={form.content} onChange={(e) => update('content', e.target.value)}
            className="neo-input" rows={8} required />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="neo-btn neo-btn-primary disabled:opacity-50">
            {saving ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
          </button>
          <button type="button" onClick={onClose} className="neo-btn neo-btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
