/**
 * Offline preview renderer.
 *
 * The geometry validator proves the meshes are closed, finite and wound the right way
 * round, but it cannot tell you whether a Su-30 actually looks like a Su-30. This
 * assembles each airframe exactly as the React components do, projects it with a
 * z-buffered software rasteriser, and writes a contact sheet you can just look at —
 * no browser or GPU involved.
 *
 * Run with: npm run preview
 */

import fs from "node:fs";
import path from "node:path";
import * as THREE from "three";
import { aircraft } from "../data/aircraft";
import {
  applyLivery,
  bladeGeometry,
  canopyGeometry,
  DEG,
  fuselageGeometry,
  fuselagePatch,
  nacelleProfile,
  planformAt,
  slabGeometry,
  surfaceGeometry,
  surfacePatch,
  tubeGeometry,
} from "../components/three/geometry/loft";
import type {
  Aircraft,
  GearLeg,
  Livery,
  StoreConfig,
  SurfaceConfig,
} from "../lib/types";
import { encodePNG } from "./png";

const STORE_LENGTH: Record<StoreConfig["kind"], number> = {
  missile: 3.2,
  tank: 4.6,
  bomb: 2.6,
  rail: 2.4,
};

const STORE_RADIUS: Record<StoreConfig["kind"], number> = {
  missile: 0.036,
  tank: 0.11,
  bomb: 0.09,
  rail: 0.036,
};

interface Part {
  geometry: THREE.BufferGeometry;
  matrix: THREE.Matrix4;
  colour: THREE.Color;
}

let TILE_W = 460;
let TILE_H = 320;
const COLS = 4;

/* ------------------------------------------------------------------ */
/* Assembly — mirrors the transforms in FixedWing.tsx / Rotorcraft.tsx  */
/* ------------------------------------------------------------------ */

function identity() {
  return new THREE.Matrix4();
}

function translation(x: number, y: number, z: number) {
  return new THREE.Matrix4().makeTranslation(x, y, z);
}

function verticalSurfacePart(
  cfg: SurfaceConfig,
  livery: Livery,
  ventral: boolean,
): Part {
  const geometry = applyLivery(
    surfaceGeometry({ ...cfg, root: [0, 0, cfg.root[2]], vertical: true }),
    livery,
  );
  const side = cfg.root[0] >= 0 ? 1 : -1;
  const cant = Math.abs(cfg.cant ?? 0) * side;
  const rotZ = (ventral ? -90 + cant : 90 - cant) * DEG;
  // VerticalSurface nets out to: rotate about Z, then offset in X and Y.
  const matrix = translation(cfg.root[0], cfg.root[1], 0).multiply(
    new THREE.Matrix4().makeRotationZ(rotZ),
  );
  return { geometry, matrix, colour: new THREE.Color(livery.upper) };
}

function gearParts(leg: GearLeg): Part[] {
  const parts: Part[] = [];
  const strut = new THREE.CylinderGeometry(
    leg.wheelRadius * 0.22,
    leg.wheelRadius * 0.27,
    leg.length,
    10,
  );
  const metal = new THREE.Color("#8d949e");
  parts.push({
    geometry: strut,
    matrix: translation(leg.position[0], leg.position[1] - leg.length / 2, leg.position[2]),
    colour: metal,
  });

  const wheels = leg.wheels ?? 1;
  for (let i = 0; i < wheels; i++) {
    const offset = wheels === 1 ? 0 : (i - (wheels - 1) / 2) * leg.wheelRadius * 2.3;
    const tyre = new THREE.CylinderGeometry(
      leg.wheelRadius,
      leg.wheelRadius,
      leg.wheelRadius * 0.62,
      16,
    );
    parts.push({
      geometry: tyre,
      matrix: translation(
        leg.position[0],
        leg.position[1] - leg.length,
        leg.position[2] + offset,
      ).multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 2)),
      colour: new THREE.Color("#15171c"),
    });
  }
  return parts;
}

