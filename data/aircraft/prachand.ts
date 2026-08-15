import type { Aircraft } from "@/lib/types";

export const prachand: Aircraft = {
  slug: "prachand",
  name: "HAL Prachand (Light Combat Helicopter)",
  shortName: "Prachand",
  category: "iaf",
  role: "Attack helicopter — high-altitude operations",
  manufacturer: "Hindustan Aeronautics Limited",
  inServiceSince: "2022",
  serviceNote:
    "Formally inducted at Jodhpur in October 2022. Prachand means 'fierce' or 'severe'.",
  specs: {
    length: "15.80 m",
    wingspan: "13.30 m main rotor diameter",
    height: "4.70 m",
    maxSpeed: "268 km/h",
    range: "550 km",
    engine: "2 × HAL/Safran Shakti (Ardiden 1H1) turboshafts, 871 kW each",
    crew: "2 (pilot and weapon systems operator, in tandem)",
  },
  description: [
    "Prachand is an indigenous attack helicopter developed by Hindustan Aeronautics Limited, and the first attack helicopter designed specifically to operate at very high altitude. Its origins lie in the Kargil conflict of 1999, which exposed a gap in the ability to deliver precise fire at extreme elevations where thin air sharply reduces rotor performance and engine output.",
    "The airframe shares its dynamic system — rotor, transmission and Shakti engines — with the earlier Dhruv, but wraps it in a narrow fuselage with the two crew seated in tandem rather than side by side, which reduces the frontal area presented to ground fire. Stub wings carry weapons and stores, and the airframe includes armour protection, crashworthy landing gear and a self-sealing fuel system.",
    "The helicopter has demonstrated take-off and landing at forward bases at altitudes above 5,000 metres, which is the capability it was designed around. It is operated by both the Indian Air Force and the Indian Army.",
  ],
  modelLicense: "procedural (original)",
  animations: ["rotors", "controlSurfaces"],
  geometry: {
    kind: "rotorcraft",
    segments: 22,
    fuselage: [
      { z: -2.6, width: 1.15, height: 1.35, y: 0.75, exponent: 2.4 },
      { z: -1.0, width: 1.4, height: 1.7, y: 0.5, exponent: 2.6 },
      { z: 0.8, width: 1.45, height: 1.85, y: 0.3, exponent: 2.6 },
      { z: 2.4, width: 1.35, height: 1.75, y: 0.25, exponent: 2.4 },
      { z: 3.8, width: 1.15, height: 1.5, y: 0.3, exponent: 2.2 },
      { z: 5.0, width: 0.9, height: 1.1, y: 0.35 },
      { z: 6.0, width: 0.55, height: 0.65, y: 0.3 },
      { z: 6.6, width: 0.14, height: 0.16, y: 0.25 },
    ],
    boom: [
      { z: -8.6, width: 0.4, height: 0.5, y: 1.15 },
      { z: -7.2, width: 0.52, height: 0.6, y: 1.0 },
      { z: -5.0, width: 0.66, height: 0.78, y: 0.85 },
      { z: -2.4, width: 0.95, height: 1.15, y: 0.7 },
    ],
    rotors: [
      { hub: [0, 2.35, 0.9], radius: 6.65, blades: 4, chord: 0.42, coning: 3 },
      {
        hub: [0.3, 2.05, -8.2],
        radius: 1.32,
        blades: 4,
        chord: 0.2,
        vertical: true,
        direction: -1,
      },
    ],
    stubWings: {
      root: [0, 0.55, 1.3],
      span: 2.3,
      rootChord: 1.25,
      tipChord: 0.95,
      sweep: 4,
      dihedral: -6,
      thickness: 0.14,
    },
    stabilator: {
      root: [0, 1.15, -6.6],
      span: 1.5,
      rootChord: 1.0,
      tipChord: 0.7,
      sweep: 6,
      thickness: 0.12,
    },
    fins: [
      {
        root: [0, 1.1, -7.4],
        span: 1.5,
        rootChord: 2.0,
        tipChord: 1.0,
        sweep: 32,
        thickness: 0.14,
      },
    ],
    engines: [
      { position: [0.62, 1.75, -1.4], length: 2.2, radius: 0.42, kind: "pod" },
      { position: [-0.62, 1.75, -1.4], length: 2.2, radius: 0.42, kind: "pod" },
    ],
    canopy: { z: 3.4, length: 3.6, width: 0.88, height: 0.5, y: 1.05, seats: 2 },
    stores: [
      { frac: 0.7, kind: "rail", length: 1.9 },
      { frac: 0.45, kind: "missile", length: 1.5 },
    ],
    gear: {
      type: "wheels",
      nose: { position: [0, -0.35, 4.4], length: 0.85, wheelRadius: 0.22 },
      main: [
        { position: [1.25, -0.3, -0.4], length: 1.15, wheelRadius: 0.3 },
        { position: [-1.25, -0.3, -0.4], length: 1.15, wheelRadius: 0.3 },
      ],
    },
    livery: {
      upper: "#4c5849",
      lower: "#78817b",
      camo: { colour: "#3b4539", scale: 2.2 },
      radome: "#31363a",
    },
    markings: {
      roundel: 0.7,
      finFlash: true,
      serial: "LC 1801",
    },
  },
  annotations: [
    {
      label: "Tandem cockpit",
      note:
        "Crew sit one behind the other in a narrow fuselage, reducing the frontal area exposed to ground fire.",
      position: [0, 1.5, 3.4],
    },
    {
      label: "Hingeless main rotor",
      note:
        "Shared with the Dhruv, along with the transmission and the Shakti engines.",
      position: [0, 2.4, 0.9],
    },
    {
      label: "Stub wings",
      note:
        "Carry weapons and stores clear of the fuselage.",
      position: [1.8, 0.45, 1.2],
    },
    {
      label: "Shakti turboshafts",
      note:
        "Two HAL/Safran Shakti engines, the powerplant that makes very high-altitude operation possible.",
      position: [0.65, 2.0, -1.4],
    },
    {
      label: "Tail rotor",
      note:
        "Counters main-rotor torque, mounted on the fin at the end of the boom.",
      position: [0.35, 2.05, -8.2],
    },
  ],
  sources: [
    { label: "Indian Air Force — official site", url: "https://indianairforce.nic.in/" },
    { label: "Hindustan Aeronautics Limited", url: "https://hal-india.co.in/" },
    { label: "Wikipedia — HAL Prachand", url: "https://en.wikipedia.org/wiki/HAL_Prachand" },
  ],
};
