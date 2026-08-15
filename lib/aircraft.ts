import fs from "node:fs";
import path from "node:path";
import { aircraft } from "@/data/aircraft";
import type { Aircraft, Category } from "./types";

/**
 * Server-side data access. This module touches the filesystem to detect optional
 * .glb overrides, so it must only be imported from server components.
 */

export function getAllAircraft(): Aircraft[] {
  return aircraft;
}

export type AircraftClass = "Fighters" | "Rotary wing" | "Transport";

/** Broad grouping used for gallery headings and card badges. */
export function aircraftClass(entry: Aircraft): AircraftClass {
  if (entry.geometry.kind === "rotorcraft") return "Rotary wing";
  return /airlift|transport/i.test(entry.role) ? "Transport" : "Fighters";
}

export const CLASS_ORDER: AircraftClass[] = ["Fighters", "Rotary wing", "Transport"];

export function groupByClass(list: Aircraft[]): [AircraftClass, Aircraft[]][] {
  return CLASS_ORDER.map(
    (name): [AircraftClass, Aircraft[]] => [
      name,
      list.filter((a) => aircraftClass(a) === name),
    ],
  ).filter(([, items]) => items.length > 0);
}

export function getAircraftByCategory(category: Category): Aircraft[] {
  return aircraft.filter((a) => a.category === category);
}

export function getAircraftBySlug(slug: string): Aircraft | undefined {
  return aircraft.find((a) => a.slug === slug);
}

export function getAdjacent(slug: string): { prev: Aircraft; next: Aircraft } | null {
  const list = getAllAircraft();
  const i = list.findIndex((a) => a.slug === slug);
  if (i === -1 || list.length < 2) return null;
  return {
    prev: list[(i - 1 + list.length) % list.length],
    next: list[(i + 1) % list.length],
  };
}

/**
 * Picks the model source for an aircraft.
 *
 * An explicit `modelPath` in the data wins. Otherwise a file dropped at
 * `public/models/<slug>.glb` is picked up automatically, so adding a real model
 * needs no code or data change. With neither, the viewer builds the airframe
 * procedurally.
 */
export function resolveModel(entry: Aircraft): { glbUrl: string | null } {
  if (entry.modelPath) return { glbUrl: entry.modelPath };

  const relative = path.join("models", `${entry.slug}.glb`);
  const absolute = path.join(process.cwd(), "public", relative);
  if (fs.existsSync(absolute)) return { glbUrl: `/models/${entry.slug}.glb` };

  return { glbUrl: null };
}
