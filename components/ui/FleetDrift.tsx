/**
 * The drifting silhouette field behind the motto.
 *
 * Deliberately *not* a wall of insignia. A slow horizontal band of marks behind a
 * hero line is the visual grammar of a partner or customer strip, and filling it
 * with Air Force crests would say the thing the whole site is built to avoid — see
 * rule 3 in CLAUDE.md. What drifts here instead is the fleet itself: aircraft
 * planforms, which are descriptive of the machines this site is about and carry no
 * claim of affiliation, in the same way the roundels on the 3D models do.
 *
 * The shapes are original artwork and generic to each type class rather than traced
 * from any published three-view, so nothing here is borrowed. They are ornament, not
 * content: no aircraft is named or captioned, because a silhouette this loose would
 * not survive the accuracy rule if it claimed to be a particular airframe.
 *
 * Authored nose-up in a 100 x 100 box so every type sits on the same scale.
 */

type Silhouette = { id: string; body: string; extras?: string[]; rotor?: number[] };

const FLEET: Silhouette[] = [
  {
    // Tailless delta with canards.
    id: "delta-canard",
    body: "M50 3 L52.5 20 L57 24 L59.5 31 L53 33 L53 42 L90 78 L90 86 L53 74 L53 89 L57 96 L43 96 L47 89 L47 74 L10 86 L10 78 L47 42 L47 33 L40.5 31 L43 24 L47.5 20 Z",
  },
  {
    // Twin-finned heavy fighter, wide body between the nozzles.
    id: "twin-fin",
    body: "M50 2 L53 17 L56 23 L56.5 33 L88 65 L88 73 L56.5 59 L58 77 L61 82 L59 95 L52.5 95 L51.5 74 L48.5 74 L47.5 95 L41 95 L39 82 L42 77 L43.5 59 L12 73 L12 65 L43.5 33 L44 23 L47 17 Z",
    extras: [
      "M60 52 L66.5 49.5 L69 66 L62 68 Z",
      "M40 52 L33.5 49.5 L31 66 L38 68 Z",
    ],
  },
  {
    // Swept delta, single fin.
    id: "swept-delta",
    body: "M50 4 L53 23 L54 39 L86 79 L86 87 L54 71 L54 88 L58 95 L42 95 L46 88 L46 71 L14 87 L14 79 L46 39 L47 23 Z",
  },
  {
    // Four-engine transport: long body, high aspect wing, underslung nacelles.
    id: "transport",
    body: "M50 3 L53.5 13 L55 43 L96 59 L96 67 L55 61 L55 79 L72 92 L72 96 L50 89 L28 96 L28 92 L45 79 L45 61 L4 67 L4 59 L45 43 L46.5 13 Z",
    extras: [
      "M62 46 L67.5 47.8 L67.5 60 L62 58.2 Z",
      "M75 50 L80.5 51.8 L80.5 63.5 L75 61.7 Z",
      "M38 46 L32.5 47.8 L32.5 60 L38 58.2 Z",
      "M25 50 L19.5 51.8 L19.5 63.5 L25 61.7 Z",
    ],
  },
  {
    // Single main rotor, boom and tail rotor. Blade angles listed separately so the
    // disc is drawn rather than described as one unreadable path.
    id: "rotary",
    body: "M50 16 C58 16 62 23 62 33 L62 50 L53 54 L53 82 L57 82 L57 90 L43 90 L43 82 L47 82 L47 54 L38 50 L38 33 C38 23 42 16 50 16 Z",
    rotor: [0, 45, 90, 135],
  },
  {
    // Tandem rotor: fuselage carries a hub at each end of the deck.
    id: "tandem",
    body: "M50 8 C57 8 61 14 61 22 L61 74 C61 84 57 90 50 90 C43 90 39 84 39 74 L39 22 C39 14 43 8 50 8 Z",
    extras: ["M61 62 L74 74 L74 88 L67 88 L61 78 Z", "M39 62 L26 74 L26 88 L33 88 L39 78 Z"],
  },
];

/** The rotor disc, as four blades about a hub rather than a ring. */
function Rotor({ angles, cy }: { angles: number[]; cy: number }) {
  return (
    <g>
      {angles.map((a) => (
        <rect
          key={a}
          x="6"
          y={cy - 1.6}
          width="88"
          height="3.2"
          rx="1.6"
          transform={`rotate(${a} 50 ${cy})`}
        />
      ))}
    </g>
  );
}

function Shape({ shape }: { shape: Silhouette }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      className="h-full w-auto shrink-0"
      role="presentation"
    >
      <path d={shape.body} />
      {shape.extras?.map((d) => (
        <path key={d} d={d} />
      ))}
      {shape.rotor ? <Rotor angles={shape.rotor} cy={33} /> : null}
      {shape.id === "tandem" ? (
        <>
          <Rotor angles={[0, 60, 120]} cy={20} />
          <Rotor angles={[30, 90, 150]} cy={72} />
        </>
      ) : null}
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
 */
function Lane({
  height,
  duration,
  reverse,
  offset,
}: {
  height: string;
  duration: string;
  reverse?: boolean;
  offset: number;
}) {
  const order = [...FLEET.slice(offset), ...FLEET.slice(0, offset)];

  return (
    <div
      className="fleet-drift flex w-[200%]"
      style={{
        animationDuration: duration,
        animationDirection: reverse ? "reverse" : "normal",
      }}
    >
      {[0, 1].map((copy) => (
        <div
          key={copy}
          className="flex w-1/2 shrink-0 items-center justify-around px-8"
        >
          {order.map((shape) => (
            <div key={shape.id} className={height}>
              <Shape shape={shape} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function FleetDrift() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 flex flex-col justify-center gap-10 overflow-hidden text-sky-300/[0.07] [mask-image:linear-gradient(90deg,transparent,#000_18%,#000_82%,transparent)]"
    >
      <Lane height="h-16 sm:h-24" duration="150s" offset={0} />
      <Lane height="h-10 sm:h-14" duration="110s" offset={3} reverse />
    </div>
  );
}
