import type { AirBase } from "@/lib/types";

/**
 * Indian Air Force stations the viewer can place an aircraft at.
 *
 * Each entry is a published fact about where a station is and what flies from it,
 * cited like everything else on the site. `terrain` is the only editorial field: it
 * picks which of the six landscapes the 3D scene builds around the runway, and is a
 * broad-brush description of the country the field sits in, not a survey.
 *
 * An aircraft's `homeBase` is the station it opens on. The picker in the viewer can
 * move any aircraft to any of these fields — that is a setting, not a claim that the
 * type is based there.
 */
export const bases: AirBase[] = [
  {
    id: "ambala",
    short: "Ambala",
    station: "Air Force Station Ambala",
    city: "Ambala",
    state: "Haryana",
    terrain: "plains",
    opensAt: "day",
    // Punjab farmland under a working summer haze.
    character: { sun: 232, clouds: 0.9, haze: 1, green: 0.62 },
    note: "One of the oldest and busiest fighter bases in the country, home to No. 17 Squadron, the 'Golden Arrows', and to Jaguar squadrons.",
    sources: [
      {
        label: "Wikipedia — Ambala Air Force Station",
        url: "https://en.wikipedia.org/wiki/Ambala_Air_Force_Station",
      },
      {
        label: "Wikipedia — No. 17 Squadron IAF",
        url: "https://en.wikipedia.org/wiki/No._17_Squadron_IAF",
      },
    ],
  },
  {
    id: "adampur",
    short: "Adampur",
    station: "Air Force Station Adampur",
    city: "Jalandhar",
    state: "Punjab",
    terrain: "plains",
    opensAt: "dusk",
    // Sun off the north-west, over the canal country.
    character: { sun: 302, clouds: 0.7, haze: 0.95, green: 0.6 },
    note: "A forward western-sector fighter base; No. 47 Squadron, the 'Black Archers', moved its MiG-29s here in 1997.",
    sources: [
      {
        label: "Wikipedia — Adampur (Sri Guru Ravidas) Airport",
        url: "https://en.wikipedia.org/wiki/Sri_Guru_Ravidas_Airport",
      },
      {
        label: "Wikipedia — No. 47 Squadron IAF",
        url: "https://en.wikipedia.org/wiki/No._47_Squadron_IAF",
      },
    ],
  },
  {
    id: "gwalior",
    short: "Gwalior",
    station: "Air Force Station Gwalior (Maharajpur)",
    city: "Gwalior",
    state: "Madhya Pradesh",
    terrain: "plateau",
    opensAt: "day",
    // Dry Malwa light, hard and high.
    character: { sun: 150, clouds: 0.5, haze: 0.9, green: 0.35 },
    note: "The Mirage 2000 base, and home of the Tactics and Air Combat Development Establishment.",
    sources: [
      {
        label: "Wikipedia — Gwalior Airport",
        url: "https://en.wikipedia.org/wiki/Gwalior_Airport",
      },
    ],
  },
  {
    id: "lohegaon",
    short: "Lohegaon",
    station: "Air Force Station Lohegaon",
    city: "Pune",
    state: "Maharashtra",
    terrain: "plateau",
    opensAt: "dusk",
    // Deccan cloud piling up off the Ghats.
    character: { sun: 205, clouds: 1.2, haze: 1, green: 0.4 },
    note: "A major Su-30MKI base; No. 20 Squadron, the 'Lightnings', reformed on the type here in 2002.",
    sources: [
      { label: "Wikipedia — Pune Airport", url: "https://en.wikipedia.org/wiki/Pune_Airport" },
      {
        label: "Wikipedia — No. 20 Squadron IAF",
        url: "https://en.wikipedia.org/wiki/No._20_Squadron_IAF",
      },
    ],
  },
  {
    id: "hindan",
    short: "Hindan",
    station: "Air Force Station Hindan",
    city: "Ghaziabad",
    state: "Uttar Pradesh",
    terrain: "urban",
    opensAt: "night",
    // The thick air the Delhi plain is known for.
    character: { sun: 250, clouds: 0.8, haze: 1.35, green: 0.5 },
    note: "The transport hub outside Delhi, flying the C-17s of No. 81 Squadron, the 'Skylords'.",
    sources: [
      {
        label: "Wikipedia — Hindan Air Force Station",
        url: "https://en.wikipedia.org/wiki/Hindan_Air_Force_Station",
      },
      {
        label: "Wikipedia — No. 81 Squadron IAF",
        url: "https://en.wikipedia.org/wiki/No._81_Squadron_IAF",
      },
    ],
  },
  {
    id: "panagarh",
    short: "Panagarh",
    station: "Air Force Station Arjan Singh (Panagarh)",
    city: "Panagarh",
    state: "West Bengal",
    terrain: "plains",
    opensAt: "night",
    // Humid Bengal: heavy cloud, green ground.
    character: { sun: 110, clouds: 1.7, haze: 1.2, green: 0.8 },
    note: "Eastern-sector special operations field; No. 87 Squadron flies its C-130Js from here, supporting the Army's mountain strike corps.",
    sources: [
      {
        label: "Wikipedia — Air Force Station Arjan Singh",
        url: "https://en.wikipedia.org/wiki/Air_Force_Station_Arjan_Singh",
      },
    ],
  },
  {
    id: "chandigarh",
    short: "Chandigarh",
    station: "Air Force Station Chandigarh",
    city: "Chandigarh",
    state: "Chandigarh",
    terrain: "foothills",
    opensAt: "day",
    // Cloud stacking against the Shivaliks.
    character: { sun: 195, clouds: 1.3, haze: 1.05, green: 0.65 },
    note: "The gateway field for Ladakh operations, sitting below the Shivalik range; the first CH-47F Chinooks were inducted here in 2019.",
    sources: [
      {
        label: "Wikipedia — Chandigarh Airport",
        url: "https://en.wikipedia.org/wiki/Chandigarh_Airport",
      },
    ],
  },
  {
    id: "pathankot",
    short: "Pathankot",
    station: "Air Force Station Pathankot",
    city: "Pathankot",
    state: "Punjab",
    terrain: "foothills",
    opensAt: "dusk",
    // Clearer sub-Himalayan light.
    character: { sun: 160, clouds: 1.1, haze: 0.95, green: 0.6 },
    note: "A northern base close to the hills, where the first AH-64E Apaches were formally inducted in 2019.",
    sources: [
      {
        label: "Wikipedia — Pathankot Airport",
        url: "https://en.wikipedia.org/wiki/Pathankot_Airport",
      },
    ],
  },
  {
    id: "jodhpur",
    short: "Jodhpur",
    station: "Air Force Station Jodhpur",
    city: "Jodhpur",
    state: "Rajasthan",
    terrain: "desert",
    opensAt: "dusk",
    // The Thar: almost no cloud, and nothing green.
    character: { sun: 158, clouds: 0.35, haze: 1, green: 0.15 },
    note: "A Thar desert base in the south-western sector; the Prachand light combat helicopter was inducted here in October 2022.",
    sources: [
      {
        label: "Wikipedia — Jodhpur Airport",
        url: "https://en.wikipedia.org/wiki/Jodhpur_Airport",
      },
    ],
  },
  {
    id: "jamnagar",
    short: "Jamnagar",
    station: "Air Force Station Jamnagar",
    city: "Jamnagar",
    state: "Gujarat",
    terrain: "coastal",
    opensAt: "dusk",
    // Sea air, and the sun setting over the Gulf.
    character: { sun: 265, clouds: 1.4, haze: 1.15, green: 0.4 },
    note: "On the Gulf of Kutch, home to the maritime strike Jaguars of No. 6 Squadron, the 'Dragons'.",
    sources: [
      {
        label: "Wikipedia — Jamnagar Airport",
        url: "https://en.wikipedia.org/wiki/Jamnagar_Airport",
      },
      {
        label: "Wikipedia — No. 6 Squadron IAF",
        url: "https://en.wikipedia.org/wiki/No._6_Squadron_IAF",
      },
    ],
  },
  {
    id: "sulur",
    short: "Sulur",
    station: "Air Force Station Sulur",
    city: "Coimbatore",
    state: "Tamil Nadu",
    terrain: "hills",
    opensAt: "day",
    // Wet country under the Western Ghats.
    character: { sun: 222, clouds: 1.6, haze: 1.1, green: 0.85 },
    note: "The southern base under the Western Ghats: No. 45 Squadron's Tejas fleet, and the Sarang display team's Dhruvs.",
    sources: [
      {
        label: "Wikipedia — Sulur Air Force Station",
        url: "https://en.wikipedia.org/wiki/Sulur_Air_Force_Station",
      },
      {
        label: "Wikipedia — Sarang display team",
        url: "https://en.wikipedia.org/wiki/Sarang_display_team",
      },
    ],
  },
  {
    id: "leh",
    short: "Leh",
    station: "Air Force Station Leh (Kushok Bakula Rimpochee)",
    city: "Leh",
    state: "Ladakh",
    elevation: "3,256 m AMSL",
    terrain: "himalayan",
    opensAt: "day",
    // Thin, dry, cloudless high-altitude air.
    character: { sun: 128, clouds: 0.4, haze: 0.85, green: 0.3 },
    note: "Owned by the Air Force and shared with civil traffic, this is the highest airfield of its kind in the country — thin air, a 2,727 m runway, and mountains on every side.",
    sources: [
      {
        label: "Wikipedia — Kushok Bakula Rimpochee Airport",
        url: "https://en.wikipedia.org/wiki/Kushok_Bakula_Rimpochee_Airport",
      },
    ],
  },
];