/** Pylons and stores, matching the transforms in details.tsx `Stores`. */
function storeParts(
  wing: SurfaceConfig,
  stores: StoreConfig[],
  body: THREE.Color,
): Part[] {
  const parts: Part[] = [];
  for (const store of stores) {
    for (const side of [1, -1]) {
      const plan = planformAt(wing, store.frac);
      const x = wing.root[0] + side * store.frac * wing.span;
      const length = store.length ?? STORE_LENGTH[store.kind];
      const z = plan.zLE - plan.chord * 0.35;
      const drop = store.tip ? 0 : Math.max(0.34, plan.chord * 0.1);

      if (!store.tip) {
        parts.push({
          geometry: new THREE.BoxGeometry(0.11, drop, plan.chord * 0.42),
          matrix: translation(x, plan.y - drop / 2, z),
          colour: body,
        });
      }
      const r = length * STORE_RADIUS[store.kind];
      parts.push({
        geometry: new THREE.CapsuleGeometry(r, length * 0.74, 4, 12),
        matrix: translation(
          x,
          plan.y - (store.tip ? 0 : drop + length * 0.045),
          z,
        ).multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2)),
        colour: new THREE.Color(store.kind === "bomb" ? "#5b6350" : "#b8bdc4"),
      });
    }
  }
  return parts;
}

/**
 * Roundel patches, flat-coloured. The rasteriser has no textures, so these stand in
 * for the real markings purely to confirm they sit on the skin and are oriented the
 * right way — a roundel floating off the flank would otherwise go unnoticed.
 */
function markingParts(entry: Aircraft): Part[] {
  const g = entry.geometry;
  const size = entry.geometry.markings?.roundel;
  if (!size) return [];

  const saffron = new THREE.Color("#ff9933");
  const parts: Part[] = [];

  const zs = g.fuselage.map((s) => s.z);
  const zMin = Math.min(...zs);
  const zMax = Math.max(...zs);
  const z = zMin + (zMax - zMin) * 0.34;
  for (const angle of [0, Math.PI]) {
    parts.push({
      geometry: fuselagePatch(g.fuselage, z, angle, size, size, 0.025),
      matrix: identity(),
      colour: saffron,
    });
  }

  if (g.kind === "fixedWing") {
    for (const side of [1, -1]) {
      for (const upper of [true, false]) {
        parts.push({
          geometry: surfacePatch(g.wing, side * 0.55, 0.52, size, upper, 0.02),
          matrix: identity(),
          colour: saffron,
        });
      }
    }
  }

  return parts;
}

