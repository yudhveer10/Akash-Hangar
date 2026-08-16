/**
 * Schema for everything the site knows about an aircraft.
 *
 * Specs are strings with units rather than numbers: they are quoted from public
 * sources, differ between variants, and are never computed. Keep them verbatim.
 */

export type Category = "iaf" | "world";

export type ModelLicense =
  | "procedural (original)"
  | "self-built"
  | "CC0"
  | "CC-BY (attribution)"
  | "licensed (paid)";

/** Animations the viewer can offer. Only list what the airframe actually has. */
export type AnimationId =
  | "landingGear"
  | "canopy"
  | "afterburner"
  | "rotors"
  | "controlSurfaces";

export interface Source {
  label: string;
  url: string;
}

/** A labelled hotspot pinned to a point on the airframe. */
export interface Annotation {
  label: string;
  /** One sentence on what the part does. Public, non-speculative. */
  note: string;
  position: [x: number, y: number, z: number];
}

/* ------------------------------------------------------------------ */
/* Airfield settings                                                   */
/* ------------------------------------------------------------------ */

/**
 * The landscape a station sits in. This is what the viewer's outdoor scene is built
 * from — the runway is the same everywhere, the country around it is not.
 */
export type TerrainId =
  | "himalayan"
  | "foothills"
  | "plateau"
  | "plains"
  | "urban"
  | "desert"
  | "coastal"
  | "hills";

/**
 * Time of day. Orthogonal to the landscape — any station can be seen at any of them,
 * and the runway lights only earn their keep at the last two.
 */
export type PhaseId = "day" | "dusk" | "night";

/**
 * An Air Force station the viewer can stand an aircraft on.
 *
 * Station locations and the units at them are published information, so they follow
 * the same rule as every other fact on the site: each entry carries its own sources,
 * and anything that could not be sourced is left out rather than estimated.
 */
export interface AirBase {
  id: string;
  /** Station name as published. */
  station: string;
  /** What the field is called in one word — the name in the viewer's picker. */
  short: string;
  city: string;
  state: string;
  /** Field elevation, quoted with units. Omitted where no figure could be sourced. */
  elevation?: string;
  terrain: TerrainId;
  /**
   * The time of day the station is first shown at, chosen for what suits the place —
   * a city field after dark, a coast at sunset, mountains in clear morning light.
   * Presentational, like `terrain`, and never a claim about when a station operates.
   * Visitors can change it, and doing so leaves this alone.
   */
  opensAt: PhaseId;
  /**
   * How this field differs from others sharing its landscape.
   *
   * The landscape says what kind of country a station sits in; this says what that
   * particular place is like — where its light comes from, how much cloud and haze
   * it carries, how green its ground is. Broad-brush and presentational, like
   * `terrain` and `opensAt`. Every field also gets its own cloud, star and terrain
   * pattern from its id, so no two skies are the same even where these agree.
   */
  character?: {
    /** Sun bearing in degrees, 0 = straight down the runway. Moves the shadows. */
    sun?: number;
    /** Multiplies the landscape's cloud cover. */
    clouds?: number;
    /** Multiplies the landscape's haze. */
    haze?: number;
    /** 0.5 leaves the landscape's ground as it is; 0 is parched, 1 is lush. */
    green?: number;
  };
  /** One sentence of public context: the unit based there, or what the field is known for. */
  note: string;
  sources: Source[];
}

export interface Specs {
  length: string;
  wingspan: string;
  height: string;
  maxSpeed: string;
  range: string;
  engine: string;
  crew: string;
}

/* ------------------------------------------------------------------ */
/* Procedural geometry configuration                                   */
/* ------------------------------------------------------------------ */

/**
 * Coordinate convention for every procedural part:
 *   +Z = nose, +X = starboard, +Y = up. Units are metres, real scale.
 */

/**
 * Paint scheme. Nearly every military aircraft is darker on top than underneath, so
 * the two are separate colours blended by surface angle rather than one flat tone.
 */
