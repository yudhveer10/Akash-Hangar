import * as THREE from "three";
import type { FuselageStation, Livery, SurfaceConfig } from "@/lib/types";

/**
 * Original procedural airframe geometry.
 *
 * Everything here builds on one primitive: `buildLoft`, which skins a sequence of
 * closed rings into a surface. A fuselage is a stack of superellipse rings along Z;
 * a wing is a stack of aerofoil rings along X. Nothing is imported from a modelling
 * package, so there is no third-party licence attached to any of it.
 *
 * Convention: +Z nose, +X starboard, +Y up. Metres, real scale.
 */

const DEG = Math.PI / 180;

/**
 * Ring winding must be counter-clockwise when viewed from the advance direction.
 *
 * Each ring is emitted with n+1 columns — the last duplicating the first — so the
 * texture seam has somewhere to land. Their normals are averaged back together
 * afterwards, which keeps the surface smooth across the seam while still letting u
 * run cleanly from 0 to 1.
 */
export function buildLoft(
  rings: THREE.Vector3[][],
  opts: { capStart?: boolean; capEnd?: boolean } = {},
): THREE.BufferGeometry {
  const { capStart = true, capEnd = true } = opts;
  if (rings.length < 2) throw new Error("buildLoft needs at least two rings");

  const n = rings[0].length;
  const cols = n + 1;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // v follows distance along the loft, u follows distance around the ring, so texel
  // density stays even instead of bunching where stations are close together.
  const centres = rings.map((ring) => {
    const c = new THREE.Vector3();
    for (const p of ring) c.add(p);
    return c.divideScalar(n);
  });
  const vs: number[] = [0];
  for (let i = 1; i < rings.length; i++) {
    vs.push(vs[i - 1] + centres[i].distanceTo(centres[i - 1]));
  }
  const totalV = vs[vs.length - 1] || 1;

  for (let i = 0; i < rings.length; i++) {
    const ring = rings[i];
    if (ring.length !== n) throw new Error("every ring must have the same point count");

    const perim: number[] = [0];
    for (let j = 1; j <= n; j++) {
      perim.push(perim[j - 1] + ring[j % n].distanceTo(ring[j - 1]));
    }
    const totalU = perim[n] || 1;

    for (let j = 0; j < cols; j++) {
      const p = ring[j % n];
      positions.push(p.x, p.y, p.z);
      uvs.push(perim[j] / totalU, vs[i] / totalV);
    }
  }

  for (let i = 0; i < rings.length - 1; i++) {
    for (let j = 0; j < n; j++) {
      const a = i * cols + j;
      const b = i * cols + j + 1;
      const c = (i + 1) * cols + j + 1;
      const d = (i + 1) * cols + j;
      indices.push(a, b, c, a, c, d);
    }
  }

  const cap = (ringIndex: number, reverse: boolean) => {
    const centre = centres[ringIndex];
    const centreIndex = positions.length / 3;
    positions.push(centre.x, centre.y, centre.z);
    uvs.push(0.5, ringIndex === 0 ? 0 : 1);
    for (let j = 0; j < n; j++) {
      const a = ringIndex * cols + j;
      const b = ringIndex * cols + j + 1;
      if (reverse) indices.push(centreIndex, b, a);
      else indices.push(centreIndex, a, b);
    }
  };

  if (capStart) cap(0, true);
  if (capEnd) cap(rings.length - 1, false);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  // Re-join the duplicated seam column so it shades as one continuous surface.
  const normal = geometry.getAttribute("normal") as THREE.BufferAttribute;
  for (let i = 0; i < rings.length; i++) {
    const first = i * cols;
    const last = first + n;
    const nx = normal.getX(first) + normal.getX(last);
    const ny = normal.getY(first) + normal.getY(last);
    const nz = normal.getZ(first) + normal.getZ(last);
    const len = Math.hypot(nx, ny, nz) || 1;
    normal.setXYZ(first, nx / len, ny / len, nz / len);
    normal.setXYZ(last, nx / len, ny / len, nz / len);
  }
  normal.needsUpdate = true;

  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

/* ------------------------------------------------------------------ */
/* Ring generators                                                     */
/* ------------------------------------------------------------------ */

/**
 * Superellipse cross-section. `exponent` 2 gives an ellipse (fighter bodies);
 * 4 and above squares off progressively (transport cargo boxes).
 */
export function superellipseRing(
  width: number,
  height: number,
  z: number,
  yOffset = 0,
  exponent = 2,
  segments = 24,
): THREE.Vector3[] {
  const ring: THREE.Vector3[] = [];
  const a = Math.max(width, 0.02) / 2;
  const b = Math.max(height, 0.02) / 2;
  const k = 2 / exponent;
  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    const ct = Math.cos(t);
    const st = Math.sin(t);
    const x = a * Math.sign(ct) * Math.abs(ct) ** k;
    const y = b * Math.sign(st) * Math.abs(st) ** k;
    ring.push(new THREE.Vector3(x, y + yOffset, z));
  }
  return ring;
}

