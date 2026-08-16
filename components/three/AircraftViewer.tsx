"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds, OrbitControls, useBounds, useProgress } from "@react-three/drei";
import * as THREE from "three";
import type { Aircraft, AnimationId } from "@/lib/types";
import { modelExtent } from "@/lib/geometry";
import { baseLocation, getAllBases, getBaseById } from "@/lib/bases";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { FixedWing } from "./geometry/FixedWing";
import { Rotorcraft } from "./geometry/Rotorcraft";
import { GlbAircraft } from "./GlbAircraft";
import { Annotations } from "./Annotations";
import { BaseEnvironment } from "./environment/BaseEnvironment";
import { GroundShadow, Grounded, HangarFloor, HangarLighting, PostFX } from "./Scene";
import { ANIMATION_LABELS, IDLE, type AnimationState } from "./geometry/animation";

/** Re-frames the camera whenever the reset button is pressed, and once on mount. */
function ResetOnSignal({ signal }: { signal: number }) {
  const api = useBounds();
  useEffect(() => {
    api.refresh().clip().fit();
  }, [signal, api]);
  return null;
}

const ON = "border-sky-400/60 bg-sky-400/15 text-sky-200 shadow-[0_0_16px_-6px_rgba(56,189,248,0.9)]";
const OFF =
  "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25 hover:text-white";

const HANGAR = "hangar";

/** HUD-style corner brackets around the viewport. */
function Brackets() {
  const corner = "absolute h-5 w-5 border-sky-400/35";
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-3">
      <span className={`${corner} left-0 top-0 border-l border-t`} />
      <span className={`${corner} right-0 top-0 border-r border-t`} />
      <span className={`${corner} bottom-0 left-0 border-b border-l`} />
      <span className={`${corner} bottom-0 right-0 border-b border-r`} />
    </div>
  );
}

