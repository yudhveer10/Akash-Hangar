/**
 * Airfield dimensions, in metres, shared by everything that has to agree about where
 * the concrete is: the runway itself, the ground that has to stay flat underneath it,
 * and the buildings placed clear of it.
 *
 * Figures follow ordinary published civil/military runway practice — a 45 m strip
 * with 7.5 m shoulders, 30 m centreline stripes on 20 m gaps, 30 m threshold bars —
 * so the markings are the standard ones used at every airfield rather than a claim
 * about any particular station's layout.
 */

export const RUNWAY = {
  width: 45,
  length: 2400,
  /** Z of the near threshold. The aircraft stands at the origin, this far down it. */
  threshold: -170,
  /** Paved overrun before the threshold. */
  overrun: 70,
  shoulder: 7.5,
} as const;

/**
 * Heights of the airfield's surfaces, in metres.
 *
 * Nothing here may share a height with anything it overlaps. A depth buffer running
 * from 0.4 m to 4 km resolves barely a centimetre at 300 m and over half a metre at
 * the far end of the runway, so two coplanar surfaces do not simply pick a winner —
 * they tear into moving stripes as the camera orbits. Paint is not a surface at all
 * for the same reason: the runway markings are baked into its texture rather than
 * floated above it.
 */
export const HEIGHT = {
  /** Ground sits below the paving, the way it does beside a real runway. */
  ground: -0.15,
  shoulder: -0.05,
  taxiway: -0.02,
  runway: 0,
  /** Only for the taxiway line, which is short, close, and nowhere near the runway. */
  taxiLine: 0.03,
} as const;

export const RUNWAY_START = RUNWAY.threshold - RUNWAY.overrun;
export const RUNWAY_END = RUNWAY.threshold + RUNWAY.length;
export const RUNWAY_HALF = RUNWAY.width / 2;

/** Taxiway running off the starboard side, and the apron it leads to. */
export const TAXIWAY = {
  width: 23,
  /** Z of the taxiway centreline. */
  z: RUNWAY.threshold + 40,
  /** How far out from the runway edge the apron sits. */
  reach: 210,
  apron: { width: 150, depth: 130 },
} as const;

/** Where the taxiway leaves the shoulder, and the centre of the apron it reaches. */
export const TAXIWAY_FROM = RUNWAY_HALF + RUNWAY.shoulder;
export const APRON_CENTRE_X =
  TAXIWAY_FROM + TAXIWAY.reach + TAXIWAY.apron.width / 2 - 10;

/**
 * Ground that has to stay flat for the taxiway, the apron and the buildings on it —
 * held level alongside the runway strip itself. Without it a hillside preset grows
 * straight through the hangars.
 */
export const APRON_AREA = {
  minX: RUNWAY_HALF,
  maxX: RUNWAY_HALF + TAXIWAY.reach + TAXIWAY.apron.width + 40,
  minZ: TAXIWAY.z - TAXIWAY.apron.depth / 2 - 70,
  maxZ: TAXIWAY.z + 200,
} as const;

/* ------------------------------------------------------------------ */
/* Markings                                                            */
/* ------------------------------------------------------------------ */

/** A painted rectangle: `w` across the runway, `l` along it, centred on (x, z). */
export interface Marking {
  x: number;
  z: number;
  w: number;
  l: number;
}

/**
 * Every white marking on the runway, in metres.
 *
 * The international standard set. It is what makes a strip of grey read instantly as
 * a runway, and being standard it says nothing about any particular airfield — unlike
 * the designator numbers, which depend on a real field's magnetic heading and are
 * therefore left off.
 */
export function runwayMarkings(): Marking[] {
  const marks: Marking[] = [];
  const t = RUNWAY.threshold;

  // Threshold bars ("piano keys"): twelve 1.8 × 30 m stripes, 1.8 m apart, with a
  // 3.6 m gap straddling the centreline.
  for (let k = 0; k < 6; k++) {
    const offset = 2.7 + k * 3.6;
    for (const side of [-1, 1]) {
      marks.push({ x: side * offset, z: t + 21, w: 1.8, l: 30 });
    }
  }

  // Side stripes down both edges.
  const stripe = RUNWAY_END - t;
  for (const side of [-1, 1]) {
    marks.push({ x: side * (RUNWAY_HALF - 0.45), z: t + stripe / 2, w: 0.9, l: stripe });
  }

  // Centreline: 30 m stripes on 20 m gaps.
  for (let z = t + 60; z < RUNWAY_END - 40; z += 50) {
    marks.push({ x: 0, z: z + 15, w: 0.9, l: 30 });
  }

  // Touchdown zone bars, in groups either side of the centreline.
  const zones: [number, number[]][] = [
    [150, [12, 16.5]],
    [300, [12, 16.5]],
    [450, [12]],
    [600, [12]],
  ];
  for (const [distance, offsets] of zones) {
    for (const offset of offsets) {
      for (const side of [-1, 1]) {
        marks.push({ x: side * offset, z: t + distance + 11.25, w: 3, l: 22.5 });
      }
    }
  }

  // Aiming point: the two fat bars the approach is flown at.
  for (const side of [-1, 1]) {
    marks.push({ x: side * 10.5, z: t + 322.5, w: 6, l: 45 });
  }

  return marks;
}
