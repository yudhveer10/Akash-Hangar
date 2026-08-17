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
import { bases } from "../data/bases";
import { PRESETS } from "../components/three/environment/presets";
import {
  HEIGHT,
  RUNWAY,
  RUNWAY_END,
  RUNWAY_HALF,
  RUNWAY_START,
  runwayMarkings,
} from "../components/three/environment/layout";
import {
  terrainGeometry,
  terrainHeight,
  type TerrainSpec,
} from "../components/three/environment/terrain";
import { sceneFor, terrainFor } from "../components/three/environment/scene";
import { PHASE_ORDER } from "../components/three/environment/phases";
import {
  FLIGHT,
  PARK_Z,
  pitchAt,
  shotAt,
  T_END,
  yAt,
  zAt,
} from "../components/three/approach";
import { modelExtent } from "../lib/geometry";
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

/**
 * Stations carry facts about real places, so they are held to the same content rules
 * as the aircraft: sourced, complete, and pointing at a landscape that exists.
 */
function checkBases() {
  const ids = new Set<string>();

  for (const base of bases) {
    if (ids.has(base.id)) fail(`base ${base.id}: duplicate id`);
    ids.add(base.id);

    if (base.sources.length === 0) fail(`base ${base.id}: no sources cited`);
    else pass();

    if (!base.station || !base.short || !base.city || !base.state)
      fail(`base ${base.id}: station, short name, city and state are all required`);
    else pass();

    if (base.note.trim().length < 40) fail(`base ${base.id}: note is too thin to be useful`);
    else pass();

    if (!PRESETS[base.terrain]) fail(`base ${base.id}: no scene preset for "${base.terrain}"`);
    else pass();

    if (!PHASE_ORDER.includes(base.opensAt))
      fail(`base ${base.id}: opens at "${base.opensAt}", which is not a time of day`);
    else pass();

    // The character dials are multipliers and bearings; out of range they produce a
    // sky nobody intended rather than an error.
    const c = base.character;
    if (c) {
      const bad: string[] = [];
      if (c.sun !== undefined && (c.sun < 0 || c.sun >= 360)) bad.push("sun");
      if (c.clouds !== undefined && (c.clouds < 0 || c.clouds > 3)) bad.push("clouds");
      if (c.haze !== undefined && (c.haze < 0.2 || c.haze > 3)) bad.push("haze");
      if (c.green !== undefined && (c.green < 0 || c.green > 1)) bad.push("green");
      if (bad.length) fail(`base ${base.id}: character out of range — ${bad.join(", ")}`);
      else pass();
    }
  }

  for (const entry of aircraft) {
    if (entry.category !== "iaf") continue;
    if (!entry.homeBase) {
      fail(`${entry.slug}: no home base recorded`);
    } else if (!ids.has(entry.homeBase)) {
      fail(`${entry.slug}: home base "${entry.homeBase}" is not in data/bases.ts`);
    } else {
      pass();
    }
  }
}

/**
 * The airfield scenery has the same failure mode as the airframes and is even harder
 * to spot: a ground sheet wound the wrong way is lit from underneath and reads as a
 * dark hole, and terrain that creeps above zero anywhere along the strip either
 * swallows the runway or leaves it floating. Neither is a type error, so both are
 * checked here.
 */
