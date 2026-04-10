import Link from 'next/link';
import CartButton from './CartButton';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight text-zinc-900">
            Chicken<span className="text-orange-500">.</span>
          </span>
          <span className="hidden text-sm font-medium text-zinc-500 sm:block">
            of the City
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
          >
            Strona główna
          </Link>
          <Link
            href="/menu"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
          >
            Menu
          </Link>
        </nav>

        <CartButton />
      </div>
    </header>
  );
}
