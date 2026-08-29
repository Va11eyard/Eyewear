import { SiteHeader } from "@/components/site-header";

export default function HowPage() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main id="content" className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-display text-5xl tracking-tight">Как считается посадка</h1>
        <ol className="mt-10 space-y-8 text-base leading-relaxed text-mute">
          <li>
            <strong className="text-ink">Съёмка.</strong> Браузер берёт кадр с камеры. Стоковые портреты не используются.
          </li>
          <li>
            <strong className="text-ink">Сетка лица.</strong> MediaPipe Face Landmarker даёт 3D-точки, включая радужку для масштаба в миллиметрах.
          </li>
          <li>
            <strong className="text-ink">Каталог.</strong> Сервер сравнивает IPD и ширину лица с реальными lens / bridge / temple.
          </li>
          <li>
            <strong className="text-ink">Оптики.</strong> Запрос к OpenStreetMap Overpass вокруг ваших координат. Если геолокация выключена, список магазинов не подставляется.
          </li>
        </ol>
      </main>
    </div>
  );
}
