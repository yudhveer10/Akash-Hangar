import * as THREE from "three";
import { clamp01, fbm, mix, smoothstep } from "./noise";

/**
 * The country around the runway.
 *
 * A height function plus a mesh built from it. Two things shape the ground:
 *
 * - the **strip mask**, which holds the terrain dead flat along the runway and lets
 *   relief climb only once it is clear of the field. Real airfields are cut into
 *   their landscape; a radial mask alone would bury the far end of the runway in a
 *   hillside.
 * - the **growth** term, which makes relief taller with distance, so a valley reads
 *   as near walls with bigger ranges behind them rather than one uniform lumpiness.
 *
 * The mesh is a polar grid with geometrically spaced rings: dense where the visitor
 * is standing, coarse out at the horizon, for a fraction of the triangles a regular
 * grid of the same near-field detail would cost.
 */

export interface TerrainColours {
  /** Ground cover at field level. */
  low: string;
  /** Ground cover high up, before rock takes over. */
  high: string;
  /** Bare faces, used where the slope is too steep to hold anything. */
  rock: string;
  snow: string;
  /** Beach and dry bed, coastal presets only. */
  sand: string;
}

export interface TerrainSpec {
  seed: number;
  /** Outer radius of the ground disc. */
  radius: number;
  /** The runway strip, held flat. */
  strip: { from: number; to: number };
  /** The apron beside it, held flat too. */
  pad: { minX: number; maxX: number; minZ: number; maxZ: number };
  /** Distance from the strip within which the ground stays flat. */
  flatWidth: number;
  /** Distance from the strip at which relief reaches full height. */
  blendWidth: number;
  /** Relief height near the field. */
  amplitude: number;
  /** Extra multiplier on relief out at the edge of the disc. */
  growth: number;
  /** Noise frequency, cycles per metre. Lower = broader landforms. */
  frequency: number;
  octaves: number;
  /** 0 = rolling hills, 1 = sharp ridge lines. */
  ridged: number;
  /** Fraction of local relief above which snow lies. Over 1 disables it. */
  snowLine: number;
  /**
   * Height in metres to quantise relief to. Country that erodes in layers — the
   * Deccan and Malwa plateaux — wears into flat tops and steps rather than peaks,
   * and stepping the height function is what produces that.
   */
  terrace?: number;
  colours: TerrainColours;
  /** Optional sea, in the −X direction from the field. */
  sea?: { level: number; shore: number };
}

/**
 * Distance from a point to the paved part of the airfield: the runway strip, which
 * runs along Z at x = 0, or the apron box beside it, whichever is closer.
 */
function distanceToField(spec: TerrainSpec, x: number, z: number): number {
  const sz = z < spec.strip.from ? spec.strip.from - z : z > spec.strip.to ? z - spec.strip.to : 0;
  const strip = Math.hypot(x, sz);

  const { minX, maxX, minZ, maxZ } = spec.pad;
  const px = x < minX ? minX - x : x > maxX ? x - maxX : 0;
  const pz = z < minZ ? minZ - z : z > maxZ ? z - maxZ : 0;

  return Math.min(strip, Math.hypot(px, pz));
}

/** Ground height in metres at a point, with the field at y = 0. */
export function terrainHeight(spec: TerrainSpec, x: number, z: number): number {
  const field = smoothstep(spec.flatWidth, spec.blendWidth, distanceToField(spec, x, z));
  if (field <= 0 && !spec.sea) return 0;

  const r = Math.hypot(x, z);
  const f = spec.frequency;

  let n = fbm(x * f, z * f, spec.octaves, spec.seed);
  if (spec.ridged > 0) {
    const ridge = 1 - Math.abs(2 * n - 1);
    n = mix(n, ridge * ridge, spec.ridged);
  }

  // A slow term underneath the detail, so ranges have a shape of their own.
  const macro = fbm(x * f * 0.21, z * f * 0.21, 3, spec.seed + 977);

  const distant = clamp01(r / spec.radius);
  const grown = 1 + spec.growth * distant * distant;
  // Peaks are pulled back down at the very edge of the disc, and the whole sheet
  // curves away, so the rim tucks under the horizon instead of ending in a cliff.
  const rim = 1 - smoothstep(0.84, 1, distant);
  // Held back until the outer half, or on a flat preset the drop swamps the 15-odd
  // metres of relief the whole landscape has and the plain becomes a bowl.
  const falloff = smoothstep(0.5, 1, distant);
  const curve = falloff * falloff * 60;

  // Everything is scaled by the field mask, the curvature included — otherwise the
  // ground sinks away under the far end of the runway and leaves it in mid-air.
  let relief = spec.amplitude * grown * rim * (0.3 + 0.7 * macro) * n;
  if (spec.terrace) {
    // Only most of the way, so the steps read as weathered rather than machined.
    relief = mix(relief, Math.round(relief / spec.terrace) * spec.terrace, 0.72);
  }

  let h = (relief - curve) * field;

  if (spec.sea) {
    // Ground falls away to seabed on the port side of the field.
    const shelf = smoothstep(spec.sea.shore, spec.sea.shore + 420, -x);
    h = mix(h, spec.sea.level - 9, shelf);
  }
  return h;
}

