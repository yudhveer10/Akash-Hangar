import type { Aircraft } from "@/lib/types";

export const mig29upg: Aircraft = {
  slug: "mig-29upg",
  name: "Mikoyan MiG-29UPG",
  shortName: "MiG-29UPG",
  category: "iaf",
  role: "Air superiority fighter",
  manufacturer: "Mikoyan (RSK MiG); upgraded with HAL participation",
  inServiceSince: "1987 (UPG upgrade from 2012)",
  serviceNote:
    "Known in Indian service as the Baaz. The UPG programme added aerial refuelling, new radar and an upgraded avionics suite.",
  specs: {
    length: "17.37 m",
    wingspan: "11.40 m",
    height: "4.73 m",
    maxSpeed: "Mach 2.25 (≈2,400 km/h at altitude)",
    range: "1,430 km on internal fuel",
    engine: "2 × Klimov RD-33 afterburning turbofans, 81.4 kN each",
    crew: "1",
  },
  description: [
    "The MiG-29 is a twin-engine air superiority fighter that entered Indian Air Force service in 1987, making India one of the earliest export operators of the type. Indian aircraft are locally named Baaz — hawk.",
    "The airframe is built around a blended body with large, curved leading-edge root extensions that sweep forward from the wing to the cockpit, generating vortex lift at high angles of attack. Two widely spaced engines sit in nacelles beneath the body, fed by intakes that on the original design could be closed by doors during ground operation to prevent debris ingestion. Twin outward-canted fins are mounted on booms either side of the engines.",
    "The UPG standard is a mid-life upgrade carried out from 2012 onward, which added an in-flight refuelling probe, the Zhuk-ME radar, new mission avionics and additional fuel capacity, and extended the airframe's service life. The upgraded aircraft serve in the air defence role.",
  ],
  modelLicense: "procedural (original)",
  animations: ["landingGear", "canopy", "afterburner", "controlSurfaces"],
  geometry: {
    kind: "fixedWing",
    segments: 26,
    fuselage: [
      { z: -8.4, width: 1.2, height: 0.9, y: 0.15 },
      { z: -7.2, width: 1.9, height: 1.1, y: 0.08 },
      { z: -5.4, width: 2.9, height: 1.35, y: 0.0 },
      { z: -3.0, width: 3.1, height: 1.5, y: 0.0 },
      { z: -0.6, width: 2.7, height: 1.55, y: 0.06 },
      { z: 1.8, width: 1.9, height: 1.48, y: 0.14 },
      { z: 3.8, width: 1.4, height: 1.24, y: 0.2 },
      { z: 5.8, width: 1.0, height: 0.94, y: 0.24 },
      { z: 7.6, width: 0.6, height: 0.56, y: 0.22 },
      { z: 8.7, width: 0.22, height: 0.2, y: 0.18 },
      { z: 8.97, width: 0.05, height: 0.05, y: 0.16 },
    ],
    wing: {
      root: [0, -0.14, 1.2],
      span: 5.7,
      rootChord: 5.6,
      tipChord: 1.35,
      sweep: 42,
      dihedral: -2,
      thickness: 0.045,
      rootExtension: 2.8,
      controlSurface: 0.2,
    },
    stabilator: {
      root: [0, 0.02, -4.6],
      span: 3.0,
      rootChord: 2.5,
      tipChord: 0.85,
      sweep: 45,
      thickness: 0.05,
    },
    fins: [
      {
        root: [1.15, 0.68, -3.2],
        span: 2.4,
        rootChord: 3.1,
        tipChord: 1.25,
        sweep: 47,
        cant: 6,
        thickness: 0.05,
      },
      {
        root: [-1.15, 0.68, -3.2],
        span: 2.4,
        rootChord: 3.1,
        tipChord: 1.25,
        sweep: 47,
        cant: 6,
        thickness: 0.05,
      },
    ],
    intakes: [
      { position: [1.0, -0.78, 1.2], width: 0.9, height: 0.8, length: 3.0, mirrored: true },
    ],
    engines: [
      {
        position: [0.82, -0.2, -5.0],
        length: 2.7,
        radius: 0.55,
        kind: "embedded",
        afterburner: true,
      },
      {
        position: [-0.82, -0.2, -5.0],
        length: 2.7,
        radius: 0.55,
        kind: "embedded",
        afterburner: true,
      },
    ],
    canopy: { z: 5.0, length: 2.6, width: 0.85, height: 0.42, y: 0.68, opens: true, seats: 1 },
    noseBoom: 1.1,
    stores: [
      { frac: 0.38, kind: "missile" },
      { frac: 0.58, kind: "missile" },
      { frac: 0.78, kind: "missile", length: 2.8 },
    ],
    gear: {
      nose: {
        position: [0, -0.6, 4.0],
        length: 1.2,
        wheelRadius: 0.27,
        retractAxis: [1, 0, 0],
      },
      main: [
        {
          position: [1.2, -0.68, -0.8],
          length: 1.4,
          wheelRadius: 0.38,
          retractAxis: [0, 0, 1],
        },
        {
          position: [-1.2, -0.68, -0.8],
          length: 1.4,
          wheelRadius: 0.38,
          retractAxis: [0, 0, -1],
        },
      ],
    },
    livery: {
      upper: "#6f7b87",
      lower: "#9ba5af",
      camo: { colour: "#59646f", scale: 3.0 },
      radome: "#3a4047",
    },
    markings: {
      roundel: 1.0,
      finFlash: true,
      serial: "KB 703",
    },
  },
  annotations: [
    {
      label: "Curved LERX",
      note:
        "Large curved root extensions sweep forward to the cockpit, generating vortex lift at high angle of attack.",
      position: [1.6, 0.1, 2.6],
    },
    {
      label: "Twin fins",
      note:
        "Mounted on booms either side of the widely spaced engines.",
      position: [1.15, 2.9, -4.0],
    },
    {
      label: "Underslung intakes",
      note:
        "Set below the blended body; the original design could close them on the ground to prevent debris ingestion.",
      position: [1.0, -0.85, 2.4],
    },
    {
      label: "RD-33 exhausts",
      note:
        "Two Klimov RD-33 afterburning turbofans, separated by a slim tail boom.",
      position: [0.82, -0.2, -7.6],
    },
    {
      label: "Refuelling probe",
      note:
        "Added under the UPG upgrade, along with new radar and extra internal fuel.",
      position: [0.4, 0.4, 5.4],
    },
  ],
  sources: [
    { label: "Indian Air Force — official site", url: "https://indianairforce.nic.in/" },
    { label: "Wikipedia — Mikoyan MiG-29", url: "https://en.wikipedia.org/wiki/Mikoyan_MiG-29" },
    {
      label: "Wikipedia — MiG-29 in Indian service",
      url: "https://en.wikipedia.org/wiki/Mikoyan_MiG-29#India",
    },
  ],
};
