import type { Aircraft } from "@/lib/types";

export const rafale: Aircraft = {
  slug: "rafale",
  name: "Dassault Rafale",
  shortName: "Rafale",
  category: "iaf",
  role: "Omnirole multirole fighter",
  manufacturer: "Dassault Aviation",
  inServiceSince: "2020",
  serviceNote:
    "Inducted into No. 17 Squadron, the 'Golden Arrows', at Ambala in September 2020.",
  homeBase: "ambala",
  specs: {
    length: "15.27 m",
    wingspan: "10.90 m",
    height: "5.34 m",
    maxSpeed: "Mach 1.8 (≈1,912 km/h)",
    range: "1,850 km combat range on a typical mission profile",
    engine: "2 × Safran M88-2 afterburning turbofans, 75 kN each",
    crew: "1 (two in the DH twin-seat variant)",
  },
  description: [
    "The Rafale is a twin-engine delta-wing fighter built by Dassault Aviation, which the manufacturer describes as 'omnirole' — designed so that a single aircraft can carry out air defence, deep strike, reconnaissance and anti-shipping tasks within one sortie rather than being configured for a single mission type.",
    "Aerodynamically it pairs a low-set delta wing with close-coupled canards mounted high and just aft of the intakes. The canards sit in front of and above the wing so that the vortices they shed pass over the wing surface, which improves low-speed handling and high angle-of-attack control while keeping the airframe compact. A single swept fin carries the rudder; there is no horizontal tail.",
    "India ordered 36 aircraft in a government-to-government agreement signed in 2016, comprising single-seat EH and twin-seat DH variants. Deliveries began in 2019 and the first aircraft arrived in India in July 2020, entering service with No. 17 Squadron at Ambala and later No. 101 Squadron at Hasimara.",
  ],
  modelLicense: "procedural (original)",
  animations: ["landingGear", "canopy", "afterburner", "controlSurfaces"],
  geometry: {
    kind: "fixedWing",
    segments: 24,
    fuselage: [
      { z: -7.6, width: 1.5, height: 1.1, y: 0.0 },
      { z: -6.2, width: 1.82, height: 1.26, y: 0.0 },
      { z: -4.2, width: 2.05, height: 1.42, y: 0.02 },
      { z: -1.8, width: 2.0, height: 1.5, y: 0.06 },
      { z: 0.6, width: 1.7, height: 1.48, y: 0.12 },
      { z: 2.6, width: 1.32, height: 1.3, y: 0.18 },
      { z: 4.4, width: 1.0, height: 1.02, y: 0.22 },
      { z: 6.2, width: 0.66, height: 0.64, y: 0.2 },
      { z: 7.3, width: 0.24, height: 0.22, y: 0.16 },
      { z: 7.6, width: 0.05, height: 0.05, y: 0.14 },
    ],
    wing: {
      root: [0, -0.2, 2.2],
      span: 5.45,
      rootChord: 8.0,
      tipChord: 0.9,
      sweep: 48,
      thickness: 0.045,
      rootExtension: 0.9,
      controlSurface: 0.22,
    },
    canard: {
      root: [0, 0.5, 4.0],
      span: 1.85,
      rootChord: 1.5,
      tipChord: 0.55,
      sweep: 47,
      dihedral: -4,
      thickness: 0.05,
    },
    fins: [
      {
        root: [0, 0.62, -2.4],
        span: 2.2,
        rootChord: 3.4,
        tipChord: 1.1,
        sweep: 46,
        thickness: 0.05,
      },
    ],
    intakes: [
      { position: [1.0, -0.18, 2.6], width: 0.72, height: 0.92, length: 2.2, mirrored: true },
    ],
    engines: [
      {
        position: [0.52, -0.05, -5.2],
        length: 2.3,
        radius: 0.46,
        kind: "embedded",
        afterburner: true,
      },
      {
        position: [-0.52, -0.05, -5.2],
        length: 2.3,
        radius: 0.46,
        kind: "embedded",
        afterburner: true,
      },
    ],
    canopy: { z: 4.0, length: 2.6, width: 0.8, height: 0.4, y: 0.66, opens: true, seats: 1 },
    probe: { position: [0.34, 0.46, 5.9], length: 1.6 },
    stores: [
      { frac: 0.27, kind: "tank" },
      { frac: 0.46, kind: "missile" },
      { frac: 0.68, kind: "missile" },
      { frac: 0.96, kind: "rail", length: 2.6, tip: true },
    ],
    gear: {
      nose: {
        position: [0, -0.55, 4.2],
        length: 1.1,
        wheelRadius: 0.25,
        retractAxis: [1, 0, 0],
      },
      main: [
        {
          position: [1.25, -0.6, -1.2],
          length: 1.2,
          wheelRadius: 0.32,
          retractAxis: [0, 0, 1],
        },
        {
          position: [-1.25, -0.6, -1.2],
          length: 1.2,
          wheelRadius: 0.32,
          retractAxis: [0, 0, -1],
        },
      ],
    },
    livery: {
      upper: "#5a646f",
      lower: "#8c949d",
      radome: "#33383f",
    },
    markings: {
      roundel: 0.9,
      lowVis: true,
      finFlash: true,
      serial: "BS 001",
    },
  },
  annotations: [
    {
      label: "Close-coupled canards",
      note:
        "Mounted high and just aft of the intakes so their vortices pass over the wing, improving low-speed control.",
      position: [1.1, 0.6, 4.1],
    },
    {
      label: "Delta wing",
      note:
        "A low-set delta with no tailplane; pitch and roll both come from the elevons along the trailing edge.",
      position: [3.4, -0.15, -1.4],
    },
    {
      label: "Fixed refuelling probe",
      note:
        "Offset to starboard ahead of the cockpit, for air-to-air refuelling from a drogue.",
      position: [0.35, 0.5, 6.6],
    },
    {
      label: "Single fin",
      note:
        "One swept fin carries the rudder; the twin-fin layout of heavier fighters is not needed at this size.",
      position: [0, 2.4, -3.4],
    },
    {
      label: "M88 exhausts",
      note:
        "Two Safran M88 turbofans exhausting close together on the centreline.",
      position: [0.52, -0.05, -7.4],
    },
  ],
  sources: [
    { label: "Indian Air Force — official site", url: "https://indianairforce.nic.in/" },
    { label: "Dassault Aviation", url: "https://www.dassault-aviation.com/" },
    { label: "Wikipedia — Dassault Rafale", url: "https://en.wikipedia.org/wiki/Dassault_Rafale" },
  ],
};
