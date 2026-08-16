"use client";

import { useMemo } from "react";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import type { TerrainId } from "@/lib/types";
import { Airfield } from "./Airfield";
import { Ground } from "./Ground";
import { PRESETS, type ScenePreset } from "./presets";
import { Runway } from "./Runway";
import { skyRotation, skyTexture, sunDirection } from "./textures";

/**
 * An aircraft standing on a runway, in the country its station sits in.
 *
 * This replaces the studio hangar when a visitor picks a base. Nothing in here is
 * loaded: the sky is painted into a canvas, the ground is grown from noise, and the
 * runway is built from its published marking dimensions.
 *
 * The painted sky does double duty as the scene's environment map, so the aircraft's
 * metal reflects the same weather the visitor can see behind it — which is most of
 * what makes it look like it is really outside.
 */

/**
 * The sky is painted with its sun at a fixed spot on the canvas and then rotated into
 * place, which keeps the drawing free of spherical mapping maths. It is handed to
 * drei's Environment as both the backdrop and the environment map, so reflections
 * agree with what is behind the aircraft.
 */
function Sky({ id, preset }: { id: TerrainId; preset: ScenePreset }) {
  const texture = useMemo(() => skyTexture(id, preset.sky), [id, preset]);
  const rotation = useMemo(
    () => new THREE.Euler(0, skyRotation(preset.sky.sun.azimuth), 0),
    [preset],
  );

  if (!texture) return null;

  return (
    <Environment
      map={texture}
      background
      backgroundRotation={rotation}
      environmentRotation={rotation}
    />
  );
}

function Daylight({ preset }: { preset: ScenePreset }) {
  const sun = useMemo(
    () => sunDirection(preset.sun.azimuth, preset.sun.elevation).multiplyScalar(170),
    [preset],
  );
  // Light bounced back off the ground, from roughly the opposite quarter.
  const bounce = useMemo(
    () => new THREE.Vector3(-sun.x * 0.5, 30, -sun.z * 0.5),
    [sun],
  );

  return (
    <>
      <hemisphereLight
        args={[preset.ambient.sky, preset.ambient.ground, preset.ambient.intensity]}
      />
      <directionalLight
        position={[sun.x, sun.y, sun.z]}
        intensity={preset.sun.intensity}
        color={preset.sun.colour}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
        shadow-normalBias={0.03}
        shadow-camera-left={-42}
        shadow-camera-right={42}
        shadow-camera-top={42}
        shadow-camera-bottom={-42}
        shadow-camera-near={40}
        shadow-camera-far={320}
      />
      <directionalLight
        position={[bounce.x, bounce.y, bounce.z]}
        intensity={0.4}
        color={preset.ambient.ground}
      />
    </>
  );
}

export function BaseEnvironment({ terrain }: { terrain: TerrainId }) {
  const preset = PRESETS[terrain];

  return (
    <>
      <Sky id={terrain} preset={preset} />
      <Daylight preset={preset} />
      <fogExp2 attach="fog" args={[preset.fog.colour, preset.fog.density]} />
      <Ground id={terrain} preset={preset} />
      <Runway preset={preset} />
      <Airfield preset={preset} />
    </>
  );
}