function collect(entry: Aircraft): Part[] {
  const g = entry.geometry;
  const livery = g.livery;
  const body = new THREE.Color(livery.upper);
  const parts: Part[] = [];

  parts.push({
    geometry: applyLivery(fuselageGeometry(g.fuselage, g.segments ?? 24), livery),
    matrix: identity(),
    colour: body,
  });

  if (g.canopy) {
    parts.push({
      geometry: canopyGeometry(g.canopy.length, g.canopy.width, g.canopy.height),
      matrix: translation(0, g.canopy.y, g.canopy.z),
      colour: new THREE.Color("#4a7d9e"),
    });
  }

  for (const engine of g.engines) {
    parts.push({
      geometry: applyLivery(
        tubeGeometry(nacelleProfile(engine.kind, engine.length, engine.radius)),
        engine.kind === "embedded"
          ? { ...livery, upper: "#5c6068", lower: "#4a4e55", camo: undefined }
          : livery,
      ),
      matrix: translation(...engine.position),
      colour: body,
    });
    if (engine.kind !== "turboprop") {
      // Nozzle petals, matching details.tsx `Nozzle`.
      const nr = engine.radius * 0.82;
      const exitZ = engine.kind === "embedded" ? -engine.length : engine.length * 0.5;
      const petals = 16;
      for (let i = 0; i < petals; i++) {
        const angle = (i / petals) * Math.PI * 2;
        parts.push({
          geometry: new THREE.BoxGeometry(
            ((Math.PI * 2 * nr) / petals) * 0.9,
            nr * 0.06,
            nr * 1.15,
          ),
          matrix: translation(engine.position[0], engine.position[1], engine.position[2] + exitZ)
            .multiply(new THREE.Matrix4().makeRotationZ(angle))
            .multiply(new THREE.Matrix4().makeTranslation(0, nr * 0.94, -nr * 0.55))
            .multiply(new THREE.Matrix4().makeRotationX(-9 * DEG)),
          colour: new THREE.Color("#4a453f"),
        });
      }
    }

    if (engine.propeller) {
      const blade = bladeGeometry(engine.propeller.radius, engine.propeller.radius * 0.16);
      for (let i = 0; i < engine.propeller.blades; i++) {
        const angle = (i / engine.propeller.blades) * Math.PI * 2;
        parts.push({
          geometry: blade,
          matrix: translation(
            engine.position[0],
            engine.position[1],
            engine.position[2] + engine.length * 0.52,
          )
            .multiply(new THREE.Matrix4().makeRotationZ(angle))
            .multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2 + 0.5)),
          colour: new THREE.Color("#1d1f24"),
        });
      }
    }
  }

  if (g.kind === "fixedWing") {
    parts.push({
      geometry: applyLivery(surfaceGeometry(g.wing), livery),
      matrix: identity(),
      colour: body,
    });
    if (g.canard)
      parts.push({
        geometry: applyLivery(surfaceGeometry(g.canard), livery),
        matrix: identity(),
        colour: body,
      });
    if (g.stabilator)
      parts.push({
        geometry: applyLivery(surfaceGeometry(g.stabilator), livery),
        matrix: identity(),
        colour: body,
      });
    for (const fin of g.fins) parts.push(verticalSurfacePart(fin, livery, false));
    for (const fin of g.ventralFins ?? [])
      parts.push(verticalSurfacePart(fin, livery, true));

    for (const intake of g.intakes ?? []) {
      for (const side of intake.mirrored ? [1, -1] : [1]) {
        parts.push({
          geometry: applyLivery(
            slabGeometry(intake.width, intake.height, intake.length, 0.92),
            livery,
          ),
          matrix: translation(
            intake.position[0] * side,
            intake.position[1],
            intake.position[2],
          ),
          colour: body,
        });
      }
    }

    if (g.stores) parts.push(...storeParts(g.wing, g.stores, body));
    parts.push(...markingParts(entry));

    const metal = new THREE.Color("#9aa2ac");
    if (g.noseBoom) {
      const noseZ = Math.max(...g.fuselage.map((s) => s.z));
      parts.push({
        geometry: new THREE.CylinderGeometry(
          g.noseBoom * 0.018,
          g.noseBoom * 0.032,
          g.noseBoom,
          8,
        ),
        matrix: translation(0, 0, noseZ + g.noseBoom / 2).multiply(
          new THREE.Matrix4().makeRotationX(Math.PI / 2),
        ),
        colour: metal,
      });
    }
    if (g.probe) {
      const [px, py, pz] = g.probe.position;
      const len = g.probe.length;
      parts.push({
        geometry: new THREE.CylinderGeometry(len * 0.035, len * 0.05, len * 0.9, 10),
        matrix: translation(px, py, pz + len * 0.45).multiply(
          new THREE.Matrix4().makeRotationX(Math.PI / 2),
        ),
        colour: metal,
      });
    }

    parts.push(...gearParts(g.gear.nose));
    for (const leg of g.gear.main) parts.push(...gearParts(leg));
  } else {
    if (g.boom)
      parts.push({
        geometry: applyLivery(fuselageGeometry(g.boom, 16), livery),
        matrix: identity(),
        colour: body,
      });
    if (g.stubWings)
      parts.push({
        geometry: applyLivery(surfaceGeometry(g.stubWings), livery),
        matrix: identity(),
        colour: body,
      });
    if (g.stabilator)
      parts.push({
        geometry: applyLivery(surfaceGeometry(g.stabilator), livery),
        matrix: identity(),
        colour: body,
      });
    for (const fin of g.fins) parts.push(verticalSurfacePart(fin, livery, false));
    parts.push(...markingParts(entry));
    if (g.stubWings && g.stores) parts.push(...storeParts(g.stubWings, g.stores, body));

    for (const rotor of g.rotors) {
      const blade = bladeGeometry(rotor.radius, rotor.chord);
      const coning = (rotor.coning ?? 3) * DEG;
      for (let i = 0; i < rotor.blades; i++) {
        const angle = (i / rotor.blades) * Math.PI * 2;
        const matrix = translation(...rotor.hub)
          .multiply(new THREE.Matrix4().makeRotationZ(rotor.vertical ? Math.PI / 2 : 0))
          .multiply(new THREE.Matrix4().makeRotationY(angle))
          .multiply(new THREE.Matrix4().makeRotationZ(coning));
        parts.push({ geometry: blade, matrix, colour: new THREE.Color("#22252b") });
      }
    }

    if (g.gear.type === "wheels") {
      if (g.gear.nose) parts.push(...gearParts(g.gear.nose));
      for (const leg of g.gear.main) parts.push(...gearParts(leg));
      if (g.gear.tail) parts.push(...gearParts(g.gear.tail));
    }
  }

  return parts;
}

