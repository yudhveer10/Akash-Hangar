/**
 * The drifting silhouette field behind the motto.
 *
 * Deliberately *not* a wall of insignia. A slow horizontal band of marks behind a hero
 * line is the visual grammar of a partner or customer strip, and filling it with Air
 * Force crests would say the thing the whole site is built to avoid — see rule 3 in
 * CLAUDE.md. What drifts here instead is the fleet itself: aircraft profiles, which
 * are descriptive of the machines this site is about and carry no claim of
 * affiliation, in the same way the roundels on the 3D models do.
 *
 * The shapes are original artwork, generic to each type class rather than traced from
 * any published three-view, so nothing is borrowed. They are ornament, not content: no
 * aircraft is named or captioned, because a silhouette this loose would not survive
 * the accuracy rule if it claimed to be a particular airframe.
 *
 * Drawn in **side profile**, not planform. The first version looked down on the
 * aircraft, which fails twice at this size: a rotor seen from above is a ring of thin
 * blades that resolves into a starburst rather than a helicopter, and a planform
 * travelling sideways reads as skidding rather than flying. In profile a rotor is one
 * line, and a shape with a nose on the leading edge reads as flight.
 *
 * Authored nose-right in a shared 200 x 64 box so every type sits on one scale and one
 * optical weight. Lanes that travel left flip on the X axis, so nothing ever flies
 * backwards.
 */

type Profile = { id: string; paths: string[] };

const FLEET: Profile[] = [
  {
    // Single-fin delta fighter: needle nose, canopy, swept fin, wing edge-on.
    id: "fighter",
    paths: [
      "M196 40 L168 34 L150 31 L60 29 L22 31 L8 36 L8 45 L26 48 L90 49 L150 45 Z",
      "M162 31 L152 22 L132 21 L122 30 Z",
      "M60 30 L42 7 L34 7 L22 30 Z",
      "M126 45 L88 46 L58 51 L104 50 Z",
      "M30 40 L6 46 L0 46 L20 41 Z",
    ],
  },
  {
    // Twin-finned heavy fighter. The second fin is offset inboard and a little lower,
    // which is what reads as "two" from the side instead of smearing into one.
    id: "heavy",
    paths: [
      "M197 41 L170 35 L150 32 L44 30 L14 33 L6 39 L6 46 L20 49 L80 50 L150 46 Z",
      "M164 32 L154 21 L118 20 L108 31 Z",
      "M64 30 L46 5 L36 5 L26 30 Z",
      "M78 31 L62 10 L54 10 L44 31 Z",
      "M136 44 L92 45 L60 52 L108 51 Z",
      "M28 42 L4 49 L0 49 L18 43 Z",
    ],
  },
  {
    // High-wing four-engine transport. The upswept tail cone is the line that makes a
    // fat tube read as a freighter rather than an airliner.
    id: "transport",
    paths: [
      "M188 34 L176 30 L48 30 L16 33 L22 41 L70 49 L176 48 L188 44 Z",
      "M48 30 L30 7 L18 7 L12 32 Z",
      "M34 8 L6 11 L4 15 L34 13 Z",
      "M134 29 L98 29 L62 20 L110 20 Z",
      "M126 30 L108 30 L104 38 L122 38 Z",
      "M100 27 L84 27 L80 35 L96 35 Z",
    ],
  },
  {
    // Single main rotor. The mast is the whole trick: a disc drawn as a free-floating
    // bar reads as a detached line, so it is carried on a pylon that meets the cabin,
    // and its span is set from the mast rather than from the edges of the box.
    id: "rotary",
    paths: [
      "M112 34 L130 28 L162 28 C176 28 186 34 186 41 C186 48 178 52 166 52 L124 51 L112 44 Z",
      "M114 36 L40 39 L40 45 L114 46 Z",
      "M46 39 L34 18 L24 18 L26 40 Z",
      "M124 28 L126 21 L138 21 L140 28 Z",
      "M62 17 L198 17 L198 21 L62 21 Z",
      "M118 54 L176 54 L176 58 L118 58 Z",
      "M130 51 L138 51 L134 55 L126 55 Z",
      "M158 51 L166 51 L162 55 L154 55 Z",
    ],
  },
  {
    // Tandem rotor: a pylon at each end of the deck, the rear one taller, and discs
    // sized to overlap the way they actually intermesh from the side.
    id: "tandem",
    paths: [
      "M170 29 L182 36 L182 46 L168 54 L46 54 L26 47 L26 36 L44 29 Z",
      "M146 29 L148 16 L168 16 L172 29 Z",
      "M38 29 L44 8 L64 8 L70 29 Z",
      "M100 18 L200 18 L200 22 L100 22 Z",
      "M4 10 L108 10 L108 14 L4 14 Z",
      "M58 54 L70 54 L70 61 L58 61 Z",
      "M142 54 L154 54 L154 61 L142 61 Z",
    ],
  },
];

function Shape({ profile, flip }: { profile: Profile; flip: boolean }) {
  return (
    <svg
      viewBox="0 0 200 64"
      fill="currentColor"
      className="h-full w-auto shrink-0"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      role="presentation"
    >
      {profile.paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

/**
 * One marquee lane.
 *
 * The seam is the whole difficulty. The track is rendered at 200% of the field and
 * translated by half itself, so a cycle ends exactly one field-width along and the
 * second copy lands where the first began. Sizing each copy at `w-1/2` — a full field
 * width — is what makes that true at *every* viewport: let the copies size to their
 * contents instead and a wide window outruns the track, so each cycle ends on a strip
 * of empty space before it snaps back.
 *
 * The horizontal fade lives here rather than on the field, so the field is free to
 * carry the vertical one. Two masks on one element would need `mask-composite`.
 */
function Lane({
  height,
  duration,
  toRight,
  offset,
}: {
  height: string;
  duration: string;
  toRight?: boolean;
  offset: number;
}) {
  const order = [...FLEET.slice(offset), ...FLEET.slice(0, offset)];

  return (
    <div className="[mask-image:linear-gradient(90deg,transparent,#000_20%,#000_80%,transparent)]">
      <div
        className="fleet-drift flex w-[200%]"
        style={{
          animationDuration: duration,
          animationDirection: toRight ? "reverse" : "normal",
        }}
      >
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex w-1/2 shrink-0 items-center justify-around px-6"
          >
            {order.map((profile) => (
              <div key={profile.id} className={height}>
                <Shape profile={profile} flip={!toRight} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FleetDrift() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 flex flex-col justify-between overflow-hidden py-2 text-sky-300/[0.06] [mask-image:linear-gradient(180deg,#000,rgba(0,0,0,0.4)_24%,transparent_38%,transparent_62%,rgba(0,0,0,0.4)_76%,#000)]"
    >
      <Lane height="h-9 sm:h-12" duration="170s" offset={0} />
      <Lane height="h-7 sm:h-10" duration="130s" offset={3} toRight />
    </div>
  );
}