export interface Livery {
  /** Upper surface colour. */
  upper: string;
  /** Under-surface colour, usually a lighter grey. */
  lower: string;
  /** Disruptive camouflage patches over the upper surfaces. */
  camo?: { colour: string; scale: number };
  /** Radome and dielectric panels, typically a different material to the skin. */
  radome?: string;
}

/**
 * National and unit markings carried on the airframe.
 *
 * These depict what is actually painted on the aircraft — descriptive use, which is
 * why they belong here and nowhere near the site's own branding. See CLAUDE.md.
 */
export interface Markings {
  /** Roundel diameter in metres. Omit for no roundels. */
  roundel?: number;
  /** Subdued grey markings, as carried by most modern fast jets. */
  lowVis?: boolean;
  /** Tricolour fin flash. */
  finFlash?: boolean;
  /** Representative tail serial. Format follows the type's real series. */
  serial?: string;
}

/** A lifting surface: wing, canard, fin, stabilator or rotor blade. */
export interface SurfaceConfig {
  /** Spanwise station where the surface meets the body. */
  root: [x: number, y: number, z: number];
  /** Half-span, measured along X from `root`. */
  span: number;
  rootChord: number;
  tipChord: number;
  /** Leading-edge sweep in degrees, positive aft. */
  sweep: number;
  /** Degrees, positive tip-up. */
  dihedral?: number;
  /** Thickness-to-chord ratio. Fighters ~0.05, transports ~0.14. */
  thickness?: number;
  /** Optional kink for double-delta / cranked planforms, as a fraction of span. */
  kink?: { at: number; sweep: number };
  /** Blend the trailing edge into the body (LERX-style root extension). */
  rootExtension?: number;
  /** Degrees of incidence, positive nose-up. */
  incidence?: number;
  /** Vertical surfaces are built in the XY plane instead of XZ. */
  vertical?: boolean;
  /** Outward cant for twin fins, degrees. */
  cant?: number;
  /** Winglet height at the tip, metres. */
  winglet?: number;
  /** Movable trailing-edge fraction, animated by `controlSurfaces`. */
  controlSurface?: number;
}

/** One cross-section along the fuselage. */
export interface FuselageStation {
  /** Position along the body axis, metres from the tail. */
  z: number;
  width: number;
  height: number;
  /** Vertical offset of the section centre — gives the body its camber. */
  y?: number;
  /**
   * Superellipse exponent. 2 = ellipse (fighters), 4+ = increasingly
   * rectangular (transport cargo boxes).
   */
  exponent?: number;
}

export interface EngineConfig {
  position: [x: number, y: number, z: number];
  length: number;
  radius: number;
  /** Embedded = buried in the fuselage, pod = under-wing nacelle. */
  kind: "embedded" | "pod" | "turboprop";
  /** Draws an afterburner plume when the animation is on. */
  afterburner?: boolean;
  /** Turboprop only. */
  propeller?: { blades: number; radius: number };
}

export interface IntakeConfig {
  position: [x: number, y: number, z: number];
  width: number;
  height: number;
  length: number;
  /** Mirror to both sides of the centreline. */
  mirrored?: boolean;
}

export interface CanopyConfig {
  /** Centre of the canopy, metres along Z. */
  z: number;
  length: number;
  width: number;
  height: number;
  /** Base of the canopy above the fuselage centreline. */
  y: number;
  /** Hinges up and back when the `canopy` animation fires. */
  opens?: boolean;
  /** Seats modelled under the glass. Drives the frame layout too. */
  seats?: number;
  /** Suppresses the cockpit interior for transports with a flight-deck window band. */
  flightDeck?: boolean;
}

/** Something hung under a wing: pylon plus its store. */
export interface StoreConfig {
  /** Span fraction where the pylon hangs, 0 at the root and 1 at the tip. */
  frac: number;
  kind: "missile" | "tank" | "bomb" | "rail";
  /** Overrides the default length for that kind. */
  length?: number;
  /** Wingtip rails sit on the tip rather than below it. */
  tip?: boolean;
}

