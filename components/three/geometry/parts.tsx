"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type {
  CanopyConfig,
  EngineConfig,
  GearLeg,
  Livery,
  RotorConfig,
} from "@/lib/types";
import {
  applyLivery,
  bladeGeometry,
  canopyGeometry,
  DEG,
  nacelleProfile,
  slabGeometry,
  tubeGeometry,
} from "./loft";
import { tiledMaps } from "./textures";
import { CanopyFrame, FanFace, Nozzle, RotorHead } from "./details";

/* ------------------------------------------------------------------ */
/* Shared materials                                                    */
/* ------------------------------------------------------------------ */

/**
 * Painted airframe skin. The panel-line normal map and weathering roughness map are
 * generated at runtime (see textures.ts); `repeat` tiles them so panel spacing stays
 * plausible whether the part is a fin or a cargo fuselage.
 */
export function Airframe({ repeat = [6, 10] }: { repeat?: [number, number] }) {
  const maps = tiledMaps(repeat[0], repeat[1]);
  const normalScale = useMemo(() => new THREE.Vector2(0.5, 0.5), []);

  return (
    <meshStandardMaterial
      vertexColors
      metalness={0.58}
      roughness={0.44}
      envMapIntensity={1.15}
      normalMap={maps?.normalMap ?? null}
      normalScale={normalScale}
      roughnessMap={maps?.roughnessMap ?? null}
    />
  );
}

/**
 * Flat-coloured variant for parts built from primitives rather than lofts — pylons,
 * gear doors, skid struts — which carry no vertex colours of their own.
 */
export function SolidAirframe({
  color,
  dark = 0,
  repeat = [3, 4],
}: {
  color: string;
  dark?: number;
  repeat?: [number, number];
}) {
  const shade = useMemo(() => {
    const c = new THREE.Color(color);
    if (dark) c.multiplyScalar(1 - dark);
    return c;
  }, [color, dark]);

  const maps = tiledMaps(repeat[0], repeat[1]);
  const normalScale = useMemo(() => new THREE.Vector2(0.4, 0.4), []);

  return (
    <meshStandardMaterial
      color={shade}
      metalness={0.58}
      roughness={0.46}
      envMapIntensity={1.1}
      normalMap={maps?.normalMap ?? null}
      normalScale={normalScale}
      roughnessMap={maps?.roughnessMap ?? null}
    />
  );
}

function Rubber() {
  return <meshStandardMaterial color="#15171c" metalness={0.05} roughness={0.9} />;
}

function BareMetal({ rough = 0.3 }: { rough?: number }) {
  return <meshStandardMaterial color="#8d949e" metalness={0.95} roughness={rough} />;
}

/* ------------------------------------------------------------------ */
/* Canopy                                                              */
/* ------------------------------------------------------------------ */

