import type { Aircraft } from "@/lib/types";

export const chinook: Aircraft = {
  slug: "chinook-ch-47f",
  name: "Boeing CH-47F Chinook",
  shortName: "CH-47F Chinook",
  category: "iaf",
  role: "Heavy-lift transport helicopter",
  manufacturer: "Boeing",
  inServiceSince: "2019",
  serviceNote:
    "Inducted at Chandigarh in March 2019, with a second unit at Mohanbari.",
  specs: {
    length: "30.10 m with rotors turning (15.87 m fuselage)",
    wingspan: "18.29 m rotor diameter, each rotor",
    height: "5.70 m",
    maxSpeed: "302 km/h",
    range: "741 km",
    engine: "2 × Honeywell T55-GA-714A turboshafts, 3,529 kW each",
    crew: "3 (two pilots and a flight engineer)",
  },
  description: [
    "The CH-47 Chinook is a heavy-lift helicopter defined by its tandem-rotor layout: two large counter-rotating rotors, one at each end of the fuselage, with no tail rotor at all. Because the two rotors turn in opposite directions, their torque reactions cancel, so none of the engine power has to be spent on a tail rotor purely to stop the airframe spinning.",
    "That arrangement has practical consequences beyond efficiency. With lift generated at both ends, the helicopter is far less sensitive to where its load sits, and it can tolerate a wide range of centre-of-gravity positions — useful when carrying vehicles, artillery or slung loads. The rear ramp allows straight-in loading, and three external hooks let it carry heavy underslung cargo.",
    "India signed for 15 aircraft in 2015, with deliveries beginning in 2019. The type is used for moving artillery, vehicles and equipment into areas that fixed-wing transports cannot reach, along with humanitarian and disaster-relief work.",
  ],
  modelLicense: "procedural (original)",
  animations: ["rotors"],
  geometry: {
    kind: "rotorcraft",
    segments: 22,
    fuselage: [
      { z: -8.4, width: 2.3, height: 2.4, y: 1.3, exponent: 3.0 },
      { z: -7.2, width: 3.0, height: 2.9, y: 0.85, exponent: 3.2 },
      { z: -5.4, width: 3.5, height: 3.1, y: 0.5, exponent: 3.4 },
      { z: -2.0, width: 3.6, height: 3.15, y: 0.35, exponent: 3.5 },
      { z: 2.0, width: 3.6, height: 3.15, y: 0.35, exponent: 3.5 },
      { z: 4.6, width: 3.5, height: 3.1, y: 0.4, exponent: 3.4 },
      { z: 6.4, width: 3.1, height: 2.85, y: 0.5, exponent: 3.0 },
      { z: 7.4, width: 2.3, height: 2.3, y: 0.55, exponent: 2.6 },
      { z: 8.0, width: 1.1, height: 1.2, y: 0.5, exponent: 2.2 },
    ],
    rotors: [
      { hub: [0, 3.35, 5.5], radius: 9.15, blades: 3, chord: 0.81, coning: 2, direction: 1 },
      { hub: [0, 4.55, -5.5], radius: 9.15, blades: 3, chord: 0.81, coning: 2, direction: -1 },
    ],
    fins: [
      // Rear rotor pylon, carried as a single deep, thick vertical surface.
      {
        root: [0, 1.5, -3.4],
        span: 2.9,
        rootChord: 4.6,
        tipChord: 3.0,
        sweep: 14,
        thickness: 0.44,
      },
      // Forward rotor fairing. Thick and short so it reads as a fairing over the
      // cockpit rather than a fin standing up at the nose.
      {
        root: [0, 1.5, 6.9],
        span: 1.3,
        rootChord: 3.0,
        tipChord: 2.3,
        sweep: 8,
        thickness: 0.62,
      },
    ],
    engines: [
      { position: [1.15, 3.55, -5.2], length: 3.2, radius: 0.55, kind: "pod" },
      { position: [-1.15, 3.55, -5.2], length: 3.2, radius: 0.55, kind: "pod" },
    ],
    canopy: { z: 6.6, length: 2.6, width: 1.9, height: 0.8, y: 1.5, flightDeck: true },
    gear: {
      type: "wheels",
      main: [
        { position: [1.85, -0.9, 2.6], length: 0.9, wheelRadius: 0.4 },
        { position: [-1.85, -0.9, 2.6], length: 0.9, wheelRadius: 0.4 },
        { position: [1.95, -0.9, -1.6], length: 0.9, wheelRadius: 0.4 },
        { position: [-1.95, -0.9, -1.6], length: 0.9, wheelRadius: 0.4 },
      ],
    },
    livery: {
      upper: "#424a3d",
      lower: "#4d5647",
      radome: "#31353a",
    },
    markings: {
      roundel: 1.2,
      serial: "CH 5801",
    },
  },
  annotations: [
    {
      label: "Tandem rotors",
      note:
        "Two counter-rotating rotors cancel each other torque reaction, so no tail rotor is needed at all.",
      position: [0, 3.5, 5.5],
    },
    {
      label: "Rear rotor pylon",
      note:
        "Raises the aft rotor so its disc clears the forward one.",
      position: [0, 4.6, -5.5],
    },
    {
      label: "Wide centre-of-gravity range",
      note:
        "Lift at both ends makes the aircraft far less sensitive to where its load sits.",
      position: [1.4, 1.0, 0.0],
    },
    {
      label: "Rear ramp",
      note:
        "Allows straight-in loading of vehicles and palletised cargo.",
      position: [0, 0.8, -8.2],
    },
    {
      label: "Fixed quad gear",
      note:
        "Four non-retracting wheels in sponsons that also carry fuel.",
      position: [1.9, -1.6, 2.6],
    },
  ],
  sources: [
    { label: "Indian Air Force — official site", url: "https://indianairforce.nic.in/" },
    { label: "Boeing Defense", url: "https://www.boeing.com/defense" },
    {
      label: "Wikipedia — Boeing CH-47 Chinook",
      url: "https://en.wikipedia.org/wiki/Boeing_CH-47_Chinook",
    },
  ],
};
