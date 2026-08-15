"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { FuselageStation, Markings, SurfaceConfig } from "@/lib/types";
import { fuselagePatch, surfacePatch } from "./loft";
import { finFlashTexture, roundelTexture, serialTexture } from "./textures";

/**
 * National markings painted on the airframe.
 *
 * These are depicted because they are on the real aircraft — descriptive use. The
 * site's own logo, header and favicon are original and share none of this artwork.
 * See the rules in CLAUDE.md before changing anything here.
 */

function MarkingMaterial({ map }: { map: THREE.Texture | null }) {
  if (!map) return null;
  return (
    <meshStandardMaterial
      map={map}
      transparent
      alphaTest={0.35}
      roughness={0.55}
      metalness={0.1}
      side={THREE.DoubleSide}
      polygonOffset
      polygonOffsetFactor={-2}
    />
  );
}

/** Roundels on both flanks of the fuselage, wrapped onto the body's curvature. */
export function FuselageRoundels({
  stations,
  z,
  size,
  lowVis,
}: {
  stations: FuselageStation[];
  z: number;
  size: number;
  lowVis?: boolean;
}) {
  const map = roundelTexture(lowVis);

  const patches = useMemo(
    // Square in metres: `fuselagePatch` works out the angular sweep from the
    // section's local curvature so the marking is not squashed on a flat flank.
    () => [0, Math.PI].map((angle) => fuselagePatch(stations, z, angle, size, size, 0.025)),
    [stations, z, size],
  );

  if (!map) return null;
  return (
    <>
      {patches.map((geometry, i) => (
        <mesh key={i} geometry={geometry}>
          <MarkingMaterial map={map} />
        </mesh>
      ))}
    </>
  );
}

/** Roundels above and below both wings. */
export function WingRoundels({
  wing,
  size,
  lowVis,
  spanFrac = 0.55,
}: {
  wing: SurfaceConfig;
  size: number;
  lowVis?: boolean;
  spanFrac?: number;
}) {
  const map = roundelTexture(lowVis);

  const patches = useMemo(() => {
    const out: THREE.BufferGeometry[] = [];
    for (const side of [1, -1]) {
      for (const upper of [true, false]) {
        out.push(surfacePatch(wing, side * spanFrac, 0.52, size, upper, 0.02));
      }
    }
    return out;
  }, [wing, size, spanFrac]);

  if (!map) return null;
  return (
    <>
      {patches.map((geometry, i) => (
        <mesh key={i} geometry={geometry}>
          <MarkingMaterial map={map} />
        </mesh>
      ))}
    </>
  );
}

/**
 * Fin flash, rendered inside the fin's own transformed group so it inherits the
 * rotation and cant that stand the fin upright.
 */
export function FinFlash({
  cfg,
  lowVis,
  serial,
}: {
  cfg: SurfaceConfig;
  lowVis?: boolean;
  serial?: string;
}) {
  const flashMap = finFlashTexture(lowVis);
  const serialMap = serial ? serialTexture(serial) : null;

  // The fin is built flat here — root at the origin, span along +X — and rotated
  // upright by the caller, so patches use the same untransformed config.
  const flat = useMemo<SurfaceConfig>(
    () => ({ ...cfg, root: [0, 0, cfg.root[2]], vertical: true }),
    [cfg],
  );

  const flash = useMemo(
    () => surfacePatch(flat, 0.68, 0.72, cfg.span * 0.34, true, 0.012),
    [flat, cfg.span],
  );
  const flashBack = useMemo(
    () => surfacePatch(flat, 0.68, 0.72, cfg.span * 0.34, false, 0.012),
    [flat, cfg.span],
  );
  const serialPatch = useMemo(
    () => (serial ? surfacePatch(flat, 0.3, 0.5, cfg.span * 0.3, true, 0.012) : null),
    [flat, cfg.span, serial],
  );
  const serialBack = useMemo(
    () => (serial ? surfacePatch(flat, 0.3, 0.5, cfg.span * 0.3, false, 0.012) : null),
    [flat, cfg.span, serial],
  );

  return (
    <>
      {flashMap && (
        <>
          <mesh geometry={flash}>
            <MarkingMaterial map={flashMap} />
          </mesh>
          <mesh geometry={flashBack}>
            <MarkingMaterial map={flashMap} />
          </mesh>
        </>
      )}
      {serialMap && serialPatch && serialBack && (
        <>
          <mesh geometry={serialPatch}>
            <MarkingMaterial map={serialMap} />
          </mesh>
          <mesh geometry={serialBack}>
            <MarkingMaterial map={serialMap} />
          </mesh>
        </>
      )}
    </>
  );
}

/** Everything that goes on the body and wings, driven by the markings config. */
export function AirframeMarkings({
  markings,
  stations,
  wing,
}: {
  markings: Markings;
  stations: FuselageStation[];
  wing?: SurfaceConfig;
}) {
  const roundel = markings.roundel;
  if (!roundel) return null;

  // Fuselage roundels sit on the rear third, clear of the wing root and intakes.
  const zs = stations.map((s) => s.z);
  const zMin = Math.min(...zs);
  const zMax = Math.max(...zs);
  const z = zMin + (zMax - zMin) * 0.34;

  return (
    <>
      <FuselageRoundels
        stations={stations}
        z={z}
        size={roundel}
        lowVis={markings.lowVis}
      />
      {wing && <WingRoundels wing={wing} size={roundel} lowVis={markings.lowVis} />}
    </>
  );
}
