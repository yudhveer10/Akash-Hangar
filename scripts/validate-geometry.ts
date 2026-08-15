/**
 * Geometry sanity check for the procedural airframes.
 *
 * The loft builder relies on rings being wound counter-clockwise as seen from the
 * direction the loft advances in. Get that backwards and the mesh renders inside-out
 * — which is easy to miss on a dark page and impossible to catch with a type check.
 * A closed mesh with correct outward winding has positive signed volume, so that is
 * what this asserts, along with scale against each aircraft's published dimensions.
 *
 * Run with: npm run validate
 */

import * as THREE from "three";
import { aircraft } from "../data/aircraft";
import {
  fuselageGeometry,
  surfaceGeometry,
  canopyGeometry,
  bladeGeometry,
} from "../components/three/geometry/loft";
import type { Aircraft, SurfaceConfig } from "../lib/types";

let failures = 0;
let checks = 0;

function fail(message: string) {
  failures++;
  console.error(`  ✗ ${message}`);
}

function pass() {
  checks++;
}

/** Sum of tetrahedron volumes. Positive iff triangles face outward. */
function signedVolume(geometry: THREE.BufferGeometry): number {
  const pos = geometry.getAttribute("position");
  const index = geometry.getIndex();
  if (!index) return NaN;

  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const cross = new THREE.Vector3();
  let total = 0;

  for (let i = 0; i < index.count; i += 3) {
    a.fromBufferAttribute(pos, index.getX(i));
    b.fromBufferAttribute(pos, index.getX(i + 1));
    c.fromBufferAttribute(pos, index.getX(i + 2));
    cross.crossVectors(b, c);
    total += a.dot(cross) / 6;
  }
  return total;
}

function checkGeometry(label: string, geometry: THREE.BufferGeometry, closed = true) {
  const pos = geometry.getAttribute("position");

  for (let i = 0; i < pos.count * 3; i++) {
    if (!Number.isFinite(pos.array[i])) {
      fail(`${label}: non-finite vertex position at index ${i}`);
      return;
    }
  }

  const index = geometry.getIndex();
  if (!index || index.count === 0) {
    fail(`${label}: no triangles`);
    return;
  }

  if (closed) {
    const volume = signedVolume(geometry);
    if (!Number.isFinite(volume)) {
      fail(`${label}: signed volume is not finite`);
      return;
    }
    if (volume <= 0) {
      fail(
        `${label}: signed volume ${volume.toFixed(3)} m³ is not positive — the mesh is wound inside-out`,
      );
      return;
    }
  }

  pass();
}

/** Pulls the leading number out of a spec string like "21.94 m". */
function metres(spec: string): number | null {
  const match = spec.match(/([\d.]+)\s*m/);
  return match ? Number.parseFloat(match[1]) : null;
}

function checkScale(entry: Aircraft) {
  const g = entry.geometry;
  const zs = g.fuselage.map((s) => s.z);
  if (g.kind === "rotorcraft" && g.boom) zs.push(...g.boom.map((s) => s.z));
  const modelLength = Math.max(...zs) - Math.min(...zs);

  const publishedLength = metres(entry.specs.length);
  if (publishedLength) {
    // Rotorcraft quote length over rotors, and fighters quote the pitot boom, so a
    // generous band still catches a genuine order-of-magnitude slip.
    const ratio = modelLength / publishedLength;
    const floor = g.kind === "rotorcraft" ? 0.5 : 0.85;
    if (ratio < floor || ratio > 1.1) {
      fail(
        `${entry.slug}: fuselage spans ${modelLength.toFixed(1)} m against a published length of ${publishedLength} m (ratio ${ratio.toFixed(2)})`,
      );
    } else {
      pass();
    }
  }

  if (g.kind === "fixedWing") {
    const publishedSpan = metres(entry.specs.wingspan);
    const modelSpan = g.wing.span * 2;
    if (publishedSpan) {
      const ratio = modelSpan / publishedSpan;
      if (ratio < 0.95 || ratio > 1.05) {
        fail(
          `${entry.slug}: wingspan ${modelSpan.toFixed(1)} m against a published ${publishedSpan} m (ratio ${ratio.toFixed(2)})`,
        );
      } else {
        pass();
      }
    }
  } else {
    const publishedDiameter = metres(entry.specs.wingspan);
    const main = g.rotors.find((r) => !r.vertical);
    if (publishedDiameter && main) {
      const ratio = (main.radius * 2) / publishedDiameter;
      if (ratio < 0.95 || ratio > 1.05) {
        fail(
          `${entry.slug}: main rotor diameter ${(main.radius * 2).toFixed(1)} m against a published ${publishedDiameter} m`,
        );
      } else {
        pass();
      }
    }
  }
}

/**
 * Annotation markers are hand-placed coordinates, so nothing stops one being typed
 * far off the airframe where it would hover in empty space. This bounds them against
 * a generous box around the model.
 */
