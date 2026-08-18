"use client";

import dynamic from "next/dynamic";
import type { Aircraft } from "@/lib/types";
import { ViewerPoster } from "./ViewerPoster";
import { useDeferredMount } from "./useDeferredMount";

/**
 * The aircraft page's viewer, on the same terms as the hero's: the 3D stack is a
 * chunk of its own, requested once the page itself has painted. The specification
 * table, the history and the sources are all readable before the model arrives,
 * which is the right order — they are the part of the page that is the content.
 */
const AircraftViewer = dynamic(
  () => import("./AircraftViewer").then((m) => m.AircraftViewer),
  { ssr: false, loading: () => null },
);

export function AircraftStage({
  aircraft,
  glbUrl,
}: {
  aircraft: Aircraft;
  glbUrl: string | null;
}) {
  const ready = useDeferredMount();

  // The placeholder holds the viewer's own frame — the same grid, the same aspect
  // ratios, the same rounding — so the page does not jump when the model arrives.
  // Change one and change the other; they are two halves of the same box.
  if (!ready) {
    return (
      <div className="grid gap-4 lg:grid-cols-[1fr_17rem]">
        <div className="flex flex-col gap-3">
          <div className="bg-hangar relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 sm:aspect-[16/10]">
            <ViewerPoster
              geometry={aircraft.geometry}
              label={aircraft.shortName}
              note="Loading model"
            />
          </div>
          <div className="h-8" />
        </div>
        <div className="hidden lg:block" />
      </div>
    );
  }

  return <AircraftViewer aircraft={aircraft} glbUrl={glbUrl} />;
}
