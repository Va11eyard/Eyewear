import Link from "next/link";
import { notFound } from "next/navigation";
import { FrameThumb } from "@/components/frame-thumb";
import { frameById, totalFrontWidthMm } from "@/lib/frame-catalog";
import { CATALOG } from "@/lib/frames";
import { resolveMesh } from "@/lib/mesh-registry";

export function generateStaticParams() {
  return CATALOG.map((f) => ({ sku: f.sku }));
}

const SHAPE_RU: Record<string, string> = {
  round: "круг", panto: "панто", rect: "прямоугольник", square: "квадрат",
  cat: "кошачий глаз", browline: "броулайны", aviator: "авиатор",
};
const MATERIAL_RU: Record<string, string> = {
  acetate: "ацетат", metal: "металл", combo: "комбинированная",
};

export default async function FramePage({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  const frame = frameById(CATALOG, sku);
  if (!frame) {
    notFound();
  }
  const mesh = resolveMesh(frame.mesh);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1280px] items-baseline gap-9 px-6 py-6 md:px-10">
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
        </div>
      </header>

      <main id="content" className="mx-auto grid max-w-[1100px] gap-x-14 gap-y-10 px-6 py-12 md:px-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section>
          <div className="border border-line bg-paper-2/40 p-6">
            <FrameThumb frame={frame} />
          </div>
          <p className="ledger-label mt-3">
            {mesh.kind === "glb" ? "скан реальной оправы" : "геометрия из размерного кода"} · {mesh.license}
          </p>
        </section>

        <section>
          <h1 className="font-display text-[clamp(2rem,3.6vw,2.8rem)] leading-tight">{frame.name}</h1>
          <p className="mt-2 text-[15px] text-ink-2">{frame.colorRu}</p>
          <table className="mt-7 w-full border-collapse text-left">
            <tbody>
              {[
                ["Глаз, мост, дужка", `${frame.lensWidthMm}-${frame.bridgeMm}-${frame.templeMm}`],
                ["Фронт в развёртке", `${totalFrontWidthMm(frame)} мм`],
                ["Форма", SHAPE_RU[frame.shape] ?? frame.shape],
                ["Материал", MATERIAL_RU[frame.material] ?? frame.material],
                ["Вес", `${frame.weightG} г`],
                ["Палитра", frame.colors.join(", ")],
              ].map(([k, v]) => (
                <tr key={k} className="border-b border-line">
                  <th className="ledger-label py-3 pr-4 font-normal">{k}</th>
                  <td className="measured py-3 text-right text-[14px]">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-6 text-[13px] leading-relaxed text-mute">
            Совпадение с вашими мерками показывается после съёмки. Без неё здесь стояло бы число,
            которое мы не измеряли
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-mute">
            Наличие и цену уточняйте в салоне: каталог описывает модель, а не склад
          </p>
          <Link href="/capture" className="mt-8 inline-flex min-h-12 items-center bg-ink px-7 text-[12.5px] font-medium uppercase tracking-[0.11em] text-paper transition-colors hover:bg-oxblood">
            Примерить на своё лицо
          </Link>
        </section>
      </main>
    </div>
  );
}
