"use client";

import * as THREE from "three";
import {
  RUNWAY,
  RUNWAY_END,
  RUNWAY_HALF,
  RUNWAY_START,
  runwayMarkings,
} from "./layout";

/**
 * Textures for the airfield, drawn into a canvas at runtime.
 *
 * Same rule as the airframe skin in `geometry/textures.ts`: no image files, so no
 * extra licences and nothing to download. There are two of them — the sky, which
 * doubles as the scene's environment map so metal reflects the actual weather, and
 * the asphalt.
 */

function canvas2d(width: number, height: number) {
  const el = document.createElement("canvas");
  el.width = width;
  el.height = height;
  const ctx = el.getContext("2d");
  if (!ctx) throw new Error("2d canvas unavailable");
  return { el, ctx };
}

/** Sobel a greyscale canvas into a tangent-space normal map. */
function heightToNormal(source: HTMLCanvasElement, strength: number): THREE.CanvasTexture {
  const size = source.width;
  const src = source.getContext("2d")!.getImageData(0, 0, size, size).data;
  const { el, ctx } = canvas2d(size, size);
  const out = ctx.createImageData(size, size);

  const at = (x: number, y: number) => {
    const xi = ((x % size) + size) % size;
    const yi = ((y % size) + size) % size;
    return src[(yi * size + xi) * 4] / 255;
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = at(x - 1, y) - at(x + 1, y);
      const dy = at(x, y - 1) - at(x, y + 1);
      const nx = dx * strength;
      const ny = dy * strength;
      const len = Math.hypot(nx, ny, 1);
      const i = (y * size + x) * 4;
      out.data[i] = ((nx / len) * 0.5 + 0.5) * 255;
      out.data[i + 1] = ((ny / len) * 0.5 + 0.5) * 255;
      out.data[i + 2] = (1 / len) * 0.5 * 255 + 127.5;
      out.data[i + 3] = 255;
    }
  }
  ctx.putImageData(out, 0, 0);
  return new THREE.CanvasTexture(el);
}

/* ------------------------------------------------------------------ */
/* Sky                                                                 */
/* ------------------------------------------------------------------ */

export interface SkyPalette {
  /** Straight up. */
  zenith: string;
  /** At the horizon, where the haze piles up. */
  horizon: string;
  /** Ground half of the sphere, which is what the undersides reflect. */
  ground: string;
  sun: { azimuth: number; elevation: number; colour: string };
  /** 0 = cloudless, 1 = a busy monsoon sky. */
  clouds: number;
  /** 0 = daylight, 1 = a full night sky. Absent on the daylight landscapes. */
  stars?: number;
  /** Sodium light thrown back off the air over a city. */
  glow?: { colour: string; strength: number };
}

const SKY_W = 2048;
const SKY_H = 1024;

/**
 * Skies are per station and per time of day, so there are dozens of them and each is
 * eight megabytes before mipmaps. They are kept in a small most-recently-used cache
 * and the rest are disposed: switching back to somewhere you were just looking is
 * free, and wandering the whole list does not accumulate a few hundred megabytes of
 * texture. The entry just requested is always the newest, so it is never the one
 * evicted out from under the renderer.
 */
const SKY_CACHE_SIZE = 4;
const skyCache = new Map<string, THREE.CanvasTexture>();

function remember(key: string, texture: THREE.CanvasTexture) {
  skyCache.set(key, texture);
  while (skyCache.size > SKY_CACHE_SIZE) {
    const oldest = skyCache.keys().next();
    if (oldest.done) break;
    skyCache.get(oldest.value)?.dispose();
    skyCache.delete(oldest.value);
  }
}

/**
 * An equirectangular sky, painted so that the sun sits at u = 0.5. The dome is then
 * rotated to put it in the right place, which keeps the drawing code free of any
 * spherical mapping maths.
 *
 * `seed` is the station's, so its cloud and star patterns are its own — two fields
 * sharing a landscape and a time of day still do not share a sky.
 */
