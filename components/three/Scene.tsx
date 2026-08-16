"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import {
  ContactShadows,
  Environment,
  Lightformer,
  MeshReflectorMaterial,
} from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

/**
 * Studio lighting for the hangar. The environment map is generated in-scene from
 * lightformers rather than downloaded — no external HDRI fetch, so the viewer works
 * offline and has nothing to block on.
 */
export function HangarLighting() {
  return (
    <>
      <hemisphereLight args={["#9fc4e8", "#080d14", 0.5]} />
      <directionalLight
        position={[9, 14, 7]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-32}
        shadow-camera-right={32}
        shadow-camera-top={32}
        shadow-camera-bottom={-32}
        shadow-camera-far={90}
      />
      {/* Cool rim from behind picks the silhouette off the dark background. */}
      <directionalLight position={[-9, 5, -12]} intensity={1.5} color="#7dd3fc" />
      {/* Warm kicker from the opposite side stops the shadowed flank going flat. */}
      <directionalLight position={[7, 2, -6]} intensity={0.65} color="#ffb27a" />
      <directionalLight position={[0, -6, 4]} intensity={0.3} color="#3b5578" />

      <Environment resolution={512} frames={1}>
        {/* Long overhead strip, like a hangar service light. */}
        <Lightformer
          form="rect"
          intensity={3}
          position={[0, 7, 1]}
          scale={[16, 3, 1]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={1.6}
          color="#9ad2ff"
          position={[-7, 3, -5]}
          scale={[7, 7, 1]}
          rotation={[0, Math.PI / 3, 0]}
        />
        <Lightformer
          form="rect"
          intensity={1.2}
          color="#ffd7a8"
          position={[7, 2, 5]}
          scale={[6, 6, 1]}
          rotation={[0, -Math.PI / 4, 0]}
        />
        {/* Small bright forms give the metal something to catch. */}
        <Lightformer form="circle" intensity={4} position={[4, 6, -3]} scale={1.6} />
        <Lightformer form="circle" intensity={3} position={[-4, 5, 4]} scale={1.2} />
        <Lightformer
          intensity={0.5}
          position={[0, -6, 0]}
          scale={[18, 18, 1]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      </Environment>
    </>
  );
}

/** Wet-looking hangar floor. The reflection is what sells the aircraft as a physical object. */
export function HangarFloor({ radius }: { radius: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[radius * 9, radius * 9]} />
      <MeshReflectorMaterial
        blur={[380, 110]}
        resolution={1024}
        mixBlur={1}
        mixStrength={26}
        roughness={0.92}
        depthScale={1.1}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.35}
        color="#080b11"
        metalness={0.72}
        mirror={0}
      />
    </mesh>
  );
}

/**
 * Soft shadow pad under the aircraft. Sized by the caller to the model's span.
 * Outdoors the sun already casts a real shadow, so this is dialled back to the
 * contact darkening under the wheels rather than the whole shadow.
 */
export function GroundShadow({ radius, opacity = 0.72 }: { radius: number; opacity?: number }) {
  return (
    <ContactShadows
      position={[0, 0.015, 0]}
      opacity={opacity}
      scale={radius * 2.8}
      blur={2.2}
      far={radius}
      resolution={1024}
      color="#000509"
    />
  );
}

/**
 * Bloom lifts the afterburner plume and navigation lights, which are the only things
 * in the scene rendered above white. The threshold is set just above 1 so ordinary
 * lit surfaces stay crisp and do not smear.
 */
export function PostFX() {
  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      <Bloom
        intensity={1.15}
        luminanceThreshold={1.0}
        luminanceSmoothing={0.28}
        mipmapBlur
        radius={0.72}
      />
      <Vignette offset={0.28} darkness={0.62} eskil={false} />
    </EffectComposer>
  );
}

/**
 * Drops whatever it wraps onto y = 0 so wheels and skids sit on the shadow plane
 * instead of floating. Measured once after layout, with the airframe in its
 * default (gear-down) state.
 */
export function Grounded({ children }: { children: ReactNode }) {
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    if (!outer.current || !inner.current) return;

    // `Box3.setFromObject` measures in world space, so it has to be taken with the
    // correction removed. Measuring with the lift already applied reads the aircraft
    // as sitting exactly on zero, sets the offset back to nothing, and drops it
    // through the runway — which is what happened every time a button re-rendered.
    outer.current.position.y = 0;
    outer.current.updateWorldMatrix(true, false);

    const box = new THREE.Box3().setFromObject(inner.current);
    if (box.isEmpty()) return;
    outer.current.position.y = -box.min.y;
    // Once only, in the default gear-down state: the aircraft must not hop when the
    // gear comes up or the afterburner lights.
  }, []);

  return (
    <group ref={outer}>
      <group ref={inner}>{children}</group>
    </group>
  );
}