export interface GearLeg {
  position: [x: number, y: number, z: number];
  length: number;
  wheelRadius: number;
  /** Wheels per leg — main gear on transports is a bogie. */
  wheels?: number;
  /** Retraction direction: legs fold toward the body along this vector. */
  retractAxis?: [x: number, y: number, z: number];
}

export interface RotorConfig {
  hub: [x: number, y: number, z: number];
  radius: number;
  blades: number;
  chord: number;
  /** Spin direction, +1 or -1. Tandem rotors counter-rotate. */
  direction?: 1 | -1;
  /** Tail rotors are mounted vertically. */
  vertical?: boolean;
  /** Degrees of coning under load. */
  coning?: number;
}

export interface FixedWingConfig {
  kind: "fixedWing";
  fuselage: FuselageStation[];
  /** Fuselage cross-section resolution. Higher = rounder. */
  segments?: number;
  wing: SurfaceConfig;
  canard?: SurfaceConfig;
  stabilator?: SurfaceConfig;
  fins: SurfaceConfig[];
  ventralFins?: SurfaceConfig[];
  engines: EngineConfig[];
  intakes?: IntakeConfig[];
  canopy?: CanopyConfig;
  /** Pylons and stores under the wing, mirrored to both sides. */
  stores?: StoreConfig[];
  /** Air-to-air refuelling probe. */
  probe?: { position: [x: number, y: number, z: number]; length: number };
  /** Pitot boom projecting from the radome. */
  noseBoom?: number;
  gear: { nose: GearLeg; main: GearLeg[] };
  livery: Livery;
  markings?: Markings;
}

export interface RotorcraftConfig {
  kind: "rotorcraft";
  fuselage: FuselageStation[];
  segments?: number;
  /** Tail boom, built as a second loft. */
  boom?: FuselageStation[];
  rotors: RotorConfig[];
  /** Stub wings / weapon pylons on attack helicopters. */
  stubWings?: SurfaceConfig;
  /** Stores hung from the stub wings, mirrored to both sides. */
  stores?: StoreConfig[];
  fins: SurfaceConfig[];
  stabilator?: SurfaceConfig;
  engines: EngineConfig[];
  canopy?: CanopyConfig;
  gear:
    | { type: "wheels"; nose?: GearLeg; main: GearLeg[]; tail?: GearLeg }
    | { type: "skids"; height: number; length: number; width: number };
  livery: Livery;
  markings?: Markings;
}

export type GeometryConfig = FixedWingConfig | RotorcraftConfig;

/* ------------------------------------------------------------------ */

export interface Aircraft {
  slug: string;
  name: string;
  /** Short name for cards and nav. */
  shortName: string;
  category: Category;
  role: string;
  manufacturer: string;
  inServiceSince: string;
  /** Optional IAF-specific note: squadron, local name, induction detail. */
  serviceNote?: string;
  /**
   * Id of the station the type is publicly associated with, from `data/bases.ts`.
   * Sets the viewer's default setting; visitors can move the aircraft to any other
   * station from there.
   */
  homeBase?: string;
  specs: Specs;
  /** Two to four paragraphs, public sources only. */
  description: string[];
  /**
   * Explicit GLB override. Leave undefined — `lib/aircraft.ts` auto-detects
   * `public/models/<slug>.glb` and uses it when present.
   */
  modelPath?: string;
  modelLicense: ModelLicense;
  animations: AnimationId[];
  geometry: GeometryConfig;
  /** Labelled points of interest, shown when the viewer's parts mode is on. */
  annotations?: Annotation[];
  sources: Source[];
}

/** What the viewer actually receives after server-side model resolution. */
export interface ResolvedModel {
  /** Set when a .glb is available; the viewer prefers it over procedural geometry. */
  glbUrl: string | null;
}