/** Symmetric NACA 4-digit thickness distribution. */
export function thicknessAt(u: number, tc: number): number {
  const x = Math.min(Math.max(u, 0), 1);
  return (
    5 *
    tc *
    (0.2969 * Math.sqrt(x) -
      0.126 * x -
      0.3516 * x * x +
      0.2843 * x * x * x -
      0.1015 * x * x * x * x)
  );
}

/**
 * Aerofoil ring in the ZY plane at a given spanwise station.
 * Wound lower-surface leading-edge → trailing edge, then upper surface back, which
 * is counter-clockwise seen from +X — the direction wing lofts advance in.
 */
export function airfoilRing(
  x: number,
  zLeadingEdge: number,
  y: number,
  chord: number,
  tc: number,
  samples = 18,
): THREE.Vector3[] {
  const us: number[] = [];
  for (let i = 0; i < samples; i++) {
    // Cosine spacing concentrates points at the leading edge where curvature is highest.
    us.push(0.5 * (1 - Math.cos((i / (samples - 1)) * Math.PI)));
  }
  const ring: THREE.Vector3[] = [];
  for (let i = 0; i < samples; i++) {
    const u = us[i];
    ring.push(new THREE.Vector3(x, y - thicknessAt(u, tc) * chord, zLeadingEdge - u * chord));
  }
  for (let i = samples - 2; i >= 1; i--) {
    const u = us[i];
    ring.push(new THREE.Vector3(x, y + thicknessAt(u, tc) * chord, zLeadingEdge - u * chord));
  }
  return ring;
}

/* ------------------------------------------------------------------ */
/* Part builders                                                       */
/* ------------------------------------------------------------------ */

/** Body of the aircraft, lofted tail-to-nose so the loft advances along +Z. */
export function fuselageGeometry(
  stations: FuselageStation[],
  segments = 30,
): THREE.BufferGeometry {
  const ordered = [...stations].sort((a, b) => a.z - b.z);
  const rings = ordered.map((s) =>
    superellipseRing(s.width, s.height, s.z, s.y ?? 0, s.exponent ?? 2, segments),
  );
  return buildLoft(rings);
}

/** Linear interpolation of the body profile at an arbitrary station. */
export function sampleFuselage(stations: FuselageStation[], z: number): FuselageStation {
  const ordered = [...stations].sort((a, b) => a.z - b.z);
  if (z <= ordered[0].z) return { ...ordered[0], z };
  const last = ordered[ordered.length - 1];
  if (z >= last.z) return { ...last, z };

  for (let i = 0; i < ordered.length - 1; i++) {
    const a = ordered[i];
    const b = ordered[i + 1];
    if (z >= a.z && z <= b.z) {
      const t = (z - a.z) / (b.z - a.z || 1);
      return {
        z,
        width: a.width + (b.width - a.width) * t,
        height: a.height + (b.height - a.height) * t,
        y: (a.y ?? 0) + ((b.y ?? 0) - (a.y ?? 0)) * t,
        exponent: (a.exponent ?? 2) + ((b.exponent ?? 2) - (a.exponent ?? 2)) * t,
      };
    }
  }
  return { ...last, z };
}

/**
 * The forward section of the body, rebuilt as a separate shell so the radome can
 * carry its own colour. Inflated a hair so it sits proud of the fuselage skin
 * instead of z-fighting with it.
 */
export function radomeGeometry(
  stations: FuselageStation[],
  length: number,
  segments = 24,
): THREE.BufferGeometry {
  const noseZ = Math.max(...stations.map((s) => s.z));
  const startZ = noseZ - length;
  const steps = 8;
  const rings: THREE.Vector3[][] = [];
  for (let i = 0; i <= steps; i++) {
    const z = startZ + (i / steps) * length;
    const s = sampleFuselage(stations, z);
    rings.push(
      superellipseRing(
        s.width * 1.004,
        s.height * 1.004,
        z,
        s.y ?? 0,
        s.exponent ?? 2,
        segments,
      ),
    );
  }
  return buildLoft(rings);
}