function checkAnnotations(entry: Aircraft) {
  if (!entry.annotations?.length) return;
  const g = entry.geometry;

  const zs = g.fuselage.map((s) => s.z);
  if (g.kind === "rotorcraft" && g.boom) zs.push(...g.boom.map((s) => s.z));

  let halfSpan = Math.max(...g.fuselage.map((s) => s.width / 2));
  let top = Math.max(...g.fuselage.map((s) => (s.y ?? 0) + s.height / 2));
  let bottom = Math.min(...g.fuselage.map((s) => (s.y ?? 0) - s.height / 2));

  if (g.kind === "fixedWing") {
    halfSpan = Math.max(halfSpan, g.wing.span);
    for (const fin of g.fins) top = Math.max(top, fin.root[1] + fin.span);
    bottom = Math.min(bottom, ...g.gear.main.map((l) => l.position[1] - l.length));
  } else {
    for (const r of g.rotors) {
      halfSpan = Math.max(halfSpan, r.vertical ? Math.abs(r.hub[0]) : r.radius);
      top = Math.max(top, r.hub[1] + r.radius * 0.2);
    }
    if (g.stubWings) halfSpan = Math.max(halfSpan, g.stubWings.span);
    if (g.gear.type === "wheels") {
      bottom = Math.min(bottom, ...g.gear.main.map((l) => l.position[1] - l.length));
    }
  }

  const pad = 0.2;
  const zMin = Math.min(...zs);
  const zMax = Math.max(...zs);
  const slackZ = (zMax - zMin) * pad;
  const slackY = (top - bottom) * pad;
  const slackX = halfSpan * pad;

  for (const note of entry.annotations) {
    const [x, y, z] = note.position;
    const off =
      Math.abs(x) > halfSpan + slackX ||
      y > top + slackY ||
      y < bottom - slackY ||
      z > zMax + slackZ ||
      z < zMin - slackZ;
    if (off) {
      fail(
        `${entry.slug} annotation "${note.label}": position [${x}, ${y}, ${z}] falls outside the airframe`,
      );
    } else {
      pass();
    }
  }

  const labels = entry.annotations.map((a) => a.label);
  if (new Set(labels).size !== labels.length)
    fail(`${entry.slug}: duplicate annotation labels`);
}

function checkSurface(slug: string, name: string, cfg: SurfaceConfig) {
  if (cfg.span <= 0) fail(`${slug} ${name}: span must be positive`);
  if (cfg.rootChord <= 0 || cfg.tipChord <= 0)
    fail(`${slug} ${name}: chords must be positive`);
  checkGeometry(`${slug} ${name}`, surfaceGeometry(cfg));
}

console.log(`Validating ${aircraft.length} airframes\n`);

for (const entry of aircraft) {
  const g = entry.geometry;

  // Fuselage stations must be strictly ordered, or the loft doubles back on itself.
  const zs = g.fuselage.map((s) => s.z);
  const sorted = [...zs].sort((a, b) => a - b);
  if (new Set(zs).size !== zs.length) fail(`${entry.slug}: duplicate fuselage station z`);
  if (zs.join() !== sorted.join())
    fail(`${entry.slug}: fuselage stations are not in increasing z order`);

  checkGeometry(`${entry.slug} fuselage`, fuselageGeometry(g.fuselage, g.segments ?? 24));
  checkScale(entry);
  checkAnnotations(entry);

  if (g.canopy) {
    checkGeometry(
      `${entry.slug} canopy`,
      canopyGeometry(g.canopy.length, g.canopy.width, g.canopy.height),
    );
  }

  if (g.kind === "fixedWing") {
    checkSurface(entry.slug, "wing", g.wing);
    if (g.canard) checkSurface(entry.slug, "canard", g.canard);
    if (g.stabilator) checkSurface(entry.slug, "stabilator", g.stabilator);
    g.fins.forEach((fin, i) =>
      checkSurface(entry.slug, `fin ${i}`, { ...fin, root: [0, 0, fin.root[2]], vertical: true }),
    );
    g.ventralFins?.forEach((fin, i) =>
      checkSurface(entry.slug, `ventral fin ${i}`, {
        ...fin,
        root: [0, 0, fin.root[2]],
        vertical: true,
      }),
    );
    if (g.engines.length === 0) fail(`${entry.slug}: no engines`);
  } else {
    if (g.boom) checkGeometry(`${entry.slug} boom`, fuselageGeometry(g.boom, 16));
    if (g.stubWings) checkSurface(entry.slug, "stub wings", g.stubWings);
    if (g.stabilator) checkSurface(entry.slug, "stabilator", g.stabilator);
    g.fins.forEach((fin, i) =>
      checkSurface(entry.slug, `fin ${i}`, { ...fin, root: [0, 0, fin.root[2]], vertical: true }),
    );
    for (const rotor of g.rotors) {
      if (rotor.blades < 2) fail(`${entry.slug}: rotor needs at least two blades`);
      checkGeometry(`${entry.slug} rotor blade`, bladeGeometry(rotor.radius, rotor.chord));
    }
  }

  // Content rules from CLAUDE.md, enforced rather than trusted.
  if (entry.sources.length === 0) fail(`${entry.slug}: no sources cited`);
  if (entry.description.length < 2) fail(`${entry.slug}: description needs 2+ paragraphs`);
  if (entry.animations.length === 0) fail(`${entry.slug}: no animations declared`);
  if (g.kind === "rotorcraft" && !entry.animations.includes("rotors"))
    fail(`${entry.slug}: a rotorcraft should offer the rotor animation`);
}

console.log(`\n${checks} checks passed, ${failures} failed`);
if (failures > 0) process.exit(1);
