"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds, OrbitControls } from "@react-three/drei";
import type { FixedWingConfig, RotorcraftConfig } from "@/lib/types";
import { FixedWing } from "./geometry/FixedWing";
import { Rotorcraft } from "./geometry/Rotorcraft";
import * as THREE from "three";
import { GroundShadow, Grounded, HangarFloor, HangarLighting, PostFX } from "./Scene";
import { IDLE } from "./geometry/animation";

/**
 * Chrome-free turntable for the home page. Visitors can still drag to look around,
 * but zoom and pan are locked so the hero cannot be knocked out of frame.
 */
export function HeroViewer({
  geometry,
  extent,
}: {
  geometry: FixedWingConfig | RotorcraftConfig;
  extent: number;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{
        antialias: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      camera={{ fov: 32, near: 0.1, far: 600 }}
      fallback={null}
    >
      <HangarLighting />
      <Suspense fallback={null}>
        <Bounds fit clip observe margin={1.35}>
          <Grounded>
            {geometry.kind === "fixedWing" ? (
              <FixedWing config={geometry} animation={IDLE} />
            ) : (
              <Rotorcraft config={geometry} animation={IDLE} />
            )}
          </Grounded>
        </Bounds>
      </Suspense>
      <HangarFloor radius={extent / 2} />
      <GroundShadow radius={extent / 2} />
      <PostFX />
      <OrbitControls
        makeDefault
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        autoRotate
        autoRotateSpeed={0.5}
        minPolarAngle={Math.PI * 0.28}
        maxPolarAngle={Math.PI * 0.49}
      />
    </Canvas>
  );
}
