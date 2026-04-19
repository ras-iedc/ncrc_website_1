import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Post {
  id: string; title: string; content: string; type: string; createdAt: string;
  author: { name: string };
}

async function getPost(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();
  return data.post as Post;
}

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream-50 pt-8 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link href="/posts" className="text-sm text-accent font-semibold hover:underline mb-6 inline-block">← Back to posts</Link>
          <article className="neo-card p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className={`neo-badge text-xs ${
                post.type === 'NEWS' ? 'bg-blue-50 text-blue-700' :
                post.type === 'NOTICE' ? 'bg-yellow-50 text-warning' :
                'bg-green-50 text-success'
              }`}>{post.type}</span>
              <span className="text-xs text-ink-400">{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-ink-900 mb-4">{post.title}</h1>
            <p className="text-xs text-ink-400 mb-6">by {post.author?.name}</p>
            <div className="prose max-w-none text-ink-700 whitespace-pre-wrap">{post.content}</div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
