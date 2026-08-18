import { PHASES } from "@/components/three/environment/phases";
import type { PhaseId } from "@/lib/types";

/**
 * A small airfield, drawn flat, one per time of day.
 *
 * These used to be three vertical colour ramps with a grey bar across the bottom,
 * which showed the palette and nothing else — a visitor could not tell what changing
 * the phase was actually *for*. What changes is the airfield: at night the strip is a
 * runway made of lights and almost nothing else, at dusk it is a lit strip under a
 * burning sky, in daylight the lighting is invisible and the paint does the work. So
 * the tile draws the runway, its edge and threshold lamps, and the sun or moon at its
 * real elevation.
 *
 * Every number here is read off `PHASES`, the same definitions the 3D scene resolves
 * against, so a tile cannot drift away from what the viewer shows. Daylight is the one
 * exception, and it always was: a phase is a set of pulls applied to a landscape, and
 * day pulls at nothing, so its colours belong to the landscape. Those are `plains` at
 * midday, quoted from `presets.ts`.
 */

const DAYLIGHT = {
  zenith: "#3f7cb8",
  horizon: "#c4dbef",
  ground: "#6a6c46",
  sunColour: "#fff5e4",
  elevation: 58,
};

function look(phase: PhaseId) {
  const p = PHASES[phase];
  if (phase === "day") {
    return {
      ...DAYLIGHT,
      lamps: p.lamps,
      stars: p.stars,
      moon: false,
    };
  }
  return {
    zenith: p.sky.zenith,
    horizon: p.sky.horizon,
    ground: p.sky.ground,
    sunColour: p.light.colour,
    elevation: p.elevation ?? DAYLIGHT.elevation,
    lamps: p.lamps,
    stars: p.stars,
    moon: phase === "night",
  };
}

/** Deterministic scatter, so a tile looks the same on the server and the client. */
function stars(count: number) {
  const out: { x: number; y: number; r: number; o: number }[] = [];
  let seed = 20260818;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
  for (let i = 0; i < count; i++) {
    const y = Math.pow(rand(), 0.7) * 46;
    out.push({ x: rand() * 160, y, r: 0.3 + rand() * 0.7, o: 0.25 + rand() * 0.7 });
  }
  return out;
}

const SKY_H = 48;
const HORIZON = SKY_H;

/** Runway edge lamps, marching away up the strip toward the horizon. */
const EDGE = [0.06, 0.2, 0.36, 0.54, 0.74, 0.97];

export function PhaseTile({ phase }: { phase: PhaseId }) {
  const l = look(phase);
  const label = PHASES[phase].label;

  // The sun sits high in the sky box at 90°, on the horizon at 0°.
  const sunY = HORIZON - (l.elevation / 90) * (SKY_H - 6);
  // Lamps are emissive in the scene; here that becomes plain opacity. The threshold
  // of the bloom in the real viewer is 1, which is also where a lamp starts to read.
  const lit = Math.min(1, l.lamps / 2.4);
  const glow = Math.min(1, l.lamps / 4.2);

  return (
    <div className="card-sheen group overflow-hidden rounded-xl border border-white/[0.08] transition-colors hover:border-sky-400/35">
      <svg
        viewBox="0 0 160 96"
        className="block h-auto w-full"
        role="img"
        aria-label={`${label} at an airfield`}
      >
        <defs>
          <linearGradient id={`sky-${phase}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={l.zenith} />
            <stop offset="100%" stopColor={l.horizon} />
          </linearGradient>
          <linearGradient id={`gnd-${phase}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={l.horizon} stopOpacity="0.55" />
            <stop offset="45%" stopColor={l.ground} />
            <stop offset="100%" stopColor={l.ground} />
          </linearGradient>
          <radialGradient id={`sun-${phase}`}>
            <stop offset="0%" stopColor={l.sunColour} stopOpacity="0.85" />
            <stop offset="100%" stopColor={l.sunColour} stopOpacity="0" />
          </radialGradient>
          {/* The strip narrows to nothing at the horizon, so the paint has to fade
              with it or the far end reads as a solid white wedge. */}
          <linearGradient id={`paint-${phase}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#e8eef5" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#e8eef5" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <rect width="160" height={SKY_H} fill={`url(#sky-${phase})`} />

        {l.stars > 0 &&
          stars(Math.round(l.stars * 60)).map((s, i) => (
            <circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill="#fffbf0"
              opacity={s.o * l.stars}
            />
          ))}

        {/* Sun or moon, with its haze. */}
        <circle cx="118" cy={sunY} r="17" fill={`url(#sun-${phase})`} />
        <circle cx="118" cy={sunY} r={l.moon ? 3 : 4.2} fill={l.moon ? "#eef2ff" : "#ffffff"} />

        <rect y={HORIZON} width="160" height={96 - HORIZON} fill={`url(#gnd-${phase})`} />

        {/* The strip, receding to a point just under the horizon. */}
        <polygon points="74,49 86,49 122,96 38,96" fill="#20242b" opacity="0.92" />
        <polygon points="74,49 86,49 122,96 38,96" fill={`url(#paint-${phase})`} opacity="0.06" />

        {/* Centreline dashes, shortening with distance. */}
        {[
          [92, 96, 1.9],
          [79, 88, 1.5],
          [69, 76, 1.1],
          [61, 66, 0.8],
          [55, 58, 0.55],
        ].map(([y1, y2, w]) => (
          <line
            key={y1}
            x1="80"
            y1={y1}
            x2="80"
            y2={y2}
            stroke={`url(#paint-${phase})`}
            strokeWidth={w}
          />
        ))}

        {/* Edge lamps down both sides. Barely there in daylight, the whole picture
            after dark — which is the reason the phase control exists. */}
        {EDGE.map((t) => {
          const y = 96 - t * 47;
          const halfWidth = 42 - t * 36;
          const r = 1.6 - t * 1.05;
          return (
            <g key={t}>
              {[80 - halfWidth, 80 + halfWidth].map((x) => (
                <g key={x}>
                  <circle cx={x} cy={y} r={r * 3.4} fill="#ffd9a0" opacity={glow * 0.28} />
                  <circle cx={x} cy={y} r={r} fill="#ffe6bd" opacity={0.25 + lit * 0.75} />
                </g>
              ))}
            </g>
          );
        })}

        {/* Threshold bar at the near end: green, as it is at every airfield there is. */}
        {[44, 52, 60, 68, 76, 84, 92, 100, 108, 116].map((x) => (
          <g key={x}>
            <circle cx={x} cy="94" r="3.2" fill="#5cf0a8" opacity={glow * 0.22} />
            <circle cx={x} cy="94" r="1.1" fill="#7dffc0" opacity={0.2 + lit * 0.8} />
          </g>
        ))}
      </svg>

      <p className="flex items-center justify-between border-t border-white/[0.06] bg-ink-900/60 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-slate-400">
        {label}
        {/* What actually changes, rather than a restatement of the label. */}
        <span className="text-slate-600">
          {phase === "day" ? "Paint only" : phase === "dusk" ? "Lamps lit" : "Field lit"}
        </span>
      </p>
    </div>
  );
}
