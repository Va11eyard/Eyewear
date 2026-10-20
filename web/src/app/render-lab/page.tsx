"use client";

import { useEffect, useState } from "react";
import type { RigFrame } from "@/lib/glasses-rig";
import { renderProductShot } from "@/lib/product-render";

const HDRI = "/models/hdri/studio_small_03.hdr";

const SHAPES = ["rect", "panto", "round", "square", "cat", "browline", "aviator"];
const SPECIMENS: { label: string; frame: RigFrame }[] = [
  ...SHAPES.map((shape) => ({
    label: `${shape} · ацетат · чёрный`,
    frame: { shape, color: "black", material: "acetate", lensWidthMm: 52, bridgeMm: 19, templeMm: 145, model: `rig:${shape}` },
  })),
  ...SHAPES.map((shape) => ({
    label: `${shape} · ацетат · тортилла`,
    frame: { shape, color: "tortoise", material: "acetate", lensWidthMm: 52, bridgeMm: 19, templeMm: 145, model: `rig:${shape}` },
  })),
  ...SHAPES.map((shape) => ({
    label: `${shape} · металл · золото`,
    frame: { shape, color: "gold", material: "metal", lensWidthMm: 52, bridgeMm: 19, templeMm: 145, model: `rig:${shape}` },
  })),
  { label: "panto · комбинированная · графит", frame: { shape: "panto", color: "gunmetal", material: "combo", lensWidthMm: 54, bridgeMm: 18, templeMm: 145, model: "rig:panto" } },
  { label: "round · CC0 меш Poly Haven", frame: { shape: "round", color: "gunmetal", material: "metal", lensWidthMm: 58, bridgeMm: 18, templeMm: 145, model: "glb:polyhaven-round" } },
];

export default function RenderLabPage() {
  const [shots, setShots] = useState<{ label: string; url: string | null }[]>(
    SPECIMENS.map((s) => ({ label: s.label, url: null })),
  );

  useEffect(() => {
    let alive = true;
    void (async () => {
      const out: { label: string; url: string | null }[] = [];
      for (const s of SPECIMENS) {
        const { instantiateGlasses } = await import("@/lib/try-on-model");
        let url: string | null = null;
        try {
          const group = await instantiateGlasses(s.frame);
          url = await renderProductShot(group, { width: 520, height: 300, env: HDRI, fill: 0.72 });
        } catch {
          url = null;
        }
        out.push({ label: s.label, url });
      }
      if (alive) {
        setShots(out);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main id="content" className="mx-auto max-w-[1280px] px-6 py-10 md:px-10">
      <h1 className="font-display text-[28px]">Рендер-лаборатория оправ</h1>
      <p className="mt-2 max-w-[60ch] text-[13px] leading-relaxed text-mute">
        Служебная страница. Каждая модель собрана из размерного кода тем же движком, что ставит
        оправу на лицо, и освещена студийным HDRI по лицензии CC0
      </p>
      <ul id="specimens" className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {shots.map((s) => (
          <li key={s.label} className="bg-paper p-4">
            {s.url ? (
              <div aria-hidden="true" className="aspect-[26/15] w-full bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${s.url})` }} />
            ) : (
              <div className="grid aspect-[26/15] place-items-center border border-line text-[11px] text-mute">нет WebGL</div>
            )}
            <p className="ledger-label mt-3">{s.label}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
