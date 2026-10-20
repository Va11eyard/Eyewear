import Link from "next/link";

const COLUMNS: { title: string; links: [string, string][] }[] = [
  {
    title: "Продукт",
    links: [
      ["Снять мерки", "/capture"],
      ["Как считаем", "/how"],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line px-6 py-14 md:px-10">
      <div className="mx-auto max-w-[1240px]">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl font-medium tracking-tight">FRAME</p>
            <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-mute">
              Ателье посадки Живая камера, реальные размеры оправ и салоны из открытого каталога
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h2 className="text-[10px] uppercase tracking-[0.16em] text-mute">{col.title}</h2>
              <ul className="mt-4 grid gap-2.5 text-sm">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-ink-2 hover:text-oxblood">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.16em] text-mute">Данные</h2>
            <ul className="mt-4 grid gap-2.5 text-sm text-ink-2">
              <li>Салоны: ODOS / 2GIS</li>
              <li>Оправы: геометрия FRAME</li>
              <li>Меш: CC0 и Apache-2.0</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap gap-x-8 gap-y-2 border-t border-line pt-6 text-[11px] leading-relaxed text-mute">
          <span>Не медицинское изделие, не диагноз, не замена приёма у офтальмолога</span>
          <span>Мерки считаются на устройстве</span>
        </div>
      </div>
    </footer>
  );
}
