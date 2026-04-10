import type { RestaurantInfo } from '@/lib/datocms';

interface FooterProps {
  info: RestaurantInfo;
}

export default function Footer({ info }: FooterProps) {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-900 text-zinc-400">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <p className="text-2xl font-black text-white">
              Chicken<span className="text-orange-500">.</span>
            </p>
            <p className="mt-2 text-sm">of the City</p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-300">
              Kontakt
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={`tel:${info.phone}`}
                  className="transition-colors hover:text-white"
                >
                  {info.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${info.email}`}
                  className="transition-colors hover:text-white"
                >
                  {info.email}
                </a>
              </li>
              <li>{info.address}</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-300">
              Godziny otwarcia
            </h3>
            <p className="whitespace-pre-line text-sm">{info.openingHours}</p>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-800 pt-6 text-center text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} Chicken of the City. Wszelkie prawa
          zastrzeżone.
        </div>
      </div>
    </footer>
  );
}
