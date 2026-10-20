import rows from "../../../public/data/odos_optics.json";
import { rankShops, type Shop } from "@/lib/optics-local";

const ASTANA = { lat: 51.1694, lng: 71.4491 };

function money(s: Shop) {
  return s.km == null ? "" : `${s.km.toFixed(1).replace(".", ",")} км`;
}

export function Outlets() {
  // Ranked at build time so the landing ships three rows and no client fetch.
  const shops: Shop[] = rankShops(rows, ASTANA.lat, ASTANA.lng).slice(0, 3);
  return (
    <section className="px-6 py-16 md:px-10">
      <div className="mx-auto max-w-[1240px]">
        <div className="grid items-end gap-12 border-b border-line pb-6 md:grid-cols-2">
          <div>
            <p className="mb-3.5 flex items-baseline gap-4 text-[11px] tracking-[0.1em] text-oxblood">
              <span className="font-mono">05</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-mute">Рядом</span>
            </p>
            <h2 className="font-display text-[clamp(1.9rem,3.4vw,2.7rem)] leading-[1.04] font-medium tracking-[-0.03em]">
              Салоны, которых не выдумываем
            </h2>
          </div>
          <p className="text-[15px] leading-relaxed text-mute">
            Записи из открытого каталога ODOS и 2GIS. Телефон и адрес взяты из записи каталога,
            наличие модели уточняйте в салоне
          </p>
        </div>
        <ul>
          {shops.map((s) => (
            <li key={s.id} className="grid gap-4 border-b border-line py-5 md:grid-cols-[1fr_auto] md:items-start">
              <div>
                <h3 className="font-display text-lg font-medium tracking-[-0.02em]">{s.name}</h3>
                <p className="mt-1 text-sm text-mute">
                  {s.address} · Астана
                </p>
                <p className="mt-2.5 flex flex-wrap gap-x-5 text-[11px] text-ink-2">
                  {s.phone ? <a className="measured underline decoration-line-2 underline-offset-2 hover:text-oxblood" href={`tel:${s.phone}`}>{s.phone}</a> : null}
                  {s.mapUrl ? <a className="underline decoration-line-2 underline-offset-2 hover:text-oxblood" href={s.mapUrl}>Открыть в 2GIS</a> : null}
                  {s.rating ? <span className="measured text-mute">оценка {s.rating.toFixed(1).replace(".", ",")}</span> : null}
                </p>
              </div>
              <p className="measured text-sm md:text-right">
                {money(s)}
                <span className="block text-[10px] tracking-[0.1em] text-mute uppercase">от камеры</span>
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[11px] text-mute">
          Это пример выборки по координатам Астаны На странице мерок список строится по вашей
          геолокации, а если доступа нет, вы выбираете город сами
        </p>
      </div>
    </section>
  );
}

const FACTS: [string, string][] = [
  ["Фото", "Не сохраняем без отдельного согласия; в истории остаются только числа"],
  ["Ориентиры", "Передаются как набор координат, без изображения лица"],
  ["Исследования", "Режим выключен по умолчанию, включается информированным согласием и отзывается в один шаг"],
  ["Статус", "Помощь в подборе: не медицинское изделие, не диагноз, не рецепт"],
];

export function Privacy() {
  return (
    <section className="px-6 py-10 md:px-10">
      <div className="mx-auto grid max-w-[1240px] gap-12 rounded-3xl bg-night px-8 py-12 text-cream md:grid-cols-[0.9fr_1.1fr] md:px-14">
        <div>
          <h2 className="font-display text-[clamp(1.6rem,2.6vw,2.1rem)] leading-tight font-medium tracking-[-0.03em]">
            Кадр не уходит с устройства
          </h2>
          <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-cream/62">
            Обработка идёт в браузере Если включён серверный разбор, исходник удаляется сразу
            после ответа, и это отдельный тест в приёмке
          </p>
        </div>
        <ul>
          {FACTS.map(([k, v]) => (
            <li key={k} className="grid gap-2 border-t border-night-2 py-4 text-sm leading-relaxed text-cream/80 sm:grid-cols-[100px_1fr] sm:gap-5">
              <span className="pt-0.5 text-[10px] uppercase tracking-[0.14em] text-brass">{k}</span>
              <span>{v}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
