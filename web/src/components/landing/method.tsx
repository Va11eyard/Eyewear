import { MeasureRow } from "@/components/ui/measure-row";
import { confidenceBand } from "@/lib/fit-math";

/**
 * An example calculation, not the visitor's data: nobody has pointed a camera
 * yet, so any number here that claimed to be yours would be invented.
 */
const EXAMPLE = {
  ipd: { label: "Межзрачковое расстояние", value: "63", unit: "мм", tolerance: "±0,8", agreed: 5, how: "По центру радужки на 3D-сетке, усреднение по 12 кадрам" },
  width: { label: "Ширина лица", value: "145", unit: "мм", tolerance: "±1,5", agreed: 4, how: "По выступающим точкам скул с учётом поворота головы" },
  shape: { label: "Форма лица", value: "Овальная", unit: "", tolerance: "4 из 5", agreed: 4, how: "Отношения лоб, скулы, челюсть, высота; шесть классов" },
  size: { label: "Типоразмер оправы", value: "54-20-145", unit: "", tolerance: "справочно", agreed: 5, how: "Заводская маркировка на дужке: глаз, мост, дужка" },
  fit: { label: "Посадка по ширине", value: "+2", unit: "мм", tolerance: "в допуске", agreed: 4, how: "Развёрнутая ширина оправы против ширины лица" },
};

const STEPS = [
  ["01", "Съёмка", "Браузер берёт живой кадр Стоковых портретов в продукте нет: если анфас не набран, мерки не считаем"],
  ["02", "Геометрия", "MediaPipe даёт 468 точек с глубиной и матрицу поворота Из них считаем IPD, ширину и форму лица"],
  ["03", "Посадка", "Оправы ранжируются по совместимости ширины и формы, а не по популярности Три модели, без повторов формы"],
];

export function Method() {
  return (
    <>
      <section className="px-6 py-16 md:px-10">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid items-end gap-12 border-b border-line pb-6 md:grid-cols-2">
            <div>
              <p className="mb-3.5 flex items-baseline gap-4 text-[11px] tracking-[0.1em] text-vermilion">
                <span className="font-mono">01</span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-mute">Что считаем</span>
              </p>
              <h2 className="font-display text-[clamp(1.9rem,3.4vw,2.7rem)] leading-[1.04] font-medium tracking-[-0.03em]">
                Пять чисел, а не тип лица из стока
              </h2>
            </div>
            <p className="text-[15px] leading-relaxed text-mute">
              Каждая строка содержит измерение, источник и разброс Там, где ориентиров сетки не
              хватает, уверенность падает, и мы это пишем прямо
            </p>
          </div>
          <div className="mt-2 grid gap-x-14 gap-y-8 md:grid-cols-2">
            <div>
              {Object.values(EXAMPLE).map((row) => (
                <MeasureRow
                  key={row.label}
                  label={row.label}
                  value={row.value}
                  unit={row.unit}
                  tolerance={row.tolerance}
                  band={confidenceBand(row.agreed).pct}
                />
              ))}
            </div>
            <dl className="grid gap-0 self-start">
              {Object.values(EXAMPLE).map((row) => (
                <div key={row.label} className="border-b border-line py-3 text-[13px] leading-relaxed text-mute">
                  <dt className="sr-only">{row.label}</dt>
                  <dd>{row.how}</dd>
                </div>
              ))}
              <p className="pt-4 text-[11px] text-mute">
                Значения из демонстрационного расчёта Ваших мерок здесь быть не может: камера ещё
                не включалась
              </p>
            </dl>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-10">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid items-end gap-12 border-b border-line pb-6 md:grid-cols-2">
            <div>
              <p className="mb-3.5 flex items-baseline gap-4 text-[11px] tracking-[0.1em] text-vermilion">
                <span className="font-mono">02</span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-mute">Процесс</span>
              </p>
              <h2 className="font-display text-[clamp(1.9rem,3.4vw,2.7rem)] leading-[1.04] font-medium tracking-[-0.03em]">
                Три шага, меньше минуты
              </h2>
            </div>
            <p className="text-[15px] leading-relaxed text-mute">
              Никаких загруженных фото и анкет Камера, геометрия, список салонов, куда можно
              позвонить с готовыми мерками
            </p>
          </div>
          <ol className="grid border-t border-line md:grid-cols-3">
            {STEPS.map(([n, title, body]) => (
              <li key={n} className="border-b border-line py-9 pr-8 md:border-r md:last:border-r-0">
                <p className="font-display text-[64px] leading-none font-light tracking-[-0.05em] text-line-2">{n}</p>
                <h3 className="font-display mt-4 text-xl font-medium tracking-[-0.02em]">{title}</h3>
                <p className="mt-2.5 max-w-[34ch] text-sm leading-relaxed text-mute">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
