import Link from "next/link";

/**
 * The plate is a draughtsman's drawing of a face with the caliper on it, not a
 * photograph of a person. The product has no stock faces and never will, and a
 * line plate belongs to the register anyway.
 */
function Plate() {
  return (
    <figure className="relative border border-line bg-paper-2/40">
      <svg viewBox="0 0 420 460" className="h-full w-full" role="img" aria-label="Схема лица с измерением межзрачкового расстояния">
        <g fill="none" stroke="#1D1A16" strokeWidth="1.1">
          <ellipse cx="210" cy="228" rx="104" ry="136" />
          <path d="M150 196 q20 -13 42 -3M228 193 q20 -10 42 3" strokeWidth="2" strokeLinecap="round" />
          <path d="M210 214 v30 h-11" />
          <path d="M186 276 q24 11 48 0" />
        </g>
        <g fill="none" stroke="#1D1A16">
          <circle cx="171" cy="212" r="7.5" strokeWidth="1.6" />
          <circle cx="249" cy="212" r="7.5" strokeWidth="1.6" />
        </g>
        <g fill="#1D1A16">
          <circle cx="171" cy="212" r="2.8" />
          <circle cx="249" cy="212" r="2.8" />
          {[132, 152, 174, 198, 222, 246, 268, 288].map((x, i) => (
            <circle key={x} cx={x} cy={176 - Math.abs(3.5 - i) * 5} r="1.4" fillOpacity=".42" />
          ))}
          <circle cx="108" cy="228" r="1.4" fillOpacity=".42" />
          <circle cx="312" cy="228" r="1.4" fillOpacity=".42" />
          <circle cx="118" cy="278" r="1.4" fillOpacity=".42" />
          <circle cx="302" cy="278" r="1.4" fillOpacity=".42" />
          <circle cx="210" cy="356" r="1.4" fillOpacity=".42" />
        </g>
        <g stroke="#7A2E23" strokeWidth="1.2">
          <line x1="171" y1="212" x2="249" y2="212" />
          <line x1="171" y1="200" x2="171" y2="224" />
          <line x1="249" y1="200" x2="249" y2="224" />
        </g>
        <g fill="none" stroke="#1D1A16" strokeWidth="2.4">
          <rect x="130" y="184" width="76" height="58" rx="26" />
          <rect x="214" y="184" width="76" height="58" rx="26" />
          <path d="M206 196 q4 -8 8 0" strokeWidth="3" />
        </g>
        <g stroke="#A98545" strokeWidth="1.4" fill="none">
          <path d="M40 420 h340" />
          <path d="M40 414 v12M90 417 v6M140 417 v6M190 417 v6M240 417 v6M290 417 v6M340 414 v12" />
        </g>
      </svg>
      <figcaption className="flex items-center justify-between gap-4 border-t border-line px-4 py-2.5">
        <span className="ledger-label">Схема кадра, не фото клиента</span>
        <span className="ledger-label">468 ориентиров</span>
      </figcaption>
    </figure>
  );
}

export function Hero() {
  return (
    <section className="relative mx-auto grid max-w-[1280px] items-end gap-14 overflow-hidden px-6 pt-16 pb-14 md:grid-cols-[1.06fr_0.94fr] md:px-10 md:pt-20">
      {/* A crest behind the content at reading transparency, not a badge in
          front of it, which is how the heritage houses place their mark. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 200 200"
        className="pointer-events-none absolute -top-16 -right-24 h-[420px] w-[420px] text-ink opacity-[0.05]"
      >
        <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="78" fill="none" stroke="currentColor" strokeWidth="0.75" />
        <text
          x="100"
          y="128"
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontSize="88"
          fill="currentColor"
        >
          F
        </text>
      </svg>
      <div>
        <p className="ledger-label-brand mb-7">Посадка по миллиметрам</p>
        <h1 className="font-display max-w-[15ch] text-[clamp(2.6rem,5.2vw,4.6rem)] leading-[1.03]">
          Оправа по <span className="text-oxblood">меркам</span>, а не по типу лица
        </h1>
        <p className="mt-7 max-w-[44ch] text-[16.5px] leading-[1.75] text-ink-2">
          Межзрачковое расстояние и ширину лица считаем по 3D-сетке с вашей камеры, оправы подбираем
          по заводской маркировке: глаз, мост, дужка
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-8">
          <Link
            href="/capture"
            className="inline-flex min-h-12 items-center bg-ink px-8 text-[12.5px] font-medium uppercase tracking-[0.11em] text-paper transition-colors hover:bg-oxblood"
          >
            Снять мерки
          </Link>
          <Link
            href="/how"
            className="font-display text-[15px] text-ink-2 underline decoration-line-2 underline-offset-4 hover:text-oxblood"
          >
            Метод расчёта
          </Link>
        </div>
        <p className="mt-12 border-t border-line pt-4 text-[11px] leading-relaxed text-mute">
          <span className="ledger-label block">Ателье FRAME · Астана · 2026</span>
          <span className="mt-2 block">
            Мерки, геометрия оправ и каталог собраны здесь, каждая модель описана собственным
            размерным кодом
          </span>
        </p>
      </div>
      <Plate />
    </section>
  );
}
