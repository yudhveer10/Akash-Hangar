/**
 * Schematic cockpit artwork for the "coming soon" panel.
 *
 * Original line work, drawn to suggest a canopy and a head-up display in the abstract:
 * no type is identified, no readout shows a figure, and nothing here is traced from a
 * real instrument panel. It is an illustration of a feature, not a claim about an
 * aircraft — the real thing will be generated geometry like everything else.
 *
 * Drawn to fit rather than fill: the panel it sits in is close to square, and covering
 * that would crop the canopy rails straight off the sides, which is the one detail that
 * makes the drawing read as a cockpit at all.
 */
export function CockpitFrame({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 280"
      className={className}
      role="presentation"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="cockpit-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b1a2e" />
          <stop offset="55%" stopColor="#123049" />
          <stop offset="100%" stopColor="#0a1119" />
        </linearGradient>
        <linearGradient id="cockpit-sweep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(56,189,248,0)" />
          <stop offset="50%" stopColor="rgba(56,189,248,0.5)" />
          <stop offset="100%" stopColor="rgba(56,189,248,0)" />
        </linearGradient>
        {/* The glass: an arched windscreen with straight rails down each side. */}
        <clipPath id="cockpit-glass">
          <path d="M46 268 L46 96 Q200 22 354 96 L354 268 Z" />
        </clipPath>
      </defs>

      <g clipPath="url(#cockpit-glass)">
        <rect x="0" y="0" width="400" height="280" fill="url(#cockpit-sky)" />

        {/* Ground beyond the horizon, and the runway running out to the vanishing point. */}
        <rect x="0" y="158" width="400" height="122" fill="#0c1420" />
        <path d="M96 280 L197 158 L203 158 L304 280 Z" fill="#131c27" />
        <g stroke="rgba(148,179,209,0.35)" strokeWidth="1.2" fill="none">
          <path d="M96 280 L197 158" />
          <path d="M304 280 L203 158" />
        </g>
        <path
          d="M200 280 L200 160"
          stroke="rgba(226,232,240,0.5)"
          strokeWidth="2"
          strokeDasharray="10 12"
          fill="none"
        />
        <path d="M0 158 H400" stroke="rgba(125,211,252,0.35)" strokeWidth="1" />

        {/* Head-up display: combiner corners, pitch ladder, reticle. */}
        <g stroke="#7dd3fc" strokeWidth="1.4" fill="none" opacity="0.9">
          <path d="M124 82 h-16 v16" />
          <path d="M276 82 h16 v16" />
          <path d="M124 214 h-16 v-16" />
          <path d="M276 214 h16 v-16" />

          <path d="M146 116 h30 M224 116 h30" />
          <path d="M146 196 h30 M224 196 h30" strokeDasharray="6 5" />

          <circle cx="200" cy="156" r="22" />
          <path d="M200 128 v-9 M200 193 v9 M167 156 h-9 M242 156 h9" />
          <path d="M186 156 h8 M206 156 h8" strokeWidth="2" />
        </g>
        <circle cx="200" cy="156" r="2.4" fill="#7dd3fc" />

        {/* Scale ticks down each side of the display, standing in for the tapes. */}
        <g stroke="rgba(125,211,252,0.55)" strokeWidth="1.2">
          <path d="M118 108 h7 M118 126 h10 M118 144 h7 M118 162 h10 M118 180 h7" />
          <path d="M282 108 h-7 M282 126 h-10 M282 144 h-7 M282 162 h-10 M282 180 h-7" />
        </g>

        {/* Slow scan across the glass. Held still for reduced-motion visitors. */}
        <rect
          className="hud-sweep"
          x="0"
          y="120"
          width="400"
          height="3"
          fill="url(#cockpit-sweep)"
        />
      </g>

      {/* Canopy structure, drawn over the glass. */}
      <g fill="none" stroke="rgba(148,179,209,0.55)" strokeWidth="3">
        <path d="M46 268 L46 96 Q200 22 354 96 L354 268" />
      </g>
      <path
        d="M200 26 L200 268"
        stroke="rgba(148,179,209,0.28)"
        strokeWidth="2.5"
        fill="none"
      />
      {/* Coaming: the top of the panel, closing the view off at the bottom. */}
      <path d="M46 236 Q200 214 354 236 L354 280 L46 280 Z" fill="#080d15" />
      <path
        d="M46 236 Q200 214 354 236"
        stroke="rgba(148,179,209,0.4)"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}
