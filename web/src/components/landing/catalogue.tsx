import Link from "next/link";
import { FrameThumb } from "@/components/frame-thumb";
import { CATALOG } from "@/lib/frames";
import { totalFrontWidthMm } from "@/lib/frame-catalog";

const PICKS = ["panto", "rect", "browline", "round"]
  .map((shape) => CATALOG.find((f) => f.shape === shape && f.mesh.startsWith("glb:")) ?? CATALOG.find((f) => f.shape === shape))
  .filter((f): f is NonNullable<typeof f> => Boolean(f));

export function Catalogue() {
  return (
    <section className="px-6 py-16 md:px-10">
      <div className="mx-auto max-w-[1240px]">
        <div className="grid items-end gap-12 border-b border-line pb-6 md:grid-cols-2">
          <div>
            <p className="mb-3.5 flex items-baseline gap-4 text-[11px] tracking-[0.1em] text-oxblood">
              <span className="font-mono">03</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-mute">Каталог</span>
            </p>
            <h2 className="font-display text-[clamp(1.9rem,3.4vw,2.7rem)] leading-[1.04] font-medium tracking-[-0.03em]">
              {CATALOG.length} моделей с реальными размерами
            </h2>
          </div>
          <p className="text-[15px] leading-relaxed text-mute">
            Картинка оправы и объект на лице строятся из одного размерного кода, поэтому фото не
            может разойтись с цифрами на дужке Цвет подписан словами, а не только образцом
          </p>
        </div>
        <ul className="grid border-t border-line md:grid-cols-4">
          {PICKS.map((f) => (
            <li key={f.sku} className="group border-b border-line py-7 md:border-r md:px-7 md:last:border-r-0">
              <FrameThumb frame={f} />
              <h3 className="font-display mt-4 text-lg font-medium tracking-[-0.02em]">{f.name}</h3>
              <p className="measured mt-1.5 text-[11px] leading-relaxed text-mute">
                {totalFrontWidthMm(f)} мм фронт · {f.material === "acetate" ? "ацетат" : f.material === "metal" ? "металл" : "комбинированная"}
                <br />
                {f.colorRu}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[11px] text-mute">
          Форма, материал и размер заданы геометрией FRAME. Наличие конкретной модели и цена
          уточняются в салоне, офертой эти числа не являются
        </p>
      </div>
    </section>
  );
}

const SIMULATED = ["#a6ad2e", "#5f5857", "#4c48c4", "#c7cc2e"];
/**
 * Adaptation keeps the simulated appearance and separates the confusing pair by
 * lightness rather than by hue, so it survives any type of deficiency. Red and
 * ochre collapse to one mustard under deuteranopia; here they are pushed apart
 * in luminance and given distinct dash patterns plus text.
 */
const ADAPTED = ["#4e5a0e", "#5f5857", "#4c48c4", "#e9f06b"];
const DASH = ["14 6", undefined, undefined, "2 5"];
const NAMES = ["линия A красная", "линия B зелёная", "линия C синяя", "линия D оранжевая"];

function Lines({ colors, adapted }: { colors: string[]; adapted: boolean }) {
  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" role="img" aria-label="Схема маршрутов до и после адаптации">
      <rect width="320" height="180" fill="#FBFAF6" />
      {colors.map((c, i) => (
        <path
          key={c}
          d={`M18 ${28 + i * 38} H120 L${150 + i * 18} ${52 + i * 30} H302`}
          fill="none"
          stroke={c}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={adapted ? DASH[i] : undefined}
        />
      ))}
      {adapted
        ? colors.map((_, i) => (
            <text key={i} x="18" y={18 + i * 38} fontFamily="var(--font-mono)" fontSize="9" fill="#141110">
              {NAMES[i]}
            </text>
          ))
        : null}
    </svg>
  );
}

export function ColourTeaser() {
  return (
    <section className="px-6 py-16 md:px-10">
      <div className="mx-auto grid max-w-[1240px] items-center gap-12 md:grid-cols-[1fr_1fr]">
        <div>
          <p className="mb-3.5 flex items-baseline gap-4 text-[11px] tracking-[0.1em] text-oxblood">
            <span className="font-mono">04</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-mute">Цветовое зрение</span>
          </p>
          <h2 className="font-display text-[clamp(1.9rem,3.4vw,2.7rem)] leading-[1.04] font-medium tracking-[-0.03em]">
            Если цвета путаются
          </h2>
          <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-mute">
            Слева то, как видит дейтераноп: красная и оранжевая линии сливаются в один горчичный
            тон Справа адаптация: разведение контраста, пунктирные паттерны и текстовые подписи,
            которые читаются без различения цвета
          </p>
          <p className="mt-5 max-w-[46ch] text-[13px] leading-relaxed text-mute">
            Подбор режима ориентировочный Диагноз мы не ставим, зрение не проверяем и линзы не
            назначаем
          </p>
          <Link href="/how" className="mt-7 inline-block text-sm font-medium text-ink-2 underline decoration-line-2 underline-offset-4 hover:text-oxblood">
            Как это считается
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
          <div>
            <p className="bg-paper px-3 py-2 text-[9px] uppercase tracking-[0.14em] text-mute">Симуляция</p>
            <Lines colors={SIMULATED} adapted={false} />
          </div>
          <div>
            <p className="bg-paper px-3 py-2 text-[9px] uppercase tracking-[0.14em] text-oxblood">Адаптация</p>
            <Lines colors={ADAPTED} adapted />
          </div>
        </div>
      </div>
    </section>
  );
}
