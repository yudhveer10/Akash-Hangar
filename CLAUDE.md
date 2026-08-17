# Akash Hangar

Interactive 3D showcase of Indian Air Force aircraft. Independent, non-commercial,
educational. Domain: akashhangar.in

## Non-negotiable rules

These come from a legal review and constrain every change. Read before touching content.

1. **No third-party 3D models.** Never add a model sourced from Sketchfab, TurboSquid,
   flight-sim rips, or any asset whose licence does not explicitly permit this use.
   Geometry in this repo is original procedural code (see `components/three/geometry/`).
   A dropped-in `.glb` must have its licence recorded in the aircraft's `modelLicense`
   field before it ships.
2. **Public sources only.** Specs, history and role text must trace to already-published
   material (IAF site, Wikipedia, manufacturer, defence press). Never infer, estimate, or
   reconstruct non-public capability details. If a figure cannot be sourced, omit it.
3. **No implied official affiliation.** The IAF crest, roundel, and Ashoka-derived marks
   must never be used as site branding — not in the logo, header, favicon, or OG image.
   Depicting national markings *on an aircraft model* is descriptive and is fine, and is
   exactly what `components/three/geometry/markings.tsx` does. The line is: roundels and
   fin flashes go on the aircraft; the site's own identity stays original, and the
   palette stays sky-blue on navy rather than a tricolour treatment.
   The Air Force's motto sits on the home page under exactly the same line: quoted,
   transliterated, translated and attributed to the service with a source
   (`components/ui/Motto.tsx`), which makes it content like any other sourced fact.
   Moving it into the header, the wordmark, the favicon or the OG image would make it
   branding, and is not allowed.
4. **The disclaimer ships on every page.** It lives in `components/ui/SiteFooter.tsx` and
   is rendered by the root layout, so every route inherits it. Do not add a layout that
   bypasses it.
5. **Every aircraft cites its sources.** The `sources` array is required and is rendered
   at the bottom of each detail page.
6. Manufacturer and type names are used nominatively (descriptively). Never use a
   manufacturer logo, or any wording implying partnership or endorsement.

If the project ever goes commercial (ads, merch, sponsorship), the legal posture changes —
particularly under the Emblems and Names (Prevention of Improper Use) Act. Flag it, don't
just proceed.

## Stack

- Next.js 16 (App Router) + TypeScript, React 19
- React Three Fiber 9 + drei 10, three 0.185
- Tailwind CSS v4 (CSS-first config in `app/globals.css`, no `tailwind.config.js`)
- `motion` (Framer Motion 13) for restrained UI transitions
- npm (pnpm is not installed on this machine)

## How the 3D works

There is no dependency on external model files. Each aircraft is described by a typed
config in `data/aircraft/`, and `components/three/geometry/` turns that config into real
geometry at runtime:

- `loft.ts` — the core primitive. `buildLoft` takes rings of `Vector3` and skins them
  into a `BufferGeometry` with UVs. Every airframe part is a loft. Ring generators live
  here too: `superellipseRing` (fuselages, from round fighter bodies to boxy transports)
  and `airfoilRing` (wings, fins, stabilators, rotor blades).
- `surfaces.tsx` — the lifting surfaces and their animation: all-moving canards and
  stabilators, fins and rudders, and the wing's elevon/flaperon panels.
- `parts.tsx` — canopy, engines, nozzles, rotors, propellers, landing gear, intakes.
- `details.tsx` — the greebles that make it read as a machine: nozzle petals, cockpit
  tubs and ejection seats, canopy bows, pylons and stores, refuelling probes, pitot
  booms, fan faces, navigation lights and rotor heads.
- `textures.ts` — panel lines, rivets and weathering, drawn into a canvas at runtime and
  converted to normal and roughness maps. No image files, so no extra licences. Maps are
  generated once and tiled per part by cloning.
- `FixedWing.tsx` / `Rotorcraft.tsx` — assemble everything from a config.

**Winding matters.** Rings must be counter-clockwise seen from the direction the loft
advances in. Vertical surfaces are therefore built flat and *rotated* upright, never
mirrored with a negative scale, which would invert their normals. `npm run validate`
guards this — see below.

