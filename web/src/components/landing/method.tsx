const EXAMPLE = [
  { n: "01", what: "Межзрачковое расстояние", value: "63 мм", how: "По центру радужки на 3D-сетке, усреднение по 12 кадрам", spread: "±0,8" },
  { n: "02", what: "Ширина лица", value: "145 мм", how: "По выступающим точкам скул с учётом поворота головы", spread: "±1,5" },
  { n: "03", what: "Форма лица", value: "Овальная", how: "Отношения лоб, скулы, челюсть, высота; шесть классов", spread: "4 из 5" },
  { n: "04", what: "Типоразмер оправы", value: "54-20-145", how: "Заводская маркировка на дужке: глаз, мост, дужка", spread: "справочно" },
  { n: "05", what: "Посадка по ширине", value: "+2 мм", how: "Развёрнутая ширина фронта против ширины лица", spread: "в допуске" },
];

const BAND = [
  ["Кадр не сохраняется", "Обработка идёт в браузере, в истории остаются только числа"],
  ["49 моделей", "Форма строится из размерного кода, цвет подписан словами"],
  ["Салоны из каталога", "Записи ODOS и 2GIS по геолокации, наличие уточняйте на месте"],
];

export function Method() {
  return (
    <>
      <section className="mx-auto max-w-[1280px] px-6 py-14 md:px-10">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-ink pb-3">
          <h2 className="font-display text-[clamp(1.7rem,3vw,2.2rem)]">Что мы измеряем</h2>
          <span className="ledger-label">List I</span>
        </div>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-line">
              <th className="ledger-label py-3 pr-4 font-normal">№</th>
              <th className="ledger-label py-3 pr-4 font-normal">Позиция</th>
              <th className="ledger-label py-3 pr-4 font-normal">Как получено</th>
              <th className="ledger-label py-3 pr-4 text-right font-normal">Значение</th>
              <th className="ledger-label py-3 text-right font-normal">Разброс</th>
            </tr>
          </thead>
          <tbody>
            {EXAMPLE.map((r) => (
              <tr key={r.n} className="border-b border-line align-top">
                <td className="measured py-3.5 pr-4 text-[11px] text-mute">{r.n}</td>
                <td className="py-3.5 pr-4 text-[15px]">{r.what}</td>
                <td className="max-w-[38ch] py-3.5 pr-4 text-[13.5px] leading-relaxed text-mute">{r.how}</td>
                <td className="measured py-3.5 pr-4 text-right text-[14px] whitespace-nowrap">{r.value}</td>
                <td className="measured py-3.5 text-right text-[12px] text-mute whitespace-nowrap">{r.spread}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-[11px] leading-relaxed text-mute">
          <span className="ledger-label block">Значения из демонстрационного расчёта</span>
          <span className="mt-2 block">
            Ваших мерок здесь быть не может: камера ещё не включалась
          </span>
        </p>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 pb-16 md:px-10">
        <div className="grid gap-x-10 gap-y-8 border-t border-line-2 pt-4 md:grid-cols-3">
          {BAND.map(([title, body]) => (
            <div key={title} className="border-t border-line-2 pt-4">
              <h3 className="font-display text-[21px]">{title}</h3>
              <p className="mt-2 text-[13.5px] leading-[1.65] text-mute">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
