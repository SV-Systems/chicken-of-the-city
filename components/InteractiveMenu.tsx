'use client';

import { useState } from 'react';
import type { Category, Product } from '@/lib/datocms';
import ProductCard from '@/components/ProductCard';

interface InteractiveMenuProps {
  categories: Category[];
  products: Product[];
  fallbackEmoji: string;
}

export default function InteractiveMenu({ categories, products, fallbackEmoji }: InteractiveMenuProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? products.filter((p) => p.category.id === activeCategory)
    : products;

  return (
    <section className="bg-zinc-50 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-brand">
            Pełna oferta
          </p>
          <h2 className="text-3xl font-black text-zinc-900">Nasze menu</h2>
        </div>

        {/* Zakładki kategorii */}
        <div className="mb-10 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
              activeCategory === null
                ? 'btn-brand text-white shadow-md'
                : 'border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900'
            }`}
          >
            Wszystkie
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                activeCategory === cat.id
                  ? 'text-white shadow-md'
                  : 'border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900'
              }`}
              style={
                activeCategory === cat.id
                  ? { background: 'var(--secondary)' }
                  : undefined
              }
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Siatka produktów */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} fallbackEmoji={fallbackEmoji} />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-zinc-500">Brak dań w tej kategorii.</p>
        )}
      </div>
    </section>
  );
}
