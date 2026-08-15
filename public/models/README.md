# Optional model overrides

Drop a Draco-compressed `.glb` here named after an aircraft's slug — for example
`su-30mki.glb` — and the viewer will load it instead of the procedural airframe.
No code or data change is needed; `lib/aircraft.ts` detects the file at build time.

Before adding anything to this directory:

1. **Check the licence.** Only self-built models, CC0/CC-BY assets, or models you hold a
   paid licence for may be used. Models from Sketchfab, TurboSquid, flight simulators or
   game rips are not usable here unless their licence explicitly permits redistribution
   on a public website.
2. **Record it.** Set `modelLicense` on the aircraft entry in `data/aircraft/<slug>.ts`
   to the correct value, and add the attribution to `sources` if the licence requires it.
3. **Match the axes.** Procedural geometry uses nose +Z, starboard +X, up +Y, in metres.
   A glb authored on different axes will import rotated.
4. **Name the clips.** Animation clips are matched by name — a clip containing
   `gear`, `canopy`, `afterburner`, `rotor` or `control` will be wired to the matching
   toggle automatically.

This directory is intentionally empty of models. Everything the site currently shows is
generated from code.
