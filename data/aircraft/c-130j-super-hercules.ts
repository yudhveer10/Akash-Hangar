import type { Aircraft } from "@/lib/types";

export const c130j: Aircraft = {
  slug: "c-130j-super-hercules",
  name: "Lockheed Martin C-130J Super Hercules",
  shortName: "C-130J",
  category: "iaf",
  role: "Tactical airlift / special operations",
  manufacturer: "Lockheed Martin",
  inServiceSince: "2011",
  serviceNote:
    "Indian aircraft are the stretched C-130J-30, configured for special operations and operated from Hindan and Panagarh.",
  specs: {
    length: "34.37 m",
    wingspan: "40.41 m",
    height: "11.84 m",
    maxSpeed: "671 km/h",
    range: "3,334 km with a 15,900 kg payload",
    engine: "4 × Rolls-Royce AE 2100D3 turboprops, 3,458 kW each",
    crew: "3 (two pilots and a loadmaster)",
  },
  description: [
    "The C-130J Super Hercules is the current production version of a tactical transport whose basic layout dates to the 1950s: a high straight wing, four turboprops, a pressurised cargo hold with a rear ramp, and landing gear housed in fuselage sponsons so the hold floor can run flat from end to end at truck-bed height.",
    "The J model is a substantial redesign rather than a refresh. It introduced six-bladed composite scimitar propellers, new engines with digital control, a two-crew glass cockpit with head-up displays, and enough systems automation to remove the flight engineer and navigator positions. The result is more thrust, better climb performance and a longer range than earlier Hercules variants.",
    "India ordered six aircraft in 2008 in the stretched C-130J-30 configuration for special operations, with deliveries from 2011, and later ordered more. The type is used for tactical transport, special forces insertion and disaster relief, and Indian aircraft have operated from some of the highest airstrips in the world.",
  ],
  modelLicense: "procedural (original)",
  animations: ["landingGear", "rotors", "controlSurfaces"],
  geometry: {
    kind: "fixedWing",
    segments: 24,
    fuselage: [
      { z: -17.2, width: 1.2, height: 1.9, y: 2.4, exponent: 2.2 },
      { z: -15.4, width: 2.2, height: 2.8, y: 1.8, exponent: 2.4 },
      { z: -12.6, width: 3.4, height: 3.6, y: 0.9, exponent: 2.8 },
      { z: -9.0, width: 4.2, height: 4.1, y: 0.2, exponent: 3.0 },
      { z: -4.0, width: 4.35, height: 4.2, y: 0.0, exponent: 3.1 },
      { z: 2.0, width: 4.35, height: 4.2, y: 0.0, exponent: 3.1 },
      { z: 7.0, width: 4.3, height: 4.15, y: 0.05, exponent: 3.0 },
      { z: 11.5, width: 3.8, height: 3.8, y: 0.15, exponent: 2.8 },
      { z: 14.6, width: 2.7, height: 2.9, y: 0.2, exponent: 2.4 },
      { z: 16.6, width: 1.3, height: 1.5, y: 0.1, exponent: 2.2 },
      { z: 17.2, width: 0.3, height: 0.3, y: 0.0 },
    ],
    wing: {
      root: [0, 1.95, 3.4],
      span: 20.2,
      rootChord: 5.0,
      tipChord: 2.1,
      sweep: 2,
      dihedral: 1.5,
      thickness: 0.15,
      controlSurface: 0.3,
    },
    stabilator: {
      root: [0, 1.1, -14.4],
      span: 8.1,
      rootChord: 3.6,
      tipChord: 1.7,
      sweep: 8,
      thickness: 0.11,
    },
    fins: [
      {
        root: [0, 1.9, -12.6],
        span: 6.2,
        rootChord: 6.4,
        tipChord: 2.6,
        sweep: 22,
        thickness: 0.1,
      },
    ],
    engines: [
      {
        position: [4.9, 2.0, 4.4],
        length: 5.4,
        radius: 0.78,
        kind: "turboprop",
        propeller: { blades: 6, radius: 2.06 },
      },
      {
        position: [-4.9, 2.0, 4.4],
        length: 5.4,
        radius: 0.78,
        kind: "turboprop",
        propeller: { blades: 6, radius: 2.06 },
      },
      {
        position: [10.1, 2.15, 4.2],
        length: 5.4,
        radius: 0.78,
        kind: "turboprop",
        propeller: { blades: 6, radius: 2.06 },
      },
      {
        position: [-10.1, 2.15, 4.2],
        length: 5.4,
        radius: 0.78,
        kind: "turboprop",
        propeller: { blades: 6, radius: 2.06 },
      },
    ],
    canopy: { z: 13.4, length: 3.4, width: 1.8, height: 0.7, y: 1.5, flightDeck: true },
    gear: {
      nose: {
        position: [0, -1.8, 12.6],
        length: 1.5,
        wheelRadius: 0.42,
        wheels: 2,
        retractAxis: [1, 0, 0],
      },
      main: [
        {
          position: [1.9, -1.75, -0.4],
          length: 1.6,
          wheelRadius: 0.52,
          wheels: 2,
          retractAxis: [0, 0, 1],
        },
        {
          position: [-1.9, -1.75, -0.4],
          length: 1.6,
          wheelRadius: 0.52,
          wheels: 2,
          retractAxis: [0, 0, -1],
        },
      ],
    },
    livery: {
      upper: "#50575e",
      lower: "#6e757c",
      radome: "#33383d",
    },
    markings: {
      roundel: 2.0,
      finFlash: true,
      serial: "KC 3801",
    },
  },
  annotations: [
    {
      label: "Six-bladed propellers",
      note:
        "Composite scimitar propellers are the clearest external difference between the J and earlier Hercules variants.",
      position: [4.9, 2.0, 7.2],
    },
    {
      label: "High straight wing",
      note:
        "An unswept high wing keeps the cargo hold low and the propellers clear of the ground.",
      position: [10.0, 2.3, 2.6],
    },
    {
      label: "Gear sponsons",
      note:
        "Gear retracts into fuselage-side blisters so the hold floor can run flat at truck-bed height.",
      position: [2.0, -1.0, -0.4],
    },
    {
      label: "Rear ramp",
      note:
        "The upswept rear fuselage clears a full-section ramp for vehicles and air-drop loads.",
      position: [0, 0.6, -14.5],
    },
    {
      label: "Two-crew flight deck",
      note:
        "A glass cockpit and systems automation removed the flight engineer and navigator positions.",
      position: [0, 2.0, 13.4],
    },
  ],
  sources: [
    { label: "Indian Air Force — official site", url: "https://indianairforce.nic.in/" },
    { label: "Lockheed Martin", url: "https://www.lockheedmartin.com/" },
    {
      label: "Wikipedia — Lockheed Martin C-130J Super Hercules",
      url: "https://en.wikipedia.org/wiki/Lockheed_Martin_C-130J_Super_Hercules",
    },
  ],
};
