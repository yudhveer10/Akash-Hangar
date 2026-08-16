import type { Aircraft } from "@/lib/types";

export const mirage2000: Aircraft = {
  slug: "mirage-2000",
  name: "Dassault Mirage 2000",
  shortName: "Mirage 2000",
  category: "iaf",
  role: "Multirole fighter",
  manufacturer: "Dassault Aviation",
  inServiceSince: "1985",
  serviceNote:
    "Named Vajra in Indian service. The fleet was upgraded to the Mirage 2000I/TI standard from 2011.",
  homeBase: "gwalior",
  specs: {
    length: "14.36 m",
    wingspan: "9.13 m",
    height: "5.20 m",
    maxSpeed: "Mach 2.2 (≈2,336 km/h at altitude)",
    range: "1,550 km ferry range with drop tanks",
    engine: "1 × SNECMA M53-P2 afterburning turbofan, 95 kN",
    crew: "1 (two in the TI trainer variant)",
  },
  description: [
    "The Mirage 2000 is a single-engine multirole fighter built by Dassault Aviation around a pure delta wing. Unlike the Rafale that followed it, there are no canards and no horizontal tail — the aircraft is controlled in pitch and roll entirely by elevons along the wing's trailing edge, with a single swept fin carrying the rudder.",
    "The delta planform gives a large wing area for its size, which suits high-altitude interception and high-speed flight, at the cost of higher induced drag in tight turns. Dassault offset the configuration's traditionally poor low-speed handling by giving the aircraft relaxed static stability managed by an analogue fly-by-wire system, along with automatic leading-edge slats that extend as angle of attack increases.",
    "India ordered the type in 1982 and the first aircraft arrived in 1985. The fleet was subsequently upgraded to the Mirage 2000I standard, which introduced a new radar, glass cockpit, updated electronic warfare suite and compatibility with newer air-to-air missiles.",
  ],
  modelLicense: "procedural (original)",
  animations: ["landingGear", "canopy", "afterburner", "controlSurfaces"],
  geometry: {
    kind: "fixedWing",
    segments: 24,
    fuselage: [
      { z: -7.2, width: 1.02, height: 0.98, y: 0.0 },
      { z: -6.0, width: 1.24, height: 1.18, y: 0.0 },
      { z: -4.2, width: 1.44, height: 1.36, y: 0.02 },
      { z: -1.8, width: 1.5, height: 1.44, y: 0.06 },
      { z: 0.6, width: 1.36, height: 1.4, y: 0.12 },
      { z: 2.6, width: 1.08, height: 1.2, y: 0.18 },
      { z: 4.2, width: 0.86, height: 0.9, y: 0.22 },
      { z: 5.8, width: 0.56, height: 0.54, y: 0.2 },
      { z: 6.9, width: 0.2, height: 0.19, y: 0.16 },
      { z: 7.18, width: 0.05, height: 0.05, y: 0.14 },
    ],
    wing: {
      root: [0, -0.16, 2.7],
      span: 4.57,
      rootChord: 8.1,
      tipChord: 0.6,
      sweep: 58,
      thickness: 0.04,
      controlSurface: 0.24,
    },
    fins: [
      {
        root: [0, 0.54, -2.2],
        span: 2.35,
        rootChord: 3.6,
        tipChord: 1.0,
        sweep: 52,
        thickness: 0.05,
      },
    ],
    intakes: [
      { position: [0.92, -0.1, 2.4], width: 0.62, height: 0.78, length: 2.0, mirrored: true },
    ],
    engines: [
      {
        position: [0, 0.0, -4.9],
        length: 2.2,
        radius: 0.52,
        kind: "embedded",
        afterburner: true,
      },
    ],
    canopy: { z: 3.7, length: 2.5, width: 0.76, height: 0.38, y: 0.62, opens: true, seats: 1 },
    noseBoom: 1.3,
    stores: [
      { frac: 0.3, kind: "tank", length: 4.2 },
      { frac: 0.55, kind: "missile" },
      { frac: 0.78, kind: "missile", length: 2.8 },
    ],
    gear: {
      nose: {
        position: [0, -0.52, 3.6],
        length: 1.05,
        wheelRadius: 0.24,
        retractAxis: [1, 0, 0],
      },
      main: [
        {
          position: [1.05, -0.55, -0.5],
          length: 1.15,
          wheelRadius: 0.3,
          retractAxis: [0, 0, 1],
        },
        {
          position: [-1.05, -0.55, -0.5],
          length: 1.15,
          wheelRadius: 0.3,
          retractAxis: [0, 0, -1],
        },
      ],
    },
    livery: {
      upper: "#5c6e7e",
      lower: "#9aa8b4",
      camo: { colour: "#42515f", scale: 3.4 },
      radome: "#31363c",
    },
    markings: {
      roundel: 0.9,
      finFlash: true,
      serial: "KF 107",
    },
  },
  annotations: [
    {
      label: "Pure delta wing",
      note:
        "No canards and no tailplane: an unusually clean planform, giving large wing area for its size.",
      position: [2.6, -0.15, -0.4],
    },
    {
      label: "Elevons",
      note:
        "The only pitch and roll control the aircraft has, running along the delta trailing edge.",
      position: [2.2, -0.2, -4.4],
    },
    {
      label: "Leading-edge slats",
      note:
        "Extend automatically as angle of attack rises, offsetting the delta usual poor low-speed handling.",
      position: [3.2, -0.05, -1.6],
    },
    {
      label: "Half-cone intakes",
      note:
        "The shock cone in each side inlet slows incoming air for the M53 engine at supersonic speed.",
      position: [0.95, -0.1, 3.2],
    },
    {
      label: "Single fin",
      note:
        "A tall swept fin carrying the rudder, with the airbrakes just ahead of it on the wing.",
      position: [0, 2.3, -3.0],
    },
  ],
  sources: [
    { label: "Indian Air Force — official site", url: "https://indianairforce.nic.in/" },
    { label: "Dassault Aviation", url: "https://www.dassault-aviation.com/" },
    {
      label: "Wikipedia — Dassault Mirage 2000",
      url: "https://en.wikipedia.org/wiki/Dassault_Mirage_2000",
    },
  ],
};
