import type { TerrainId } from "@/lib/types";
import { APRON_AREA, RUNWAY_END, RUNWAY_START } from "./layout";
import type { TerrainSpec } from "./terrain";
import type { SkyPalette } from "./textures";

/**
 * The landscapes, as they look in daylight.
 *
 * Every station in `data/bases.ts` points at one of these. They are broad-brush
 * portraits of the country a field sits in — a Ladakh valley, the Thar, the Deccan
 * plateau, the built-up plain outside Delhi — not surveys of any particular airfield,
 * and nothing here is a claim about a real station's layout. The runway is identical
 * in all of them; what changes is the ground, the light and the air.
 *
 * This is the daylight base. `phases.ts` takes it to dusk and night, and `scene.ts`
 * gives each station its own seed so that two fields sharing a landscape are still
 * not the same field.
 */

export interface Landscape {
  sky: SkyPalette;
  sun: { azimuth: number; elevation: number; colour: string; intensity: number };
  ambient: { sky: string; ground: string; intensity: number };
  fog: { colour: string; density: number };
  terrain: TerrainSpec;
  /**
   * Multiplies the baked runway texture. A light tint for the local quality of
   * the daylight, not a colour — the asphalt's own tone is in the texture.
   */
  pavementTint: string;
  /** Flat colour for unpainted pavement: shoulders, taxiway and apron. */
  shoulder: string;
  /** What is scattered on the ground clear of the field. */
  scatter: { kind: "tree" | "scrub" | "rock"; colour: string; count: number; scale: number };
  /**
   * A valley strip gets one hangar, open country gets the full set, and a field on
   * the edge of a city gets a skyline beyond the boundary as well.
   */
  buildings: "full" | "minimal" | "urban";
}

/** Runway strip the ground has to stay flat along, with a margin at each end. */
const STRIP = { from: RUNWAY_START - 140, to: RUNWAY_END + 140 };

/** The apron, taxiway and buildings, held level alongside it. */
const PAD = APRON_AREA;

