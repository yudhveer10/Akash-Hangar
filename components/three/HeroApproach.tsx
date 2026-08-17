"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { GeometryConfig } from "@/lib/types";
import {
  bankAt,
  FLIGHT,
  PARK_HEIGHT,
  PARK_Z,
  pitchAt,
  shotAt,
  T_END,
  T_TOUCHDOWN,
  yAt,
  zAt,
} from "./approach";
import { IDLE } from "./geometry/animation";
import { FixedWing } from "./geometry/FixedWing";
import { Rotorcraft } from "./geometry/Rotorcraft";
import { Grounded } from "./Scene";

/**
 * Flies the home page's landing sequence.
 *
 * The path itself lives in `approach.ts` and is checked by `npm run validate`; what is
 * here is the mounting — the aircraft pitched about its main wheels rather than about
 * the model origin, the camera driven off the same clock, and the smoke the tyres
 * leave where they touched.
 */

const DEG = Math.PI / 180;
const PUFF_LIFE = 2.1;
const PUFFS_PER_WHEEL = 7;

/** Soft round blob, drawn once. No image file, like every other texture here. */
function puffTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const el = document.createElement("canvas");
  el.width = 64;
  el.height = 64;
  const ctx = el.getContext("2d");
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(226, 232, 240, 0.85)");
  gradient.addColorStop(0.45, "rgba(198, 210, 224, 0.35)");
  gradient.addColorStop(1, "rgba(198, 210, 224, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  return new THREE.CanvasTexture(el);
}

/**
 * The puff off each main wheel as it spins up.
 *
 * Emitted into world space at the touchdown point rather than parented to the
 * aircraft, so it stays where the wheels touched and the aircraft rolls away from it.
 * Ages are read straight off the sequence clock, which means a replay rewinds the
 * smoke along with everything else and no event has to be fired.
 */
