/**
 * The home page's landing: where the aircraft is, how it is sitting, and where the
 * camera is watching it from, at any second of the sequence.
 *
 * Pure maths in metres and seconds at real scale, with no React and no three, for the
 * same reason the geometry builders are separated from the components that mount them:
 * `npm run validate` runs it. An animation is the one thing on this site that cannot
 * be checked by looking at a still, and "the aircraft sinks through the runway" or
 * "the camera ends up underground" are exactly the sort of faults that are obvious in
 * motion and invisible in code.
 *
 * The path is flown rather than keyframed. A standard 3° glideslope at an approach
 * speed, a flare that leaves the slope at the gradient it was descending on and
 * arrives with the sink taken off, and a rollout that decelerates — so the aircraft
 * moves the way one does instead of sliding along a curve someone drew.
 */

const DEG = Math.PI / 180;

export const FLIGHT = {
  /** On final, m/s — about 260 km/h. */
  speed: 72,
  /** The standard glideslope, degrees. */
  slope: 3,
  /**
   * Where the main wheels meet the runway. The threshold is at z = −170 and the
   * touchdown zone markings run from about z = −20 to z = 430, so this is a normal
   * place to arrive rather than a chosen-looking one.
   */
  touchdownZ: 60,
  /** Height the flare begins at, metres. */
  flareHeight: 7,
  /** Nose-up attitude on the slope, degrees. */
  approachPitch: 2.5,
  /** Nose-up through the flare, held into the rollout to brake on the wings. */
  flarePitch: 9.5,
  /** Length of final approach flown, metres. */
  finalMetres: 470,
  /** How long the rollout takes to come to a stop. */
  brakeSeconds: 8.5,
  /** A beat at the far end before the camera hands over to the visitor. */
  holdSeconds: 1.1,
} as const;

export const SLOPE = Math.tan(FLIGHT.slope * DEG);
export const START_Z = FLIGHT.touchdownZ - FLIGHT.finalMetres;
export const FLARE_Z = FLIGHT.touchdownZ - FLIGHT.flareHeight / SLOPE;
export const T_TOUCHDOWN = FLIGHT.finalMetres / FLIGHT.speed;
/** Speed decays as (1−u)², so the ground covered is a third of speed × time. */
export const ROLL_METRES = (FLIGHT.speed * FLIGHT.brakeSeconds) / 3;
export const PARK_Z = FLIGHT.touchdownZ + ROLL_METRES;
export const T_END = T_TOUCHDOWN + FLIGHT.brakeSeconds + FLIGHT.holdSeconds;

/** Height above the runway the parked aircraft is orbited about, metres. */
export const PARK_HEIGHT = 2.4;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};

/** Distance down the runway, metres. */
export function zAt(t: number): number {
  if (t <= T_TOUCHDOWN) return START_Z + FLIGHT.speed * t;
  const u = clamp01((t - T_TOUCHDOWN) / FLIGHT.brakeSeconds);
  return FLIGHT.touchdownZ + ROLL_METRES * (1 - (1 - u) ** 3);
}

/** Wheel height above the runway, metres. */
export function yAt(z: number): number {
  if (z >= FLIGHT.touchdownZ) return 0;
  if (z <= FLARE_Z) return (FLIGHT.touchdownZ - z) * SLOPE;
  const f = (z - FLARE_Z) / (FLIGHT.touchdownZ - FLARE_Z);
  return FLIGHT.flareHeight * (1 - f) ** 2 * (1 + f);
}

/** Nose-up attitude, degrees. */
export function pitchAt(t: number, z: number): number {
  if (t <= T_TOUCHDOWN) {
    if (z <= FLARE_Z) return FLIGHT.approachPitch;
    const f = (z - FLARE_Z) / (FLIGHT.touchdownZ - FLARE_Z);
    return FLIGHT.approachPitch + (FLIGHT.flarePitch - FLIGHT.approachPitch) * smooth(f);
  }
  const u = (t - T_TOUCHDOWN) / FLIGHT.brakeSeconds;
  return FLIGHT.flarePitch * (1 - smooth((u - 0.28) / 0.34));
}

/** A little wing rock on the way down, gone by the time the wheels are on. Degrees. */
export function bankAt(t: number): number {
  return 1.3 * Math.sin(t * 1.15) * (1 - clamp01(t / T_TOUCHDOWN));
}

/* ------------------------------------------------------------------ */
/* The camera                                                          */
/* ------------------------------------------------------------------ */

/** A shot: where the camera sits relative to the aircraft, and what it looks at. */
interface Shot {
  t: number;
  offset: readonly [number, number, number];
  look: readonly [number, number, number];
}

/**
 * One continuous move rather than cuts: high and behind on the slope, where the
 * runway ahead is as much the subject as the aircraft; down to runway level for the
 * touchdown; then round to the front quarter as it rolls to a stop and the visitor
 * takes over. Offsets are in airframe-lengths of a 22 m fighter and are scaled to
 * whatever is actually flying, so a heavier aircraft frames the same.
 */
export const SHOTS: readonly Shot[] = [
  { t: 0, offset: [40, 14, -62], look: [0, -10, 44] },
  { t: 3.4, offset: [29, 7.5, -38], look: [0, -6, 26] },
  { t: 5.6, offset: [21, 3.2, -14], look: [0, -1.5, 12] },
  { t: T_TOUCHDOWN, offset: [23, 2.4, 7], look: [0, 1.2, 0] },
  { t: 9.6, offset: [27, 4.5, 27], look: [0, 1.8, 0] },
  // The last look-at is PARK_HEIGHT above the wheels, which is exactly where the
  // orbit target goes — so the handover does not nudge the framing.
  { t: 13, offset: [31, 7.5, 33], look: [0, PARK_HEIGHT, 0] },
  { t: T_END, offset: [30, 10, 26], look: [0, PARK_HEIGHT, 0] },
];

/** Anything with a `set` — a THREE.Vector3, or a plain object in the validator. */
export interface Vec3Like {
  set(x: number, y: number, z: number): unknown;
}

/** Camera offset and look-at offset at time `t`, both relative to the aircraft. */
export function shotAt(t: number, offset: Vec3Like, look: Vec3Like): void {
  let i = SHOTS.length - 1;
  while (i > 0 && SHOTS[i].t > t) i--;
  const a = SHOTS[i];
  const b = SHOTS[Math.min(i + 1, SHOTS.length - 1)];
  const span = b.t - a.t;
  const k = span > 0 ? smooth((t - a.t) / span) : 0;

  offset.set(
    a.offset[0] + (b.offset[0] - a.offset[0]) * k,
    a.offset[1] + (b.offset[1] - a.offset[1]) * k,
    a.offset[2] + (b.offset[2] - a.offset[2]) * k,
  );
  look.set(
    a.look[0] + (b.look[0] - a.look[0]) * k,
    a.look[1] + (b.look[1] - a.look[1]) * k,
    a.look[2] + (b.look[2] - a.look[2]) * k,
  );
}
