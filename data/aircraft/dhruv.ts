import type { Aircraft } from "@/lib/types";

export const dhruv: Aircraft = {
  slug: "dhruv",
  name: "HAL Dhruv (Advanced Light Helicopter)",
  shortName: "Dhruv",
  category: "iaf",
  role: "Utility / transport helicopter",
  manufacturer: "Hindustan Aeronautics Limited",
  inServiceSince: "2002",
  serviceNote:
    "Flown by the Sarang helicopter display team, and used across all three Indian armed services.",
  homeBase: "sulur",
  specs: {
    length: "15.87 m",
    wingspan: "13.20 m main rotor diameter",
    height: "4.98 m",
    maxSpeed: "290 km/h",
    range: "630 km",
    engine: "2 × HAL/Safran Shakti turboshafts, 1,067 kW each",
    crew: "2, with seating for up to 12 passengers",
  },
  description: [
    "The Dhruv is a twin-engine multirole helicopter designed and built by Hindustan Aeronautics Limited. Development began in the 1980s and the aircraft entered service in 2002. It is used by the Indian Air Force, Army, Navy and Coast Guard, as well as by civil operators, in roles ranging from transport and casualty evacuation to search and rescue.",
    "Its most notable engineering feature is the hingeless main rotor with composite blades, which gives crisper handling than the articulated rotors typical of helicopters in its weight class. The four-bladed main rotor is paired with a four-bladed tail rotor mounted on a conventional boom. Later production aircraft use the more powerful Shakti engine, developed jointly with Safran, which substantially improved hot-and-high performance.",
    "The type is flown by the Sarang display team, whose aircraft are painted in a distinctive peacock scheme. Dhruv also formed the technology base for the Prachand attack helicopter, which shares its engines, rotor and transmission.",
  ],
  modelLicense: "procedural (original)",
  animations: ["rotors", "controlSurfaces"],
  geometry: {
    kind: "rotorcraft",
    segments: 22,
    fuselage: [
      { z: -2.8, width: 1.35, height: 1.5, y: 0.85, exponent: 2.4 },
      { z: -1.2, width: 1.95, height: 1.95, y: 0.5, exponent: 2.4 },
      { z: 0.6, width: 2.15, height: 2.15, y: 0.25, exponent: 2.4 },
      { z: 2.4, width: 2.1, height: 2.05, y: 0.2, exponent: 2.3 },
      { z: 4.0, width: 1.85, height: 1.8, y: 0.25, exponent: 2.2 },
      { z: 5.2, width: 1.4, height: 1.35, y: 0.3 },
      { z: 6.1, width: 0.8, height: 0.75, y: 0.3 },
      { z: 6.6, width: 0.2, height: 0.2, y: 0.28 },
    ],
    boom: [
      { z: -8.4, width: 0.45, height: 0.55, y: 1.25 },
      { z: -7.0, width: 0.58, height: 0.68, y: 1.1 },
      { z: -5.2, width: 0.74, height: 0.86, y: 0.95 },
      { z: -2.6, width: 1.25, height: 1.35, y: 0.8 },
    ],
    rotors: [
      { hub: [0, 2.55, 0.6], radius: 6.6, blades: 4, chord: 0.5, coning: 3 },
      {
        hub: [0.32, 2.2, -8.0],
        radius: 1.3,
        blades: 4,
        chord: 0.2,
        vertical: true,
        direction: -1,
      },
    ],
    stabilator: {
      root: [0, 1.2, -6.4],
      span: 1.55,
      rootChord: 0.95,
      tipChord: 0.7,
      sweep: 4,
      thickness: 0.12,
    },
    fins: [
      {
        root: [0, 1.2, -7.2],
        span: 1.5,
        rootChord: 1.85,
        tipChord: 0.95,
        sweep: 30,
        thickness: 0.14,
      },
    ],
    engines: [
      { position: [0.72, 1.95, -1.2], length: 2.1, radius: 0.44, kind: "pod" },
      { position: [-0.72, 1.95, -1.2], length: 2.1, radius: 0.44, kind: "pod" },
    ],
    canopy: { z: 4.2, length: 3.0, width: 1.35, height: 0.66, y: 1.15, flightDeck: true },
    gear: {
      type: "wheels",
      nose: { position: [0, -0.55, 4.2], length: 0.8, wheelRadius: 0.22 },
      main: [
        { position: [1.5, -0.5, -0.6], length: 1.0, wheelRadius: 0.3 },
        { position: [-1.5, -0.5, -0.6], length: 1.0, wheelRadius: 0.3 },
      ],
    },
    livery: {
      upper: "#5e6b64",
      lower: "#838e87",
      radome: "#343940",
    },
    markings: {
      roundel: 0.9,
      finFlash: true,
      serial: "ZD 4062",
    },
  },
  annotations: [
    {
      label: "Hingeless main rotor",
      note:
        "Composite blades on a hingeless head give crisper handling than the articulated rotors typical of its class.",
      position: [0, 2.6, 0.6],
    },
    {
      label: "Shakti engines",
      note:
        "Developed with Safran; the more powerful Shakti substantially improved hot-and-high performance.",
      position: [0.75, 2.0, -1.2],
    },
    {
      label: "Wide cabin",
      note:
        "Seating for up to twelve, with large sliding doors for utility and casualty evacuation work.",
      position: [1.1, 0.4, 1.2],
    },
    {
      label: "Four-bladed tail rotor",
      note:
        "Mounted on a conventional boom to counter main-rotor torque.",
      position: [0.32, 2.2, -8.0],
    },
    {
      label: "Wheeled undercarriage",
      note:
        "Non-retractable tricycle gear, suited to the utility role the type flies.",
      position: [1.5, -1.3, -0.6],
    },
  ],
  sources: [
    { label: "Indian Air Force — official site", url: "https://indianairforce.nic.in/" },
    { label: "Hindustan Aeronautics Limited", url: "https://hal-india.co.in/" },
    { label: "Wikipedia — HAL Dhruv", url: "https://en.wikipedia.org/wiki/HAL_Dhruv" },
  ],
};
