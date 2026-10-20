import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/92 backdrop-blur">
      <div className="mx-auto flex h-19 max-w-[1240px] items-center gap-9 px-6 md:px-10">
        <Link href="/" className="font-display text-2xl font-medium tracking-tight">
          FRAME
        </Link>
        <nav aria-label="Разделы">
          <ul className="flex items-center gap-7 text-sm text-ink-2">
            <li>
              <Link href="/capture" className="hover:text-vermilion">
                Снять мерки
              </Link>
            </li>
            <li>
              <Link href="/how" className="hover:text-vermilion">
                Как считаем
              </Link>
            </li>
          </ul>
        </nav>
        <Link
          href="/capture"
          className="ml-auto inline-flex min-h-12 items-center gap-2.5 rounded-full bg-ink px-6 text-sm font-medium text-paper transition-colors hover:bg-vermilion"
        >
          Открыть камеру
          <Icon name="camera" className="text-base" />
        </Link>
      </div>
    </header>
  );
}
