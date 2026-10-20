import Link from "next/link";
import { Icon } from "@/components/ui/icon";

function Aperture() {
  return (
    <div className="relative aspect-4/5 w-full overflow-hidden rounded-3xl bg-night ring-1 ring-night-2">
      <svg viewBox="0 0 480 600" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <defs>
          <radialGradient id="vig" cx="50%" cy="42%" r="72%">
            <stop offset="0%" stopColor="#4a4038" />
            <stop offset="58%" stopColor="#241f1b" />
            <stop offset="100%" stopColor="#100e0c" />
          </radialGradient>
          <linearGradient id="acetate" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8a5227" />
            <stop offset="45%" stopColor="#5c3419" />
            <stop offset="100%" stopColor="#3a2010" />
          </linearGradient>
        </defs>
        <rect width="480" height="600" fill="url(#vig)" />
        <ellipse cx="240" cy="300" rx="118" ry="152" fill="none" stroke="rgba(239,233,220,.3)" strokeWidth="1.4" />
        <g fill="rgba(239,233,220,.42)">
          {[162, 182, 204, 228, 252, 276, 298, 318].map((x, i) => (
            <circle key={x} cx={x} cy={252 - Math.abs(4 - i) * 6} r="1.6" />
          ))}
          <circle cx="128" cy="300" r="1.6" />
          <circle cx="352" cy="300" r="1.6" />
          <circle cx="132" cy="346" r="1.6" />
          <circle cx="348" cy="346" r="1.6" />
          <circle cx="150" cy="392" r="1.6" />
          <circle cx="330" cy="392" r="1.6" />
          <circle cx="240" cy="446" r="1.6" />
        </g>
        <path
          d="M176 288 q22 -14 46 -3M258 285 q22 -11 46 3"
          stroke="rgba(239,233,220,.55)"
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="199" cy="303" r="8.5" fill="none" stroke="#EFE9DC" strokeWidth="2" />
        <circle cx="199" cy="303" r="3.4" fill="#EFE9DC" />
        <circle cx="281" cy="303" r="8.5" fill="none" stroke="#EFE9DC" strokeWidth="2" />
        <circle cx="281" cy="303" r="3.4" fill="#EFE9DC" />
        <path d="M240 318 v34 h-12" stroke="rgba(239,233,220,.34)" strokeWidth="1.6" fill="none" />
        <path d="M212 372 q28 12 56 0" stroke="rgba(239,233,220,.4)" strokeWidth="2" fill="none" />
        <g stroke="url(#acetate)" strokeWidth="9" fill="none" strokeLinejoin="round">
          <rect x="158" y="272" width="82" height="62" rx="20" />
          <rect x="240" y="272" width="82" height="62" rx="20" />
        </g>
        <path d="M240 288 q0 -10 0 0" stroke="#5c3419" strokeWidth="8" />
        <path d="M158 292 L112 280M322 292 L368 280" stroke="#9C7A3C" strokeWidth="5" strokeLinecap="round" />
        <g fill="rgba(255,255,255,.14)">
          <rect x="163" y="277" width="72" height="52" rx="16" />
          <rect x="245" y="277" width="72" height="52" rx="16" />
        </g>
        <g stroke="#B0301C" strokeWidth="1.4">
          <line x1="199" y1="303" x2="281" y2="303" />
          <line x1="199" y1="291" x2="199" y2="315" />
          <line x1="281" y1="291" x2="281" y2="315" />
        </g>
        <rect x="220" y="226" width="40" height="18" rx="3" fill="#B0301C" />
        <text x="240" y="239" fill="#fff" fontFamily="var(--font-mono)" fontSize="11" textAnchor="middle">
          IPD
        </text>
        <g stroke="rgba(239,233,220,.35)" strokeWidth="1.4" fill="none">
          <path d="M40 40 h26M40 40 v26M440 40 h-26M440 40 v26M40 560 h26M40 560 v-26M440 560 h-26M440 560 v-26" />
        </g>
      </svg>
      <p className="absolute top-4 left-4 rounded-md border border-cream/20 bg-night/70 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-cream/80">
        Схема кадра, не фото клиента
      </p>
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.14em] text-cream/55">
        468 ориентиров
      </p>
    </div>
  );
}

export function Hero() {
  return (
    <section className="grid items-center gap-14 px-6 pt-16 pb-20 md:grid-cols-[1.02fr_0.98fr] md:px-10 md:pt-24">
      <div>
        <p className="mb-7 flex items-center gap-3.5 text-[10px] font-medium uppercase tracking-[0.24em] text-vermilion">
          <span className="h-px w-11 bg-vermilion" aria-hidden="true" />
          Ателье посадки · живая камера
        </p>
        <h1 className="font-display max-w-[13ch] text-[clamp(2.9rem,7.2vw,5.5rem)] leading-[0.92] font-medium tracking-[-0.035em]">
          Оправа по <em className="font-light italic">меркам</em>, а не по типу лица
        </h1>
        <p className="mt-7 max-w-[46ch] text-lg leading-relaxed text-ink-2">
          Считаем межзрачковое расстояние и ширину лица по 3D-сетке с вашей камеры, подбираем оправы
          по заводской маркировке и показываем посадку до примерки
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-7">
          <Link
            href="/capture"
            className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-ink px-7 text-sm font-medium text-paper transition-colors hover:bg-vermilion"
          >
            Открыть камеру
            <Icon name="camera" className="text-base" />
          </Link>
          <Link href="/how" className="text-sm font-medium text-ink-2 underline decoration-line-2 underline-offset-4 hover:text-vermilion">
            Как это считается
          </Link>
        </div>
        <ul className="mt-11 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-5 text-[11px] leading-relaxed text-mute">
          <li>Фото не сохраняется после анализа</li>
          <li className="border-l border-line pl-6">Не рецепт и не диагноз</li>
          <li className="border-l border-line pl-6">Мерки считаются в браузере</li>
        </ul>
      </div>
      <Aperture />
    </section>
  );
}
