import type { Aircraft } from "@/lib/types";

export const apache: Aircraft = {
  slug: "apache-ah-64e",
  name: "Boeing AH-64E Apache Guardian",
  shortName: "AH-64E Apache",
  category: "iaf",
  role: "Attack helicopter",
  manufacturer: "Boeing",
  inServiceSince: "2019",
  serviceNote:
    "First aircraft handed over in 2019 and inducted at Pathankot, with the fleet later based at Jorhat as well.",
  homeBase: "pathankot",
  specs: {
    length: "17.73 m",
    wingspan: "14.63 m main rotor diameter",
    height: "4.95 m",
    maxSpeed: "293 km/h",
    range: "476 km",
    engine: "2 × General Electric T700-GE-701D turboshafts, 1,410 kW each",
    crew: "2 (pilot and co-pilot/gunner, in tandem)",
  },
  description: [
    "The AH-64 Apache is a twin-engine attack helicopter designed around survivability and precision fire. The E model, sometimes called the Apache Guardian, is the current production standard, with more powerful engines, composite main rotor blades, improved drive train and the ability to control unmanned aircraft from the cockpit.",
    "The crew sit in tandem under a stepped canopy, with the co-pilot/gunner forward and the pilot behind and higher. The fuselage is narrow, and the two engines are mounted in nacelles on either side of the rotor mast rather than buried in the body. Stub wings carry weapons and external fuel. The four-bladed main rotor is paired with a distinctive tail rotor whose blades are set at an uneven angle to one another rather than evenly spaced, which spreads the acoustic signature across a wider range of frequencies and makes the helicopter less easy to pick out by ear.",
    "India signed for 22 aircraft in 2015, with the first handed over in 2019, and later ordered a further batch for the Indian Army. The Indian Air Force operates the type in the attack and armed reconnaissance roles.",
  ],
  modelLicense: "procedural (original)",
  animations: ["rotors", "controlSurfaces"],
  geometry: {
    kind: "rotorcraft",
    segments: 22,
    fuselage: [
      { z: -3.0, width: 1.25, height: 1.5, y: 0.8, exponent: 2.5 },
      { z: -1.4, width: 1.55, height: 1.9, y: 0.5, exponent: 2.6 },
      { z: 0.6, width: 1.6, height: 2.0, y: 0.3, exponent: 2.6 },
      { z: 2.4, width: 1.5, height: 1.85, y: 0.25, exponent: 2.4 },
      { z: 4.0, width: 1.25, height: 1.55, y: 0.3, exponent: 2.2 },
      { z: 5.4, width: 0.95, height: 1.15, y: 0.35 },
      { z: 6.4, width: 0.6, height: 0.7, y: 0.3 },
      { z: 7.1, width: 0.18, height: 0.2, y: 0.2 },
    ],
    boom: [
      { z: -9.2, width: 0.5, height: 0.62, y: 1.2 },
      { z: -7.6, width: 0.62, height: 0.74, y: 1.05 },
      { z: -5.4, width: 0.78, height: 0.92, y: 0.9 },
      { z: -2.8, width: 1.1, height: 1.3, y: 0.72 },
    ],
    rotors: [
      { hub: [0, 2.5, 0.5], radius: 7.32, blades: 4, chord: 0.53, coning: 3 },
      {
        hub: [0.35, 2.45, -8.8],
        radius: 1.4,
        blades: 4,
        chord: 0.22,
        vertical: true,
        direction: -1,
      },
    ],
    stubWings: {
      root: [0, 0.7, 1.2],
      span: 2.6,
      rootChord: 1.35,
      tipChord: 1.0,
      sweep: 3,
      dihedral: -8,
      thickness: 0.14,
    },
    stabilator: {
      root: [0, 0.85, -7.4],
      span: 1.75,
      rootChord: 1.1,
      tipChord: 0.8,
      sweep: 5,
      thickness: 0.12,
    },
    fins: [
      {
        root: [0, 1.15, -8.2],
        span: 1.6,
        rootChord: 2.2,
        tipChord: 1.05,
        sweep: 34,
        thickness: 0.14,
      },
    ],
    engines: [
      { position: [0.9, 1.75, -1.0], length: 2.6, radius: 0.5, kind: "pod" },
      { position: [-0.9, 1.75, -1.0], length: 2.6, radius: 0.5, kind: "pod" },
    ],
    canopy: { z: 3.6, length: 3.8, width: 0.94, height: 0.52, y: 1.1, seats: 2 },
    stores: [
      { frac: 0.72, kind: "rail", length: 2.0 },
      { frac: 0.46, kind: "missile", length: 1.6 },
    ],
    gear: {
      type: "wheels",
      main: [
        { position: [1.35, -0.4, 1.4], length: 1.25, wheelRadius: 0.32 },
        { position: [-1.35, -0.4, 1.4], length: 1.25, wheelRadius: 0.32 },
      ],
      tail: { position: [0, 0.55, -8.4], length: 0.62, wheelRadius: 0.16 },
    },
    livery: {
      upper: "#40483a",
      lower: "#4b5344",
      radome: "#2e3236",
    },
    markings: {
      roundel: 0.8,
      finFlash: true,
      serial: "AH 4101",
    },
  },
  annotations: [
    {
      label: "Tandem stepped cockpit",
      note:
        "Co-pilot and gunner forward, pilot behind and raised for a clear view over them.",
      position: [0, 1.5, 3.6],
    },
    {
      label: "Uneven tail rotor",
      note:
        "The blades sit at unequal angles to one another, spreading the noise across more frequencies.",
      position: [0.35, 2.45, -8.8],
    },
    {
      label: "Stub wings",
      note:
        "Carry weapons and external fuel on four hardpoints.",
      position: [2.0, 0.55, 1.2],
    },
    {
      label: "Side-mounted engines",
      note:
        "The two T700 turboshafts sit in nacelles either side of the mast rather than buried in the body.",
      position: [0.9, 1.8, -1.0],
    },
    {
      label: "Tailwheel gear",
      note:
        "A tailwheel layout rather than a nosewheel, with the main legs set well forward.",
      position: [1.35, -1.6, 1.4],
    },
  ],
  sources: [
    { label: "Indian Air Force — official site", url: "https://indianairforce.nic.in/" },
    { label: "Boeing Defense", url: "https://www.boeing.com/defense" },
    {
      label: "Wikipedia — Boeing AH-64 Apache",
      url: "https://en.wikipedia.org/wiki/Boeing_AH-64_Apache",
    },
  ],
};
