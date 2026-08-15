import type { Aircraft } from "@/lib/types";

export const tejas: Aircraft = {
  slug: "tejas",
  name: "HAL Tejas (Light Combat Aircraft)",
  shortName: "Tejas",
  category: "iaf",
  role: "Multirole light fighter",
  manufacturer: "Hindustan Aeronautics Limited / Aeronautical Development Agency",
  inServiceSince: "2016",
  serviceNote:
    "First delivered to No. 45 Squadron, the 'Flying Daggers', in July 2016.",
  specs: {
    length: "13.20 m",
    wingspan: "8.20 m",
    height: "4.40 m",
    maxSpeed: "Mach 1.6 (≈1,920 km/h)",
    range: "1,700 km ferry range",
    engine: "1 × General Electric F404-GE-IN20 afterburning turbofan, 84 kN",
    crew: "1 (two in the trainer variant)",
  },
  description: [
    "Tejas is an indigenous single-engine multirole fighter designed by the Aeronautical Development Agency and built by Hindustan Aeronautics Limited. It is the smallest and lightest aircraft in its class currently in frontline service, and was developed to replace the MiG-21 in Indian Air Force service.",
    "The layout is a tailless compound delta: there is no horizontal tail at all, and pitch, roll and part of the aircraft's trim are handled by elevons along the wing trailing edge. The wing's leading edge changes sweep partway out to the tip, which is what gives the planform its distinctive kinked outline. The airframe makes extensive use of carbon-fibre composites, which account for a large share of its structural weight.",
    "Because the configuration is aerodynamically relaxed-stability, the aircraft depends on a quadruplex digital fly-by-wire flight control system — itself developed in India — to remain flyable. Tejas achieved initial operational clearance in 2011 and final operational clearance in 2019, with the more capable Mk1A variant following in production.",
  ],
  modelLicense: "procedural (original)",
  animations: ["landingGear", "canopy", "afterburner", "controlSurfaces"],
  geometry: {
    kind: "fixedWing",
    segments: 24,
    fuselage: [
      { z: -6.6, width: 1.02, height: 0.98, y: 0.0 },
      { z: -5.4, width: 1.2, height: 1.12, y: 0.0 },
      { z: -3.6, width: 1.42, height: 1.3, y: 0.02 },
      { z: -1.4, width: 1.5, height: 1.36, y: 0.06 },
      { z: 0.8, width: 1.4, height: 1.34, y: 0.12 },
      { z: 2.6, width: 1.14, height: 1.18, y: 0.18 },
      { z: 4.2, width: 0.92, height: 0.94, y: 0.22 },
      { z: 5.6, width: 0.62, height: 0.6, y: 0.2 },
      { z: 6.4, width: 0.22, height: 0.2, y: 0.16 },
      { z: 6.6, width: 0.05, height: 0.05, y: 0.14 },
    ],
    wing: {
      root: [0, -0.18, 2.4],
      span: 4.1,
      rootChord: 7.4,
      tipChord: 0.75,
      sweep: 62,
      thickness: 0.045,
      kink: { at: 0.52, sweep: 44 },
      controlSurface: 0.24,
    },
    fins: [
      {
        root: [0, 0.5, -2.6],
        span: 2.05,
        rootChord: 3.5,
        tipChord: 1.15,
        sweep: 48,
        thickness: 0.05,
      },
    ],
    intakes: [
      { position: [0.86, -0.28, 1.6], width: 0.72, height: 0.86, length: 2.4, mirrored: true },
    ],
    engines: [
      {
        position: [0, 0.0, -4.4],
        length: 2.2,
        radius: 0.56,
        kind: "embedded",
        afterburner: true,
      },
    ],
    canopy: { z: 3.5, length: 2.4, width: 0.78, height: 0.38, y: 0.62, opens: true, seats: 1 },
    noseBoom: 1.5,
    stores: [
      { frac: 0.32, kind: "tank", length: 3.6 },
      { frac: 0.54, kind: "missile", length: 2.8 },
      { frac: 0.74, kind: "missile", length: 2.8 },
      { frac: 0.97, kind: "rail", length: 2.4, tip: true },
    ],
    gear: {
      nose: {
        position: [0, -0.5, 3.2],
        length: 1.05,
        wheelRadius: 0.24,
        retractAxis: [1, 0, 0],
      },
      main: [
        {
          position: [1.1, -0.5, -0.6],
          length: 1.15,
          wheelRadius: 0.3,
          retractAxis: [0, 0, 1],
        },
        {
          position: [-1.1, -0.5, -0.6],
          length: 1.15,
          wheelRadius: 0.3,
          retractAxis: [0, 0, -1],
        },
      ],
    },
    livery: {
      upper: "#8a939d",
      lower: "#a9b1b9",
      radome: "#333940",
    },
    markings: {
      roundel: 0.8,
      finFlash: true,
      serial: "LA 5015",
    },
  },
  annotations: [
    {
      label: "Cranked delta wing",
      note:
        "The leading edge changes sweep partway out, which is what gives the planform its kinked outline.",
      position: [2.6, -0.15, -0.6],
    },
    {
      label: "Elevons",
      note:
        "With no tailplane, these trailing-edge surfaces provide both pitch and roll control.",
      position: [2.2, -0.2, -4.2],
    },
    {
      label: "Composite structure",
      note:
        "A large share of the airframe structural weight is carbon-fibre composite, unusually high for its class.",
      position: [1.2, 0.4, 1.0],
    },
    {
      label: "Y-duct intakes",
      note:
        "Side inlets feed a single F404 engine through a Y-shaped duct.",
      position: [0.9, -0.3, 2.4],
    },
    {
      label: "Pitot boom",
      note:
        "The long probe on the nose carries air-data sensors clear of airflow disturbed by the fuselage.",
      position: [0, 0.15, 7.4],
    },
  ],
  sources: [
    { label: "Indian Air Force — official site", url: "https://indianairforce.nic.in/" },
    { label: "Hindustan Aeronautics Limited", url: "https://hal-india.co.in/" },
    { label: "Wikipedia — HAL Tejas", url: "https://en.wikipedia.org/wiki/HAL_Tejas" },
  ],
};
