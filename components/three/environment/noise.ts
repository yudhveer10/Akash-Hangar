/**
 * Deterministic value noise, used to grow the ground around an airfield.
 *
 * Same reasoning as the airframe textures: nothing here is downloaded or shipped as
 * an asset, so a landscape is a function rather than a file. It is seeded and
 * integer-hashed, which means Leh looks like Leh on every reload and on the server.
 */

const smooth = (t: number) => t * t * (3 - 2 * t);

/** Integer lattice hash. Returns 0 → 1. */
function hash2(ix: number, iy: number, seed: number): number {
  let h = Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seed, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

export function valueNoise(x: number, y: number, seed: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const u = smooth(x - ix);
  const v = smooth(y - iy);

  const a = hash2(ix, iy, seed);
  const b = hash2(ix + 1, iy, seed);
  const c = hash2(ix, iy + 1, seed);
  const d = hash2(ix + 1, iy + 1, seed);

  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

/** Stacked octaves. Returns 0 → 1. */
export function fbm(x: number, y: number, octaves: number, seed: number): number {
  let amplitude = 1;
  let frequency = 1;
  let sum = 0;
  let norm = 0;

  for (let i = 0; i < octaves; i++) {
    sum += amplitude * valueNoise(x * frequency, y * frequency, seed + i * 101);
    norm += amplitude;
    amplitude *= 0.5;
    frequency *= 2.03; // Not exactly 2, or the octaves line their features up.
  }
  return sum / norm;
}

export const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x < edge0 ? 0 : 1;
  return smooth(clamp01((x - edge0) / (edge1 - edge0)));
}

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
