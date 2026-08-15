"use client";

import * as THREE from "three";

/**
 * Procedurally drawn airframe skin.
 *
 * Real aircraft are not smooth: they are panelled, riveted, and streaked with wear
 * around the doors and exhaust. None of that can come from a texture file here — an
 * image would be another asset with another licence — so it is drawn at runtime into
 * a canvas and converted to a normal and roughness map.
 *
 * The maps are generated once and shared; per-part tiling is applied by cloning,
 * which reuses the same underlying image on the GPU.
 */

const SIZE = 1024;

interface Maps {
  normalMap: THREE.Texture;
  roughnessMap: THREE.Texture;
}

let cache: Maps | null = null;

function canvas2d(size: number) {
  const el = document.createElement("canvas");
  el.width = size;
  el.height = size;
  const ctx = el.getContext("2d");
  if (!ctx) throw new Error("2d canvas unavailable");
  return { el, ctx };
}

/** Draws a shape and its wrapped copies so the texture tiles cleanly in u. */
function wrapped(ctx: CanvasRenderingContext2D, draw: (dx: number) => void) {
  draw(0);
  draw(-SIZE);
  draw(SIZE);
}

function drawPanelHeight(): HTMLCanvasElement {
  const { el, ctx } = canvas2d(SIZE);

  // Mid grey is "flat"; darker is recessed.
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Deterministic pseudo-random so the skin is identical between reloads.
  let seed = 20260815;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };

  const line = (x0: number, y0: number, x1: number, y1: number, w: number) => {
    ctx.strokeStyle = "#5a5a5a";
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  };

  // Circumferential panel joints — the rings you see running around a fuselage.
  let y = 0;
  while (y < SIZE) {
    y += 46 + rand() * 78;
    wrapped(ctx, (dx) => line(dx, y, dx + SIZE, y, 1.6));
  }

  // Longitudinal stringers.
  let x = 0;
  while (x < SIZE) {
    x += 84 + rand() * 120;
    line(x, 0, x, SIZE, 1.4);
  }

  // Access panels and service hatches.
  for (let i = 0; i < 46; i++) {
    const px = rand() * SIZE;
    const py = rand() * SIZE;
    const pw = 26 + rand() * 78;
    const ph = 20 + rand() * 54;
    wrapped(ctx, (dx) => {
      ctx.strokeStyle = "#535353";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px + dx, py, pw, ph);
    });
  }

  // Rivet lines along a subset of the joints.
  ctx.fillStyle = "#6e6e6e";
  for (let i = 0; i < 26; i++) {
    const ry = rand() * SIZE;
    const step = 9 + rand() * 5;
    for (let rx = 0; rx < SIZE; rx += step) {
      ctx.beginPath();
      ctx.arc(rx, ry, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  return el;
}

/** Sobel the height field into a tangent-space normal map. */
function heightToNormal(height: HTMLCanvasElement, strength: number): THREE.CanvasTexture {
  const src = height.getContext("2d")!.getImageData(0, 0, SIZE, SIZE).data;
  const { el, ctx } = canvas2d(SIZE);
  const out = ctx.createImageData(SIZE, SIZE);

  const at = (x: number, y: number) => {
    const xi = ((x % SIZE) + SIZE) % SIZE;
    const yi = Math.min(SIZE - 1, Math.max(0, y));
    return src[(yi * SIZE + xi) * 4] / 255;
  };

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx =
        at(x - 1, y - 1) + 2 * at(x - 1, y) + at(x - 1, y + 1) -
        (at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1));
      const dy =
        at(x - 1, y - 1) + 2 * at(x, y - 1) + at(x + 1, y - 1) -
        (at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1));

      const nx = dx * strength;
      const ny = dy * strength;
      const nz = 1;
      const len = Math.hypot(nx, ny, nz);
      const i = (y * SIZE + x) * 4;
      out.data[i] = ((nx / len) * 0.5 + 0.5) * 255;
      out.data[i + 1] = ((ny / len) * 0.5 + 0.5) * 255;
      out.data[i + 2] = ((nz / len) * 0.5 + 0.5) * 255;
      out.data[i + 3] = 255;
    }
  }

  ctx.putImageData(out, 0, 0);
  return new THREE.CanvasTexture(el);
}

