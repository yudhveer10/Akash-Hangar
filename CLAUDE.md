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
components/ui/       cards, spec table, nav, footer, disclaimer
data/aircraft/       one typed file per aircraft, re-exported from index.ts
lib/                 types.ts (schema), aircraft.ts (server-side data access)
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

## Status

v1 scope is the 12 IAF aircraft. The `/world` section is deliberately **not built** —
`category: "world"` exists in the schema so it can be added later without a migration,
but the route, nav entry and data are out of scope until the aircraft list is confirmed.
