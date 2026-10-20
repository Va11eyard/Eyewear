"use client";

import { FrameThumb } from "@/components/frame-thumb";
import type { Match } from "@/lib/api";
import { resolveMesh } from "@/lib/mesh-registry";

export function FramePicker({
  matches,
  picked,
  onPick,
  colors,
  color,
  onTint,
}: {
  matches: Match[];
  picked: number;
  onPick: (index: number) => void;
  colors: string[];
  color: string;
  onTint: (id: string) => void;
}) {
  const current = matches[picked];
  const tintable = !current || resolveMesh(current.frame.model ?? "rig:rect").tintable;

  return (
    <div className="mt-5">
      <div className="flex items-baseline justify-between gap-4 border-b border-line pb-2">
        <h2 className="ledger-label">Смена оправы</h2>
        <span className="ledger-label">{matches.length > 0 ? `${matches.length} из базы` : "сначала мерки"}</span>
      </div>
      {matches.length === 0 ? (
        <p className="pt-3 text-[13px] leading-relaxed text-mute">
          На превью ниже ателье-модель. Список появится после мерок, и переключение обновит его сразу
        </p>
      ) : (
        <ul className="-mx-1 flex snap-x gap-2 overflow-x-auto pt-3 pb-1">
          {matches.map((m, i) => {
            const on = i === picked;
            return (
              <li key={m.frame.sku} className="shrink-0 snap-start">
                <button
                  type="button"
                  onClick={() => onPick(i)}
                  aria-pressed={on}
                  className={`w-[168px] border p-3 text-left transition-colors ${
                    on ? "border-ink bg-paper-2" : "border-line hover:border-line-2"
                  }`}
                >
                  <FrameThumb frame={m.frame} color={on ? color : m.frame.color} />
                  <span className="mt-2 block truncate text-[14px]">{m.frame.name}</span>
                  <span className="measured mt-0.5 block text-[10px] text-mute">
                    {m.frame.lensWidthMm}-{m.frame.bridgeMm}-{m.frame.templeMm}
                  </span>
                  <span className="measured mt-1 block text-[10px] text-ink-2">
                    посадка {m.score >= 90 ? "в допуске" : `${Math.round(m.score)} по базе`}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {tintable ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <span className="ledger-label mr-2">Цвет</span>
          {colors.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onTint(id)}
              aria-pressed={id === color}
              aria-label={id}
              className={`h-8 w-8 rounded-full border-2 ${id === color ? "border-ink" : "border-line-2"}`}
              style={{ background: TINT_CSS[id] ?? TINT_CSS.black }}
            />
          ))}
          <span className="ml-1 text-[12px] text-mute">{color}</span>
        </div>
      ) : (
        <p className="border-t border-line pt-3 text-[12px] text-mute">
          У этой модели материал снят с реального скана, перекраски нет
        </p>
      )}
    </div>
  );
}

const TINT_CSS: Record<string, string> = {
  black: "#161310",
  gold: "#c9a66b",
  silver: "#d0cbc3",
  gunmetal: "#4a5058",
  tortoise: "#7a4a28",
  horn: "#4a3428",
  burgundy: "#6b1c28",
  grey: "#6e6b67",
  clear: "#e0dacc",
  crystal: "#b8b2a8",
  olive: "#5a5c38",
};
