"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Livery, Markings, SurfaceConfig } from "@/lib/types";
import {
  airfoilRing,
  applyLivery,
  buildLoft,
  DEG,
  planformAt,
  surfaceGeometry,
} from "./loft";
import { Airframe } from "./parts";
import { FinFlash } from "./markings";

/**
 * An all-moving horizontal surface — canard, stabilator or helicopter stabiliser.
 * These really are all-moving on the aircraft in this collection, so rotating the
 * whole panel is accurate rather than a shortcut.
 */
export function HorizontalSurface({
  cfg,
  livery,
  amplitude = 0,
  phase = 0,
}: {
  cfg: SurfaceConfig;
  livery: Livery;
  amplitude?: number;
  phase?: number;
}) {
  const geometry = useMemo(
    () => applyLivery(surfaceGeometry(cfg), livery),
    [cfg, livery],
  );
  const group = useRef<THREE.Group>(null);
  const amp = useRef(0);
  const pivotZ = cfg.root[2] - cfg.rootChord * 0.35;

  useFrame((state, dt) => {
    if (!group.current) return;
    amp.current = THREE.MathUtils.damp(amp.current, amplitude, 3, dt);
    group.current.rotation.x =
      Math.sin(state.clock.elapsedTime * 1.1 + phase) * amp.current * 9 * DEG;
  });

  return (
    <group ref={group} position={[0, cfg.root[1], pivotZ]}>
      <group position={[0, -cfg.root[1], -pivotZ]}>
        <mesh geometry={geometry} castShadow receiveShadow>
          <Airframe repeat={[4, Math.max(3, cfg.span / 1.6)]} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Fins, ventral strakes and winglets. Built flat and rotated upright about Z, which
 * keeps the loft's winding intact — mirroring with a negative scale would flip the
 * normals and light the surface from the inside.
 */
export function VerticalSurface({
  cfg,
  livery,
  markings,
  ventral = false,
  amplitude = 0,
}: {
  cfg: SurfaceConfig;
  livery: Livery;
  /** Set on the fin that carries the flash and serial. */
  markings?: Markings;
  ventral?: boolean;
  amplitude?: number;
}) {
  const geometry = useMemo(
    () =>
      applyLivery(
        surfaceGeometry({ ...cfg, root: [0, 0, cfg.root[2]], vertical: true }),
        livery,
      ),
    [cfg, livery],
  );
  const rudder = useRef<THREE.Group>(null);
  const amp = useRef(0);
  const pivotZ = cfg.root[2] - cfg.rootChord * 0.55;

  // Cant leans the fin away from the centreline, so its sign follows the side.
  const side = cfg.root[0] >= 0 ? 1 : -1;
  const cant = Math.abs(cfg.cant ?? 0) * side;
  const rotZ = (ventral ? -90 + cant : 90 - cant) * DEG;

  useFrame((state, dt) => {
    if (!rudder.current) return;
    amp.current = THREE.MathUtils.damp(amp.current, amplitude, 3, dt);
    rudder.current.rotation.y =
      Math.sin(state.clock.elapsedTime * 0.85) * amp.current * 6 * DEG;
  });

  return (
    <group position={[cfg.root[0], cfg.root[1], pivotZ]}>
      <group ref={rudder}>
        <group position={[0, 0, -pivotZ]} rotation={[0, 0, rotZ]}>
          <mesh geometry={geometry} castShadow receiveShadow>
            <Airframe repeat={[3, Math.max(2, cfg.span / 1.4)]} />
          </mesh>
          {markings?.finFlash && (
            <FinFlash cfg={cfg} lowVis={markings.lowVis} serial={markings.serial} />
          )}
        </group>
      </group>
    </group>
  );
}

/**
 * Trailing-edge panels on the wing. On the tailless deltas here these elevons are the
 * only pitch control there is, so the control-surface animation would look dead
 * without them.
 */
export function ControlPanels({
  cfg,
  livery,
  amplitude,
}: {
  cfg: SurfaceConfig;
  livery: Livery;
  amplitude: number;
}) {
  const fraction = cfg.controlSurface;

  const panels = useMemo(() => {
    if (!fraction) return [];
    const ranges: [number, number, boolean][] = [
      [0.2, 0.53, true], // inboard: symmetric, flap / elevator
      [0.57, 0.9, false], // outboard: antisymmetric, aileron
    ];
    const out: {
      geometry: THREE.BufferGeometry;
      pivot: [number, number, number];
      symmetric: boolean;
      side: number;
    }[] = [];

    for (const side of [-1, 1]) {
      for (const [f0, f1, symmetric] of ranges) {
        const a = planformAt(cfg, f0);
        const b = planformAt(cfg, f1);
        const chordA = a.chord * fraction;
        const chordB = b.chord * fraction;
        // Hinge line sits one panel-chord ahead of the trailing edge.
        const hingeA = a.zLE - a.chord + chordA;
        const hingeB = b.zLE - b.chord + chordB;
        const xA = cfg.root[0] + side * f0 * cfg.span;
        const xB = cfg.root[0] + side * f1 * cfg.span;

        const ringA = airfoilRing(xA, hingeA, a.y, chordA, 0.05);
        const ringB = airfoilRing(xB, hingeB, b.y, chordB, 0.05);
        // Rings must advance along +X for the winding to come out right.
        const rings = xA <= xB ? [ringA, ringB] : [ringB, ringA];

        out.push({
          geometry: applyLivery(buildLoft(rings), livery),
          pivot: [(xA + xB) / 2, (a.y + b.y) / 2, (hingeA + hingeB) / 2],
          symmetric,
          side,
        });
      }
    }
    return out;
  }, [cfg, fraction, livery]);

  if (!panels.length) return null;
  return (
    <>
      {panels.map((p, i) => (
        <Panel key={i} {...p} amplitude={amplitude} />
      ))}
    </>
  );
}

function Panel({
  geometry,
  pivot,
  symmetric,
  side,
  amplitude,
}: {
  geometry: THREE.BufferGeometry;
  pivot: [number, number, number];
  symmetric: boolean;
  side: number;
  amplitude: number;
}) {
  const group = useRef<THREE.Group>(null);
  const amp = useRef(0);

  useFrame((state, dt) => {
    if (!group.current) return;
    amp.current = THREE.MathUtils.damp(amp.current, amplitude, 3, dt);
    const t = state.clock.elapsedTime;
    const drive = symmetric ? Math.sin(t * 1.1) : Math.sin(t * 1.5 + Math.PI / 3) * side;
    group.current.rotation.x = drive * amp.current * 14 * DEG;
  });

  return (
    <group ref={group} position={pivot}>
      <group position={[-pivot[0], -pivot[1], -pivot[2]]}>
        <mesh geometry={geometry} castShadow receiveShadow>
          <Airframe repeat={[2, 3]} />
        </mesh>
      </group>
    </group>
  );
}
