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
    <div className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-48 w-full bg-white">
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.image.alt || product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain p-3"
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
          <span className="text-lg font-bold text-zinc-900">
            {priceFormatted} zł
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
