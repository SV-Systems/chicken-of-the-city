import Link from 'next/link';
import CartButton from './CartButton';

interface HeaderProps {
  restaurantName: string;
  restaurantTagline: string;
}

export default function Header({ restaurantName, restaurantTagline }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight text-zinc-900">
            {restaurantName}<span className="text-brand">.</span>
          </span>
          {restaurantTagline && (
            <span className="hidden text-sm font-medium text-zinc-500 sm:block">
              {restaurantTagline}
            </span>
          )}
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
