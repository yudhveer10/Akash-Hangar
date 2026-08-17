"use client";

import { Suspense, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { AirBase, GeometryConfig, PhaseId } from "@/lib/types";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { BaseEnvironment } from "./environment/BaseEnvironment";
import { PHASES, PHASE_ORDER } from "./environment/phases";
import { HeroApproach } from "./HeroApproach";
import { PostFX } from "./Scene";

/**
 * The home page's hero: an aircraft flying an approach onto the runway, which the
 * visitor is then left holding at the controls of.
 *
 * The scene is the same one the aircraft pages use — a real station at a real time of
 * day — rather than a studio set, because the point of the shot is that the aircraft
 * is somewhere. Once it has rolled to a stop the camera hands over to the ordinary
 * turntable, so the hero ends as the thing the rest of the site is made of.
 */
export function HeroViewer({
  geometry,
  extent,
  base,
  opensAt,
}: {
  geometry: GeometryConfig;
  extent: number;
  base: AirBase;
  /** The time of day the landing opens on — the station's own, as everywhere else. */
  opensAt: PhaseId;
}) {
  const reduced = usePrefersReducedMotion();
  const [run, setRun] = useState(0);
  const [skip, setSkip] = useState(0);
  const [flying, setFlying] = useState(true);
  const [phase, setPhase] = useState<PhaseId>(opensAt);

  // Shared with the environment: the sun's shadow frustum is about a hundred metres
  // wide, and the aircraft covers five times that.
  const focus = useRef<THREE.Vector3 | null>(new THREE.Vector3());

  return (
    <>
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        camera={{ fov: 32, near: 0.5, far: 1800, position: [40, 38, -430] }}
        fallback={null}
      >
        <BaseEnvironment base={base} phase={phase} focus={focus} />
        <Suspense fallback={null}>
          <HeroApproach
            geometry={geometry}
            extent={extent}
            focus={focus}
            run={run}
            skip={skip}
            animate={!reduced}
            onSettled={() => setFlying(false)}
          />
        </Suspense>
        <OrbitControls
          makeDefault
          enabled={!flying}
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={0.06}
          autoRotate={!flying && !reduced}
          autoRotateSpeed={0.42}
          minDistance={extent * 1.1}
          maxDistance={extent * 2.6}
          minPolarAngle={Math.PI * 0.24}
          maxPolarAngle={Math.PI * 0.487}
        />
        <PostFX />
      </Canvas>

      <div className="absolute bottom-4 right-5 flex items-center gap-2">
        {/* Land it in daylight, at sunset or after dark. The runway lighting only
            earns its keep on the last two, which is the point of having them. */}
        <div className="flex overflow-hidden rounded-md border border-white/15 bg-ink-950/60 backdrop-blur-sm">
          {PHASE_ORDER.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setPhase(id)}
              aria-pressed={phase === id}
              className={`px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                phase === id
                  ? "bg-sky-400/15 text-sky-200"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {PHASES[id].label}
            </button>
          ))}
        </div>

        {!reduced && (
          <button
            type="button"
            onClick={() => {
              if (flying) {
                setSkip((n) => n + 1);
              } else {
                setRun((n) => n + 1);
                setFlying(true);
              }
            }}
            className="rounded-md border border-white/15 bg-ink-950/60 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-300 backdrop-blur-sm transition-colors hover:border-sky-400/50 hover:text-sky-200"
          >
            {flying ? "Skip" : "Replay"}
          </button>
        )}
      </div>
    </>
  );
}