export function AircraftViewer({
  aircraft,
  glbUrl,
}: {
  aircraft: Aircraft;
  glbUrl: string | null;
}) {
  const [animation, setAnimation] = useState<AnimationState>(() => ({ ...IDLE }));
  const [resetSignal, setResetSignal] = useState(0);
  const [partsOn, setPartsOn] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const { active, progress } = useProgress();

  // The aircraft opens on its own station and can be moved to any other. `hangar`
  // is the studio backdrop the site started with, kept as a neutral option.
  const stations = getAllBases();
  const [setting, setSetting] = useState(() => aircraft.homeBase ?? HANGAR);
  const base = getBaseById(setting);

  // The turntable follows the OS motion preference until the visitor overrides it.
  const reducedMotion = usePrefersReducedMotion();
  const [autoRotateOverride, setAutoRotateOverride] = useState<boolean | null>(null);
  const autoRotate = (autoRotateOverride ?? !reducedMotion) && !partsOn;

  const extent = useMemo(() => modelExtent(aircraft.geometry), [aircraft.geometry]);
  const annotations = aircraft.annotations ?? [];

  const toggle = useCallback((id: AnimationId) => {
    setAnimation((prev) => ({ ...prev, [id]: prev[id] > 0.5 ? 0 : 1 }));
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_17rem]">
      <div className="flex flex-col gap-3">
        <div className="bg-hangar relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 sm:aspect-[16/10]">
          <Canvas
            shadows
            dpr={[1, 1.75]}
            gl={{
              antialias: false,
              powerPreference: "high-performance",
              toneMapping: THREE.ACESFilmicToneMapping,
            }}
            camera={{ fov: 35, near: 0.1, far: 600 }}
            fallback={
              <div className="grid h-full place-items-center p-6 text-center text-sm text-slate-400">
                This browser could not start WebGL, so the 3D viewer is unavailable. The
                specifications and history below are unaffected.
              </div>
            }
          >
            {base ? <BaseEnvironment terrain={base.terrain} /> : <HangarLighting />}
            <Suspense fallback={null}>
              <Bounds fit clip observe margin={1.28}>
                <ResetOnSignal signal={resetSignal} />
                <Grounded>
                  {glbUrl ? (
                    <GlbAircraft url={glbUrl} animation={animation} />
                  ) : aircraft.geometry.kind === "fixedWing" ? (
                    <FixedWing config={aircraft.geometry} animation={animation} />
                  ) : (
                    <Rotorcraft config={aircraft.geometry} animation={animation} />
                  )}
                  {partsOn && (
                    <Annotations
                      items={annotations}
                      selected={selected}
                      onSelect={setSelected}
                    />
                  )}
                </Grounded>
              </Bounds>
            </Suspense>
            {!base && <HangarFloor radius={extent / 2} />}
            <GroundShadow radius={extent / 2} opacity={base ? 0.4 : 0.72} />
            <OrbitControls
              makeDefault
              enableDamping
              dampingFactor={0.08}
              autoRotate={autoRotate}
              autoRotateSpeed={0.55}
              minDistance={extent * 0.3}
              maxDistance={extent * 4}
              maxPolarAngle={Math.PI * 0.495}
            />
            <PostFX />
          </Canvas>

          <Brackets />

          {active && (
            <div className="absolute inset-0 grid place-items-center bg-slate-950/70 backdrop-blur-sm">
              <div className="w-48 text-center">
                <p className="font-mono text-xs uppercase tracking-widest text-sky-300">
                  Loading model
                </p>
                <div className="mt-3 h-0.5 w-full overflow-hidden rounded bg-white/10">
                  <div
                    className="h-full bg-sky-400 transition-[width] duration-200"
                    style={{ width: `${Math.round(progress)}%` }}
                  />
                </div>
                <p className="mt-2 font-mono text-xs text-slate-400">
                  {Math.round(progress)}%
                </p>
              </div>
            </div>
          )}

          <p className="pointer-events-none absolute bottom-4 left-6 font-mono text-[10px] uppercase tracking-wider text-slate-500">
            Drag to orbit · scroll to zoom
          </p>

          {base && (
            <div className="pointer-events-none absolute bottom-4 right-6 text-right">
              <p className="font-mono text-[10px] uppercase tracking-wider text-sky-300/75">
                {base.station}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                {baseLocation(base)}
                {base.elevation ? ` · ${base.elevation}` : ""}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {aircraft.animations.map((id) => {
            const on = animation[id] > 0.5;
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggle(id)}
                aria-pressed={on}
                className={`rounded-md border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all ${
                  on ? ON : OFF
                }`}
              >
                {on ? ANIMATION_LABELS[id].on : ANIMATION_LABELS[id].off}
              </button>
            );
          })}

          <div className="ml-auto flex gap-2">
            <select
              value={setting}
              onChange={(event) => setSetting(event.target.value)}
              aria-label="Setting"
              style={{ colorScheme: "dark" }}
              className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 font-mono text-xs uppercase tracking-wider text-slate-300 transition-colors hover:border-white/25 hover:text-white"
            >
              <optgroup label="Air Force stations">
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.short}
                    {station.id === aircraft.homeBase ? " · home" : ""}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Studio">
                <option value={HANGAR}>Hangar</option>
              </optgroup>
            </select>
            <button
              type="button"
              onClick={() => setAutoRotateOverride(!autoRotate)}
              aria-pressed={autoRotate}
              className={`rounded-md border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all ${
                autoRotate ? ON : OFF
              }`}
            >
              Auto-rotate
            </button>
            <button
              type="button"
              onClick={() => setResetSignal((v) => v + 1)}
              className={`rounded-md border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all ${OFF}`}
            >
              Reset view
            </button>
          </div>
        </div>

        {base && (
          <p className="text-xs leading-relaxed text-slate-500">
            {base.note}
            {base.id !== aircraft.homeBase && (
              <span className="text-slate-600">
                {" "}
                Shown here as a setting — the {aircraft.shortName} is not based at this
                station.
              </span>
            )}{" "}
            {base.sources.map((source, i) => (
              <span key={source.url}>
                {i > 0 && <span className="text-slate-700"> · </span>}
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whitespace-nowrap underline decoration-white/20 underline-offset-4 transition-colors hover:text-sky-300 hover:decoration-sky-400/50"
                >
                  {i === 0 ? "Source" : `Source ${i + 1}`}
                </a>
              </span>
            ))}
          </p>
        )}
      </div>

      {/* Parts panel. Markers on the model and rows here drive the same selection. */}
      {annotations.length > 0 && (
        <aside className="rounded-2xl border border-white/10 bg-ink-900/50 p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
              Anatomy
            </h2>
            <button
              type="button"
              onClick={() => {
                setPartsOn((v) => !v);
                setSelected(null);
              }}
              aria-pressed={partsOn}
              className={`rounded border px-2 py-1 font-mono text-[10px] uppercase tracking-wider transition-all ${
                partsOn ? ON : OFF
              }`}
            >
              {partsOn ? "Hide" : "Show"}
            </button>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            {partsOn
              ? "Select a part to read about it, on the model or in the list."
              : `${annotations.length} labelled parts on this airframe.`}
          </p>

          <ol className="mt-4 space-y-1">
            {annotations.map((item, i) => {
              const isSelected = partsOn && selected === i;
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => {
                      setPartsOn(true);
                      setSelected(isSelected ? null : i);
                    }}
                    className={`flex w-full items-start gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors ${
                      isSelected ? "bg-sky-400/10" : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <span
                      className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border font-mono text-[9px] ${
                        isSelected
                          ? "border-sky-300 bg-sky-400 text-ink-950"
                          : "border-white/20 text-slate-500"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span
                      className={`text-xs leading-snug ${
                        isSelected ? "text-sky-200" : "text-slate-300"
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                  {isSelected && (
                    <p className="px-2 pb-2 pl-9 text-[11px] leading-relaxed text-slate-500">
                      {item.note}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </aside>
      )}
    </div>
  );
}