/* ------------------------------------------------------------------ */
/* Rasteriser                                                          */
/* ------------------------------------------------------------------ */

interface Tri {
  x: [number, number, number];
  y: [number, number, number];
  z: [number, number, number];
  shade: number;
  colour: THREE.Color;
}

const LIGHT = new THREE.Vector3(-0.35, 0.66, 0.66).normalize();

function buildTriangles(parts: Part[], view: THREE.Matrix4) {
  const tris: Tri[] = [];
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const ab = new THREE.Vector3();
  const ac = new THREE.Vector3();
  const normal = new THREE.Vector3();

  const vertexColour = new THREE.Color();

  for (const part of parts) {
    const geometry = part.geometry;
    const pos = geometry.getAttribute("position");
    const col = geometry.getAttribute("color");
    const index = geometry.getIndex();
    const toView = view.clone().multiply(part.matrix);
    const count = index ? index.count : pos.count;

    for (let i = 0; i < count; i += 3) {
      const i0 = index ? index.getX(i) : i;
      const i1 = index ? index.getX(i + 1) : i + 1;
      const i2 = index ? index.getX(i + 2) : i + 2;
      a.fromBufferAttribute(pos, i0).applyMatrix4(toView);
      b.fromBufferAttribute(pos, i1).applyMatrix4(toView);
      c.fromBufferAttribute(pos, i2).applyMatrix4(toView);

      ab.subVectors(b, a);
      ac.subVectors(c, a);
      normal.crossVectors(ab, ac);
      if (normal.lengthSq() === 0) continue;
      normal.normalize();
      // The camera looks down -Z in view space, so visible faces point at +Z.
      // Culling here doubles as a winding check: an inverted part renders hollow.
      if (normal.z <= 0) continue;

      const shade = 0.22 + 0.78 * Math.max(0, normal.dot(LIGHT));

      // Painted parts carry their scheme in a vertex colour attribute; flat-shade
      // each triangle from the average of its three corners.
      let colour = part.colour;
      if (col) {
        vertexColour.setRGB(
          (col.getX(i0) + col.getX(i1) + col.getX(i2)) / 3,
          (col.getY(i0) + col.getY(i1) + col.getY(i2)) / 3,
          (col.getZ(i0) + col.getZ(i1) + col.getZ(i2)) / 3,
        );
        colour = vertexColour.clone();
      }

      tris.push({
        x: [a.x, b.x, c.x],
        y: [a.y, b.y, c.y],
        z: [a.z, b.z, c.z],
        shade,
        colour,
      });
    }
  }
  return tris;
}

