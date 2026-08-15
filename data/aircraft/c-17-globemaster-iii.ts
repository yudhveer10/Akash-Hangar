import type { Aircraft } from "@/lib/types";

export const c17: Aircraft = {
  slug: "c-17-globemaster-iii",
  name: "Boeing C-17 Globemaster III",
  shortName: "C-17",
  category: "iaf",
  role: "Strategic airlift",
  manufacturer: "Boeing (originally McDonnell Douglas)",
  inServiceSince: "2013",
  serviceNote:
    "Operated by No. 81 Squadron, the 'Skylords', from Hindan. India is the largest operator outside the United States.",
  specs: {
    length: "53.04 m",
    wingspan: "51.74 m",
    height: "16.79 m",
    maxSpeed: "Mach 0.825 (≈830 km/h)",
    range: "4,482 km with a 71,214 kg payload",
    engine: "4 × Pratt & Whitney F117-PW-100 turbofans, 180 kN each",
    crew: "3 (two pilots and a loadmaster)",
  },
  description: [
    "The C-17 Globemaster III is a four-engine strategic transport designed to carry outsize cargo over intercontinental distances and then land it on short, semi-prepared runways — a combination that normally requires two different aircraft. It can carry armoured vehicles, helicopters and palletised freight, and can air-drop loads or paratroops.",
    "The short-field capability comes from an externally blown flap system: the four engines are mounted well forward and below a high-set swept wing, and their exhaust is deliberately directed onto large slotted flaps. The deflected exhaust generates additional lift at low speed, letting a very heavy aircraft approach slowly. Blended winglets at the tips reduce induced drag on the long cruise legs. The tail is a T-tail, keeping the horizontal surfaces clear of the wing and engine wake.",
    "India signed for ten aircraft in 2011, with deliveries running from 2013, and later added an eleventh. The fleet is used for strategic movement of troops and equipment, disaster relief, and evacuation operations, and has repeatedly been deployed for humanitarian missions abroad.",
  ],
  modelLicense: "procedural (original)",
  animations: ["landingGear", "controlSurfaces"],
  geometry: {
    kind: "fixedWing",
    segments: 26,
    fuselage: [
      { z: -26.5, width: 1.4, height: 2.2, y: 3.4, exponent: 2.4 },
      { z: -24.0, width: 2.6, height: 3.2, y: 2.6, exponent: 2.6 },
      { z: -20.0, width: 4.2, height: 4.6, y: 1.5, exponent: 3.0 },
      { z: -15.0, width: 5.6, height: 5.6, y: 0.5, exponent: 3.4 },
      { z: -8.0, width: 6.0, height: 5.9, y: 0.0, exponent: 3.6 },
      { z: 0.0, width: 6.0, height: 5.9, y: 0.0, exponent: 3.6 },
      { z: 8.0, width: 6.0, height: 5.9, y: 0.0, exponent: 3.6 },
      { z: 15.0, width: 5.7, height: 5.7, y: 0.1, exponent: 3.4 },
      { z: 20.0, width: 4.8, height: 4.9, y: 0.3, exponent: 3.0 },
      { z: 23.5, width: 3.4, height: 3.5, y: 0.4, exponent: 2.6 },
      { z: 25.6, width: 1.7, height: 1.8, y: 0.3, exponent: 2.2 },
      { z: 26.5, width: 0.3, height: 0.3, y: 0.2 },
    ],
    wing: {
      root: [0, 2.5, 6.0],
      span: 25.87,
      rootChord: 9.4,
      tipChord: 2.6,
      sweep: 25,
      dihedral: -3,
      thickness: 0.13,
      winglet: 2.9,
      controlSurface: 0.28,
    },
    stabilator: {
      root: [0, 12.8, -20.5],
      span: 9.8,
      rootChord: 5.0,
      tipChord: 1.9,
      sweep: 30,
      thickness: 0.1,
    },
    fins: [
      {
        root: [0, 2.6, -14.0],
        span: 10.4,
        rootChord: 9.5,
        tipChord: 3.4,
        sweep: 38,
        thickness: 0.09,
      },
    ],
    engines: [
      {
        position: [8.6, 0.9, 6.5],
        length: 7.2,
        radius: 1.42,
        kind: "pod",
      },
      {
        position: [-8.6, 0.9, 6.5],
        length: 7.2,
        radius: 1.42,
        kind: "pod",
      },
      {
        position: [16.2, 0.1, 3.0],
        length: 7.2,
        radius: 1.42,
        kind: "pod",
      },
      {
        position: [-16.2, 0.1, 3.0],
        length: 7.2,
        radius: 1.42,
        kind: "pod",
      },
    ],
    canopy: { z: 21.0, length: 4.6, width: 2.2, height: 0.9, y: 2.1, flightDeck: true },
    gear: {
      nose: {
        position: [0, -2.4, 19.0],
        length: 2.3,
        wheelRadius: 0.6,
        wheels: 2,
        retractAxis: [1, 0, 0],
      },
      main: [
        {
          position: [2.9, -2.5, -1.5],
          length: 2.6,
          wheelRadius: 0.72,
          wheels: 3,
          retractAxis: [0, 0, 1],
        },
        {
          position: [-2.9, -2.5, -1.5],
          length: 2.6,
          wheelRadius: 0.72,
          wheels: 3,
          retractAxis: [0, 0, -1],
        },
      ],
    },
    livery: {
      upper: "#707a83",
      lower: "#8e969e",
      radome: "#3b4046",
    },
    markings: {
      roundel: 2.4,
      finFlash: true,
      serial: "CB 8005",
    },
  },
  annotations: [
    {
      label: "Externally blown flaps",
      note:
        "Engine exhaust is directed onto the flaps, generating extra lift so a very heavy aircraft can approach slowly.",
      position: [7.0, 1.4, -2.0],
    },
    {
      label: "Blended winglets",
      note:
        "Reduce induced drag on the long cruise legs the aircraft is designed for.",
      position: [25.8, 4.0, -3.2],
    },
    {
      label: "T-tail",
      note:
        "The horizontal surfaces sit atop the fin, clear of the wing and engine wake.",
      position: [0, 13.4, -20.5],
    },
    {
      label: "Four F117 turbofans",
      note:
        "Mounted well forward and below the wing so their exhaust can reach the flaps.",
      position: [8.6, 0.9, 8.0],
    },
    {
      label: "Six-wheel main gear",
      note:
        "Each main leg carries six wheels in a fuselage-side fairing, spreading load on semi-prepared runways.",
      position: [2.9, -4.0, -1.5],
    },
    {
      label: "Rear cargo ramp",
      note:
        "The upswept tail clears a full-width ramp for straight-in loading and air-drops.",
      position: [0, 1.0, -22.0],
    },
  ],
  sources: [
    { label: "Indian Air Force — official site", url: "https://indianairforce.nic.in/" },
    { label: "Boeing Defense", url: "https://www.boeing.com/defense" },
    {
      label: "Wikipedia — Boeing C-17 Globemaster III",
      url: "https://en.wikipedia.org/wiki/Boeing_C-17_Globemaster_III",
    },
  ],
};