**GLB override.** `lib/aircraft.ts` checks `public/models/<slug>.glb` at build time. If the
file exists, the viewer loads it instead of the procedural airframe — no data edit needed.
An explicit `modelPath` in the aircraft data takes precedence over both. Record the licence
in `modelLicense` when you add one.

Coordinate convention for all procedural geometry: **nose +Z, starboard +X, up +Y**, and
models are authored in metres at real scale. The viewer frames them automatically.

## Layout

```
app/                 routes; layout.tsx renders header + footer (disclaimer)
components/three/    Canvas, scene, viewer chrome, procedural geometry
  environment/       the outdoor setting: runway, terrain, sky, airfield buildings
components/ui/       cards, spec table, nav, footer, disclaimer
data/aircraft/       one typed file per aircraft, re-exported from index.ts
data/bases.ts        Air Force stations, with sources
data/roadmap.ts      what is being built next; rendered by components/ui/ComingSoon.tsx
lib/                 types.ts (schema), aircraft.ts (server-side), bases.ts (station lookups),
                     site.ts (canonical URL, CONTACT_EMAIL)
public/models/       optional .glb overrides, keyed by slug
```

## Conventions

- Aircraft data is TypeScript, not JSON, so the geometry config is type-checked against
  the builders. `lib/types.ts` is the single source of truth for the schema.
- Anything using `<Canvas>`, hooks, or browser APIs is a client component. Pages stay
  server components and pass plain props down.
- Specs are stored as pre-formatted strings with units (`"21.94 m"`), not numbers — they
  are quoted from sources, not computed, and variants differ.

## Commands

```bash
npm run dev        # dev server
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run validate   # geometry + content checks across all aircraft
npm run preview    # renders every airframe to .preview/fleet.png
```

`npm run preview` assembles each aircraft exactly as the React components do and
rasterises it to a PNG in pure Node — no browser or GPU. Use it to actually *look* at a
shape change when a dev server isn't available. It backface-culls, so an inverted part
shows up as a hole. Pass a slug for one aircraft at full resolution:

```bash
npm run preview -- su-30mki
```

The preview renderer duplicates the assembly transforms from the React components. When
you change how a part is positioned, change it in both, or the preview stops telling you
the truth. Shared shape maths (`nacelleProfile`, `planformAt`) is imported rather than
copied for exactly this reason.

## Liveries and markings

Paint is applied as **vertex colours**, not shader code: `applyLivery` walks a lofted
geometry and blends `livery.upper` into `livery.lower` by each vertex's surface angle,
then layers optional disruptive `camo` blotches over the upper surfaces. Two consequences
worth knowing:

- The material is a stock `MeshStandardMaterial` with `vertexColors` on. Parts built from
  primitives rather than lofts (pylons, gear doors, skid struts) have no vertex colours,
  so they use `SolidAirframe` with an explicit colour instead.
- The offline preview renderer reads the same attribute, so `npm run preview` shows the
  real scheme rather than a flat grey stand-in.

Markings are **conformal patches**, not decals. `fuselagePatch` samples the same
superellipse sections the body is built from and lifts the result a couple of centimetres
clear of the skin; `surfacePatch` does the same on an aerofoil. Both size themselves in
metres, which matters: deriving the fuselage sweep from the section's half-width squashes
the roundel on a flattened flank, and following the chord *fraction* on a swept wing
shears a roundel into a parallelogram. Both bugs existed and are fixed — don't reintroduce
them by switching back to fractions.

Serials are representative of each type's real series rather than specific airframes.

## Airfield settings

The viewer can stand an aircraft on a runway instead of in the studio hangar. Each
aircraft names a `homeBase` — the station it opens at — and the picker in the viewer
can move it to any other station in `data/bases.ts`, at any time of day.

A scene is **landscape × phase × station**, resolved in `scene.ts`:

