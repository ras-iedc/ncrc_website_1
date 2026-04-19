import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { Product } from '@/types';

async function getProducts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shop/products`, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return data.products as Product[];
}

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream-50 pt-8 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="font-display text-4xl font-bold mb-2">Pro Shop</h1>
            <p className="text-ink-500">Equipment and accessories for NCRC members.</p>
          </div>

          {products.length === 0 ? (
            <div className="neo-card p-12 text-center">
              <svg className="w-12 h-12 mx-auto text-ink-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-ink-500 mb-1">No products available yet.</p>
              <p className="text-ink-400 text-sm">Check back soon!</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <div key={product.id} className="neo-card p-0 overflow-hidden">
                  {product.image ? (
                    <div className="h-48 bg-cream-100 border-b-2 border-ink-900 overflow-hidden">
                      <img src={product.image} alt={product.name}
                        className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-48 bg-cream-100 border-b-2 border-ink-900 flex items-center justify-center">
                      <svg className="w-16 h-16 text-ink-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold text-ink-900 mb-1">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-ink-500 mb-3 line-clamp-2">{product.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xl font-bold text-ink-900">₹{product.price.toFixed(2)}</span>
                      <span className={`neo-badge text-xs ${product.stock > 0 ? 'bg-green-50 text-success' : 'bg-accent-light text-accent'}`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
