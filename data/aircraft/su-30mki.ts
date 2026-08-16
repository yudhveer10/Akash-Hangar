import type { Aircraft } from "@/lib/types";

export const su30mki: Aircraft = {
  slug: "su-30mki",
  name: "Sukhoi Su-30MKI",
  shortName: "Su-30MKI",
  category: "iaf",
  role: "Air superiority / multirole heavy fighter",
  manufacturer: "Sukhoi — licence-built by Hindustan Aeronautics Limited",
  inServiceSince: "2002",
  serviceNote:
    "The numerical backbone of the fighter fleet, assembled in India by HAL at Nashik.",
  homeBase: "lohegaon",
  specs: {
    length: "21.94 m",
    wingspan: "14.70 m",
    height: "6.36 m",
    maxSpeed: "Mach 2.0 (≈2,120 km/h at altitude)",
    range: "3,000 km on internal fuel",
    engine: "2 × Saturn AL-31FP afterburning turbofans, 123 kN each",
    crew: "2 (pilot and weapon systems operator)",
  },
  description: [
    "The Su-30MKI is a twin-seat, twin-engine heavy fighter developed by Sukhoi to an Indian Air Force specification, combining the Su-30 airframe with canards, thrust-vectoring engine nozzles and avionics drawn from Russian, Indian, Israeli and French suppliers. The 'MKI' suffix denotes Modernizirovannyi Kommercheskiy Indiski — modernised, commercial, Indian.",
    "Its most distinctive feature is the aerodynamic layout: a long-span cranked delta wing blended into the fuselage by large leading-edge root extensions, a pair of close-coupled canards ahead of the wing, and widely separated engine nacelles carried beneath a flattened centre body. Combined with axisymmetric thrust vectoring, this gives the aircraft the very high angle-of-attack manoeuvrability it is known for at public airshow displays.",
    "The type entered Indian service in 2002 and is now assembled domestically by Hindustan Aeronautics Limited under licence, making it both the most numerous and the most locally-industrialised fighter in the fleet. It is flown in the air superiority, strike and maritime strike roles.",
  ],
  modelLicense: "procedural (original)",
  animations: ["landingGear", "canopy", "afterburner", "controlSurfaces"],
  geometry: {
    kind: "fixedWing",
    segments: 26,
    fuselage: [
      { z: -10.6, width: 1.05, height: 0.85, y: 0.2 },
      { z: -9.2, width: 1.7, height: 1.1, y: 0.12 },
      { z: -7.0, width: 3.3, height: 1.5, y: 0.0 },
      { z: -4.0, width: 3.6, height: 1.72, y: 0.0 },
      { z: -1.0, width: 3.15, height: 1.78, y: 0.05 },
      { z: 2.0, width: 2.25, height: 1.7, y: 0.12 },
      { z: 4.6, width: 1.66, height: 1.46, y: 0.2 },
      { z: 7.2, width: 1.2, height: 1.1, y: 0.26 },
      { z: 9.2, width: 0.78, height: 0.72, y: 0.26 },
      { z: 10.6, width: 0.26, height: 0.24, y: 0.22 },
      { z: 11.0, width: 0.05, height: 0.05, y: 0.2 },
    ],
    wing: {
      root: [0, -0.12, 1.6],
      span: 7.35,
      rootChord: 7.1,
      tipChord: 1.45,
      sweep: 42,
      dihedral: -2,
      thickness: 0.045,
      rootExtension: 2.4,
      controlSurface: 0.2,
    },
    canard: {
      root: [0, 0.42, 4.6],
      span: 2.6,
      rootChord: 2.0,
      tipChord: 0.72,
      sweep: 46,
      dihedral: -3,
      thickness: 0.05,
    },
    stabilator: {
      root: [0, -0.05, -4.6],
      span: 3.7,
      rootChord: 2.9,
      tipChord: 0.95,
      sweep: 43,
      thickness: 0.05,
    },
    fins: [
      {
        root: [1.35, 0.78, -3.4],
        span: 3.0,
        rootChord: 3.7,
        tipChord: 1.5,
        sweep: 43,
        cant: 15,
        thickness: 0.05,
      },
      {
        root: [-1.35, 0.78, -3.4],
        span: 3.0,
        rootChord: 3.7,
        tipChord: 1.5,
        sweep: 43,
        cant: 15,
        thickness: 0.05,
      },
    ],
    ventralFins: [
      {
        root: [1.5, -0.7, -4.6],
        span: 0.9,
        rootChord: 1.5,
        tipChord: 0.7,
        sweep: 40,
        cant: 22,
        thickness: 0.06,
      },
      {
        root: [-1.5, -0.7, -4.6],
        span: 0.9,
        rootChord: 1.5,
        tipChord: 0.7,
        sweep: 40,
        cant: 22,
        thickness: 0.06,
      },
    ],
    intakes: [
      { position: [1.15, -0.92, 1.5], width: 1.12, height: 0.95, length: 3.6, mirrored: true },
    ],
    engines: [
      {
        position: [0.98, -0.18, -6.4],
        length: 3.3,
        radius: 0.64,
        kind: "embedded",
        afterburner: true,
      },
      {
        position: [-0.98, -0.18, -6.4],
        length: 3.3,
        radius: 0.64,
        kind: "embedded",
        afterburner: true,
      },
    ],
    canopy: { z: 6.4, length: 3.6, width: 0.95, height: 0.46, y: 0.78, opens: true, seats: 2 },
    noseBoom: 1.3,
    stores: [
      { frac: 0.34, kind: "missile" },
      { frac: 0.55, kind: "missile" },
      { frac: 0.75, kind: "missile" },
      { frac: 0.96, kind: "rail", length: 2.6, tip: true },
    ],
    gear: {
      nose: {
        position: [0, -0.62, 5.4],
        length: 1.45,
        wheelRadius: 0.33,
        retractAxis: [1, 0, 0],
      },
      main: [
        {
          position: [1.35, -0.72, -1.2],
          length: 1.65,
          wheelRadius: 0.46,
          retractAxis: [0, 0, 1],
        },
        {
          position: [-1.35, -0.72, -1.2],
          length: 1.65,
          wheelRadius: 0.46,
          retractAxis: [0, 0, -1],
        },
      ],
    },
    livery: {
      upper: "#4d5d6e",
      lower: "#96a2ae",
      camo: { colour: "#687c92", scale: 3.2 },
      radome: "#3d444d",
    },
    markings: {
      roundel: 1.2,
      finFlash: true,
      serial: "SB 042",
    },
  },
  annotations: [
    {
      label: "Canards",
      note:
        "Small foreplanes ahead of the wing that shed vortices over it, sharpening pitch control at high angle of attack.",
      position: [1.5, 0.55, 4.3],
    },
    {
      label: "Leading-edge root extension",
      note:
        "The blended strake running forward from the wing root; it generates vortex lift when the nose is high.",
      position: [1.9, 0.1, 2.6],
    },
    {
      label: "Canted twin fins",
      note:
        "Angled outward so they stay in cleaner airflow when the fuselage blankets the tail at high alpha.",
      position: [1.35, 3.4, -4.2],
    },
    {
      label: "Thrust-vectoring nozzles",
      note:
        "The AL-31FP nozzles can be steered, which is what allows the very low-speed manoeuvres seen at airshows.",
      position: [1.0, -0.2, -9.9],
    },
    {
      label: "Engine intakes",
      note:
        "Widely spaced rectangular inlets under the strakes, feeding engines carried well apart in separate nacelles.",
      position: [1.2, -1.0, 3.3],
    },
    {
      label: "Tandem cockpit",
      note:
        "Two crew: pilot in front, weapon systems operator behind, under a single long canopy.",
      position: [0, 1.3, 6.4],
    },
  ],
  sources: [
    { label: "Indian Air Force — official site", url: "https://indianairforce.nic.in/" },
    { label: "Hindustan Aeronautics Limited", url: "https://hal-india.co.in/" },
    { label: "Wikipedia — Sukhoi Su-30MKI", url: "https://en.wikipedia.org/wiki/Sukhoi_Su-30MKI" },
  ],
};
