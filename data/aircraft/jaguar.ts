import type { Aircraft } from "@/lib/types";

export const jaguar: Aircraft = {
  slug: "jaguar",
  name: "SEPECAT Jaguar",
  shortName: "Jaguar",
  category: "iaf",
  role: "Ground attack / deep penetration strike",
  manufacturer: "SEPECAT (BAC / Breguet) — licence-built by Hindustan Aeronautics Limited",
  inServiceSince: "1979",
  serviceNote:
    "Named Shamsher in Indian service. India is the last operator of the type still flying it in frontline squadrons.",
  homeBase: "jamnagar",
  specs: {
    length: "16.83 m",
    wingspan: "8.69 m",
    height: "4.89 m",
    maxSpeed: "Mach 1.6 (≈1,699 km/h at altitude)",
    range: "908 km combat radius on a typical strike profile",
    engine: "2 × Rolls-Royce/Turbomeca Adour Mk811 afterburning turbofans, 32.5 kN each",
    crew: "1 (two in the IB trainer variant)",
  },
  description: [
    "The Jaguar is an Anglo-French strike aircraft developed by SEPECAT, a joint venture between Britain's BAC and France's Breguet. It was designed for low-level penetration: getting under radar coverage, crossing hostile territory fast and low, and delivering ordnance accurately.",
    "That role shaped the airframe. The wing is small, high-set on the shoulder of the fuselage and given pronounced anhedral, which keeps it clear of stores hung underneath and reduces the ride's sensitivity to low-altitude turbulence. Two comparatively small afterburning turbofans sit side by side in the rear fuselage. The tall, upright fin and the all-moving tailplane, also with anhedral, complete a layout built for stability at high speed and low level rather than for dogfighting.",
    "India selected the Jaguar in 1978, receiving initial aircraft directly before Hindustan Aeronautics Limited began licence production at Bengaluru. Indian aircraft have been progressively upgraded with the DARIN series of avionics standards, and the type remains in service in the strike and maritime strike roles.",
  ],
  modelLicense: "procedural (original)",
  animations: ["landingGear", "canopy", "afterburner", "controlSurfaces"],
  geometry: {
    kind: "fixedWing",
    segments: 24,
    fuselage: [
      { z: -8.4, width: 1.55, height: 1.05, y: 0.05 },
      { z: -7.0, width: 1.75, height: 1.2, y: 0.02 },
      { z: -5.0, width: 1.85, height: 1.34, y: 0.0 },
      { z: -2.6, width: 1.8, height: 1.4, y: 0.04 },
      { z: -0.2, width: 1.6, height: 1.4, y: 0.1 },
      { z: 2.2, width: 1.3, height: 1.28, y: 0.16 },
      { z: 4.4, width: 1.02, height: 1.0, y: 0.2 },
      { z: 6.4, width: 0.7, height: 0.66, y: 0.18 },
      { z: 8.0, width: 0.28, height: 0.26, y: 0.14 },
      { z: 8.4, width: 0.05, height: 0.05, y: 0.12 },
    ],
    wing: {
      root: [0, 0.55, 0.9],
      span: 4.35,
      rootChord: 4.2,
      tipChord: 1.35,
      sweep: 40,
      dihedral: -3,
      thickness: 0.06,
      controlSurface: 0.2,
    },
    stabilator: {
      root: [0, 0.28, -5.4],
      span: 2.4,
      rootChord: 2.1,
      tipChord: 0.85,
      sweep: 42,
      dihedral: -8,
      thickness: 0.055,
    },
    fins: [
      {
        root: [0, 0.66, -4.4],
        span: 2.35,
        rootChord: 3.4,
        tipChord: 1.35,
        sweep: 42,
        thickness: 0.055,
      },
    ],
    intakes: [
      { position: [1.0, 0.05, 1.6], width: 0.66, height: 0.8, length: 2.2, mirrored: true },
    ],
    engines: [
      {
        position: [0.48, -0.05, -6.0],
        length: 2.2,
        radius: 0.44,
        kind: "embedded",
        afterburner: true,
      },
      {
        position: [-0.48, -0.05, -6.0],
        length: 2.2,
        radius: 0.44,
        kind: "embedded",
        afterburner: true,
      },
    ],
    canopy: { z: 4.2, length: 2.4, width: 0.74, height: 0.36, y: 0.6, opens: true, seats: 1 },
    probe: { position: [0.42, 0.5, 5.4], length: 1.3 },
    stores: [
      { frac: 0.28, kind: "tank", length: 4.0 },
      { frac: 0.46, kind: "bomb" },
      { frac: 0.66, kind: "bomb" },
      { frac: 0.96, kind: "rail", length: 2.4, tip: true },
    ],
    gear: {
      nose: {
        position: [0, -0.6, 4.6],
        length: 1.1,
        wheelRadius: 0.26,
        wheels: 2,
        retractAxis: [1, 0, 0],
      },
      main: [
        {
          position: [0.95, -0.62, -0.6],
          length: 1.25,
          wheelRadius: 0.3,
          wheels: 2,
          retractAxis: [0, 0, 1],
        },
        {
          position: [-0.95, -0.62, -0.6],
          length: 1.25,
          wheelRadius: 0.3,
          wheels: 2,
          retractAxis: [0, 0, -1],
        },
      ],
    },
    livery: {
      upper: "#4f5b43",
      lower: "#9aa1a6",
      camo: { colour: "#5d5138", scale: 2.6 },
      radome: "#31363c",
    },
    markings: {
      roundel: 0.9,
      finFlash: true,
      serial: "JS 136",
    },
  },
  annotations: [
    {
      label: "Shoulder-mounted wing",
      note:
        "Set high on the fuselage with pronounced anhedral, keeping it clear of the stores hung underneath.",
      position: [2.4, 0.35, -0.4],
    },
    {
      label: "Anhedral tailplane",
      note:
        "The all-moving tailplane droops for the same reason as the wing, and to stay clear of its wake.",
      position: [1.6, 0.05, -6.0],
    },
    {
      label: "Adour engines",
      note:
        "Two comparatively small afterburning turbofans, sized for low-level speed rather than climb.",
      position: [0.48, -0.05, -8.0],
    },
    {
      label: "Refuelling probe",
      note:
        "Fixed probe ahead of the cockpit; the type was designed for long-range strike.",
      position: [0.42, 0.55, 6.2],
    },
    {
      label: "Twin-wheel gear",
      note:
        "Paired wheels on each leg spread the load for operations from rough or short strips.",
      position: [0.95, -1.6, -0.6],
    },
  ],
  sources: [
    { label: "Indian Air Force — official site", url: "https://indianairforce.nic.in/" },
    { label: "Hindustan Aeronautics Limited", url: "https://hal-india.co.in/" },
    { label: "Wikipedia — SEPECAT Jaguar", url: "https://en.wikipedia.org/wiki/SEPECAT_Jaguar" },
  ],
};
