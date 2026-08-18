"use client";

import { useEffect, useState } from "react";

/**
 * True once the browser has drawn the page and gone quiet.
 *
 * The 3D bundle is about a megabyte, and building a scene out of it — terrain, sky,
 * an airframe — is tens of milliseconds of solid main thread on top. Starting either
 * during the first paint is what made the site feel slow to arrive: the text a
 * visitor could have been reading waited on geometry they had not scrolled to yet.
 *
 * So: two frames to let the shell paint, then the browser's own idle callback. The
 * import is a separate chunk either way; this only decides when to ask for it.
 *
 * Two things this has to survive. A tab opened in the background — a middle click, a
 * restored session — never runs an animation frame at all, so the sequence does not
 * begin until the visitor actually looks at it, which is both correct and free: there
 * is no reason to build a scene nobody is watching. And a browser that delivers
 * neither an idle callback nor a frame still gets its aircraft, because a plain timer
 * is armed alongside as a backstop. Whichever arrives first wins.
 */
export function useDeferredMount(delay = 1400): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let frame = 0;
    let idle: number | undefined;
    let backstop: number | undefined;

    const win = window as Window &
      typeof globalThis & {
        requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
        cancelIdleCallback?: (h: number) => void;
      };

    const go = () => {
      if (!cancelled) setReady(true);
    };

    const start = () => {
      if (cancelled) return;
      backstop = window.setTimeout(go, delay);
      frame = requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (cancelled) return;
          if (win.requestIdleCallback) idle = win.requestIdleCallback(go, { timeout: delay });
          else go();
        }),
      );
    };

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      document.removeEventListener("visibilitychange", onVisible);
      start();
    };

    if (document.visibilityState === "visible") start();
    else document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      cancelAnimationFrame(frame);
      if (backstop !== undefined) clearTimeout(backstop);
      if (idle !== undefined && win.cancelIdleCallback) win.cancelIdleCallback(idle);
    };
  }, [delay]);

  return ready;
}
