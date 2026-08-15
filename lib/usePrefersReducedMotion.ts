"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

/** Server render has no media queries; assume motion is fine and correct on hydrate. */
function getServerSnapshot() {
  return false;
}

/**
 * Reads the OS motion preference as an external store rather than mirroring it into
 * state from an effect, so the first render already has the right value instead of
 * flipping on the second.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