export function Canopy({ config, open }: { config: CanopyConfig; open: number }) {
  const group = useRef<THREE.Group>(null);
  const geometry = useMemo(
    () => canopyGeometry(config.length, config.width, config.height),
    [config.length, config.width, config.height],
  );
  const value = useRef(0);

  useFrame((_, dt) => {
    if (!group.current) return;
    value.current = THREE.MathUtils.damp(value.current, open, 4, dt);
    // Hinged at the rear rail, so it lifts the windscreen end clear.
    group.current.rotation.x = -value.current * 42 * DEG;
  });

  // Frame travels with the glass; the pivot sits at the aft edge of the sill.
  const framed = { ...config, y: 0, z: 0 };

  return (
    <group position={[0, config.y, config.z + config.length / 2]}>
      <group ref={group}>
        <group position={[0, 0, -config.length / 2]}>
          <mesh geometry={geometry} castShadow>
            <meshPhysicalMaterial
              color="#9ad8ff"
              metalness={0.12}
              roughness={0.045}
              transparent
              opacity={0.3}
              clearcoat={1}
              clearcoatRoughness={0.03}
              ior={1.45}
              envMapIntensity={2.6}
              side={THREE.DoubleSide}
            />
          </mesh>
          <CanopyFrame config={framed} />
        </group>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Engines                                                             */
/* ------------------------------------------------------------------ */

export function Engine({
  config,
  livery,
  afterburner,
  rotorsOn,
}: {
  config: EngineConfig;
  livery: Livery;
  afterburner: number;
  rotorsOn: number;
}) {
  const { position, length, radius, kind } = config;

  const nacelle = useMemo(
    () =>
      applyLivery(tubeGeometry(nacelleProfile(kind, length, radius)), {
        ...livery,
        // Buried engine cans are bare metal rather than painted skin.
        upper: kind === "embedded" ? "#5c6068" : livery.upper,
        lower: kind === "embedded" ? "#4a4e55" : livery.lower,
        camo: kind === "embedded" ? undefined : livery.camo,
      }),
    [kind, length, radius, livery],
  );

  const exitZ = kind === "embedded" ? -length : length * 0.5;

  return (
    <group position={position}>
      <mesh geometry={nacelle} castShadow receiveShadow>
        <Airframe repeat={[4, 5]} />
      </mesh>

      {kind === "pod" && (
        <>
          {/* Pylon joining the nacelle to the wing above it. */}
          <mesh position={[0, radius * 0.95, -length * 0.05]} castShadow>
            <boxGeometry args={[radius * 0.28, radius * 1.1, length * 0.62]} />
            <SolidAirframe color={livery.upper} dark={0.1} repeat={[2, 3]} />
          </mesh>
          <FanFace radius={radius * 0.86} z={-length * 0.4} spin={rotorsOn} />
        </>
      )}

      {kind !== "turboprop" && <Nozzle radius={radius * 0.82} z={exitZ} />}

      {config.propeller && (
        <Propeller
          blades={config.propeller.blades}
          radius={config.propeller.radius}
          z={length * 0.52}
          spin={rotorsOn}
        />
      )}

      {config.afterburner && (
        <Afterburner radius={radius * 0.74} z={exitZ} intensity={afterburner} />
      )}
    </group>
  );
}

function Afterburner({
  radius,
  z,
  intensity,
}: {
  radius: number;
  z: number;
  intensity: number;
}) {
  const inner = useRef<THREE.Mesh>(null);
  const outer = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  const value = useRef(0);

  useFrame((state, dt) => {
    value.current = THREE.MathUtils.damp(value.current, intensity, 6, dt);
    const v = value.current;
    const t = state.clock.elapsedTime;
    // Shock-diamond shimmer on top of the steady plume length.
    const flicker = 1 + Math.sin(t * 42) * 0.05 + Math.sin(t * 17.3) * 0.035;

    if (inner.current) {
      inner.current.scale.set(v * flicker, v * flicker, v * flicker);
      inner.current.visible = v > 0.01;
    }
    if (outer.current) {
      outer.current.scale.set(v * flicker * 1.12, v * flicker * 1.12, v * flicker * 1.35);
      outer.current.visible = v > 0.01;
    }
    if (light.current) light.current.intensity = v * flicker * 16;
  });

  const length = radius * 11;

  return (
    <group position={[0, 0, z]}>
      {/* Starts collapsed: at full size on the first frame the plume would be part of
          the bounding box the camera frames itself against. */}
      <mesh
        ref={inner}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, -length / 2]}
        scale={0}
        visible={false}
      >
        <coneGeometry args={[radius * 0.62, length, 18, 1, true]} />
        <meshBasicMaterial
          color="#cfeeff"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <mesh
        ref={outer}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, -length / 2]}
        scale={0}
        visible={false}
      >
        <coneGeometry args={[radius * 0.95, length, 18, 1, true]} />
        <meshBasicMaterial
          color="#ff8c33"
          transparent
          opacity={0.34}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <pointLight ref={light} color="#ffa24a" intensity={0} distance={radius * 26} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Rotors and propellers                                               */