- the **landscape** (`presets.ts`) is the country a field sits in, in daylight;
- the **phase** (`phases.ts`) is day, dusk or night, expressed as colour targets and
  weights rather than as scenes of its own, so eight landscapes and three phases give
  twenty-four looks out of eleven definitions;
- the **station** makes it a particular place. Its id seeds the terrain, the clouds
  and the stars, so two fields sharing a landscape are not the same field — before
  that, the six plains stations were literally identical ground under an identical
  sky. Its `character` block moves the sun's bearing, the cloud cover, the haze and
  how green the ground is. And `opensAt` names the phase it opens on, so picking a
  station snaps to the look that suits it — a city field after dark, a coast at
  sunset — with the phase buttons overriding that until the next station is picked.

Sun bearing is a station's, not a landscape's, and both the shadows and the sun in
the sky read from the same number, so moving it moves both. It also drives the shadow
camera: a 6° dusk sun throws a shadow near sixty metres long, and the camera widens
as the sun drops rather than cutting it off partway down the runway.

`blend` in `scene.ts` mixes **in sRGB, not through `THREE.Color`**, which works in
linear space. Ninety per cent of the way from a bright horizon toward near-black comes
back as mid grey in linear, and every night sky in the place resolved to dusk. Weights
in `phases.ts` are written to mean what they say.

Everything is generated, like the airframes:

- `layout.ts` — the dimensions everything else agrees on. A 45 m runway with 7.5 m
  shoulders, threshold at z = −170, so the aircraft stands on the centreline a little
  way down it with the piano keys behind and 2.4 km of runway ahead.
- `noise.ts` / `terrain.ts` — the ground. A height function plus a polar mesh with
  geometrically spaced rings: dense underfoot, coarse at the horizon. Two masks shape
  it — the **strip mask** holds the ground flat along the runway, and **growth** makes
  relief taller with distance so a valley reads as near walls with ranges behind.
  Colour is a vertex attribute derived from height and slope, the same technique the
  liveries use.
- `Runway.tsx` — pavement and lights. Markings are the international standard set,
  which is what makes a grey strip read as a runway.
- `textures.ts` — the sky, painted into an equirectangular canvas with its sun always
  at u = 0.5 and then *rotated* into place, plus the asphalt maps. The sky doubles as
  the scene's environment map, which is most of why the aircraft looks like it is
  really outside. Skies are per station per phase and eight megabytes each, so they
  are held in a four-entry most-recently-used cache and the rest are disposed —
  wandering the whole station list must not accumulate a few hundred megabytes of
  texture. The entry just asked for is always the newest, so it is never the one
  evicted out from under the renderer.
- `presets.ts` — the eight landscapes (`himalayan`, `foothills`, `plateau`, `plains`,
  `urban`, `desert`, `coastal`, `hills`) with their light, air and palette. `plateau`
  uses the terrain builder's `terrace` step, because country that erodes in layers
  wears into flat tops rather than peaks.
- `phases.ts` / `scene.ts` — time of day, and the resolver that combines it with a
  landscape and a station.
- `Airfield.tsx` — tower, hangars, windsock, and for an `urban` field a skyline beyond
  the boundary. Generic structures for scale, with no insignia or signage: the
  branding rule applies here too. Their windows light up with the phase, driven by the
  same `lamps` value as the runway lighting.

**Nothing may share a height with anything it overlaps.** Every surface takes its
level from `HEIGHT` in `layout.ts` — ground below shoulders below taxiway below
runway. The scene is 2.4 km long against a depth buffer that reaches 4 km, which
resolves about a centimetre at 300 m and half a metre at the far threshold, so two
coplanar surfaces do not pick a winner: they tear into stripes that crawl as the
camera orbits. That shipped once, from the ground plane and the runway slab both
sitting at zero.

The same arithmetic is why the runway's **markings are baked into its texture**
rather than floated above it as geometry, the way a decal would be at close range.
Baked, there is nothing to fight, and the paint mipmaps — thin white lines fade into
the distance instead of crawling, which matters with `antialias: false` on the canvas.
`npm run validate` checks the heights for collisions and the markings for fitting on
the slab.

