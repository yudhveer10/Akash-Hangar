"use client";

import { useMemo } from "react";
import * as THREE from "three";
import {
  APRON_CENTRE_X,
  HEIGHT,
  RUNWAY,
  RUNWAY_END,
  RUNWAY_HALF,
  RUNWAY_START,
  TAXIWAY,
  TAXIWAY_FROM,
} from "./layout";
import type { ScenePreset } from "./scene";
import { pavementMaps, runwayTexture } from "./textures";

/**
 * The runway, the pavement around it, and the lights.
 *
 * Every surface here is at its own height (see `HEIGHT` in layout.ts) and no two
 * overlap. That is not tidiness: coplanar ground tears into moving stripes at this
 * scale. The runway's markings live in its texture rather than on top of it, for the
 * same reason.
 */

const LENGTH = RUNWAY_END - RUNWAY_START;
const CENTRE_Z = (RUNWAY_START + RUNWAY_END) / 2;

/** A slab of pavement lying in the XZ plane: `width` across X, `length` along Z. */
function Pavement({
  width,
  length,
  centre,
  y,
  colour,
  map,
}: {
  width: number;
  length: number;
  centre: [number, number];
  y: number;
  colour: string;
  map?: THREE.Texture | null;
}) {
  const maps = pavementMaps(width, length);
  const normalScale = useMemo(() => new THREE.Vector2(0.7, 0.7), []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[centre[0], y, centre[1]]} receiveShadow>
      <planeGeometry args={[width, length]} />
      <meshStandardMaterial
        color={colour}
        map={map ?? null}
        roughness={0.94}
        metalness={0.02}
        normalMap={maps?.normalMap ?? null}
        normalScale={normalScale}
        roughnessMap={maps?.roughnessMap ?? null}
      />
    </mesh>
  );
}

/**
 * Edge and threshold lights, as lenses on short stems. Built once as finished
 * instanced meshes: there are a few dozen of them, they never move, and assembling
 * them up front keeps the whole set to two draw calls.
 */
function lampMesh(
  positions: [number, number][],
  colour: string,
  emissive: string,
  size: number,
  intensity: number,
): THREE.InstancedMesh {
  const geometry = new THREE.BoxGeometry(size, size * 1.3, size);
  const material = new THREE.MeshStandardMaterial({
    color: colour,
    emissive,
    // Past 1 this clears the bloom threshold and the lamp starts to burn.
    emissiveIntensity: intensity,
    toneMapped: intensity <= 1,
    roughness: 0.3,
  });
  const mesh = new THREE.InstancedMesh(geometry, material, positions.length);
  const matrix = new THREE.Matrix4();
  positions.forEach(([x, z], i) => {
    // Set low enough that the base is buried in the pavement rather than hovering
    // over it, which at this distance would read as a floating speck.
    matrix.makeTranslation(x, 0.16, z);
    mesh.setMatrixAt(i, matrix);
  });
  mesh.computeBoundingSphere();
  return mesh;
}

function Lights({ intensity, reach }: { intensity: number; reach: number }) {
  const lamps = useMemo(() => {
    // In daylight the far lamps are smaller than a pixel and sub-pixel specks
    // sparkle as the camera moves, so the line is kept short. After dark they are
    // the whole picture, and bloom smears them into something worth seeing.
    const edge: [number, number][] = [];
    for (let z = RUNWAY.threshold; z < RUNWAY.threshold + reach; z += 60) {
      edge.push([RUNWAY_HALF + 2.5, z], [-(RUNWAY_HALF + 2.5), z]);
    }

    const threshold: [number, number][] = [];
    for (let x = -RUNWAY_HALF + 2; x <= RUNWAY_HALF - 2; x += 3.6) {
      threshold.push([x, RUNWAY.threshold - 2.5]);
    }

    // Approach lighting on the extended centreline, out over the overrun.
    const approach: [number, number][] = [];
    for (let z = RUNWAY.threshold - 30; z > RUNWAY_START - 120; z -= 30) {
      approach.push([0, z], [-4.5, z], [4.5, z]);
    }

    return {
      edge: lampMesh(edge, "#e8eef6", "#dceaff", 0.34, intensity),
      threshold: lampMesh(threshold, "#2fd07a", "#37e78a", 0.3, intensity * 1.15),
      approach: lampMesh(approach, "#fff6e2", "#fff1d0", 0.3, intensity * 1.1),
    };
  }, [intensity, reach]);

  return (
    <>
      <primitive object={lamps.edge} />
      <primitive object={lamps.threshold} />
      <primitive object={lamps.approach} />
    </>
  );
}

export function Runway({ preset }: { preset: ScenePreset }) {
  const surface = runwayTexture();

  // Taxiway and apron start outside the shoulders rather than under them.
  const taxiFrom = TAXIWAY_FROM;
  const apronX = APRON_CENTRE_X;

  return (
    <group>
      {/* Shoulders, as a strip either side. They do not run under the runway. */}
      {[-1, 1].map((side) => (
        <Pavement
          key={side}
          width={RUNWAY.shoulder}
          length={LENGTH}
          centre={[side * (RUNWAY_HALF + RUNWAY.shoulder / 2), CENTRE_Z]}
          y={HEIGHT.shoulder}
          colour={preset.shoulder}
        />
      ))}

      <Pavement
        width={RUNWAY.width}
        length={LENGTH}
        centre={[0, CENTRE_Z]}
        y={HEIGHT.runway}
        colour={preset.pavementTint}
        map={surface}
      />

      <Pavement
        width={TAXIWAY.reach}
        length={TAXIWAY.width}
        centre={[taxiFrom + TAXIWAY.reach / 2, TAXIWAY.z]}
        y={HEIGHT.taxiway}
        colour={preset.shoulder}
      />
      <Pavement
        width={TAXIWAY.apron.width}
        length={TAXIWAY.apron.depth}
        centre={[apronX, TAXIWAY.z]}
        y={HEIGHT.taxiway}
        colour={preset.shoulder}
      />

      {/* Taxiway centreline. Short, close to the camera and clear of the runway, so a
          painted quad is safe here where it would not be out on the runway. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[taxiFrom + TAXIWAY.reach / 2, HEIGHT.taxiLine, TAXIWAY.z]}
      >
        <planeGeometry args={[TAXIWAY.reach, 0.9]} />
        <meshStandardMaterial
          color="#c9a63a"
          roughness={0.88}
          metalness={0}
          polygonOffset
          polygonOffsetFactor={-2}
          polygonOffsetUnits={-4}
        />
      </mesh>

      <Lights intensity={preset.lamps} reach={preset.lampReach} />
    </group>
  );
}