function checkEnvironment() {
  // Every station grows its own ground from its own seed, so each has to be checked:
  // a landscape that is fine on one seed can land the field on a flat patch or a
  // hillside on another.
  const grounds: [string, ReturnType<typeof terrainFor>][] = [
    ...Object.entries(PRESETS).map(
      ([id, preset]) => [`landscape ${id}`, preset.terrain] as [string, typeof preset.terrain],
    ),
    ...bases.map(
      (base) => [`${base.id} (${base.terrain})`, terrainFor(base)] as [string, TerrainSpec],
    ),
  ];

  for (const [id, spec] of grounds) {
    // Coarse mesh: winding and finiteness do not depend on the resolution.
    const geometry = terrainGeometry(spec, 26, 48);
    const position = geometry.getAttribute("position");
    const normal = geometry.getAttribute("normal");

    let bad = 0;
    let flipped = 0;
    for (let i = 0; i < position.count; i++) {
      if (
        !Number.isFinite(position.getX(i)) ||
        !Number.isFinite(position.getY(i)) ||
        !Number.isFinite(position.getZ(i))
      ) {
        bad++;
      }
      if (normal.getY(i) <= 0) flipped++;
    }
    if (bad > 0) fail(`terrain ${id}: ${bad} non-finite vertices`);
    else pass();

    if (flipped > 0)
      fail(`terrain ${id}: ${flipped} vertices face downward — the sheet is inside-out`);
    else pass();

    // The runway and its shoulders must sit on dead-flat ground.
    const edge = RUNWAY_HALF + RUNWAY.shoulder;
    let worst = 0;
    for (let z = RUNWAY_START; z <= RUNWAY_END; z += 40) {
      for (const x of [-edge, -RUNWAY_HALF, 0, RUNWAY_HALF, edge]) {
        worst = Math.max(worst, Math.abs(terrainHeight(spec, x, z)));
      }
    }
    if (worst > 0.001)
      fail(`terrain ${id}: ground moves ${worst.toFixed(2)} m under the runway`);
    else pass();

    // So must the apron, or a hillside preset grows through the hangars.
    let apron = 0;
    for (let x = spec.pad.minX; x <= spec.pad.maxX; x += 25) {
      for (let z = spec.pad.minZ; z <= spec.pad.maxZ; z += 25) {
        apron = Math.max(apron, Math.abs(terrainHeight(spec, x, z)));
      }
    }
    if (apron > 0.001)
      fail(`terrain ${id}: ground moves ${apron.toFixed(2)} m under the apron`);
    else pass();

    // And relief has to actually arrive once clear of it, or the setting is a void.
    let relief = 0;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
      const r = spec.radius * 0.45;
      relief = Math.max(relief, terrainHeight(spec, Math.cos(a) * r, Math.sin(a) * r));
    }
    if (relief < spec.amplitude * 0.1)
      fail(`terrain ${id}: no relief within the disc (highest sample ${relief.toFixed(1)} m)`);
    else pass();
  }

  // No two stations may end up on the same ground, which is the whole point of
  // seeding them separately.
  const seeds = new Map<number, string>();
  for (const base of bases) {
    const { seed } = terrainFor(base);
    const clash = seeds.get(seed);
    if (clash) fail(`base ${base.id}: same terrain seed as ${clash}`);
    else pass();
    seeds.set(seed, base.id);
  }

  // Every station at every time of day has to resolve to a usable scene.
  for (const base of bases) {
    for (const phase of PHASE_ORDER) {
      const scene = sceneFor(base, phase);
      const colours = [
        scene.sky.zenith,
        scene.sky.horizon,
        scene.sun.colour,
        scene.fog.colour,
        scene.pavementTint,
      ];
      if (colours.some((c) => !/^#[0-9a-f]{6}$/i.test(c)))
        fail(`${base.id} at ${phase}: produced a colour that is not a hex triplet`);
      else if (!(scene.fog.density > 0) || !(scene.sun.intensity > 0))
        fail(`${base.id} at ${phase}: fog or sunlight resolved to nothing`);
      else pass();
    }
  }
}

/**
 * Two airfield surfaces at the same height do not pick a winner at this scale — the
 * depth buffer runs out to 4 km and resolves barely a centimetre at 300 m, so they
 * tear into stripes that crawl as the camera orbits. That shipped once, from the
 * ground plane and the runway slab both sitting at zero. Heights are now declared in
 * one place and checked for collisions here.
 */
function checkAirfield() {
  const levels = Object.entries(HEIGHT);
  for (let i = 0; i < levels.length; i++) {
    for (let j = i + 1; j < levels.length; j++) {
      if (Math.abs(levels[i][1] - levels[j][1]) < 0.005) {
        fail(
          `airfield: ${levels[i][0]} and ${levels[j][0]} are at the same height — they will z-fight`,
        );
      } else {
        pass();
      }
    }
  }

  // Markings are painted into the runway texture, so anything off the slab is
  // silently cropped rather than visibly wrong.
  for (const mark of runwayMarkings()) {
    const offSide = Math.abs(mark.x) + mark.w / 2 > RUNWAY_HALF + 1e-6;
    const offEnd =
      mark.z - mark.l / 2 < RUNWAY_START - 1e-6 || mark.z + mark.l / 2 > RUNWAY_END + 1e-6;
    if (offSide || offEnd) {
      fail(
        `airfield: a marking at [${mark.x}, ${mark.z}] falls outside the paved surface`,
      );
    } else {
      pass();
    }
  }

  if (RUNWAY.threshold <= RUNWAY_START || RUNWAY.threshold >= RUNWAY_END)
    fail("airfield: the threshold is not on the runway");
  else pass();
}

/**
 * The home page's landing sequence.
 *
 * An animation is the one thing here that cannot be checked by looking at a still, and
 * its failures are the loud kind: an aircraft sinking through the runway, a tail
 * scraping it, a camera ending up underground or losing the aircraft off the edge of
 * the frame. The path is pure maths in `components/three/approach.ts` precisely so it
 * can be flown here, a step at a time, with nothing rendered.
 */
function checkApproach() {
  // The same aircraft the home page features, and the same frame it is shown in.
  const entry = aircraft.find((a) => a.slug === "su-30mki") ?? aircraft[0];
  const extent = modelExtent(entry.geometry);
  const scale = extent / 22;
  const camera = new THREE.PerspectiveCamera(32, 3 / 2, 0.5, 1800);
  const offset = new THREE.Vector3();
  const look = new THREE.Vector3();
  const eye = new THREE.Vector3();
  const aim = new THREE.Vector3();
  const craft = new THREE.Vector3();

  let below = 0;
  let backwards = 0;
  let climbing = 0;
  let underground = 0;
  let offScreen = 0;
  let tooClose = 0;
  let pitchOut = 0;
  let previous = { z: -Infinity, y: Infinity };

  for (let t = 0; t <= T_END; t += 0.05) {
    const z = zAt(t);
    const y = yAt(z);
    const pitch = pitchAt(t, z);

    if (y < 0) below++;
    if (z < previous.z) backwards++;
    // The flare may not balloon: once it is coming down it keeps coming down.
    if (y > previous.y + 1e-6) climbing++;
    if (pitch < -0.01 || pitch > 12) pitchOut++;
    previous = { z, y };

    shotAt(t, offset, look);
    offset.multiplyScalar(scale);
    look.multiplyScalar(scale);
    craft.set(0, y, z);
    eye.copy(craft).add(offset);
    aim.copy(craft).add(look);

    // The camera stands on the airfield too, and the shoulder is barely below zero.
    if (eye.y < 1.5) underground++;
    if (eye.distanceTo(craft) < extent * 0.6) tooClose++;

    camera.position.copy(eye);
    camera.lookAt(aim);
    camera.updateMatrixWorld();
    const ndc = craft.clone().project(camera);
    // Margin for the damping, which lets the real camera trail the scripted one
    // through a change of shot.
    if (Math.abs(ndc.x) > 0.85 || Math.abs(ndc.y) > 0.85 || ndc.z > 1) offScreen++;
  }

  if (below) fail(`approach: aircraft is below the runway on ${below} samples`);
  else pass();
  if (backwards) fail(`approach: aircraft moves backwards on ${backwards} samples`);
  else pass();
  if (climbing) fail(`approach: the descent gains height again on ${climbing} samples`);
  else pass();
  if (pitchOut) fail(`approach: pitch leaves 0–12° on ${pitchOut} samples`);
  else pass();
  if (underground) fail(`approach: camera is at or below ground on ${underground} samples`);
  else pass();
  if (tooClose) fail(`approach: camera is inside the aircraft on ${tooClose} samples`);
  else pass();
  if (offScreen) fail(`approach: aircraft is out of frame on ${offScreen} samples`);
  else pass();

  // Starts airborne, on a normal-looking final rather than a strafing pass.
  const startHeight = yAt(zAt(0));
  if (startHeight < 15 || startHeight > 60)
    fail(`approach: starts at ${startHeight.toFixed(1)} m, which is not a final approach`);
  else pass();

  // Crosses the threshold at about the height an aircraft does.
  const crossing = yAt(RUNWAY.threshold);
  if (crossing < 8 || crossing > 25)
    fail(`approach: crosses the threshold at ${crossing.toFixed(1)} m`);
  else pass();

  // Touches down on the touchdown zone rather than on the piano keys or halfway down.
  const zoneFrom = RUNWAY.threshold + 150;
  const zoneTo = RUNWAY.threshold + 600;
  if (FLIGHT.touchdownZ < zoneFrom || FLIGHT.touchdownZ > zoneTo)
    fail(`approach: touches down at z=${FLIGHT.touchdownZ}, outside the touchdown zone`);
  else pass();

  // And stops on the pavement, with runway to spare.
  if (PARK_Z <= FLIGHT.touchdownZ || PARK_Z > RUNWAY_END - 300)
    fail(`approach: rolls out to z=${PARK_Z.toFixed(0)}, which is not on the runway`);
  else pass();

  // It has actually stopped by the time the visitor gets the controls.
  const creep = (zAt(T_END) - zAt(T_END - 0.1)) / 0.1;
  if (creep > 0.5) fail(`approach: still rolling at ${creep.toFixed(2)} m/s when it parks`);
  else pass();

  // And it is sitting level, not parked nose-high.
  if (pitchAt(T_END, zAt(T_END)) > 0.05) fail("approach: parks nose-high");
  else pass();

  // No tailstrike: everything behind the main wheels has to clear the runway at the
  // steepest attitude the sequence asks for.
  const g = entry.geometry;
  const legs =
    g.kind === "fixedWing" ? g.gear.main : g.gear.type === "wheels" ? g.gear.main : [];
  if (legs.length > 0) {
    const pivotZ = legs.reduce((sum, leg) => sum + leg.position[2], 0) / legs.length;
    const lift = -Math.min(
      ...legs.map((leg) => leg.position[1] - leg.length - leg.wheelRadius),
    );
    const theta = FLIGHT.flarePitch * (Math.PI / 180);
    let strike = 0;

    for (const station of g.fuselage) {
      if (station.z >= pivotZ) continue;
      const bottom = (station.y ?? 0) - station.height / 2 + lift;
      const arm = pivotZ - station.z;
      if (bottom * Math.cos(theta) - arm * Math.sin(theta) < 0.05) strike++;
    }

    if (strike)
      fail(
        `approach: ${entry.slug} strikes its tail at ${FLIGHT.flarePitch}° on ${strike} stations`,
      );
    else pass();
  }
}

console.log(
  `Validating ${aircraft.length} airframes, ${bases.length} stations and ${Object.keys(PRESETS).length} settings\n`,
);

checkAirfield();

checkBases();
checkEnvironment();
checkApproach();

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
