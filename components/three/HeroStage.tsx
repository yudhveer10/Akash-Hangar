"use client";

import dynamic from "next/dynamic";
import type { AirBase, GeometryConfig, PhaseId } from "@/lib/types";
import { ViewerPoster } from "./ViewerPoster";
import { useDeferredMount } from "./useDeferredMount";

/**
 * The home page hero's 3D, kept off the critical path.
 *
 * `ssr: false` is what moves three, R3F, drei and the post-processing stack out of
 * the page's own bundle and into a chunk of their own — the home page was shipping
 * roughly 1.8 MB of JavaScript, 1.1 MB of it this, all of it in front of hydration.
 * Now the hero's copy, its figures and both buttons are live while the aircraft is
 * still loading, and `useDeferredMount` holds the request until after the first
 * paint so the two are not competing for the same thread.
 */
const HeroViewer = dynamic(
  () => import("./HeroViewer").then((m) => m.HeroViewer),
  { ssr: false, loading: () => null },
);

export function HeroStage({
  geometry,
  extent,
  base,
  opensAt,
  label,
}: {
  geometry: GeometryConfig;
  extent: number;
  base: AirBase;
  opensAt: PhaseId;
  /** The aircraft's short name, shown on the placeholder. */
  label: string;
}) {
  const ready = useDeferredMount();

  if (!ready) {
    return <ViewerPoster geometry={geometry} label={label} note="Preparing approach" />;
  }

  return (
    <HeroViewer geometry={geometry} extent={extent} base={base} opensAt={opensAt} />
  );
}
