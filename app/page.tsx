import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllCategories, getAllProducts, getBrandSettings } from '@/lib/datocms';
import ProductCard from '@/components/ProductCard';

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
      <section
        className="py-24 text-white"
        style={{
          background:
            'linear-gradient(to bottom right, #18181b, #27272a, var(--brand-deep))',
        }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-light">
              {brand.heroLabel}
            </p>
            <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">
              {brand.heroTitle}
              <br />
              <span className="text-brand-light">{brand.heroHighlight}</span>
            </h1>
            <p className="mt-6 text-lg text-zinc-400">
              {brand.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/menu"
                className="btn-brand inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-semibold"
              >
                Zobacz menu
              </Link>
              <Link
                href="/menu"
                className="inline-flex items-center justify-center rounded-full border border-zinc-600 px-8 py-3 text-base font-semibold text-zinc-300 transition-colors hover:border-zinc-400 hover:text-white"
              >
                Zamów teraz
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Kategorie */}
      {categories.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="mb-8 text-2xl font-bold text-zinc-900">
              Nasze kategorie
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/menu#${cat.id}`}
                  className="border-brand-hover flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm transition-all hover:shadow-md"
                >
                  <span className="text-3xl">{brand.categoryEmoji}</span>
                  <span className="mt-2 text-sm font-semibold text-zinc-800">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Wyróżnione produkty */}
      {featuredProducts.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-zinc-900">
                Polecane dania
              </h2>
              <Link
                href="/menu"
                className="link-brand text-sm font-semibold"
              >
                Zobacz wszystkie &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} fallbackEmoji={brand.categoryEmoji} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
