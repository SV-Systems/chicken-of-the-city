'use client';

import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/context/CartContext';

export default function CartWidget() {
  const { totalItems, totalPrice, openCart } = useCart();
  const [bumping, setBumping] = useState(false);
  const prevItems = useRef(totalItems);

  useEffect(() => {
    if (totalItems > prevItems.current) {
      setBumping(true);
      const t = setTimeout(() => setBumping(false), 450);
      return () => clearTimeout(t);
    }
    prevItems.current = totalItems;
  }, [totalItems]);

  if (totalItems === 0) return null;

  const totalFormatted = totalPrice.toFixed(2).replace('.', ',');

  return (
    <button
      onClick={openCart}
      aria-label={`Koszyk (${totalItems} produktów)`}
      className={`btn-brand fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-xl hover:scale-105 active:scale-95 ${bumping ? 'cart-bump' : 'transition-transform'}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5"
      >
        <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
      </svg>
      <span>{totalItems} {totalItems === 1 ? 'pozycja' : totalItems < 5 ? 'pozycje' : 'pozycji'}</span>
      <span className="h-4 w-px bg-white/40" />
      <span>{totalFormatted} zł</span>
    </button>
  );
}
