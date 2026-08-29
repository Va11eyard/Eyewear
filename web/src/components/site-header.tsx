import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between gap-6 px-6 py-5 md:px-10">
      <Link href="/" className="font-display text-2xl tracking-tight">
        FRAME
      </Link>
      <nav className="flex items-center gap-6 text-sm text-mute">
        <Link href="/capture" className="hover:text-ink">
          Снять мерки
        </Link>
        <Link href="/how" className="hover:text-ink">
          Как это работает
        </Link>
      </nav>
    </header>
  );
}