function renderTile(
  parts: Part[],
  sheet: Uint8Array,
  sheetW: number,
  originX: number,
  originY: number,
) {
  // Three-quarter view from front, right and above.
  const direction = new THREE.Vector3(0.68, 0.38, 0.78).normalize();

  const bounds = new THREE.Box3();
  const vec = new THREE.Vector3();
  for (const part of parts) {
    const pos = part.geometry.getAttribute("position");
    for (let i = 0; i < pos.count; i++) {
      vec.fromBufferAttribute(pos, i).applyMatrix4(part.matrix);
      bounds.expandByPoint(vec);
    }
  }
  const centre = bounds.getCenter(new THREE.Vector3());
  const radius = bounds.getSize(new THREE.Vector3()).length();

  const eye = centre.clone().addScaledVector(direction, radius * 2);
  const camera = new THREE.Matrix4().lookAt(eye, centre, new THREE.Vector3(0, 1, 0));
  camera.setPosition(eye);
  const view = camera.invert();

  const tris = buildTriangles(parts, view);
  if (tris.length === 0) return;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const t of tris) {
    for (let k = 0; k < 3; k++) {
      minX = Math.min(minX, t.x[k]);
      maxX = Math.max(maxX, t.x[k]);
      minY = Math.min(minY, t.y[k]);
      maxY = Math.max(maxY, t.y[k]);
    }
  }

  const margin = 0.92;
  const scale = Math.min(
    (TILE_W * margin) / (maxX - minX),
    (TILE_H * margin) / (maxY - minY),
  );
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  const depth = new Float32Array(TILE_W * TILE_H).fill(-Infinity);

  for (const t of tris) {
    const sx = t.x.map((v) => TILE_W / 2 + (v - cx) * scale);
    const sy = t.y.map((v) => TILE_H / 2 - (v - cy) * scale);

    const area = (sx[1] - sx[0]) * (sy[2] - sy[0]) - (sx[2] - sx[0]) * (sy[1] - sy[0]);
    if (area === 0) continue;
    const sign = Math.sign(area);

    const x0 = Math.max(0, Math.floor(Math.min(...sx)));
    const x1 = Math.min(TILE_W - 1, Math.ceil(Math.max(...sx)));
    const y0 = Math.max(0, Math.floor(Math.min(...sy)));
    const y1 = Math.min(TILE_H - 1, Math.ceil(Math.max(...sy)));

    for (let py = y0; py <= y1; py++) {
      for (let px = x0; px <= x1; px++) {
        const cxp = px + 0.5;
        const cyp = py + 0.5;
        const w0 =
          ((sx[1] - sx[0]) * (cyp - sy[0]) - (cxp - sx[0]) * (sy[1] - sy[0])) * sign;
        const w1 =
          ((sx[2] - sx[1]) * (cyp - sy[1]) - (cxp - sx[1]) * (sy[2] - sy[1])) * sign;
        const w2 =
          ((sx[0] - sx[2]) * (cyp - sy[2]) - (cxp - sx[2]) * (sy[0] - sy[2])) * sign;
        if (w0 < 0 || w1 < 0 || w2 < 0) continue;

        const total = Math.abs(area);
        const l0 = w1 / total;
        const l1 = w2 / total;
        const l2 = w0 / total;
        const z = t.z[0] * l0 + t.z[1] * l1 + t.z[2] * l2;

        const di = py * TILE_W + px;
        if (z <= depth[di]) continue;
        depth[di] = z;

        const si = ((originY + py) * sheetW + originX + px) * 3;
        sheet[si] = Math.min(255, t.colour.r * 255 * t.shade);
        sheet[si + 1] = Math.min(255, t.colour.g * 255 * t.shade);
        sheet[si + 2] = Math.min(255, t.colour.b * 255 * t.shade);
      }
    }
  }
}

/* ------------------------------------------------------------------ */

const outDir = path.join(process.cwd(), ".preview");
fs.mkdirSync(outDir, { recursive: true });

// Background tone matching the site's viewport, so the render reads the same way.
function fill(sheet: Uint8Array, count: number) {
  for (let i = 0; i < count; i++) {
    sheet[i * 3] = 9;
    sheet[i * 3 + 1] = 14;
    sheet[i * 3 + 2] = 22;
  }
}

const wanted = process.argv[2];

if (wanted) {
  // Single aircraft, large — for checking detail parts rather than overall shape.
  const entry = aircraft.find((a) => a.slug === wanted || a.shortName === wanted);
  if (!entry) {
    console.error(`No aircraft matching "${wanted}". Available slugs:`);
    for (const a of aircraft) console.error(`  ${a.slug}`);
    process.exit(1);
  }
  TILE_W = 1500;
  TILE_H = 1000;
  const sheet = new Uint8Array(TILE_W * TILE_H * 3);
  fill(sheet, TILE_W * TILE_H);
  renderTile(collect(entry), sheet, TILE_W, 0, 0);

  const outFile = path.join(outDir, `${entry.slug}.png`);
  fs.writeFileSync(outFile, encodePNG(TILE_W, TILE_H, sheet));
  console.log(`Wrote ${outFile} (${TILE_W}×${TILE_H}) — ${entry.name}`);
} else {
  const rows = Math.ceil(aircraft.length / COLS);
  const sheetW = TILE_W * COLS;
  const sheetH = TILE_H * rows;
  const sheet = new Uint8Array(sheetW * sheetH * 3);
  fill(sheet, sheetW * sheetH);

  aircraft.forEach((entry, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    renderTile(collect(entry), sheet, sheetW, col * TILE_W, row * TILE_H);
    console.log(`  [${row},${col}] ${entry.shortName}`);
  });

  const outFile = path.join(outDir, "fleet.png");
  fs.writeFileSync(outFile, encodePNG(sheetW, sheetH, sheet));
  console.log(`\nWrote ${outFile} (${sheetW}×${sheetH})`);
}
