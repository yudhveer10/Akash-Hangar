"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CanopyConfig, StoreConfig, SurfaceConfig } from "@/lib/types";
import { DEG, planformAt } from "./loft";

/**
 * The small hardware that makes an airframe read as a machine rather than a shape:
 * nozzle petals, cockpit tubs, canopy bows, pylons and stores, probes, fan faces and
 * navigation lights. All original geometry, all built from primitives.
 */

/* ------------------------------------------------------------------ */
/* Shared materials                                                    */
/* ------------------------------------------------------------------ */

function DarkComposite({ rough = 0.72 }: { rough?: number }) {
  return <meshStandardMaterial color="#1b1e24" metalness={0.25} roughness={rough} />;
}

function Titanium({ rough = 0.34 }: { rough?: number }) {
  return <meshStandardMaterial color="#9aa2ac" metalness={0.98} roughness={rough} />;
}

function Scorched() {
  return <meshStandardMaterial color="#4a453f" metalness={0.85} roughness={0.55} />;
}

/* ------------------------------------------------------------------ */
/* Exhaust nozzle                                                      */
/* ------------------------------------------------------------------ */

/**
 * Convergent-divergent nozzle petals. On a fighter these are the single most
 * recognisable piece of detail at the back of the aircraft.
 */
export function Nozzle({
  radius,
  z,
  petals = 16,
}: {
  radius: number;
  z: number;
  petals?: number;
}) {
  const petal = useMemo(() => {
    // A tapered plate, narrow at the exit end.
    const shape = new THREE.BufferGeometry();
    const w0 = (Math.PI * 2 * radius) / petals / 2;
    const w1 = w0 * 0.62;
    const len = radius * 1.15;
    const verts = new Float32Array([
      -w0, 0, 0, w0, 0, 0, w1, 0, -len,
      -w0, 0, 0, w1, 0, -len, -w1, 0, -len,
    ]);
    shape.setAttribute("position", new THREE.BufferAttribute(verts, 3));
    shape.computeVertexNormals();
    return shape;
  }, [radius, petals]);

  return (
    <group position={[0, 0, z]}>
      {Array.from({ length: petals }, (_, i) => {
        const angle = (i / petals) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, 0, angle]}>
            {/* Push out to the nozzle radius, then cant inward toward the exit. */}
            <group position={[0, radius * 0.94, 0]} rotation={[-9 * DEG, 0, 0]}>
              <mesh geometry={petal} castShadow>
                <Scorched />
              </mesh>
            </group>
          </group>
        );
      })}
      {/* Dark interior so the nozzle reads as a hole, not a disc. */}
      <mesh position={[0, 0, -radius * 0.6]}>
        <cylinderGeometry args={[radius * 0.8, radius * 0.62, radius * 1.3, 20, 1, true]} />
        <meshStandardMaterial
          color="#0d0e11"
          metalness={0.6}
          roughness={0.5}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Cockpit                                                             */
/* ------------------------------------------------------------------ */

function EjectionSeat({ scale = 1 }: { scale?: number }) {
  return (
    <group scale={scale}>
      {/* Seat pan. */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.44, 0.1, 0.46]} />
        <DarkComposite />
      </mesh>
      {/* Back, raked aft. */}
      <mesh position={[0, 0.32, -0.24]} rotation={[0.22, 0, 0]} castShadow>
        <boxGeometry args={[0.44, 0.66, 0.12]} />
        <DarkComposite />
      </mesh>
      {/* Head box. */}
      <mesh position={[0, 0.68, -0.32]} castShadow>
        <boxGeometry args={[0.34, 0.26, 0.2]} />
        <meshStandardMaterial color="#2a2d34" metalness={0.3} roughness={0.6} />
      </mesh>
    </group>
  );
}