function TyreSmoke({
  wheels,
  clock,
  visible,
}: {
  wheels: [number, number][];
  clock: React.RefObject<number>;
  visible: boolean;
}) {
  const texture = useMemo(() => puffTexture(), []);
  const group = useRef<THREE.Group>(null);

  const puffs = useMemo(() => {
    const out: {
      x: number;
      z: number;
      delay: number;
      size: number;
      drift: number;
      rise: number;
    }[] = [];

    // Deterministic jitter: the same landing every time, and on every machine.
    let seed = 20260817;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    for (const [wx, wz] of wheels) {
      for (let i = 0; i < PUFFS_PER_WHEEL; i++) {
        const step = i / PUFFS_PER_WHEEL;
        out.push({
          x: wx + (rand() - 0.5) * 1.1,
          // Spread along the runway: the wheels are still moving as they smoke.
          z: wz + step * 26 + rand() * 3,
          delay: step * 0.34,
          size: 2.6 + rand() * 2.8,
          drift: (rand() - 0.5) * 1.6,
          rise: 0.8 + rand() * 1.2,
        });
      }
    }
    return out;
  }, [wheels]);

  useFrame(() => {
    if (!group.current) return;
    const t = clock.current;

    group.current.children.forEach((child, i) => {
      const puff = puffs[i];
      const sprite = child as THREE.Sprite;
      const age = t - (T_TOUCHDOWN + puff.delay);

      if (!visible || age < 0 || age > PUFF_LIFE) {
        sprite.visible = false;
        return;
      }

      const life = age / PUFF_LIFE;
      sprite.visible = true;
      sprite.scale.setScalar(0.5 + puff.size * (1 - (1 - life) ** 2));
      sprite.position.set(
        puff.x + puff.drift * life * 3,
        0.25 + puff.rise * life * 2.4,
        FLIGHT.touchdownZ + puff.z + life * 5,
      );
      (sprite.material as THREE.SpriteMaterial).opacity = 0.5 * (1 - life) ** 1.5;
    });
  });

  if (!texture) return null;

  return (
    <group ref={group}>
      {puffs.map((puff, i) => (
        <sprite key={i} visible={false}>
          <spriteMaterial
            map={texture}
            transparent
            depthWrite={false}
            opacity={0}
            color="#c9d6e4"
          />
        </sprite>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */

interface OrbitLike {
  target: THREE.Vector3;
  update: () => void;
}

export function HeroApproach({
  geometry,
  extent,
  focus,
  run,
  skip,
  animate,
  onSettled,
}: {
  geometry: GeometryConfig;
  extent: number;
  /** Shared with the environment, so the sun's shadow follows the aircraft. */
  focus: React.RefObject<THREE.Vector3 | null>;
  /** Bumping this restarts the sequence. */
  run: number;
  /** Bumping this cuts to the parked aircraft without waiting the sequence out. */
  skip: number;
  /** False parks the aircraft immediately — what a reduced-motion visitor gets. */
  animate: boolean;
  onSettled: () => void;
}) {
  const craft = useRef<THREE.Group>(null);
  const pivot = useRef<THREE.Group>(null);
  const clock = useRef(animate ? 0 : T_END);
  const settled = useRef(false);
  const snap = useRef(true);
  const hold = useRef(0);

  const controls = useThree((state) => state.controls) as OrbitLike | null;
  const scale = extent / 22;

  const vectors = useMemo(
    () => ({
      offset: new THREE.Vector3(),
      look: new THREE.Vector3(),
      /** Damped, so shot changes ease instead of stepping. */
      heldOffset: new THREE.Vector3(),
      heldLook: new THREE.Vector3(),
      position: new THREE.Vector3(),
      aim: new THREE.Vector3(),
      here: new THREE.Vector3(),
    }),
    [],
  );

  // Main gear contact points, used both to pitch the aircraft about its wheels rather
  // than about the model's origin, and to put the smoke where the tyres actually are.
  const wheels = useMemo<[number, number][]>(() => {
    if (geometry.kind === "fixedWing") {
      return geometry.gear.main.map((leg) => [leg.position[0], leg.position[2]]);
    }
    if (geometry.gear.type === "wheels") {
      return geometry.gear.main.map((leg) => [leg.position[0], leg.position[2]]);
    }
    return [];
  }, [geometry]);

  const pitchPivotZ = wheels.length
    ? wheels.reduce((sum, [, z]) => sum + z, 0) / wheels.length
    : 0;

  useEffect(() => {
    clock.current = animate ? 0 : T_END;
    settled.current = false;
    snap.current = true;
    hold.current = 0;
  }, [run, animate]);

  useEffect(() => {
    // Skipping leaves `snap` alone, so the camera flies to the parked pose rather
    // than cutting to it.
    if (skip > 0) clock.current = T_END;
  }, [skip]);

  useFrame((state, delta) => {
    if (!craft.current || !pivot.current) return;

    // A backgrounded tab hands back one enormous delta; stepping the sequence by it
    // would teleport the aircraft down the runway.
    const step = Math.min(delta, 0.05);
    clock.current = Math.min(clock.current + step, T_END);
    const t = clock.current;

    const z = zAt(t);
    const y = yAt(z);

    craft.current.position.set(0, y, z);
    pivot.current.rotation.x = -pitchAt(t, z) * DEG;
    pivot.current.rotation.z = bankAt(t) * DEG;
    focus.current?.set(0, 0, z);

    if (settled.current) return;

    vectors.here.set(0, y, z);
    shotAt(t, vectors.offset, vectors.look);
    vectors.offset.multiplyScalar(scale);
    vectors.look.multiplyScalar(scale);

    // The offset is damped rather than the world position: damping the position would
    // leave the camera permanently trailing an aircraft flying at a steady 72 m/s,
    // where what wants softening is only the change from one shot to the next.
    if (snap.current) {
      vectors.heldOffset.copy(vectors.offset);
      vectors.heldLook.copy(vectors.look);
      snap.current = false;
    } else {
      const k = 1 - Math.exp(-step * 4.5);
      vectors.heldOffset.lerp(vectors.offset, k);
      vectors.heldLook.lerp(vectors.look, k);
    }

    vectors.position.copy(vectors.here).add(vectors.heldOffset);
    vectors.aim.copy(vectors.here).add(vectors.heldLook);
    state.camera.position.copy(vectors.position);
    state.camera.lookAt(vectors.aim);

    if (t >= T_END) {
      // Hand over only once the camera has arrived. Skipping mid-approach ends the
      // sequence instantly but leaves the offset hundreds of metres out, and orbit
      // controls would yank the camera into range on their first update.
      hold.current += step;
      const arrived = vectors.heldOffset.distanceTo(vectors.offset) < extent * 0.06;
      if (!arrived && hold.current < 3) return;

      settled.current = true;
      if (controls) {
        controls.target.set(0, PARK_HEIGHT * scale, PARK_Z);
        controls.update();
      }
      onSettled();
    }
  });

  return (
    <>
      <group ref={craft}>
        <group ref={pivot} position={[0, 0, pitchPivotZ]}>
          <group position={[0, 0, -pitchPivotZ]}>
            <Grounded>
              {geometry.kind === "fixedWing" ? (
                <FixedWing config={geometry} animation={IDLE} />
              ) : (
                <Rotorcraft config={geometry} animation={IDLE} />
              )}
            </Grounded>
          </group>
        </group>
      </group>

      {wheels.length > 0 && (
        <TyreSmoke wheels={wheels} clock={clock} visible={animate} />
      )}
    </>
  );
}
