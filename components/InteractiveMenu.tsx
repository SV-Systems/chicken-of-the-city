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
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="mb-8 text-2xl font-bold text-zinc-900">Nasze menu</h2>

        {/* Zakładki kategorii */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              activeCategory === null
                ? 'btn-brand text-white'
                : 'border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400 hover:text-zinc-900'
            }`}
          >
            Wszystkie
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                activeCategory === cat.id
                  ? 'btn-brand text-white'
                  : 'border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400 hover:text-zinc-900'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Siatka produktów */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} fallbackEmoji={fallbackEmoji} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-12 text-center text-zinc-500">Brak dań w tej kategorii.</p>
        )}
      </div>
    </section>
  );
}
