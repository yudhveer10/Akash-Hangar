"use client";

import { Html } from "@react-three/drei";
import type { Annotation } from "@/lib/types";

/**
 * Numbered hotspots pinned to points on the airframe. Selection is owned by the
 * viewer so the same index can be driven from the list beside the canvas — clicking
 * either the marker or the list entry highlights both.
 */
export function Annotations({
  items,
  selected,
  onSelect,
}: {
  items: Annotation[];
  selected: number | null;
  onSelect: (index: number | null) => void;
}) {
  return (
    <>
      {items.map((item, i) => {
        const active = selected === i;
        return (
          <Html
            key={item.label}
            position={item.position}
            center
            zIndexRange={[30, 10]}
            style={{ pointerEvents: "auto" }}
          >
            <div className="relative">
              <button
                type="button"
                onClick={() => onSelect(active ? null : i)}
                aria-label={item.label}
                aria-expanded={active}
                className={`grid h-6 w-6 place-items-center rounded-full border font-mono text-[10px] font-semibold transition-all ${
                  active
                    ? "scale-110 border-sky-300 bg-sky-400 text-ink-950 shadow-[0_0_18px_rgba(56,189,248,0.8)]"
                    : "border-sky-300/70 bg-ink-950/85 text-sky-200 hover:border-sky-300 hover:bg-sky-400/25"
                }`}
              >
                {i + 1}
              </button>

              {active && (
                <div className="absolute left-8 top-1/2 w-60 -translate-y-1/2 rounded-lg border border-sky-400/35 bg-ink-950/95 p-3 shadow-xl backdrop-blur-sm">
                  <p className="text-xs font-medium text-sky-200">{item.label}</p>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
                    {item.note}
                  </p>
                </div>
              )}
            </div>
          </Html>
        );
      })}
    </>
  );
}
