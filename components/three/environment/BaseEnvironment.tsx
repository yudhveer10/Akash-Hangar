"use client";

import { useMemo } from "react";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import type { AirBase, PhaseId } from "@/lib/types";
import { Airfield } from "./Airfield";
import { Ground } from "./Ground";
import { Runway } from "./Runway";
import { sceneFor, type ScenePreset } from "./scene";
import { skyRotation, skyTexture, sunDirection } from "./textures";

/**
 * An aircraft standing on a runway, at a station, at a time of day.
 *
 * This replaces the studio hangar when a visitor picks a base. Nothing in here is
 * loaded: the sky is painted into a canvas, the ground is grown from noise, and the
 * runway is built from its published marking dimensions.
 *
 * The painted sky does double duty as the scene's environment map, so the aircraft's
 * metal reflects the same weather the visitor can see behind it — which is most of
 * what makes it look like it is really outside, and the reason it turns orange at
 * dusk without a single line of code about aircraft.
 */

/**
 * The sky is painted with its sun at a fixed spot on the canvas and then rotated into
 * place, which keeps the drawing free of spherical mapping maths. It is handed to
 * drei's Environment as both the backdrop and the environment map.
 */
function Sky({ preset }: { preset: ScenePreset }) {
  const texture = useMemo(
    () => skyTexture(preset.key, preset.sky, preset.seed),
    [preset],
  );
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
      environmentIntensity={preset.envIntensity}
    />
  );
}

function Daylight({ preset }: { preset: ScenePreset }) {
  const sun = useMemo(
    () => sunDirection(preset.sun.azimuth, preset.sun.elevation).multiplyScalar(170),
    [preset],
  );
  // Light bounced back off the ground, from roughly the opposite quarter.
  const bounce = useMemo(() => new THREE.Vector3(-sun.x * 0.5, 30, -sun.z * 0.5), [sun]);

  // A low sun throws a long shadow — near sixty metres at dusk — and a fixed shadow
  // camera simply cuts it off partway down the runway. Widen it as the sun drops,
  // trading a little shadow resolution for a shadow that ends where it should.
  const extent = useMemo(() => {
    const radians = (preset.sun.elevation * Math.PI) / 180;
    return Math.min(110, Math.max(42, 30 / Math.tan(radians)));
  }, [preset]);

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
        shadow-camera-left={-extent}
        shadow-camera-right={extent}
        shadow-camera-top={extent}
        shadow-camera-bottom={-extent}
        shadow-camera-near={30}
        shadow-camera-far={330}
      />
      <directionalLight
        position={[bounce.x, bounce.y, bounce.z]}
        intensity={0.4}
        color={preset.ambient.ground}
      />

      {/* Apron floodlighting. Once the sun is down the sky gives the aircraft almost
          nothing, and an unreadable silhouette is not a viewer. */}
      {preset.flood > 0 && (
        <>
          <directionalLight
            position={[34, 20, -26]}
            intensity={preset.flood}
            color="#ffd7a4"
          />
          <directionalLight
            position={[-30, 15, 30]}
            intensity={preset.flood * 0.5}
            color="#bcd4ff"
          />
        </>
      )}
    </>
  );
}

export function BaseEnvironment({ base, phase }: { base: AirBase; phase: PhaseId }) {
  const preset = sceneFor(base, phase);

  return (
    <>
      <Sky preset={preset} />
      <Daylight preset={preset} />
      <fogExp2 attach="fog" args={[preset.fog.colour, preset.fog.density]} />
      <Ground preset={preset} />
      <Runway preset={preset} />
      <Airfield preset={preset} />
    </>
  );
}
