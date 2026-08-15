# Akash Hangar

Interactive 3D models of Indian Air Force aircraft, with specifications and history
drawn from publicly available sources.

**akashhangar.in** — an independent, non-commercial educational project. Not affiliated
with, endorsed by, or connected to the Indian Air Force, the Ministry of Defence, or the
Government of India.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (prerenders every aircraft page) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run validate` | Geometry and content checks over all 12 airframes |
| `npm run preview` | Renders a contact sheet of every airframe to `.preview/fleet.png` |
| `npm run preview -- <slug>` | Renders one aircraft full-size, for checking detail |

## How the 3D models work

There are no model files in this repository, and none are downloaded at runtime. Each
aircraft is described as a set of parameters — fuselage cross-sections, wing planform,
fin sweep, engine and gear positions, what hangs off the pylons — and the geometry is
generated in the browser from that description.

It all rests on one primitive in `components/three/geometry/loft.ts`: `buildLoft` skins a
sequence of closed rings into a surface. A fuselage is a stack of superellipse rings along
Z; a wing is a stack of aerofoil rings along X. Fins are built flat and rotated upright,
because mirroring with a negative scale would invert their normals.

On top of that sit the details that make an airframe read as a machine rather than a
shape: nozzle petals, cockpit tubs and seats, canopy bows, pylons and stores, refuelling
probes, pitot booms, fan faces, navigation lights and rotor heads. The panel lines,
rivets and weathering are drawn into a canvas at runtime and converted to normal and
roughness maps, so even the surface finish ships as code rather than as an image file.

The winding rule is what `npm run validate` guards. A closed mesh whose triangles face
outward has positive signed volume, so the script computes it for every lofted part on
every aircraft — an inside-out wing is otherwise very easy to miss on a dark page. It also
checks each model's dimensions against the published figures in its own data file, and
bounds-checks every hand-placed annotation marker against the airframe.

### Adding a real model

Drop a `.glb` into `public/models/` named after the aircraft's slug and the viewer will
use it instead of the procedural airframe — no code change needed. Read
`public/models/README.md` first: licensing is not optional here, and the axis convention
and animation clip names both matter.

## Project layout

```
app/                 routes; layout.tsx renders the header and footer
components/three/    canvas, scene, viewer chrome, annotations
  geometry/          loft primitive, surfaces, parts, details, runtime textures
components/ui/       cards, spec table, planform silhouettes, footer
data/aircraft/       one typed file per aircraft
lib/                 types.ts (schema), aircraft.ts (server-side data access)
scripts/             geometry validation and the offline preview renderer
public/models/       optional .glb overrides, keyed by slug
```

## Liveries and markings

Each aircraft carries its real scheme — the Su-30's blue-grey mottle, the Jaguar's green
and dark-earth disruptive camouflage, the olive of the attack helicopters, grey over
lighter grey on the transports. Paint is written into the geometry as vertex colours,
blended by surface angle so every aircraft is darker on top than underneath, with
disruptive blotches layered over the upper surfaces where the type wears them.

National markings — tricolour roundels on the fuselage and wings, fin flashes, tail
serials — are drawn procedurally and projected onto the skin as conformal patches that
follow the body's curvature rather than floating flat against it.

These markings are depicted because they are painted on the real aircraft. None of it is
used as this site's own branding, which is original throughout; see `CLAUDE.md`.

## Anatomy view

Each aircraft carries a set of labelled points pinned to its airframe. Turning on the
anatomy panel marks them on the model and explains what each part does — canards,
leading-edge root extensions, thrust-vectoring nozzles, tandem rotors. Markers and the
list beside the canvas drive the same selection.

## Contributing content

Read `CLAUDE.md` before adding or editing an aircraft. The short version:

- Specifications and history must come from already-published sources, and every aircraft
  must cite them. If a figure cannot be sourced, leave it out.
- No third-party 3D models without a licence that permits this use.
- No official crest, roundel or state emblem as site branding.
- The disclaimer appears on every page via the footer — do not add a layout that bypasses
  it.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · React Three Fiber 9 · drei 10 ·
three 0.185 · @react-three/postprocessing · Tailwind CSS v4 · Motion
