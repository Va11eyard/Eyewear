"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FrameThumb } from "@/components/frame-thumb";
import { totalFrontWidthMm, type Frame } from "@/lib/frame-catalog";
import { applyFilters, EMPTY_FILTERS, facets, sortByFit, type FilterState } from "@/lib/filters";
import { CATALOG } from "@/lib/frames";

const SHAPE_RU: Record<string, string> = {
  round: "Круг", panto: "Панто", rect: "Прямоугольник", square: "Квадрат",
  cat: "Кошка", browline: "Броулайны", aviator: "Авиатор",
};
const MATERIAL_RU: Record<string, string> = {
  acetate: "Ацетат", metal: "Металл", combo: "Комбинированная",
};

export default function CatalogPage() {
  const [state, setState] = useState<FilterState>(EMPTY_FILTERS);
  const all = useMemo(() => facets(CATALOG), []);
  const shown = useMemo(() => sortByFit(applyFilters(CATALOG, state), null), [state]);

  const toggle = (key: "shapes" | "materials", value: string) =>
    setState((s) => ({ ...s, [key]: s[key].includes(value) ? s[key].filter((v) => v !== value) : [...s[key], value] }));

  return (
    <div className="min-h-dvh">
      <Header />
      <main id="content" className="mx-auto grid max-w-[1280px] gap-x-12 gap-y-8 px-6 py-10 md:px-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="ledger-label mb-3">Форма</h2>
          <div className="flex flex-wrap gap-1.5">
            {all.shapes.map(([shape, n]) => (
              <Chip key={shape} on={state.shapes.includes(shape)} onClick={() => toggle("shapes", shape)} label={`${SHAPE_RU[shape] ?? shape} ${n}`} />
            ))}
          </div>
          <h2 className="ledger-label mb-3 mt-7">Материал</h2>
          <div className="flex flex-wrap gap-1.5">
            {all.materials.map(([m, n]) => (
              <Chip key={m} on={state.materials.includes(m)} onClick={() => toggle("materials", m)} label={`${MATERIAL_RU[m] ?? m} ${n}`} />
            ))}
          </div>
          <h2 className="ledger-label mb-2 mt-7">Ширина фронта</h2>
          <input
            type="range" min={128} max={165} value={state.maxFront}
            onChange={(e) => setState((s) => ({ ...s, maxFront: Number(e.target.value) }))}
            className="w-full accent-[#8e1812]" aria-label="Максимальная ширина фронта"
          />
          <p className="measured mt-1 text-[11px] text-mute">до {state.maxFront} мм</p>
          <h2 className="ledger-label mb-2 mt-7">Поиск</h2>
          <input
            value={state.query} onChange={(e) => setState((s) => ({ ...s, query: e.target.value }))}
            placeholder="тортилла, панто, 54" aria-label="Поиск по каталогу"
            className="min-h-11 w-full border border-line bg-paper px-3 text-[14px] outline-none focus:border-oxblood"
          />
          <p className="mt-5 text-[11px] leading-relaxed text-mute">
            Порядок в списке не меняется от мерок: сначала идёт алфавит форм. Совпадение по вашим
            размерам показывается на странице модели
          </p>
        </aside>

        <section>
          <div className="flex items-baseline justify-between gap-4 border-b border-ink pb-3">
            <h1 className="font-display text-[clamp(1.7rem,3vw,2.2rem)]">Каталог оправ</h1>
            <span className="ledger-label">{shown.length} из {CATALOG.length}</span>
          </div>
          {shown.length === 0 ? (
            <p className="py-14 text-[15px] text-mute">Под такие фильтры ничего не подходит. Снимите одно условие</p>
          ) : (
            <ul className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((f) => <Cell key={f.sku} frame={f} />)}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

function Cell({ frame }: { frame: Frame }) {
  return (
    <li className="bg-paper p-4">
      <Link href={`/frames/${frame.sku}`} className="group block">
        <FrameThumb frame={frame} />
        <h3 className="font-display mt-3 text-[19px] group-hover:text-oxblood">{frame.name}</h3>
        <p className="measured mt-1 text-[11px] leading-relaxed text-mute">
          {frame.lensWidthMm}-{frame.bridgeMm}-{frame.templeMm} · фронт {totalFrontWidthMm(frame)} мм · {frame.weightG} г
        </p>
        <p className="mt-1.5 text-[12.5px] text-ink-2">{frame.colorRu}</p>
      </Link>
    </li>
  );
}

function Chip({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button" onClick={onClick} aria-pressed={on}
      className={`border px-2.5 py-1.5 text-[11px] uppercase tracking-[0.08em] transition-colors ${
        on ? "border-ink bg-ink text-paper" : "border-line-2 text-ink-2 hover:border-oxblood hover:text-oxblood"
      }`}
    >
      {label}
    </button>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-baseline gap-x-9 gap-y-3 px-6 py-6 md:px-10">
        <Link href="/" className="font-display text-[26px] leading-none">
          Frame <sup className="font-mono text-[8px] tracking-[0.1em] text-oxblood">№</sup>
        </Link>
        <nav aria-label="Разделы">
          <ul className="flex items-baseline gap-7 text-[12.5px] uppercase tracking-[0.09em] text-mute">
            <li><Link href="/capture" className="hover:text-oxblood">Мерки</Link></li>
            <li><Link href="/catalog" className="text-oxblood">Каталог</Link></li>
            <li><Link href="/how" className="hover:text-oxblood">Метод</Link></li>
          </ul>
        </nav>
        <Link href="/capture" className="ml-auto inline-flex min-h-11 items-center bg-ink px-6 text-[12px] font-medium uppercase tracking-[0.11em] text-paper transition-colors hover:bg-oxblood">
          Снять мерки
        </Link>
      </div>
    </header>
  );
}