export function skyTexture(
  key: string,
  palette: SkyPalette,
  seed0 = 4711,
): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;

  const hit = skyCache.get(key);
  if (hit) {
    // Re-inserting moves it to the newest end of the map.
    skyCache.delete(key);
    skyCache.set(key, hit);
    return hit;
  }

  const { el, ctx } = canvas2d(SKY_W, SKY_H);
  const horizonY = SKY_H / 2;
  const stars = palette.stars ?? 0;

  // v = 1 at the top of the image is straight up; the middle row is the horizon.
  const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
  sky.addColorStop(0, palette.zenith);
  sky.addColorStop(0.55, mixHex(palette.zenith, palette.horizon, 0.55));
  sky.addColorStop(1, palette.horizon);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, SKY_W, horizonY);

  const ground = ctx.createLinearGradient(0, horizonY, 0, SKY_H);
  ground.addColorStop(0, mixHex(palette.horizon, palette.ground, 0.4));
  ground.addColorStop(1, palette.ground);
  ctx.fillStyle = ground;
  ctx.fillRect(0, horizonY - 1, SKY_W, SKY_H - horizonY + 1);

  let seed = (seed0 * 2654435761 + 4711) >>> 0;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };

  // Stars, thickest overhead and thinning into the haze at the horizon.
  if (stars > 0) {
    const count = Math.round(stars * 1400);
    for (let i = 0; i < count; i++) {
      const x = rand() * SKY_W;
      const height = Math.pow(rand(), 0.6);
      const y = horizonY * (1 - height);
      const size = 0.5 + Math.pow(rand(), 3) * 1.9;
      const alpha = stars * (0.18 + rand() * 0.82) * (0.25 + height * 0.75);
      ctx.fillStyle = `rgba(255,251,240,${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // A city throws its light back off the air: a warm band hugging the horizon.
  if (palette.glow) {
    const height = horizonY * 0.26;
    const g = ctx.createLinearGradient(0, horizonY, 0, horizonY - height);
    g.addColorStop(0, hexToRgba(palette.glow.colour, 0.55 * palette.glow.strength));
    g.addColorStop(0.35, hexToRgba(palette.glow.colour, 0.2 * palette.glow.strength));
    g.addColorStop(1, hexToRgba(palette.glow.colour, 0));
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = g;
    ctx.fillRect(0, horizonY - height, SKY_W, height);
    ctx.globalCompositeOperation = "source-over";
  }

  // Clouds: soft flattened blobs stacked into a band above the horizon, drawn three
  // times so the band wraps cleanly at the seam.
  if (palette.clouds > 0) {
    const count = Math.round(palette.clouds * 90);
    for (let i = 0; i < count; i++) {
      const cx = rand() * SKY_W;
      const cy = horizonY - Math.pow(rand(), 1.7) * horizonY * 0.72 - 12;
      const rx = 60 + rand() * 240;
      const ry = rx * (0.16 + rand() * 0.22);
      const alpha = 0.1 + rand() * 0.4 * palette.clouds;
      // After dark a cloud is a hole in the stars, not a white blob, so it takes the
      // colour of the sky it sits in.
      const tint = mixHex("#ffffff", palette.horizon, stars);
      for (const dx of [-SKY_W, 0, SKY_W]) {
        const g = ctx.createRadialGradient(cx + dx, cy, 0, cx + dx, cy, rx);
        g.addColorStop(0, hexToRgba(tint, alpha));
        g.addColorStop(0.5, hexToRgba(tint, alpha * 0.5));
        g.addColorStop(1, hexToRgba(tint, 0));
        ctx.save();
        ctx.translate(cx + dx, cy);
        ctx.scale(1, ry / rx);
        ctx.translate(-(cx + dx), -cy);
        ctx.fillStyle = g;
        ctx.fillRect(cx + dx - rx, cy - rx, rx * 2, rx * 2);
        ctx.restore();
      }
    }
  }

  // Sun, with its glow. Painted last so it sits in front of the cloud band. The moon
  // gets a far tighter halo — a night sky washed out to the horizon reads as fog.
  const night = stars > 0.5;
  const sunY = (0.5 - palette.sun.elevation / 180) * SKY_H;
  const sunX = SKY_W / 2;
  const reach = SKY_H * (night ? 0.1 : 0.42);
  const strength = night ? 0.5 : 1;

  const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, reach);
  glow.addColorStop(0, hexToRgba(palette.sun.colour, 0.95 * strength));
  glow.addColorStop(0.06, hexToRgba(palette.sun.colour, 0.5 * strength));
  glow.addColorStop(0.3, hexToRgba(palette.sun.colour, 0.12 * strength));
  glow.addColorStop(1, hexToRgba(palette.sun.colour, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, SKY_W, SKY_H);

  ctx.beginPath();
  ctx.arc(sunX, sunY, night ? 11 : 16, 0, Math.PI * 2);
  ctx.fillStyle = night ? "#f4f6ff" : "#ffffff";
  ctx.fill();

  const texture = new THREE.CanvasTexture(el);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  remember(key, texture);
  return texture;
}

/**
 * Y rotation that brings the painted sun round to the light's real bearing.
 * On a three.js sphere u = 0.5 faces +X, so everything is measured from there.
 */
export function skyRotation(azimuthDeg: number): number {
  const a = (azimuthDeg * Math.PI) / 180;
  return Math.atan2(-Math.cos(a), Math.sin(a));
}

/** Unit vector toward the sun, from a compass bearing and an elevation. */
export function sunDirection(azimuthDeg: number, elevationDeg: number): THREE.Vector3 {
  const a = (azimuthDeg * Math.PI) / 180;
  const e = (elevationDeg * Math.PI) / 180;
  return new THREE.Vector3(
    Math.sin(a) * Math.cos(e),
    Math.sin(e),
    Math.cos(a) * Math.cos(e),
  ).normalize();
}

/* ------------------------------------------------------------------ */
/* Asphalt                                                             */
/* ------------------------------------------------------------------ */

interface SurfaceMaps {
  normalMap: THREE.Texture;
  roughnessMap: THREE.Texture;
}

let asphalt: SurfaceMaps | null = null;

function drawAsphaltHeight(): HTMLCanvasElement {
  const size = 512;
  const { el, ctx } = canvas2d(size, size);

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);

  let seed = 9182736;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return seed / 0xffffffff;
  };

  // Aggregate: thousands of chips of stone in the binder.
  for (let i = 0; i < 26000; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 0.6 + rand() * 1.9;
    const tone = 96 + Math.floor(rand() * 88);
    ctx.fillStyle = `rgb(${tone},${tone},${tone})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Paving joints, faint and straight.
  ctx.strokeStyle = "#606060";
  ctx.lineWidth = 2;
  for (const t of [0.25, 0.75]) {
    ctx.beginPath();
    ctx.moveTo(0, size * t);
    ctx.lineTo(size, size * t);
    ctx.stroke();
  }

  // Hairline cracks.
  ctx.strokeStyle = "#5c5c5c";
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 14; i++) {
    let x = rand() * size;
    let y = rand() * size;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let s = 0; s < 7; s++) {
      x += (rand() - 0.5) * 60;
      y += (rand() - 0.5) * 60;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  return el;
}

function drawAsphaltRoughness(height: HTMLCanvasElement): THREE.CanvasTexture {
  const size = height.width;
  const { el, ctx } = canvas2d(size, size);
  ctx.drawImage(height, 0, 0);
  ctx.globalCompositeOperation = "multiply";

  let seed = 5150;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
  for (let i = 0; i < 60; i++) {
    const cx = rand() * size;
    const cy = rand() * size;
    const r = 30 + rand() * 120;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    const tone = 205 + Math.floor(rand() * 45);
    g.addColorStop(0, `rgba(${tone},${tone},${tone},0.6)`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  ctx.globalCompositeOperation = "source-over";
  return new THREE.CanvasTexture(el);
}

/** Shared asphalt maps, tiled per surface by the caller. */
export function asphaltMaps(): SurfaceMaps | null {
  if (typeof document === "undefined") return null;
  if (!asphalt) {
    const height = drawAsphaltHeight();
    const normalMap = heightToNormal(height, 1.4);
    const roughnessMap = drawAsphaltRoughness(height);
    for (const tex of [normalMap, roughnessMap]) {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.anisotropy = 8;
    }
    asphalt = { normalMap, roughnessMap };
  }
  return asphalt;
}

const tiled = new Map<string, SurfaceMaps>();

/** Asphalt maps repeated to cover a surface of a given size in metres. */
export function pavementMaps(metresU: number, metresV: number): SurfaceMaps | null {
  const base = asphaltMaps();
  if (!base) return null;

  // One tile every 8 m keeps the aggregate at a believable size.
  const u = Math.max(1, Math.round(metresU / 8));
  const v = Math.max(1, Math.round(metresV / 8));
  const key = `${u}x${v}`;
  const hit = tiled.get(key);
  if (hit) return hit;

  const normalMap = base.normalMap.clone();
  const roughnessMap = base.roughnessMap.clone();
  for (const tex of [normalMap, roughnessMap]) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(u, v);
    tex.needsUpdate = true;
  }
  const maps = { normalMap, roughnessMap };
  tiled.set(key, maps);
  return maps;
}

/* ------------------------------------------------------------------ */
/* The runway surface                                                  */
/* ------------------------------------------------------------------ */

/**
 * The whole runway — asphalt, weathering, rubber and every marking — painted into one
 * texture that is then stretched over the slab.
 *
 * The markings were originally geometry floated two centimetres above the pavement,
 * which is how it is usually done up close and is wrong here: this runway is 2.4 km
 * long, and a depth buffer reaching 4 km cannot separate two centimetres past about
 * 200 m. The paint tore into moving stripes as the camera orbited. Baked into the
 * surface there is nothing to fight, and — just as valuable — the lines now mipmap,
 * so they fade into the distance instead of crawling.
 *
 * u runs across the runway, v along it, with v = 0 at the near end.
 */
const RUNWAY_TEX_W = 512;
const RUNWAY_TEX_H = 4096;

let runwaySurface: THREE.CanvasTexture | null = null;

export function runwayTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  if (runwaySurface) return runwaySurface;

  const total = RUNWAY_END - RUNWAY_START;
  const { el, ctx } = canvas2d(RUNWAY_TEX_W, RUNWAY_TEX_H);

  const px = (x: number) => ((x + RUNWAY_HALF) / RUNWAY.width) * RUNWAY_TEX_W;
  const py = (z: number) => ((z - RUNWAY_START) / total) * RUNWAY_TEX_H;

  let seed = 24601;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };

  ctx.fillStyle = "#4f5155";
  ctx.fillRect(0, 0, RUNWAY_TEX_W, RUNWAY_TEX_H);

  // Patchy resurfacing and general grime.
  for (let i = 0; i < 240; i++) {
    const cx = rand() * RUNWAY_TEX_W;
    const cy = rand() * RUNWAY_TEX_H;
    const r = 20 + rand() * 190;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    const tone = 62 + Math.floor(rand() * 34);
    g.addColorStop(0, `rgba(${tone},${tone + 2},${tone + 5},0.5)`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }

  // Longitudinal construction joints.
  ctx.strokeStyle = "rgba(30,32,36,0.55)";
  ctx.lineWidth = 1.6;
  for (const x of [-15, -7.5, 0, 7.5, 15]) {
    ctx.beginPath();
    ctx.moveTo(px(x), 0);
    ctx.lineTo(px(x), RUNWAY_TEX_H);
    ctx.stroke();
  }

  // Rubber laid down in the touchdown zone, heaviest just past the aiming point.
  const rubberFrom = py(RUNWAY.threshold + 60);
  const rubberTo = py(RUNWAY.threshold + 700);
  const rubber = ctx.createLinearGradient(0, rubberFrom, 0, rubberTo);
  rubber.addColorStop(0, "rgba(24,24,26,0)");
  rubber.addColorStop(0.35, "rgba(24,24,26,0.5)");
  rubber.addColorStop(1, "rgba(24,24,26,0)");
  ctx.fillStyle = rubber;
  ctx.fillRect(px(-17), rubberFrom, px(17) - px(-17), rubberTo - rubberFrom);

  // Yellow chevrons on the overrun: paved, but not for landing on.
  ctx.strokeStyle = "#b79a3a";
  ctx.lineWidth = 5;
  for (let z = RUNWAY_START + 12; z < RUNWAY.threshold - 8; z += 22) {
    ctx.beginPath();
    ctx.moveTo(px(-19), py(z));
    ctx.lineTo(px(0), py(z + 16));
    ctx.lineTo(px(19), py(z));
    ctx.stroke();
  }

  // The markings themselves, worn rather than fresh.
  ctx.fillStyle = "#c9cdd0";
  for (const mark of runwayMarkings()) {
    const x0 = px(mark.x - mark.w / 2);
    const y0 = py(mark.z - mark.l / 2);
    ctx.fillRect(x0, y0, px(mark.x + mark.w / 2) - x0, py(mark.z + mark.l / 2) - y0);
  }

  // Scuff the paint so it does not read as a fresh coat.
  ctx.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 900; i++) {
    const r = 2 + rand() * 9;
    ctx.fillStyle = `rgba(0,0,0,${0.1 + rand() * 0.35})`;
    ctx.beginPath();
    ctx.arc(rand() * RUNWAY_TEX_W, rand() * RUNWAY_TEX_H, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";

  const texture = new THREE.CanvasTexture(el);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  runwaySurface = texture;
  return texture;
}

/* ------------------------------------------------------------------ */

/** Canvas colours are sRGB, so go back through the hex string rather than the
 *  linear components three.js stores internally. */
function hexToRgba(hex: string, alpha: number): string {
  const s = new THREE.Color(hex).getHexString();
  const r = Number.parseInt(s.slice(0, 2), 16);
  const g = Number.parseInt(s.slice(2, 4), 16);
  const b = Number.parseInt(s.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function mixHex(a: string, b: string, t: number): string {
  return `#${new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString()}`;
}
