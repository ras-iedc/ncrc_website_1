import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface Post {
  id: string; title: string; content: string; type: string; createdAt: string;
  author: { name: string };
}

async function getPosts(type?: string) {
  const params = new URLSearchParams({ limit: '50' });
  if (type) params.set('type', type);
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts?${params}`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.posts as Post[];
}

export default async function PostsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const posts = await getPosts(type);
  const tabs = [
    { label: 'All', value: '' },
    { label: 'News', value: 'NEWS' },
    { label: 'Notices', value: 'NOTICE' },
    { label: 'Tournaments', value: 'TOURNAMENT' },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream-50 pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="font-display text-4xl font-bold mb-2">News & Events</h1>
            <p className="text-ink-500">Stay updated with the latest from North Calcutta Rifle Club.</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto">
            {tabs.map((tab) => (
              <Link key={tab.value} href={tab.value ? `/posts?type=${tab.value}` : '/posts'}
                className={`px-4 py-2 border-2 text-sm font-display font-semibold whitespace-nowrap transition-all ${
                  (type || '') === tab.value
                    ? 'border-ink-900 bg-ink-900 text-white shadow-[2px_2px_0_var(--color-accent)]'
                    : 'border-ink-200 text-ink-600 hover:border-ink-900'
                }`}>
                {tab.label}
              </Link>
            ))}
          </div>

          {posts.length === 0 ? (
            <div className="neo-card p-12 text-center">
              <p className="text-ink-500">No posts found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Link key={post.id} href={`/posts/${post.id}`} className="block">
                  <article className="neo-card p-6 hover:shadow-[4px_4px_0_var(--color-ink-900)] transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`neo-badge text-xs ${
                        post.type === 'NEWS' ? 'bg-blue-50 text-blue-700' :
                        post.type === 'NOTICE' ? 'bg-yellow-50 text-warning' :
                        'bg-green-50 text-success'
                      }`}>{post.type}</span>
                      <span className="text-xs text-ink-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h2 className="font-display text-xl font-bold text-ink-900 mb-2">{post.title}</h2>
                    <p className="text-sm text-ink-600 line-clamp-2">{post.content}</p>
                    <p className="text-xs text-ink-400 mt-3">by {post.author?.name}</p>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
