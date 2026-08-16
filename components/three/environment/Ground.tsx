"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { HEIGHT } from "./layout";
import { valueNoise } from "./noise";
import type { ScenePreset } from "./scene";
import { terrainGeometry, terrainHeight } from "./terrain";

/**
 * Everything that is not pavement: the ground itself, the sea where there is one,
 * and what grows on it.
 *
 * Terrain meshes are cached by landscape rather than rebuilt, so moving an aircraft
 * from Ambala to Leh and back costs nothing the second time.
 */

const cache = new Map<number, THREE.BufferGeometry>();

/** Keyed by the station's seed: the ground is the station's, not the landscape's. */
function groundGeometry(preset: ScenePreset): THREE.BufferGeometry {
  const hit = cache.get(preset.terrain.seed);
  if (hit) return hit;
  const geometry = terrainGeometry(preset.terrain);
  cache.set(preset.terrain.seed, geometry);
  return geometry;
}

/**
 * Trees, scrub or boulders, scattered clear of the field. Positions come from the
 * same deterministic noise as the ground, so nothing jumps between reloads, and each
 * one is dropped onto the real terrain height rather than floating at zero.
 */
function scatterGeometry(kind: ScenePreset["scatter"]["kind"]): THREE.BufferGeometry {
  if (kind === "tree") return new THREE.ConeGeometry(2.6, 9, 6);
  if (kind === "scrub") return new THREE.SphereGeometry(2.2, 6, 4);
  return new THREE.IcosahedronGeometry(2.4, 0);
}

function Scatter({ preset }: { preset: ScenePreset }) {
  const { kind, count, scale } = preset.scatter;

  const mesh = useMemo(() => {
    const out: { x: number; z: number; y: number; s: number; r: number }[] = [];
    const spec = preset.terrain;

    for (let i = 0; i < count * 5 && out.length < count; i++) {
      const x = (valueNoise(i * 1.37, 0.5, 71) - 0.5) * 2600;
      const z = (valueNoise(0.5, i * 1.13, 137) - 0.5) * 3600 + 300;

      // Well clear of the runway strip, as an obstacle-free airfield has to be, and
      // off the apron where the buildings are.
      const dz = z < spec.strip.from ? spec.strip.from - z : z > spec.strip.to ? z - spec.strip.to : 0;
      if (Math.hypot(x, dz) < spec.flatWidth * 0.85) continue;
      if (
        x > spec.pad.minX - 40 &&
        x < spec.pad.maxX + 40 &&
        z > spec.pad.minZ - 40 &&
        z < spec.pad.maxZ + 40
      ) {
        continue;
      }

      const y = terrainHeight(spec, x, z);
      if (spec.sea && y < 1) continue;

      out.push({
        x,
        z,
        y,
        s: scale * (0.6 + valueNoise(i * 2.3, 5.5, 53) * 0.9),
        r: valueNoise(i * 0.11, 9.1, 97) * Math.PI * 2,
      });
    }
    if (out.length === 0) return null;

    const instances = new THREE.InstancedMesh(
      scatterGeometry(kind),
      new THREE.MeshStandardMaterial({
        color: preset.scatter.colour,
        roughness: 0.95,
        flatShading: true,
      }),
      out.length,
    );

    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const axis = new THREE.Vector3(0, 1, 0);
    const position = new THREE.Vector3();
    const size = new THREE.Vector3();

    out.forEach((p, i) => {
      position.set(p.x, p.y, p.z);
      quaternion.setFromAxisAngle(axis, p.r);
      size.set(p.s, p.s * (kind === "tree" ? 1.15 : 0.85), p.s);
      instances.setMatrixAt(i, matrix.compose(position, quaternion, size));
    });
    instances.computeBoundingSphere();
    return instances;
  }, [preset, kind, count, scale]);

  if (!mesh) return null;
  return <primitive object={mesh} />;
}

function Sea({ preset }: { preset: ScenePreset }) {
  const sea = preset.terrain.sea;
  if (!sea) return null;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, sea.level, 0]}>
      <circleGeometry args={[preset.terrain.radius * 1.3, 96]} />
      {/* Smooth and barely rough, so it takes its colour from the sky above it —
          which means it turns with the time of day for free. */}
      <meshStandardMaterial color="#31586e" roughness={0.12} metalness={0.55} />
    </mesh>
  );
}

export function Ground({ preset }: { preset: ScenePreset }) {
  const geometry = useMemo(() => groundGeometry(preset), [preset]);

  // The whole landscape sits a hand's width below the paving. It has to: the flat
  // pad and the runway slab are both level over 2.4 km, and two surfaces at the same
  // height at that range tear into moving stripes rather than picking a winner. The
  // step also reads correctly — there is a lip at the edge of a real runway.
  return (
    <group position={[0, HEIGHT.ground, 0]}>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial vertexColors roughness={1} metalness={0} />
      </mesh>
      <Sea preset={preset} />
      <Scatter preset={preset} />
    </group>
  );
}