/** Circular tube from a radius profile — nacelles, booms, exhaust cans. */
export function tubeGeometry(
  profile: { z: number; r: number }[],
  segments = 24,
): THREE.BufferGeometry {
  return fuselageGeometry(
    profile.map((p) => ({ z: p.z, width: p.r * 2, height: p.r * 2 })),
    segments,
  );
}

// Spanwise stations, bunched at root and tip where the planform changes fastest.
const HALF_STATIONS = [0, 0.05, 0.1, 0.18, 0.28, 0.4, 0.52, 0.64, 0.76, 0.86, 0.93, 0.97, 1];

export interface Planform {
  chord: number;
  zLE: number;
  y: number;
}

/** Chord, leading-edge position and height at a fraction of the half-span. */
export function planformAt(cfg: SurfaceConfig, frac: number): Planform {
  const span = cfg.span;
  const dist = frac * span;
  const sweep = Math.tan(cfg.sweep * DEG);

  let zLE: number;
  let chord: number;

  if (cfg.kink && frac > cfg.kink.at) {
    // Cranked planform: the outboard panel picks up a second sweep angle.
    const kinkDist = cfg.kink.at * span;
    const kinkZ = cfg.root[2] - kinkDist * sweep;
    zLE = kinkZ - (dist - kinkDist) * Math.tan(cfg.kink.sweep * DEG);
    const kinkChord =
      cfg.rootChord + (cfg.tipChord - cfg.rootChord) * (cfg.kink.at * 0.65);
    const outboard = (frac - cfg.kink.at) / (1 - cfg.kink.at);
    chord = kinkChord + (cfg.tipChord - kinkChord) * outboard;
  } else {
    zLE = cfg.root[2] - dist * sweep;
    chord = cfg.rootChord + (cfg.tipChord - cfg.rootChord) * frac;
  }

  // Leading-edge root extension (LERX / strake): pull the root forward and blend
  // it out over the inboard quarter of the span.
  if (cfg.rootExtension && frac < 0.3) {
    const blend = (1 - frac / 0.3) ** 2;
    const extra = cfg.rootExtension * blend;
    zLE += extra;
    chord += extra;
  }

  const y = cfg.root[1] + dist * Math.tan((cfg.dihedral ?? 0) * DEG);
  return { chord, zLE, y };
}

/**
 * A lifting surface. Horizontal surfaces are built as one continuous loft from the
 * port tip through the root to the starboard tip, so the two halves share geometry
 * and no part is mirrored by a negative scale (which would invert its normals).
 *
 * Vertical surfaces are built as a single half and rotated into place by the caller.
 */
export function surfaceGeometry(cfg: SurfaceConfig): THREE.BufferGeometry {
  const tc = cfg.thickness ?? 0.06;
  const half = cfg.vertical === true;
  const fracs = half
    ? HALF_STATIONS
    : [...HALF_STATIONS.slice(1).reverse().map((f) => -f), ...HALF_STATIONS];

  const rings = fracs.map((f) => {
    const frac = Math.abs(f);
    const { chord, zLE, y } = planformAt(cfg, frac);
    const x = cfg.root[0] + f * cfg.span;
    // Tip chord tapers to a thin edge rather than a blunt cut.
    const tipRound = frac > 0.97 ? 0.35 : 1;
    return airfoilRing(x, zLE, y, chord * tipRound, tc);
  });

  return buildLoft(rings);
}

/** Rotor and propeller blades are the same builder with a slim, twisted planform. */
export function bladeGeometry(
  radius: number,
  chord: number,
  rootFraction = 0.12,
): THREE.BufferGeometry {
  return surfaceGeometry({
    root: [radius * rootFraction, 0, chord / 2],
    span: radius * (1 - rootFraction),
    rootChord: chord,
    tipChord: chord * 0.75,
    sweep: 1,
    thickness: 0.09,
    vertical: true,
  });
}

/**
 * Radius profile of an engine installation, measured along Z from the mount point.
 * Shared by the live viewer and the offline preview renderer so the two cannot drift.
 */
export function nacelleProfile(
  kind: "embedded" | "pod" | "turboprop",
  length: number,
  radius: number,
): { z: number; r: number }[] {
  if (kind === "embedded") {
    // Only the exhaust can and nozzle emerge from the rear fuselage.
    return [
      { z: -length, r: radius * 0.78 },
      { z: -length * 0.55, r: radius * 0.98 },
      { z: -length * 0.2, r: radius },
      { z: 0, r: radius * 0.95 },
    ];
  }
  if (kind === "turboprop") {
    return [
      { z: -length * 0.5, r: radius * 0.45 },
      { z: -length * 0.2, r: radius * 0.85 },
      { z: length * 0.15, r: radius },
      { z: length * 0.42, r: radius * 0.86 },
      { z: length * 0.5, r: radius * 0.5 },
    ];
  }
  // Podded turbofan: fat cowl at the inlet, tapering to the exhaust.
  return [
    { z: -length * 0.5, r: radius * 0.55 },
    { z: -length * 0.32, r: radius * 0.82 },
    { z: length * 0.1, r: radius },
    { z: length * 0.36, r: radius * 0.99 },
    { z: length * 0.5, r: radius * 0.88 },
  ];
}

