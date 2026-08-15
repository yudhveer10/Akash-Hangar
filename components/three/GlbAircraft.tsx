"use client";

import { useEffect, useMemo, useRef } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { AnimationId } from "@/lib/types";
import type { AnimationState } from "./geometry/animation";

/** Clip-name keywords we accept for each animation, in order of preference. */
const CLIP_KEYWORDS: Record<AnimationId, string[]> = {
  landingGear: ["landinggear", "gear", "undercarriage"],
  canopy: ["canopy", "cockpit", "hood"],
  afterburner: ["afterburner", "burner", "reheat"],
  rotors: ["rotor", "propeller", "prop", "blade"],
  controlSurfaces: ["control", "surface", "aileron", "elevon", "flap"],
};

/** Animations that run as a continuous loop rather than scrubbing to a position. */
const LOOPING: AnimationId[] = ["rotors", "afterburner", "controlSurfaces"];

/**
 * Renders a supplied .glb instead of the procedural airframe.
 *
 * Nothing here ships with the repo — this path only activates when a licensed or
 * self-built model is placed in `public/models/<slug>.glb`. Clips are matched by
 * name so a model can opt into whichever animations it actually has.
 */
export function GlbAircraft({
  url,
  animation,
}: {
  url: string;
  animation: AnimationState;
}) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, group);

  // Shadows are opt-in per mesh in three, and glTF imports arrive with them off.
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  // Memoise the clip *names*, not the actions themselves. AnimationAction is an
  // imperative handle that has to be mutated to drive it, and mutating something held
  // in a memo is exactly what the React Compiler forbids.
  const clipNames = useMemo(() => {
    const found: Partial<Record<AnimationId, string>> = {};
    const names = animations.map((clip) => clip.name);
    for (const [id, keywords] of Object.entries(CLIP_KEYWORDS) as [
      AnimationId,
      string[],
    ][]) {
      const match = keywords
        .map((kw) => names.find((n) => n.toLowerCase().replace(/[\s_-]/g, "").includes(kw)))
        .find(Boolean);
      if (match) found[id] = match;
    }
    return found;
  }, [animations]);

  const eased = useRef<Record<string, number>>({});

  /* eslint-disable react-hooks/immutability --
   * three's AnimationAction is an imperative handle: play(), stop() and assigning
   * `time` are how playback is driven, and it is exactly what drei's useAnimations
   * hands back for that purpose. The rule reads that as mutating a hook return value.
   * Nothing here is React state, and the mutation is confined to this frame callback. */
  useFrame((_, dt) => {
    for (const [id, name] of Object.entries(clipNames) as [AnimationId, string][]) {
      const action = actions[name];
      if (!action) continue;
      const target = animation[id] ?? 0;
      const current = eased.current[id] ?? target;
      const next = THREE.MathUtils.damp(current, target, 3.2, dt);
      eased.current[id] = next;

      if (LOOPING.includes(id)) {
        // Let the clip run; fade it in and out with the toggle.
        if (next > 0.02 && !action.isRunning()) action.reset().play();
        action.setEffectiveWeight(next);
        if (next <= 0.02 && action.isRunning()) action.stop();
      } else {
        // Scrub to a held position so the gear can sit half-way.
        if (!action.isRunning()) action.play();
        action.paused = true;
        action.setEffectiveWeight(1);
        action.time = next * action.getClip().duration;
      }
    }
  });
  /* eslint-enable react-hooks/immutability */

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}
