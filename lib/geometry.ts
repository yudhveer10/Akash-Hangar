import type { GeometryConfig } from "./types";

/**
 * Largest dimension of an airframe, in metres. Used to size the shadow pad, set
 * zoom limits and frame the hero. Pure maths over the config, so it is safe to call
 * from server components.
 */
export function modelExtent(g: GeometryConfig): number {
  const zs = g.fuselage.map((s) => s.z);
  if (g.kind === "rotorcraft" && g.boom) zs.push(...g.boom.map((s) => s.z));
  const length = Math.max(...zs) - Math.min(...zs);

  const span =
    g.kind === "fixedWing"
      ? g.wing.span * 2
      : Math.max(0, ...g.rotors.filter((r) => !r.vertical).map((r) => r.radius * 2));

  return Math.max(length, span, 1);
}