function drawRoughness(height: HTMLCanvasElement): THREE.CanvasTexture {
  const { el, ctx } = canvas2d(SIZE);

  // Start from the panel drawing so joints read as slightly duller than the skin.
  ctx.drawImage(height, 0, 0);
  ctx.globalCompositeOperation = "multiply";

  let seed = 987651;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return seed / 0xffffffff;
  };

  // Soft weathering blotches.
  for (let i = 0; i < 150; i++) {
    const cx = rand() * SIZE;
    const cy = rand() * SIZE;
    const r = 30 + rand() * 150;
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    const tone = 200 + Math.floor(rand() * 40);
    gradient.addColorStop(0, `rgba(${tone},${tone},${tone},0.5)`);
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }

  ctx.globalCompositeOperation = "source-over";
  return new THREE.CanvasTexture(el);
}

function build(): Maps {
  const height = drawPanelHeight();
  const normalMap = heightToNormal(height, 2.4);
  const roughnessMap = drawRoughness(height);

  for (const tex of [normalMap, roughnessMap]) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 8;
  }
  return { normalMap, roughnessMap };
}

/** Shared base maps. Returns null during server rendering. */
export function airframeMaps(): Maps | null {
  if (typeof document === "undefined") return null;
  if (!cache) cache = build();
  return cache;
}

/* ------------------------------------------------------------------ */
/* Markings                                                            */
/* ------------------------------------------------------------------ */

/**
 * National markings as carried on the airframe.
 *
 * Drawn rather than shipped as image files, for the same licensing reason as the
 * panel lines. These depict what is painted on the aircraft — the site's own
 * identity uses none of it (see CLAUDE.md).
 */
const SAFFRON = "#ff9933";
const GREEN = "#138808";

const markingCache = new Map<string, THREE.CanvasTexture>();

function cached(key: string, draw: () => HTMLCanvasElement): THREE.CanvasTexture {
  const hit = markingCache.get(key);
  if (hit) return hit;
  const tex = new THREE.CanvasTexture(draw());
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  markingCache.set(key, tex);
  return tex;
}

/**
 * Three concentric rings — saffron outside, white, green at the centre — in the
 * usual 3 : 2 : 1 radius proportion. The low-visibility form most fast jets now
 * carry is the same layout in subdued greys.
 */
export function roundelTexture(lowVis = false): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  return cached(`roundel-${lowVis}`, () => {
    const size = 256;
    const { el, ctx } = canvas2d(size);
    const c = size / 2;
    const r = size * 0.46;

    const rings: [number, string][] = lowVis
      ? [
          [r, "#6c7681"],
          [(r * 2) / 3, "#9aa3ad"],
          [r / 3, "#5b646e"],
        ]
      : [
          [r, SAFFRON],
          [(r * 2) / 3, "#ffffff"],
          [r / 3, GREEN],
        ];

    for (const [radius, colour] of rings) {
      ctx.beginPath();
      ctx.arc(c, c, radius, 0, Math.PI * 2);
      ctx.fillStyle = colour;
      ctx.fill();
    }
    return el;
  });
}

/** Tricolour fin flash: three vertical bars. */
export function finFlashTexture(lowVis = false): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  return cached(`flash-${lowVis}`, () => {
    const size = 256;
    const { el, ctx } = canvas2d(size);
    const bars = lowVis
      ? ["#6c7681", "#9aa3ad", "#5b646e"]
      : [SAFFRON, "#ffffff", GREEN];

    // Inset vertically so the flash does not run to the very edge of its patch.
    const top = size * 0.16;
    const height = size * 0.68;
    bars.forEach((colour, i) => {
      ctx.fillStyle = colour;
      ctx.fillRect((i * size) / 3, top, size / 3 + 1, height);
    });
    return el;
  });
}

/** Tail serial, stencilled. */
export function serialTexture(text: string): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  return cached(`serial-${text}`, () => {
    const w = 512;
    const h = 128;
    const el = document.createElement("canvas");
    el.width = w;
    el.height = h;
    const ctx = el.getContext("2d")!;
    ctx.fillStyle = "#12161c";
    ctx.font = "bold 74px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, w / 2, h / 2 + 4);
    return el;
  });
}

const tiled = new Map<string, Maps>();

/**
 * Maps tiled for a part of a given size, so panel spacing stays roughly constant in
 * metres whether it is a wingtip or a cargo fuselage.
 */
export function tiledMaps(repeatU: number, repeatV: number): Maps | null {
  const base = airframeMaps();
  if (!base) return null;

  const u = Math.max(0.5, Math.round(repeatU * 2) / 2);
  const v = Math.max(0.5, Math.round(repeatV * 2) / 2);
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
