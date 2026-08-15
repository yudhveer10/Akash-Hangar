import type { GeometryConfig, SurfaceConfig } from "@/lib/types";

/**
 * Top-view silhouette drawn straight from the geometry config.
 *
 * The gallery needs a thumbnail per aircraft without loading a 3D scene twelve
 * times over, and without shipping image files that would each need their own
 * provenance. Deriving the outline from the same data the viewer uses keeps the
 * card honest: if the model changes shape, so does its thumbnail.
 */

const DEG = Math.PI / 180;

function surfaceOutline(cfg: SurfaceConfig): string {
  const steps = 14;
  const le: [number, number][] = [];
  const te: [number, number][] = [];
  const sweep = Math.tan(cfg.sweep * DEG);

  for (let i = 0; i <= steps; i++) {
    const frac = i / steps;
    const dist = frac * cfg.span;
    let zLE: number;
    let chord: number;

    if (cfg.kink && frac > cfg.kink.at) {
      const kinkDist = cfg.kink.at * cfg.span;
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

    if (cfg.rootExtension && frac < 0.3) {
      const blend = (1 - frac / 0.3) ** 2;
      zLE += cfg.rootExtension * blend;
      chord += cfg.rootExtension * blend;
    }

    le.push([zLE, dist]);
    te.push([zLE - chord, dist]);
  }

  // Starboard leading edge out to the tip, back along the trailing edge, then the
  // mirror image for the port side.
  const pts = [
    ...le,
    ...te.reverse(),
    ...te.map(([z, x]) => [z, -x] as [number, number]),
    ...le.reverse().map(([z, x]) => [z, -x] as [number, number]),
  ];
  return pts.map(([z, x]) => `${z.toFixed(2)},${x.toFixed(2)}`).join(" ");
}

function bodyOutline(stations: { z: number; width: number }[]): string {
  const ordered = [...stations].sort((a, b) => b.z - a.z);
  const right = ordered.map((s) => [s.z, s.width / 2] as [number, number]);
  const left = [...right].reverse().map(([z, x]) => [z, -x] as [number, number]);
  return [...right, ...left].map(([z, x]) => `${z.toFixed(2)},${x.toFixed(2)}`).join(" ");
}

export function Planform({
  geometry,
  className,
}: {
  geometry: GeometryConfig;
  className?: string;
}) {
  const shapes: { points: string; opacity: number }[] = [];
  const discs: { cz: number; r: number }[] = [];

  const zs = geometry.fuselage.map((s) => s.z);
  let halfSpan = Math.max(...geometry.fuselage.map((s) => s.width / 2));

  if (geometry.kind === "fixedWing") {
    shapes.push({ points: surfaceOutline(geometry.wing), opacity: 0.95 });
    if (geometry.stabilator)
      shapes.push({ points: surfaceOutline(geometry.stabilator), opacity: 0.8 });
    if (geometry.canard)
      shapes.push({ points: surfaceOutline(geometry.canard), opacity: 0.8 });
    halfSpan = Math.max(halfSpan, geometry.wing.span);
  } else {
    if (geometry.boom) zs.push(...geometry.boom.map((s) => s.z));
    if (geometry.stubWings)
      shapes.push({ points: surfaceOutline(geometry.stubWings), opacity: 0.8 });
    if (geometry.stabilator)
      shapes.push({ points: surfaceOutline(geometry.stabilator), opacity: 0.8 });
    for (const rotor of geometry.rotors) {
      if (rotor.vertical) continue;
      discs.push({ cz: rotor.hub[2], r: rotor.radius });
      halfSpan = Math.max(halfSpan, rotor.radius);
    }
  }

  const body = bodyOutline(geometry.fuselage);
  const boom =
    geometry.kind === "rotorcraft" && geometry.boom
      ? bodyOutline(geometry.boom)
      : null;

  const minZ = Math.min(...zs, ...discs.map((d) => d.cz - d.r));
  const maxZ = Math.max(...zs, ...discs.map((d) => d.cz + d.r));
  const pad = (maxZ - minZ) * 0.04;
  const width = maxZ - minZ + pad * 2;
  const height = halfSpan * 2 + pad * 2;

  return (
    <svg
      viewBox={`${minZ - pad} ${-halfSpan - pad} ${width} ${height}`}
      className={className}
      role="presentation"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Nose points right; the whole drawing is flipped so it reads left-to-right. */}
      <g transform={`translate(${minZ + maxZ} 0) scale(-1 1)`}>
        {discs.map((d, i) => (
          <circle
            key={`disc-${i}`}
            cx={d.cz}
            cy={0}
            r={d.r}
            fill="none"
            stroke="currentColor"
            strokeWidth={Math.max(width, height) * 0.004}
            opacity={0.35}
          />
        ))}
        {shapes.map((s, i) => (
          <polygon key={`surface-${i}`} points={s.points} fill="currentColor" opacity={s.opacity} />
        ))}
        <polygon points={body} fill="currentColor" />
        {boom && <polygon points={boom} fill="currentColor" />}
      </g>
    </svg>
  );
}