export const PRESETS: Record<TerrainId, Landscape> = {
  himalayan: {
    sky: {
      zenith: "#0d3f7d",
      horizon: "#a9c6e4",
      ground: "#6d6253",
      sun: { azimuth: 128, elevation: 44, colour: "#fff4e2" },
      clouds: 0.16,
    },
    sun: { azimuth: 128, elevation: 44, colour: "#fff4e0", intensity: 3.4 },
    ambient: { sky: "#8fb7e3", ground: "#6a5e50", intensity: 0.75 },
    // Thin, dry air: distant ranges stay legible instead of dissolving.
    fog: { colour: "#b6cadf", density: 0.00026 },
    terrain: {
      seed: 4207,
      radius: 3800,
      strip: STRIP,
      pad: PAD,
      flatWidth: 190,
      blendWidth: 780,
      amplitude: 620,
      growth: 1.9,
      frequency: 1 / 1150,
      octaves: 5,
      ridged: 0.72,
      snowLine: 0.54,
      colours: {
        low: "#6f6252",
        high: "#8b8070",
        rock: "#565049",
        snow: "#f4f7fa",
        sand: "#7d7160",
      },
    },
    pavementTint: "#e8eff8",
    shoulder: "#3f4145",
    scatter: { kind: "rock", colour: "#6b6255", count: 260, scale: 1.5 },
    buildings: "minimal",
  },

  foothills: {
    sky: {
      zenith: "#2a6cae",
      horizon: "#ccdcec",
      ground: "#55603f",
      sun: { azimuth: 205, elevation: 54, colour: "#fff6e6" },
      clouds: 0.42,
    },
    sun: { azimuth: 205, elevation: 54, colour: "#fff4e0", intensity: 3.1 },
    ambient: { sky: "#a6c6e6", ground: "#5c6142", intensity: 0.7 },
    fog: { colour: "#c4d4e4", density: 0.0007 },
    terrain: {
      seed: 8801,
      radius: 3200,
      strip: STRIP,
      pad: PAD,
      flatWidth: 230,
      blendWidth: 1050,
      amplitude: 190,
      growth: 1.5,
      frequency: 1 / 780,
      octaves: 5,
      ridged: 0.38,
      snowLine: 2,
      colours: {
        low: "#5f6c47",
        high: "#4b5c3d",
        rock: "#6d6a5d",
        snow: "#eef3f6",
        sand: "#8a8163",
      },
    },
    pavementTint: "#f1f4f6",
    shoulder: "#414347",
    scatter: { kind: "tree", colour: "#3d5233", count: 420, scale: 1.1 },
    buildings: "full",
  },

  plateau: {
    sky: {
      zenith: "#3277b4",
      horizon: "#dcd9cd",
      ground: "#7a7452",
      sun: { azimuth: 168, elevation: 60, colour: "#fff3dc" },
      clouds: 0.22,
    },
    sun: { azimuth: 168, elevation: 60, colour: "#fff2d8", intensity: 3.2 },
    ambient: { sky: "#bdd2e6", ground: "#7d7554", intensity: 0.78 },
    fog: { colour: "#d8d3c2", density: 0.00092 },
    terrain: {
      seed: 7734,
      radius: 3000,
      strip: STRIP,
      pad: PAD,
      flatWidth: 230,
      blendWidth: 900,
      amplitude: 135,
      growth: 1.2,
      frequency: 1 / 620,
      octaves: 4,
      ridged: 0.12,
      // Steps and flat tops rather than peaks: that is what a plateau erodes into.
      terrace: 34,
      snowLine: 2,
      colours: {
        low: "#7b7550",
        high: "#8c8360",
        rock: "#6f6553",
        snow: "#eef3f6",
        sand: "#9d9068",
      },
    },
    pavementTint: "#f5f1e6",
    shoulder: "#46464a",
    scatter: { kind: "scrub", colour: "#78784a", count: 320, scale: 1 },
    buildings: "full",
  },

  plains: {
    sky: {
      zenith: "#2f74b6",
      horizon: "#d7e0e8",
      ground: "#6a6c46",
      sun: { azimuth: 238, elevation: 58, colour: "#fff5e4" },
      clouds: 0.34,
    },
    sun: { azimuth: 238, elevation: 58, colour: "#fff3dd", intensity: 3.1 },
    ambient: { sky: "#aecbe6", ground: "#6c6c47", intensity: 0.7 },
    fog: { colour: "#cfd9e3", density: 0.00088 },
    terrain: {
      seed: 3312,
      radius: 2800,
      strip: STRIP,
      pad: PAD,
      flatWidth: 220,
      blendWidth: 900,
      amplitude: 16,
      growth: 0.8,
      frequency: 1 / 260,
      octaves: 4,
      ridged: 0,
      snowLine: 2,
      colours: {
        low: "#6d7248",
        high: "#7e7c4e",
        rock: "#7b7462",
        snow: "#eef3f6",
        sand: "#9a8f68",
      },
    },
    pavementTint: "#f4f2ec",
    shoulder: "#424449",
    scatter: { kind: "tree", colour: "#4a5b34", count: 300, scale: 1 },
    buildings: "full",
  },

  urban: {
    sky: {
      zenith: "#3d7fb2",
      horizon: "#dcdcd8",
      ground: "#6d6f4e",
      sun: { azimuth: 250, elevation: 55, colour: "#fff2dc" },
      clouds: 0.3,
    },
    sun: { azimuth: 250, elevation: 55, colour: "#fff0d6", intensity: 2.9 },
    ambient: { sky: "#b9cadb", ground: "#6d6f4e", intensity: 0.72 },
    // A city's air is never as clear as open country's.
    fog: { colour: "#d4d4cf", density: 0.00135 },
    terrain: {
      seed: 5150,
      radius: 2800,
      strip: STRIP,
      pad: PAD,
      flatWidth: 230,
      blendWidth: 850,
      amplitude: 13,
      growth: 0.7,
      frequency: 1 / 240,
      octaves: 4,
      ridged: 0,
      snowLine: 2,
      colours: {
        low: "#70724f",
        high: "#7d7a55",
        rock: "#7c7565",
        snow: "#eef3f6",
        sand: "#988f6c",
      },
    },
    pavementTint: "#f2f1ec",
    shoulder: "#43454a",
    scatter: { kind: "tree", colour: "#48583a", count: 260, scale: 1 },
    buildings: "urban",
  },

  desert: {
    sky: {
      zenith: "#3b80bd",
      horizon: "#e7ddc7",
      ground: "#b39a70",
      sun: { azimuth: 158, elevation: 66, colour: "#fff2d4" },
      clouds: 0.1,
    },
    sun: { azimuth: 158, elevation: 66, colour: "#fff0cf", intensity: 3.5 },
    ambient: { sky: "#cddcea", ground: "#b8a077", intensity: 0.85 },
    fog: { colour: "#ded1b4", density: 0.00105 },
    terrain: {
      seed: 6620,
      radius: 2800,
      strip: STRIP,
      pad: PAD,
      flatWidth: 210,
      blendWidth: 640,
      amplitude: 46,
      growth: 1.1,
      frequency: 1 / 340,
      octaves: 4,
      ridged: 0.18,
      snowLine: 2,
      colours: {
        low: "#c0a274",
        high: "#d7bd8d",
        rock: "#a68d66",
        snow: "#f2efe6",
        sand: "#d9c193",
      },
    },
    pavementTint: "#f7e9d0",
    shoulder: "#4a4944",
    scatter: { kind: "scrub", colour: "#8c8a5c", count: 340, scale: 0.8 },
    buildings: "full",
  },

  coastal: {
    sky: {
      zenith: "#2b78bd",
      horizon: "#dde8f0",
      ground: "#6f7350",
      sun: { azimuth: 262, elevation: 50, colour: "#fff7ea" },
      clouds: 0.52,
    },
    sun: { azimuth: 262, elevation: 50, colour: "#fff6e6", intensity: 2.9 },
    ambient: { sky: "#b6d3ea", ground: "#6f7350", intensity: 0.78 },
    fog: { colour: "#d3e0ea", density: 0.00115 },
    terrain: {
      seed: 1290,
      radius: 3000,
      strip: STRIP,
      pad: PAD,
      flatWidth: 220,
      blendWidth: 700,
      amplitude: 22,
      growth: 0.7,
      frequency: 1 / 300,
      octaves: 4,
      ridged: 0,
      snowLine: 2,
      colours: {
        low: "#79794f",
        high: "#8b8757",
        rock: "#7f7a65",
        snow: "#eef3f6",
        sand: "#cdbc94",
      },
      sea: { level: -3.5, shore: 640 },
    },
    pavementTint: "#edf4f8",
    shoulder: "#424449",
    scatter: { kind: "scrub", colour: "#6f7a48", count: 300, scale: 0.9 },
    buildings: "full",
  },

  hills: {
    sky: {
      zenith: "#2c70b0",
      horizon: "#d0dee6",
      ground: "#46583a",
      sun: { azimuth: 222, elevation: 62, colour: "#fff6e6" },
      clouds: 0.56,
    },
    sun: { azimuth: 222, elevation: 62, colour: "#fff4e2", intensity: 3 },
    ambient: { sky: "#aecde8", ground: "#46583a", intensity: 0.75 },
    fog: { colour: "#c8d8de", density: 0.00098 },
    terrain: {
      seed: 5514,
      radius: 3400,
      strip: STRIP,
      pad: PAD,
      flatWidth: 240,
      blendWidth: 1250,
      amplitude: 270,
      growth: 1.4,
      frequency: 1 / 950,
      octaves: 5,
      ridged: 0.42,
      snowLine: 2,
      colours: {
        low: "#53673f",
        high: "#3e5636",
        rock: "#6b6a5c",
        snow: "#eef3f6",
        sand: "#8d8461",
      },
    },
    pavementTint: "#eef3f1",
    shoulder: "#404246",
    scatter: { kind: "tree", colour: "#33502f", count: 460, scale: 1.2 },
    buildings: "full",
  },
};
