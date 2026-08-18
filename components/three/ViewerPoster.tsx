import type { GeometryConfig } from "@/lib/types";
import { Brackets } from "@/components/ui/Brackets";
import { Planform } from "@/components/ui/Planform";

/**
 * What stands in the viewport while the 3D bundle is still on its way.
 *
 * three, R3F, drei and the post-processing stack are a megabyte of JavaScript, and
 * until this existed the page could not finish hydrating without them: the first
 * thing a visitor got on a slow connection was a hole where the aircraft goes. The
 * stage components below load that bundle *after* first paint, and this holds the
 * frame in the meantime.
 *
 * It is not a spinner. The silhouette is the same `Planform` the fleet cards draw,
 * derived from the very geometry config the viewer is about to build in 3D, so the
 * placeholder is the aircraft that is coming rather than a stand-in for it — and it
 * costs no image file and no extra licence, like everything else here.
 */
export function ViewerPoster({
  geometry,
  label,
  note,
}: {
  geometry: GeometryConfig;
  label: string;
  note: string;
}) {
  return (
    <div className="bg-hangar absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 grid place-items-center px-10 py-12">
        <Planform
          geometry={geometry}
          className="h-full w-full text-slate-700/70 opacity-70"
        />
      </div>

      <Brackets className="inset-3" />

      <div className="absolute inset-x-0 bottom-5 flex flex-col items-center gap-2">
        {/* Indeterminate: the three.js chunk streams in, and a percentage that has to
            be invented is worse than a bar that only says "working". */}
        <div className="h-px w-32 overflow-hidden rounded-full bg-white/10">
          <div
            className="plate-sweep h-full w-1/2 bg-sky-400/80"
            // The beacon's own nine seconds is a mood; a progress bar has to look
            // like it is working.
            style={{ animationDuration: "1.6s" }}
          />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
          {note}
        </p>
      </div>

      <p className="absolute left-5 top-4 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
        {label}
      </p>
    </div>
  );
}
