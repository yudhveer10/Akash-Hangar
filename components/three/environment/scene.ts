import type { AirBase, PhaseId } from "@/lib/types";
import { PHASES, type Phase } from "./phases";
import { PRESETS, type Landscape } from "./presets";
import type { TerrainSpec } from "./terrain";
import type { SkyPalette } from "./textures";

/**
 * Resolves a station and a time of day into the scene the viewer actually builds.
 *
 * Two things happen here. Colours are pulled from the landscape's daylight palette
 * toward the phase's targets, which is what makes eighteen looks out of nine
 * definitions. And every station gets its own terrain seed, so that Ambala and
 * Adampur — both flat Punjab plain, both correctly described by the same landscape —
 * are nonetheless not the same field. Without it the six plains stations were
 * literally identical ground.
 */

export interface ScenePreset {
  key: string;
  /** The station's own number, which seeds its clouds, stars and ground. */
  seed: number;
  sky: SkyPalette;
  sun: { azimuth: number; elevation: number; colour: string; intensity: number };
  ambient: { sky: string; ground: string; intensity: number };
  fog: { colour: string; density: number };
  terrain: TerrainSpec;
  pavementTint: string;
  shoulder: string;
  scatter: Landscape["scatter"];
  buildings: Landscape["buildings"];
  /** Everything the time of day adds rather than modifies. */
  lamps: number;
  lampReach: number;
  flood: number;
  envIntensity: number;
}

/**
 * Pulls one colour toward another. Both are hex, the result is hex.
 *
 * Deliberately mixed in sRGB rather than through THREE.Color, which works in linear
 * space: there, ninety per cent of the way from a bright horizon to near-black still
 * comes back as mid grey, and every night sky in the place resolved to dusk. Mixing
 * the way the numbers are written is what makes the phase weights mean what they say.
 */
function blend(from: string, to: string, t: number): string {
  if (t <= 0) return from;
  const a = Number.parseInt(from.slice(1), 16);
  const b = Number.parseInt(to.slice(1), 16);
  const channel = (shift: number) => {
    const x = (a >> shift) & 255;
    const y = (b >> shift) & 255;
    return Math.round(x + (y - x) * t);
  };
  const packed = (1 << 24) | (channel(16) << 16) | (channel(8) << 8) | channel(0);
  return `#${packed.toString(16).slice(1)}`;
}

/**
 * A station's own number, so its ground is its own. Any stable hash of the id will
 * do; what matters is that it never changes, since the landscape would change with it.
 */
export function stationSeed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 90000;
}

/** Lush ground, for a station that has more of it than its landscape assumes. */
const LUSH = "#41602f";

/**
 * The ground at a particular station: its landscape, grown from its own seed and
 * shifted toward parched or lush. Dry pulls toward the landscape's own sand rather
 * than a single brown, so a dry desert still looks like desert and a dry plateau
 * still looks like plateau.
 */
export function terrainFor(base: AirBase): TerrainSpec {
  const spec = PRESETS[base.terrain].terrain;
  const green = base.character?.green ?? 0.5;
  const shift = Math.abs(green - 0.5) * 0.9;
  const target = green < 0.5 ? spec.colours.sand : LUSH;

  return {
    ...spec,
    seed: stationSeed(base.id),
    colours: {
      ...spec.colours,
      low: blend(spec.colours.low, target, shift),
      high: blend(spec.colours.high, target, shift),
    },
  };
}

function resolve(
  base: AirBase,
  land: Landscape,
  phase: Phase,
  terrain: TerrainSpec,
  key: string,
): ScenePreset {
  const sky = land.sky;
  const p = phase;
  const air = base.character ?? {};

  // A station may put its sun somewhere else entirely, which moves both the shadows
  // on the runway and the sun in the sky — they read from the same number.
  const azimuth = air.sun ?? land.sun.azimuth;
  const clouds = sky.clouds * (air.clouds ?? 1);

  return {
    key,
    seed: stationSeed(base.id),
    sky: {
      zenith: blend(sky.zenith, p.sky.zenith, p.sky.mix),
      horizon: blend(sky.horizon, p.sky.horizon, p.sky.mix),
      ground: blend(sky.ground, p.sky.ground, p.sky.mix),
      sun: {
        azimuth,
        elevation: p.elevation ?? sky.sun.elevation,
        colour: blend(sky.sun.colour, p.light.colour, p.light.mix),
      },
      // Cloud sits lower at dusk and is barely there after dark.
      clouds: clouds * (p.stars > 0.5 ? 0.35 : 1),
      stars: p.stars,
      glow: land.buildings === "urban" && p.cityGlow > 0
        ? { colour: "#ffab52", strength: p.cityGlow }
        : undefined,
    },
    sun: {
      azimuth,
      elevation: p.elevation ?? land.sun.elevation,
      colour: blend(land.sun.colour, p.light.colour, p.light.mix),
      intensity: land.sun.intensity * p.light.intensity,
    },
    ambient: {
      sky: blend(land.ambient.sky, p.ambient.sky, p.ambient.mix),
      ground: blend(land.ambient.ground, p.ambient.ground, p.ambient.mix),
      intensity: land.ambient.intensity * p.ambient.intensity,
    },
    fog: {
      colour: blend(land.fog.colour, p.fog.colour, p.fog.mix),
      density: land.fog.density * (air.haze ?? 1) * p.fog.density,
    },
    terrain,
    pavementTint: blend(land.pavementTint, p.sky.horizon, p.sky.mix * 0.55),
    shoulder: land.shoulder,
    scatter: land.scatter,
    buildings: land.buildings,
    lamps: p.lamps,
    lampReach: p.lampReach,
    flood: p.flood,
    envIntensity: p.envIntensity,
  };
}

const cache = new Map<string, ScenePreset>();

/** The scene for a station at a time of day. Cached: switching back is free. */
export function sceneFor(base: AirBase, phaseId: PhaseId): ScenePreset {
  const key = `${base.id}:${phaseId}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const resolved = resolve(base, PRESETS[base.terrain], PHASES[phaseId], terrainFor(base), key);
  cache.set(key, resolved);
  return resolved;
}
