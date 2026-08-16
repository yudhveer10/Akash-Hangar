"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { APRON_CENTRE_X, HEIGHT, RUNWAY, RUNWAY_HALF, TAXIWAY } from "./layout";
import { valueNoise } from "./noise";
import type { ScenePreset } from "./scene";

/**
 * Buildings and airfield furniture.
 *
 * These exist for scale: a 15 m aircraft means nothing until there is a hangar door
 * and a tower cab next to it. They are deliberately generic structures — no
 * insignia, no signage, nothing that would imply a particular station or any
 * official connection (see the branding rule in CLAUDE.md).
 */

const APRON_X = APRON_CENTRE_X;

function Hangar({
  position,
  lit,
  width = 46,
  depth = 30,
}: {
  position: [number, number, number];
  lit: number;
  width?: number;
  depth?: number;
}) {
  const wall = 8;
  return (
    <group position={position}>
      <mesh position={[0, wall / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, wall, depth]} />
        <meshStandardMaterial color="#6d7178" roughness={0.85} metalness={0.1} />
      </mesh>
      {/* Barrel roof, sitting on the walls. */}
      <mesh
        position={[0, wall, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[depth / 2, depth / 2, width, 20, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#7c828a" roughness={0.7} metalness={0.25} />
      </mesh>
      {/* Door slot in the face toward the apron, with the hangar lights behind it. */}
      <mesh position={[0, wall * 0.52, depth / 2 + 0.1]}>
        <boxGeometry args={[width * 0.68, wall * 0.9, 0.3]} />
        <meshStandardMaterial
          color="#2b3037"
          emissive="#ffd9a0"
          emissiveIntensity={lit * 0.45}
          roughness={0.9}
        />
      </mesh>
    </group>
  );
}

function ControlTower({ position, lit }: { position: [number, number, number]; lit: number }) {
  return (
    <group position={position}>
      <mesh position={[0, 11, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3.4, 4.6, 22, 12]} />
        <meshStandardMaterial color="#767b82" roughness={0.85} />
      </mesh>
      {/* Glazed cab, canted out over the field the way they always are. Lit from
          inside once the sun is down — a tower cab is never dark. */}
      <mesh position={[0, 24, 0]} castShadow>
        <cylinderGeometry args={[7.4, 5.6, 4.4, 12]} />
        <meshStandardMaterial
          color="#1b2733"
          emissive="#7fd4b0"
          emissiveIntensity={lit * 0.5}
          roughness={0.16}
          metalness={0.65}
          envMapIntensity={1.4}
        />
      </mesh>
      <mesh position={[0, 26.6, 0]} castShadow>
        <cylinderGeometry args={[8.2, 8.2, 0.8, 12]} />
        <meshStandardMaterial color="#5f646b" roughness={0.8} />
      </mesh>
      {/* Mast. */}
      <mesh position={[0, 31, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 8, 6]} />
        <meshStandardMaterial color="#9aa1a8" roughness={0.5} metalness={0.6} />
      </mesh>
    </group>
  );
}

/** Pole, cone, and the small platform they stand on. */
function Windsock({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 4, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 8, 6]} />
        <meshStandardMaterial color="#c8ccd0" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, 7.6, -1.9]} rotation={[Math.PI / 2.3, 0, 0]} castShadow>
        <coneGeometry args={[0.75, 3.6, 10, 1, true]} />
        <meshStandardMaterial color="#e2622c" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/**
 * The city beyond the boundary, for a field that has one.
 *
 * Blocks of flats and offices in a broad arc well clear of the approach, generic in
 * exactly the way the airfield's own buildings are. At night their windows carry most
 * of the light in the scene, which is what an urban field actually looks like from
 * the ground: a dark apron under an orange sky.
 */
function City({ lit }: { lit: number }) {
  const mesh = useMemo(() => {
    const blocks: { x: number; z: number; w: number; d: number; h: number }[] = [];

    for (let i = 0; i < 460; i++) {
      const angle = valueNoise(i * 1.31, 0.5, 613) * Math.PI * 2;
      const distance = 900 + Math.pow(valueNoise(0.5, i * 1.17, 941), 0.7) * 1500;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance * 1.35;

      // Nothing is built across the approach or the departure end.
      if (Math.abs(x) < 620 && z > -1400 && z < 2900) continue;

      const w = 16 + valueNoise(i * 2.7, 1.5, 271) * 34;
      blocks.push({
        x,
        z,
        w,
        d: w * (0.6 + valueNoise(i * 0.7, 3.3, 337) * 0.9),
        h: 10 + Math.pow(valueNoise(i * 1.9, 7.1, 457), 2.2) * 62,
      });
    }

    const instances = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({
        color: "#5d6068",
        emissive: "#ffb861",
        emissiveIntensity: lit * 0.5,
        roughness: 0.9,
      }),
      blocks.length,
    );

    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const size = new THREE.Vector3();
    blocks.forEach((b, i) => {
      position.set(b.x, b.h / 2, b.z);
      size.set(b.w, b.h, b.d);
      instances.setMatrixAt(i, matrix.compose(position, quaternion, size));
    });
    instances.computeBoundingSphere();
    return instances;
  }, [lit]);

  return <primitive object={mesh} />;
}

export function Airfield({ preset }: { preset: ScenePreset }) {
  const minimal = preset.buildings === "minimal";
  // How hard the building lighting burns. Nothing is lit in daylight.
  const lit = Math.max(0, preset.lamps - 0.5);

  // Planted at ground level rather than at the pavement's, so anything standing on
  // the apron is buried a few centimetres instead of floating above it.
  return (
    <group position={[0, HEIGHT.ground, 0]}>
      <ControlTower position={[RUNWAY_HALF + 120, 0, TAXIWAY.z + 150]} lit={lit} />
      <Hangar position={[APRON_X, 0, TAXIWAY.z - 46]} lit={lit} />
      {!minimal && <Hangar position={[APRON_X, 0, TAXIWAY.z + 30]} lit={lit} />}
      {!minimal && (
        <Hangar position={[APRON_X + 74, 0, TAXIWAY.z - 8]} lit={lit} width={34} depth={26} />
      )}
      <Windsock position={[RUNWAY_HALF + 34, 0, RUNWAY.threshold + 120]} />
      {preset.buildings === "urban" && <City lit={lit} />}
    </group>
  );
}