**No runway designator is painted.** The number depends on a real field's magnetic
heading, and inventing one would be inventing a fact about a real station. The
markings that are painted are identical at every airfield in the world, so they claim
nothing.

**Stations are content, not decoration.** A base carries a city, a state, a note and
its own `sources`, and is held to the sourcing rule like everything else — the viewer
renders the station's sources next to it, and the aircraft page merges its home base's
sources into the page list. `terrain`, `opensAt` and `character` are the editorial
fields: between them they say what kind of country a place is, when it is best seen,
and what its light and weather are broadly like. None is a survey of a real field, a
claim about when a station operates, or a forecast. Moving an aircraft to a station it
does not fly from is labelled as a setting, in as many words.

To add a station: append to `data/bases.ts` with at least one source and a terrain
that already exists, then `npm run validate`.

## The home page landing

The hero is not a turntable: the featured aircraft flies an approach onto the runway at
its own station, touches down, rolls to a stop, and only then hands the camera over to
the ordinary orbit controls. It is the same `BaseEnvironment` the aircraft pages use, so
there is one airfield in the codebase and not two.

The path is **pure maths in `components/three/approach.ts`** — no React, no three — and
that is the point: `npm run validate` flies it a step at a time and checks what a still
cannot show. That the aircraft never sinks through the runway, never gains height again
mid-flare, never rolls backwards; that it crosses the threshold at a sane height, touches
down inside the touchdown zone markings, stops on the pavement and parks level; that its
tail clears the runway at the steepest attitude the flare asks for; and that the camera
stays above ground, outside the aircraft, and keeps it inside the frame. `HeroApproach.tsx`
only mounts that path — the aircraft pitched about its main wheels rather than the model
origin, and the tyre smoke, whose ages are read off the same clock so a replay rewinds it.

Two things the sequence needs from elsewhere. `BaseEnvironment` takes an optional `focus`
ref: the sun's shadow camera covers about a hundred metres and the aircraft covers five
times that, so the light and its target ride along. And the camera damps its **offset from
the aircraft**, not its world position — damping the position leaves the camera permanently
trailing an aircraft flying at a steady 72 m/s, when what wants softening is only the change
from one shot to the next.

## Annotations

Each aircraft carries an `annotations` array — labelled points pinned to coordinates on
the airframe, surfaced by the viewer's anatomy panel. They are hand-placed, so the
validator bounds-checks every one against the model. Notes follow the same sourcing rule
as everything else: describe what a part does from public material, never speculate.

**Run `npm run validate` after touching geometry.** Types cannot catch a ring wound the
wrong way, and an inverted mesh is hard to spot on a dark page — so the script computes
the signed volume of every lofted part (positive means the triangles face outward) and
checks each model's dimensions against the published figures in its own data file. It
also enforces the content rules above: sources present, description long enough,
animations declared.

It covers the airfield too, which has the same failure mode and worse symptoms: that
the ground faces upward, that it is dead flat under the whole length of the runway,
its shoulders and the apron (terrain creeping above zero swallows the runway; sagging
below it leaves the far end in mid-air — a real bug this check caught), that relief
actually arrives once clear of the strip, that no two airfield surfaces share a
height, and that every station is sourced and points at a landscape that exists.

Terrain checks run **per station, not per landscape**, since each station seeds its
own ground: a landscape that behaves on one seed can put the field on a flat patch or
a hillside on another. Every station is also resolved at all three phases, to catch a
blend that produces something that is not a colour.

## Status

v1 scope is the 12 IAF aircraft. The `/world` section is deliberately **not built** —
`category: "world"` exists in the schema so it can be added later without a migration,
but the route, nav entry and data are out of scope until the aircraft list is confirmed.

What is not built yet is stated on the site rather than left implied: `data/roadmap.ts`
holds the list, `components/ui/ComingSoon.tsx` renders it on the home page (`/#next`)
and, in its list form, on the about page. Two rules for editing it — **no dates**, since
none can be kept, and nothing may be promised there that the content rules above would
not allow to ship. The cockpit view is the featured item, and its instrument panels are
committed to published cockpit photographs and manufacturer material only.
