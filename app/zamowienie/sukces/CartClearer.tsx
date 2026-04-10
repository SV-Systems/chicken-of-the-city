'use client';

import { useEffect } from 'react';
import { useCart } from '@/context/CartContext';

export default function CartClearer() {
  const { clearCart, hydrated } = useCart();

  useEffect(() => {
    if (!hydrated) return;
    clearCart();
  }, [hydrated]);

  return null;
}