/* ------------------------------------------------------------------ */

export function Rotor({ config, spin }: { config: RotorConfig; spin: number }) {
  const disc = useRef<THREE.Group>(null);
  const rate = useRef(0);
  const geometry = useMemo(
    () => bladeGeometry(config.radius, config.chord),
    [config.radius, config.chord],
  );
  const dir = config.direction ?? 1;
  const coning = (config.coning ?? 3) * DEG;

  useFrame((_, dt) => {
    rate.current = THREE.MathUtils.damp(rate.current, spin, 1.6, dt);
    if (disc.current) disc.current.rotation.y += rate.current * dir * 7.5 * dt;
  });

  const vertical = config.vertical === true;

  return (
    <group position={config.hub} rotation={vertical ? [0, 0, Math.PI / 2] : [0, 0, 0]}>
      {/* Rotor mast. */}
      <mesh position={[0, -config.radius * 0.06, 0]} castShadow>
        <cylinderGeometry
          args={[config.radius * 0.045, config.radius * 0.055, config.radius * 0.16, 12]}
        />
        <BareMetal rough={0.45} />
      </mesh>
      <group ref={disc}>
        <mesh castShadow>
          <cylinderGeometry
            args={[config.radius * 0.085, config.radius * 0.075, config.radius * 0.05, 14]}
          />
          <BareMetal rough={0.5} />
        </mesh>
        <RotorHead radius={config.radius} blades={config.blades} />
        {Array.from({ length: config.blades }, (_, i) => (
          <group key={i} rotation={[0, (i / config.blades) * Math.PI * 2, 0]}>
            <group rotation={[0, 0, coning]}>
              <mesh geometry={geometry} castShadow>
                <meshStandardMaterial color="#22252b" metalness={0.35} roughness={0.66} />
              </mesh>
            </group>
          </group>
        ))}
      </group>
    </group>
  );
}

