import Link from 'next/link';
import CartClearer from './CartClearer';

export default function SukcesPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <CartClearer />
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-10 w-10 text-green-600"
        >
          <path
            fillRule="evenodd"
            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      <h1 className="mt-6 text-3xl font-black text-zinc-900">
        Zamówienie przyjęte!
      </h1>
      <p className="mt-3 max-w-md text-zinc-500">
        Dziękujemy za zamówienie. Wysłaliśmy potwierdzenie na Twój adres
        e-mail. Przygotujemy Twoje danie najszybciej jak to możliwe.
      </p>

      <Link
        href="/menu"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-orange-500 px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-orange-600"
      >
        Wróć do menu
      </Link>
    </div>
  );
}
