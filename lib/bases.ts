import { bases } from "@/data/bases";
import type { Aircraft, AirBase } from "./types";

/**
 * Lookups over the station list. Pure data access with no filesystem work, so unlike
 * `lib/aircraft.ts` this is safe to import from client components — the viewer needs
 * it to build its setting picker.
 */

export function getAllBases(): AirBase[] {
  return bases;
}

export function getBaseById(id: string | undefined): AirBase | undefined {
  if (!id) return undefined;
  return bases.find((b) => b.id === id);
}

/** The station an aircraft opens at, when one is recorded for it. */
export function homeBaseOf(entry: Aircraft): AirBase | undefined {
  return getBaseById(entry.homeBase);
}

/** "Ambala, Haryana" — the label used wherever a station needs placing on a map. */
export function baseLocation(base: AirBase): string {
  return base.city === base.state ? base.city : `${base.city}, ${base.state}`;
}