function Propeller({
  blades,
  radius,
  z,
  spin,
}: {
  blades: number;
  radius: number;
  z: number;
  spin: number;
}) {
  const disc = useRef<THREE.Group>(null);
  const rate = useRef(0);
  const geometry = useMemo(() => bladeGeometry(radius, radius * 0.16), [radius]);

  useFrame((_, dt) => {
    rate.current = THREE.MathUtils.damp(rate.current, spin, 1.6, dt);
    if (disc.current) disc.current.rotation.z += rate.current * 24 * dt;
  });

  return (
    <group position={[0, 0, z]}>
      <group ref={disc}>
        {Array.from({ length: blades }, (_, i) => (
          <group key={i} rotation={[0, 0, (i / blades) * Math.PI * 2]}>
            {/* Blade geometry is built chord-along-Z; turn it a quarter so the disc
                faces forward, then add pitch about its own span axis. */}
            <mesh geometry={geometry} rotation={[Math.PI / 2 + 0.5, 0, 0]} castShadow>
              <meshStandardMaterial color="#1d1f24" metalness={0.3} roughness={0.68} />
            </mesh>
          </group>
        ))}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <coneGeometry args={[radius * 0.12, radius * 0.3, 14]} />
          <BareMetal rough={0.4} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Landing gear                                                        */
/* ------------------------------------------------------------------ */

export function LandingGear({
  leg,
  deployed,
  livery,
}: {
  leg: GearLeg;
  deployed: number;
  livery: Livery;
}) {
  const group = useRef<THREE.Group>(null);
  const door = useRef<THREE.Group>(null);
  const value = useRef(1);
  const axis = useMemo(
    () => new THREE.Vector3(...(leg.retractAxis ?? [0, 0, 1])).normalize(),
    [leg.retractAxis],
  );
  const quat = useMemo(() => new THREE.Quaternion(), []);

  useFrame((_, dt) => {
    value.current = THREE.MathUtils.damp(value.current, deployed, 3.2, dt);
    const v = value.current;
    if (group.current) {
      // Fold up toward the bay as the value drops to zero.
      quat.setFromAxisAngle(axis, (1 - v) * 88 * DEG);
      group.current.quaternion.copy(quat);
      group.current.visible = v > 0.02;
    }
    // Doors swing open ahead of the leg and close again behind it.
    if (door.current) door.current.rotation.z = v * 82 * DEG;
  });

  const wheels = leg.wheels ?? 1;
  const wheelWidth = leg.wheelRadius * 0.62;
  const r = leg.wheelRadius;

  return (
    <group position={leg.position}>
      {/* Bay door, hinged on the centreline side. */}
      <group ref={door}>
        <mesh position={[r * 0.5, 0, 0]} castShadow>
          <boxGeometry args={[r * 1.0, r * 0.06, leg.length * 0.9]} />
          <SolidAirframe color={livery.lower} repeat={[1.5, 2]} />
        </mesh>
      </group>

      <group ref={group}>
        {/* Oleo strut, with a polished lower section. */}
        <mesh position={[0, -leg.length * 0.28, 0]} castShadow>
          <cylinderGeometry args={[r * 0.24, r * 0.27, leg.length * 0.56, 12]} />
          <BareMetal rough={0.42} />
        </mesh>
        <mesh position={[0, -leg.length * 0.76, 0]} castShadow>
          <cylinderGeometry args={[r * 0.19, r * 0.19, leg.length * 0.48, 12]} />
          <BareMetal rough={0.12} />
        </mesh>

        {/* Torque link, the scissor between the two strut halves. */}
        {[-1, 1].map((s) => (
          <mesh
            key={s}
            position={[0, -leg.length * (0.52 + s * 0.1), r * 0.24]}
            rotation={[s * 0.62, 0, 0]}
            castShadow
          >
            <boxGeometry args={[r * 0.1, leg.length * 0.24, r * 0.07]} />
            <BareMetal rough={0.4} />
          </mesh>
        ))}

        {/* Drag brace. */}
        <mesh
          position={[0, -leg.length * 0.55, leg.length * 0.16]}
          rotation={[-0.5, 0, 0]}
          castShadow
        >
          <cylinderGeometry args={[r * 0.095, r * 0.095, leg.length * 0.8, 8]} />
          <BareMetal rough={0.4} />
        </mesh>

        {Array.from({ length: wheels }, (_, i) => {
          const offset = wheels === 1 ? 0 : (i - (wheels - 1) / 2) * r * 2.3;
          return (
            <group key={i} position={[0, -leg.length, offset]}>
              <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[r, r, wheelWidth, 20]} />
                <Rubber />
              </mesh>
              {/* Hub and brake pack. */}
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[r * 0.52, r * 0.52, wheelWidth * 1.06, 16]} />
                <BareMetal rough={0.35} />
              </mesh>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[r * 0.68, r * 0.68, wheelWidth * 0.5, 16]} />
                <meshStandardMaterial color="#5a5148" metalness={0.7} roughness={0.62} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Intakes                                                             */
/* ------------------------------------------------------------------ */

export function Intake({
  position,
  width,
  height,
  length,
  livery,
}: {
  position: [number, number, number];
  width: number;
  height: number;
  length: number;
  livery: Livery;
}) {
  const geometry = useMemo(
    () => applyLivery(slabGeometry(width, height, length, 0.92), livery),
    [width, height, length, livery],
  );
  return (
    <group position={position}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <Airframe repeat={[3, 4]} />
      </mesh>
      {/* Duct recessed behind the lip, so the inlet reads as genuinely open. */}
      <mesh position={[0, 0, length / 2 - 0.18]}>
        <boxGeometry args={[width * 0.8, height * 0.8, 0.36]} />
        <meshStandardMaterial color="#080a0d" metalness={0.3} roughness={0.88} />
      </mesh>
    </group>
  );
}
