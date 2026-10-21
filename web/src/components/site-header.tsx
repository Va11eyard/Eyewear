import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-baseline gap-x-9 gap-y-3 px-6 py-6 md:px-10">
        <Link href="/" className="font-display text-[26px] leading-none">
          Frame <sup className="font-mono text-[8px] tracking-[0.1em] text-oxblood">№</sup>
        </Link>
        <nav aria-label="Разделы">
          <ul className="flex items-baseline gap-7 text-[12.5px] uppercase tracking-[0.09em] text-mute">
            <li>
              <Link href="/capture" className="hover:text-oxblood">
                Мерки
              </Link>
            </li>
            <li>
              <Link href="/catalog" className="hover:text-oxblood">
                Каталог
              </Link>
            </li>
            <li>
              <Link href="/how" className="hover:text-oxblood">
                Метод
              </Link>
            </li>
          </ul>
        </nav>
        <p className="ledger-label ml-auto hidden lg:block">Atelier · Astana</p>
        <Link
          href="/capture"
          className="inline-flex min-h-11 items-center bg-ink px-6 text-[12px] font-medium uppercase tracking-[0.11em] text-paper transition-colors hover:bg-oxblood lg:ml-0"
        >
          Снять мерки
        </Link>
      </div>
    </header>
  );
}
