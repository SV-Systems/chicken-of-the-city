import Link from 'next/link';

export default function AnulowanoPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-10 w-10 text-zinc-400"
        >
          <path
            fillRule="evenodd"
            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      <h1 className="mt-6 text-3xl font-black text-zinc-900">
        Płatność anulowana
      </h1>
      <p className="mt-3 max-w-md text-zinc-500">
        Płatność została anulowana. Twój koszyk czeka — możesz spróbować
        ponownie w dowolnym momencie.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/menu"
          className="inline-flex items-center justify-center rounded-full bg-orange-500 px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-orange-600"
        >
          Wróć do menu
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-8 py-3 text-base font-semibold text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-50"
        >
          Strona główna
        </Link>
      </div>
    </div>
  );
}
