import type { Metadata } from 'next';
import { getAllCategories, getAllProducts, getBrandSettings } from '@/lib/datocms';
import ProductCard from '@/components/ProductCard';
import InteractiveMenu from '@/components/InteractiveMenu';

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  const [categories, products, brand] = await Promise.all([
    getAllCategories(),
    getAllProducts(),
    getBrandSettings(),
  ]);

  const featuredProducts = products.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden py-28 text-white">
        {/* Decorative blobs */}
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'var(--brand)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-20 left-1/3 h-72 w-72 rounded-full opacity-15 blur-3xl"
          style={{ background: 'var(--secondary)' }}
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <span
            className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
            style={{ background: 'color-mix(in srgb, var(--brand) 25%, transparent)', color: 'var(--brand-light)' }}
          >
            {brand.heroLabel}
          </span>
          <h1 className="text-5xl font-black leading-tight tracking-tight sm:text-7xl">
            {brand.heroTitle}
            <br />
            <span style={{ color: 'var(--brand-light)' }}>{brand.heroHighlight}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-zinc-400">
            {brand.heroSubtitle}
          </p>
        </div>
      </section>

      {/* Polecane dania */}
      {featuredProducts.length > 0 && (
        <section className="relative py-20">
          {/* Section bg accent */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{ background: 'var(--secondary)' }}
          />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-secondary">
                  Nasze propozycje
                </p>
                <h2 className="text-3xl font-black text-zinc-900">Polecane dania</h2>
              </div>
              <div
                className="hidden h-1 w-16 rounded-full sm:block"
                style={{ background: 'linear-gradient(90deg, var(--brand), var(--secondary))' }}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} fallbackEmoji={brand.categoryEmoji} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pełne menu z filtrami */}
      <InteractiveMenu
        categories={categories}
        products={products}
        fallbackEmoji={brand.categoryEmoji}
      />
    </>
  );
}
