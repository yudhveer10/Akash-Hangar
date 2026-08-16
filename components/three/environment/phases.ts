import type { PhaseId } from "@/lib/types";

/**
 * Time of day.
 *
 * A phase is not a scene of its own — it is a set of pulls applied to whichever
 * landscape is showing. Each colour here is a target and each `mix` is how far toward
 * it the landscape's own daylight colour is dragged, so Leh at dusk and Jodhpur at
 * dusk are both plausibly dusk without either losing what makes it itself. Six
 * landscapes and three phases give eighteen looks out of nine definitions.
 *
 * The runway lighting only matters in the last two, which is the point of having them:
 * a lit airfield at night is a different photograph entirely.
 */

export interface Phase {
  label: string;
  /** Sun or moon height in degrees. Null keeps the landscape's own daylight angle. */
  elevation: number | null;
  light: { colour: string; mix: number; intensity: number };
  sky: { zenith: string; horizon: string; ground: string; mix: number };
  ambient: { sky: string; ground: string; mix: number; intensity: number };
  /** Fog colour target, and a multiplier on the landscape's density. */
  fog: { colour: string; mix: number; density: number };
  /**
   * Emissive strength of the airfield lighting. The bloom threshold sits at 1, so
   * anything under that reads as an unlit lens and anything over it glows.
   */
  lamps: number;
  /** How far down the runway the lights are worth drawing, in metres. */
  lampReach: number;
  /** Stars painted into the sky. */
  stars: number;
  /** Warm fill standing in for apron floodlights, so the airframe stays readable. */
  flood: number;
  /** Sodium glow over a city, if the landscape has one. */
  cityGlow: number;
  /** Lifts reflections when the sky itself has stopped providing any. */
  envIntensity: number;
}

export const PHASES: Record<PhaseId, Phase> = {
  day: {
    label: "Day",
    elevation: null,
    light: { colour: "#ffffff", mix: 0, intensity: 1 },
    sky: { zenith: "#ffffff", horizon: "#ffffff", ground: "#ffffff", mix: 0 },
    ambient: { sky: "#ffffff", ground: "#ffffff", mix: 0, intensity: 1 },
    fog: { colour: "#ffffff", mix: 0, density: 1 },
    lamps: 0.45,
    lampReach: 600,
    stars: 0,
    flood: 0,
    cityGlow: 0,
    envIntensity: 1,
  },

  dusk: {
    label: "Dusk",
    // Low enough for long shadows down the runway, high enough to still model the
    // airframe rather than silhouette it.
    elevation: 6,
    light: { colour: "#ff9448", mix: 0.82, intensity: 0.72 },
    sky: { zenith: "#1d2f68", horizon: "#f0914f", ground: "#3a3325", mix: 0.8 },
    ambient: { sky: "#7d8fc4", ground: "#4b4030", mix: 0.75, intensity: 0.6 },
    fog: { colour: "#d9905c", mix: 0.72, density: 1.35 },
    lamps: 1.9,
    lampReach: 900,
    stars: 0.25,
    flood: 0.22,
    cityGlow: 0.55,
    envIntensity: 1.15,
  },

  night: {
    label: "Night",
    // Moonlight, from high enough that the top surfaces catch it.
    elevation: 38,
    light: { colour: "#9fb6e8", mix: 0.9, intensity: 0.16 },
    sky: { zenith: "#040814", horizon: "#101d33", ground: "#080a10", mix: 0.93 },
    ambient: { sky: "#41577f", ground: "#131720", mix: 0.9, intensity: 0.42 },
    fog: { colour: "#0d1524", mix: 0.9, density: 1.25 },
    lamps: 4.2,
    lampReach: 1200,
    stars: 1,
    flood: 0.5,
    cityGlow: 1,
    envIntensity: 1.6,
  },
};

export const PHASE_ORDER: PhaseId[] = ["day", "dusk", "night"];