/* ------------------------------------------------------------------ */
/* Paint                                                               */
/* ------------------------------------------------------------------ */

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Organic blotches for disruptive camouflage. Layered sines rather than a noise
 * texture, so the pattern is deterministic and costs nothing to evaluate.
 */
function blotch(x: number, y: number, z: number, scale: number) {
  const s = 1 / Math.max(scale, 0.001);
  return (
    Math.sin(x * s * 1.7 + Math.sin(z * s * 0.9) * 1.6) *
      Math.sin(z * s * 1.3 + Math.sin(y * s * 1.1) * 1.4) +
    0.55 * Math.sin((x + z) * s * 2.4 + 1.7) * Math.cos(z * s * 1.9)
  );
}

/**
 * Paints a lofted part by writing per-vertex colours.
 *
 * Doing it in the geometry rather than the shader means the offline preview renderer
 * sees exactly the same scheme as the browser, and the material stays a stock
 * MeshStandardMaterial with `vertexColors` on.
 */
export function applyLivery(
  geometry: THREE.BufferGeometry,
  livery: Livery,
): THREE.BufferGeometry {
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  if (!position || !normal) return geometry;

  const upper = new THREE.Color(livery.upper);
  const lower = new THREE.Color(livery.lower);
  const camo = livery.camo ? new THREE.Color(livery.camo.colour) : null;
  const scale = livery.camo?.scale ?? 3;

  const colours = new Float32Array(position.count * 3);
  const c = new THREE.Color();

  for (let i = 0; i < position.count; i++) {
    // Surface angle decides the paint: level-ish surfaces get the topside colour,
    // downward-facing ones the underside, with a soft wrap around the flanks.
    const ny = normal.getY(i);
    const t = smoothstep(-0.35, 0.3, ny);
    c.copy(lower).lerp(upper, t);

    if (camo) {
      const n = blotch(position.getX(i), position.getY(i), position.getZ(i), scale);
      // Only over the upper surfaces, and feathered rather than hard-edged.
      const mask = smoothstep(0.1, 0.45, n) * t;
      c.lerp(camo, mask);
    }

    colours[i * 3] = c.r;
    colours[i * 3 + 1] = c.g;
    colours[i * 3 + 2] = c.b;
  }

  geometry.setAttribute("color", new THREE.BufferAttribute(colours, 3));
  return geometry;
}

/* ------------------------------------------------------------------ */
/* Marking patches                                                     */
/* ------------------------------------------------------------------ */

/** Outward normal of a superellipse cross-section at angle t. */
function sectionPoint(
  a: number,
  b: number,
  k: number,
  t: number,
): { x: number; y: number } {
  const ct = Math.cos(t);
  const st = Math.sin(t);
  return {
    x: a * Math.sign(ct) * Math.abs(ct) ** k,
    y: b * Math.sign(st) * Math.abs(st) ** k,
  };
}

/**
 * A small patch of surface lying on the fuselage, carrying a marking texture.
 *
 * Roundels have to sit *on* a curved body — a flat disc would either float off the
 * flanks or sink into them — so the patch is sampled from the same superellipse
 * sections the fuselage itself is built from, then lifted a couple of centimetres
 * clear of the skin.
 */