/**
 * Vertex-coloured ground mesh. Colour comes from height and slope — grass low down,
 * bare rock where it is too steep to hold, snow above the line on gentler faces —
 * which is the same trick the airframes use for their liveries.
 */
export function terrainGeometry(spec: TerrainSpec, rings = 68, segments = 148): THREE.BufferGeometry {
  const inner = Math.max(40, spec.flatWidth * 0.35);
  const radii = [0];
  for (let i = 0; i < rings; i++) {
    radii.push(inner * Math.pow(spec.radius / inner, i / (rings - 1)));
  }

  const count = radii.length * (segments + 1);
  const position = new Float32Array(count * 3);
  const colour = new Float32Array(count * 3);
  const index: number[] = [];

  const low = new THREE.Color(spec.colours.low);
  const high = new THREE.Color(spec.colours.high);
  const rock = new THREE.Color(spec.colours.rock);
  const snow = new THREE.Color(spec.colours.snow);
  const sand = new THREE.Color(spec.colours.sand);
  const c = new THREE.Color();

  let v = 0;
  for (let ri = 0; ri < radii.length; ri++) {
    const r = radii[ri];
    // Sample step scales with the ring, so slope is measured over a distance that
    // means something at both ends of the mesh.
    const step = Math.max(1.5, r * 0.02);

    for (let si = 0; si <= segments; si++) {
      const angle = (si / segments) * Math.PI * 2;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = terrainHeight(spec, x, z);

      position[v * 3] = x;
      position[v * 3 + 1] = y;
      position[v * 3 + 2] = z;

      const dx = terrainHeight(spec, x + step, z) - terrainHeight(spec, x - step, z);
      const dz = terrainHeight(spec, x, z + step) - terrainHeight(spec, x, z - step);
      const slope = clamp01(Math.hypot(dx, dz) / (2 * step) * 1.6);
      const lift = clamp01(y / (spec.amplitude * 0.85));

      c.copy(low).lerp(high, smoothstep(0.04, 0.5, lift));
      c.lerp(rock, smoothstep(0.34, 0.78, slope));
      if (spec.snowLine <= 1) {
        const cover = smoothstep(spec.snowLine, spec.snowLine + 0.16, lift);
        c.lerp(snow, cover * (1 - smoothstep(0.55, 0.86, slope)));
      }
      if (spec.sea) c.lerp(sand, smoothstep(2, -2, y));

      // Break up the flat pad so it does not read as a painted plane.
      const jitter = 0.9 + 0.2 * fbm(x * 0.05, z * 0.05, 2, spec.seed + 31);
      colour[v * 3] = c.r * jitter;
      colour[v * 3 + 1] = c.g * jitter;
      colour[v * 3 + 2] = c.b * jitter;
      v++;
    }
  }

  const stride = segments + 1;
  for (let ri = 0; ri < radii.length - 1; ri++) {
    for (let si = 0; si < segments; si++) {
      const a = ri * stride + si;
      const b = a + 1;
      const d = (ri + 1) * stride + si;
      const e = d + 1;
      // Wound so the faces look up: the innermost ring collapses to a point, so half
      // of its quads are degenerate and drop out on their own.
      index.push(a, b, d, b, e, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colour, 3));
  geometry.setIndex(index);
  geometry.computeVertexNormals();

  // The vertex at the exact centre belongs only to the degenerate triangles of the
  // collapsed inner ring, so it comes back with a zero normal. It sits on flat
  // ground; point it up.
  const normals = geometry.getAttribute("normal");
  for (let i = 0; i < normals.count; i++) {
    if (normals.getX(i) === 0 && normals.getY(i) === 0 && normals.getZ(i) === 0) {
      normals.setXYZ(i, 0, 1, 0);
    }
  }

  geometry.computeBoundingSphere();
  return geometry;
}