/** Tub, seats, coaming and head-up display under the canopy glass. */
export function Cockpit({ config }: { config: CanopyConfig }) {
  const seats = config.seats ?? 1;
  const halfWidth = config.width / 2;

  if (config.flightDeck) {
    // Transports get a lit flight deck rather than modelled ejection seats.
    return (
      <group position={[0, config.y - config.height * 0.55, config.z]}>
        <mesh>
          <boxGeometry args={[halfWidth * 1.7, config.height * 0.7, config.length * 0.8]} />
          <meshStandardMaterial color="#20242b" metalness={0.2} roughness={0.8} />
        </mesh>
      </group>
    );
  }

  const seatScale = Math.min(1, halfWidth / 0.42);

  return (
    <group position={[0, config.y - config.height * 0.72, config.z]}>
      {/* Tub floor and sidewalls, so you do not see straight through the glass. */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[halfWidth * 1.55, config.height * 0.9, config.length * 0.92]} />
        <meshStandardMaterial color="#161a20" metalness={0.2} roughness={0.85} />
      </mesh>

      {Array.from({ length: seats }, (_, i) => {
        const spacing = config.length * 0.34;
        const z = seats === 1 ? -config.length * 0.04 : (0.5 - i) * spacing * 1.5;
        return (
          <group key={i} position={[0, config.height * 0.42, z]}>
            <EjectionSeat scale={seatScale} />
            {/* Instrument coaming ahead of each seat. */}
            <mesh position={[0, 0.16 * seatScale, 0.5 * seatScale]} castShadow>
              <boxGeometry
                args={[halfWidth * 1.3, 0.24 * seatScale, 0.28 * seatScale]}
              />
              <DarkComposite rough={0.85} />
            </mesh>
            {/* HUD combiner glass. */}
            <mesh position={[0, 0.42 * seatScale, 0.52 * seatScale]} rotation={[0.18, 0, 0]}>
              <planeGeometry args={[0.26 * seatScale, 0.22 * seatScale]} />
              <meshStandardMaterial
                color="#7fe3b0"
                transparent
                opacity={0.3}
                emissive="#3ad48a"
                emissiveIntensity={0.5}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** Windscreen bow and canopy rails. */
export function CanopyFrame({ config }: { config: CanopyConfig }) {
  const seats = config.seats ?? 1;
  const radius = config.width / 2;
  const squash = config.height / radius;

  // Front bow, an optional centre arch between tandem seats, and the rear rail.
  const positions = [config.z + config.length * 0.46];
  if (seats > 1) positions.push(config.z - config.length * 0.02);
  positions.push(config.z - config.length * 0.46);

  return (
    <>
      {positions.map((z, i) => (
        <group key={i} position={[0, config.y, z]} scale={[1, squash, 1]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[radius * 1.01, radius * 0.045, 8, 24, Math.PI]} />
            <meshStandardMaterial color="#2b3038" metalness={0.6} roughness={0.45} />
          </mesh>
        </group>
      ))}
      {/* Longitudinal rails along the sill on each side. */}
      {[1, -1].map((side) => (
        <mesh
          key={side}
          position={[side * radius * 0.99, config.y, config.z]}
          castShadow
        >
          <boxGeometry args={[radius * 0.08, radius * 0.09, config.length * 0.95]} />
          <meshStandardMaterial color="#2b3038" metalness={0.6} roughness={0.45} />
        </mesh>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Pylons and stores                                                   */
/* ------------------------------------------------------------------ */

function Missile({ length }: { length: number }) {
  const r = length * 0.036;
  const finSpan = r * 3.4;
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[r, r, length * 0.86, 14]} />
        <meshStandardMaterial color="#c8ccd2" metalness={0.35} roughness={0.5} />
      </mesh>
      {/* Ogive seeker head. */}
      <mesh position={[0, 0, length * 0.5]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[r, length * 0.16, 14]} />
        <meshStandardMaterial color="#3a3f47" metalness={0.5} roughness={0.35} />
      </mesh>
      {/* Forward canards and tail fins, offset a quarter turn from each other. */}
      {[
        { z: length * 0.24, roll: 0 },
        { z: -length * 0.36, roll: Math.PI / 4 },
      ].map((set, si) =>
        Array.from({ length: 4 }, (_, i) => (
          <mesh
            key={`${si}-${i}`}
            position={[0, 0, set.z]}
            rotation={[0, 0, set.roll + (i * Math.PI) / 2]}
            castShadow
          >
            <boxGeometry args={[finSpan, r * 0.16, length * 0.12]} />
            <meshStandardMaterial color="#b9bec6" metalness={0.3} roughness={0.55} />
          </mesh>
        )),
      )}
    </group>
  );
}

function FuelTank({ length }: { length: number }) {
  const r = length * 0.11;
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <capsuleGeometry args={[r, length * 0.72, 6, 16]} />
        <meshStandardMaterial color="#7f8792" metalness={0.5} roughness={0.45} />
      </mesh>
      {Array.from({ length: 3 }, (_, i) => (
        <mesh
          key={i}
          position={[0, 0, -length * 0.38]}
          rotation={[0, 0, (i * Math.PI * 2) / 3]}
          castShadow
        >
          <boxGeometry args={[r * 2.1, r * 0.14, length * 0.16]} />
          <meshStandardMaterial color="#7f8792" metalness={0.4} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Bomb({ length }: { length: number }) {
  const r = length * 0.09;
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <capsuleGeometry args={[r, length * 0.6, 6, 14]} />
        <meshStandardMaterial color="#5b6350" metalness={0.3} roughness={0.62} />
      </mesh>
      {Array.from({ length: 4 }, (_, i) => (
        <mesh
          key={i}
          position={[0, 0, -length * 0.4]}
          rotation={[0, 0, (i * Math.PI) / 2 + Math.PI / 4]}
          castShadow
        >
          <boxGeometry args={[r * 2.6, r * 0.16, length * 0.2]} />
          <meshStandardMaterial color="#4f5648" metalness={0.25} roughness={0.68} />
        </mesh>
      ))}
    </group>
  );
}

const STORE_LENGTH: Record<StoreConfig["kind"], number> = {
  missile: 3.2,
  tank: 4.6,
  bomb: 2.6,
  rail: 2.4,
};

/** A pylon and whatever hangs off it, mirrored to both wings. */
export function Stores({
  wing,
  stores,
  colour,
}: {
  wing: SurfaceConfig;
  stores: StoreConfig[];
  colour: string;
}) {
  return (
    <>
      {stores.flatMap((store) =>
        [1, -1].map((side) => {
          const plan = planformAt(wing, store.frac);
          const x = wing.root[0] + side * store.frac * wing.span;
          const length = store.length ?? STORE_LENGTH[store.kind];
          // Hang from about a third back along the local chord.
          const z = plan.zLE - plan.chord * 0.35;
          const pylonDrop = store.tip ? 0 : Math.max(0.34, plan.chord * 0.1);

          return (
            <group key={`${store.frac}-${store.kind}-${side}`} position={[x, plan.y, z]}>
              {!store.tip && (
                <mesh position={[0, -pylonDrop / 2, 0]} castShadow>
                  <boxGeometry args={[0.11, pylonDrop, plan.chord * 0.42]} />
                  <meshStandardMaterial color={colour} metalness={0.5} roughness={0.5} />
                </mesh>
              )}
              <group position={[0, store.tip ? 0 : -pylonDrop - length * 0.045, 0]}>
                {store.kind === "missile" && <Missile length={length} />}
                {store.kind === "rail" && <Missile length={length} />}
                {store.kind === "tank" && <FuelTank length={length} />}
                {store.kind === "bomb" && <Bomb length={length} />}
              </group>
            </group>
          );
        }),
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Probes and booms                                                    */
/* ------------------------------------------------------------------ */

export function Probe({
  position,
  length,
}: {
  position: [number, number, number];
  length: number;
}) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, length * 0.45]} castShadow>
        <cylinderGeometry args={[length * 0.035, length * 0.05, length * 0.9, 10]} />
        <Titanium rough={0.4} />
      </mesh>
      {/* Basket-catching nozzle at the tip. */}
      <mesh position={[0, 0, length * 0.93]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[length * 0.065, length * 0.04, length * 0.14, 10]} />
        <DarkComposite rough={0.5} />
      </mesh>
    </group>
  );
}

/** Pitot boom projecting straight forward from the radome. */
export function NoseBoom({ z, length }: { z: number; length: number }) {
  return (
    <group position={[0, 0, z]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, length / 2]}>
        <cylinderGeometry args={[length * 0.018, length * 0.032, length, 8]} />
        <Titanium rough={0.45} />
      </mesh>
      {/* Angle-of-attack vanes near the base. */}
      {[1, -1].map((side) => (
        <mesh key={side} position={[side * length * 0.05, 0, length * 0.3]} castShadow>
          <boxGeometry args={[length * 0.09, length * 0.02, length * 0.12]} />
          <Titanium rough={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Intake fan                                                          */
/* ------------------------------------------------------------------ */

/** Visible fan face for podded engines, where you really can see straight in. */
export function FanFace({
  radius,
  z,
  blades = 22,
  spin,
}: {
  radius: number;
  z: number;
  blades?: number;
  spin: number;
}) {
  const disc = useRef<THREE.Group>(null);
  const rate = useRef(0);

  useFrame((_, dt) => {
    rate.current = THREE.MathUtils.damp(rate.current, spin, 1.5, dt);
    if (disc.current) disc.current.rotation.z += rate.current * 9 * dt;
  });

  return (
    <group position={[0, 0, z]}>
      {/* Dark duct behind the fan. */}
      <mesh position={[0, 0, -radius * 0.5]}>
        <cylinderGeometry args={[radius * 0.94, radius * 0.94, radius, 24, 1, true]} />
        <meshStandardMaterial color="#0b0d10" metalness={0.4} roughness={0.7} side={THREE.BackSide} />
      </mesh>
      <group ref={disc}>
        {Array.from({ length: blades }, (_, i) => (
          <group key={i} rotation={[0, 0, (i / blades) * Math.PI * 2]}>
            <mesh position={[0, radius * 0.5, 0]} rotation={[0.55, 0, 0]}>
              <boxGeometry args={[radius * 0.1, radius * 0.86, radius * 0.03]} />
              <meshStandardMaterial color="#8f959d" metalness={0.95} roughness={0.28} />
            </mesh>
          </group>
        ))}
        {/* Spinner. */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, radius * 0.12]}>
          <coneGeometry args={[radius * 0.17, radius * 0.42, 14]} />
          <meshStandardMaterial color="#3d434b" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Lights                                                              */
/* ------------------------------------------------------------------ */

/** Emissive navigation light. Reads as a glow once bloom is applied. */
export function NavLight({
  position,
  colour,
}: {
  position: [number, number, number];
  colour: string;
}) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.1, 10, 8]} />
      <meshStandardMaterial
        color={colour}
        emissive={colour}
        emissiveIntensity={3.2}
        toneMapped={false}
      />
    </mesh>
  );
}

/** Port red, starboard green, tail white — the standard arrangement. */
export function NavLights({ wing, tailZ, tailY }: { wing: SurfaceConfig; tailZ: number; tailY: number }) {
  const tip = planformAt(wing, 0.99);
  return (
    <>
      <NavLight position={[wing.span, tip.y, tip.zLE - tip.chord * 0.5]} colour="#25e06a" />
      <NavLight position={[-wing.span, tip.y, tip.zLE - tip.chord * 0.5]} colour="#ff2d3d" />
      <NavLight position={[0, tailY, tailZ]} colour="#ffffff" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Rotor head                                                          */
/* ------------------------------------------------------------------ */

/** Blade grips, swashplate and pitch links on a helicopter rotor head. */
export function RotorHead({ radius, blades }: { radius: number; blades: number }) {
  const gripLength = radius * 0.13;
  return (
    <group>
      {/* Swashplate. */}
      <mesh position={[0, -radius * 0.05, 0]} castShadow>
        <cylinderGeometry args={[radius * 0.1, radius * 0.1, radius * 0.018, 18]} />
        <Titanium rough={0.4} />
      </mesh>
      {Array.from({ length: blades }, (_, i) => {
        const angle = (i / blades) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, angle, 0]}>
            {/* Grip out to the blade root. */}
            <mesh position={[gripLength * 0.7, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[radius * 0.022, radius * 0.026, gripLength, 10]} />
              <Titanium rough={0.35} />
            </mesh>
            {/* Pitch link down to the swashplate. */}
            <mesh
              position={[gripLength * 0.55, -radius * 0.035, radius * 0.03]}
              castShadow
            >
              <cylinderGeometry args={[radius * 0.007, radius * 0.007, radius * 0.07, 6]} />
              <Titanium rough={0.4} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
