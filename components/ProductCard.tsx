'use client';

import Image from 'next/image';
import type { Product } from '@/lib/datocms';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
  fallbackEmoji?: string;
}

export default function ProductCard({ product, fallbackEmoji = '🍽️' }: ProductCardProps) {
  const { addToCart } = useCart();
  const priceFormatted = product.price.toFixed(2).replace('.', ',');

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      {/* Gradient accent bar */}
      <div className="card-brand-bar h-1 w-full" />

      <div className="relative h-48 w-full bg-zinc-100">
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.image.alt || product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            quality={80}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">
            {fallbackEmoji}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-zinc-900">{product.name}</h3>

        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
            {product.description}
          </p>
        )}

        {product.allergens && (
          <p className="mt-2 text-xs text-zinc-400">
            Alergeny: {product.allergens}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-lg font-black text-zinc-900">
            {priceFormatted} <span className="text-sm font-semibold text-zinc-500">zł</span>
          </span>
          <button
            onClick={() => addToCart(product)}
            className="btn-brand rounded-full px-4 py-2 text-sm font-semibold text-white active:scale-95"
          >
            Dodaj
          </button>
        </div>
      </div>
    </div>
  );
}