export function fuselagePatch(
  stations: FuselageStation[],
  zCentre: number,
  angle: number,
  sizeZ: number,
  arcLength: number,
  offset = 0.02,
): THREE.BufferGeometry {
  const N = 10;
  const M = 10;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // How far the surface travels per radian at this angle. On a flattened section
  // that is nothing like the half-width, so deriving the sweep from the radius
  // would squash the marking — measure the tangent instead.
  const mid = sampleFuselage(stations, zCentre);
  const midA = Math.max(mid.width, 0.02) / 2;
  const midB = Math.max(mid.height, 0.02) / 2;
  const midK = 2 / (mid.exponent ?? 2);
  const step = 0.01;
  const q0 = sectionPoint(midA, midB, midK, angle - step);
  const q1 = sectionPoint(midA, midB, midK, angle + step);
  const perRadian = Math.hypot(q1.x - q0.x, q1.y - q0.y) / (2 * step) || midB;
  const arc = Math.min(Math.PI * 0.9, arcLength / perRadian);

  for (let i = 0; i <= N; i++) {
    const fz = i / N;
    const z = zCentre + (fz - 0.5) * sizeZ;
    const s = sampleFuselage(stations, z);
    const a = Math.max(s.width, 0.02) / 2;
    const b = Math.max(s.height, 0.02) / 2;
    const k = 2 / (s.exponent ?? 2);
    const yOff = s.y ?? 0;

    for (let j = 0; j <= M; j++) {
      const t = angle + ((j / M) - 0.5) * arc;
      const p = sectionPoint(a, b, k, t);
      // Outward normal from the local tangent.
      const d = 0.01;
      const p1 = sectionPoint(a, b, k, t + d);
      const tx = p1.x - p.x;
      const ty = p1.y - p.y;
      const len = Math.hypot(tx, ty) || 1;
      const nx = ty / len;
      const ny = -tx / len;

      positions.push(p.x + nx * offset, p.y + yOff + ny * offset, z);
      uvs.push(j / M, fz);
    }
  }

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < M; j++) {
      const a0 = i * (M + 1) + j;
      const b0 = a0 + 1;
      const c0 = (i + 1) * (M + 1) + j + 1;
      const d0 = (i + 1) * (M + 1) + j;
      indices.push(a0, b0, c0, a0, c0, d0);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * The same idea on a lifting surface: a patch following the aerofoil's upper or
 * lower skin, used for wing roundels and fin flashes.
 */
export function surfacePatch(
  cfg: SurfaceConfig,
  spanFrac: number,
  chordFrac: number,
  size: number,
  upper: boolean,
  offset = 0.015,
): THREE.BufferGeometry {
  const N = 8;
  const M = 8;
  const tc = cfg.thickness ?? 0.06;
  const sign = upper ? 1 : -1;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Laid out in metres about a fixed centre rather than in span and chord
  // fractions. Following the chord fraction would shear the patch along with the
  // sweep, turning a roundel into a parallelogram.
  const centre = planformAt(cfg, Math.abs(spanFrac));
  const xCentre = cfg.root[0] + spanFrac * cfg.span;
  const zCentre = centre.zLE - chordFrac * centre.chord;

  for (let i = 0; i <= N; i++) {
    const x = xCentre + ((i / N) - 0.5) * size;
    const f = Math.min(0.995, Math.abs((x - cfg.root[0]) / cfg.span));
    const plan = planformAt(cfg, f);

    for (let j = 0; j <= M; j++) {
      const z = zCentre + ((j / M) - 0.5) * size;
      // Where this point sits along the local chord, for the aerofoil thickness.
      const u = Math.min(0.97, Math.max(0.03, (plan.zLE - z) / Math.max(plan.chord, 0.1)));
      const y = plan.y + sign * (thicknessAt(u, tc) * plan.chord + offset);
      positions.push(x, y, z);
      uvs.push(j / M, i / N);
    }
  }

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < M; j++) {
      const a0 = i * (M + 1) + j;
      const b0 = a0 + 1;
      const c0 = (i + 1) * (M + 1) + j + 1;
      const d0 = (i + 1) * (M + 1) + j;
      indices.push(a0, b0, c0, a0, c0, d0);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** Rounded box used for intakes, gear bays, pylons and control-surface panels. */
export function slabGeometry(
  width: number,
  height: number,
  length: number,
  taper = 1,
): THREE.BufferGeometry {
  const rings = [
    superellipseRing(width * 0.85, height * 0.85, -length / 2, 0, 3, 16),
    superellipseRing(width, height, -length / 2 + length * 0.15, 0, 3, 16),
    superellipseRing(width * taper, height * taper, length / 2 - length * 0.1, 0, 3, 16),
    superellipseRing(width * taper * 0.9, height * taper * 0.9, length / 2, 0, 3, 16),
  ];
  return buildLoft(rings);
}

/** Canopy shell — a stretched dome sitting on the spine. */
export function canopyGeometry(
  length: number,
  width: number,
  height: number,
): THREE.BufferGeometry {
  const rings: THREE.Vector3[][] = [];
  const steps = 16;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Blunt at the windscreen, tapering into the spine at the back.
    const profile = Math.sin(Math.PI * (0.12 + t * 0.82));
    const z = -length / 2 + t * length;
    rings.push(superellipseRing(width * profile, height * profile * 2, z, 0, 2.4, 26));
  }
  return buildLoft(rings);
}

export { DEG };
