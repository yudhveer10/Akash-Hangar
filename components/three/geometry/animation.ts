import type { AnimationId } from "@/lib/types";

/**
 * Live animation levels, 0 → 1. The viewer owns these; parts ease toward their
 * target every frame rather than snapping, so toggles read as mechanical motion.
 */
export type AnimationState = Record<AnimationId, number>;

export const IDLE: AnimationState = {
  landingGear: 1,
  canopy: 0,
  afterburner: 0,
  rotors: 0,
  controlSurfaces: 0,
};

export const ANIMATION_LABELS: Record<AnimationId, { on: string; off: string }> = {
  landingGear: { on: "Retract gear", off: "Extend gear" },
  canopy: { on: "Close canopy", off: "Open canopy" },
  afterburner: { on: "Cut afterburner", off: "Light afterburner" },
  rotors: { on: "Stop rotors", off: "Spin rotors" },
  controlSurfaces: { on: "End control check", off: "Control check" },
};
