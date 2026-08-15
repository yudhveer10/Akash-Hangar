"use client";

import { useMemo } from "react";
import type { FixedWingConfig, SurfaceConfig } from "@/lib/types";
import {
  applyLivery,
  fuselageGeometry,
  planformAt,
  radomeGeometry,
  surfaceGeometry,
} from "./loft";
import { Airframe, Canopy, Engine, Intake, LandingGear } from "./parts";
import { Cockpit, NavLights, NoseBoom, Probe, Stores } from "./details";
import { AirframeMarkings } from "./markings";
import { ControlPanels, HorizontalSurface, VerticalSurface } from "./surfaces";
import type { AnimationState } from "./animation";

export function FixedWing({
  config,
  animation,
}: {
  config: FixedWingConfig;
  animation: AnimationState;
}) {
  const { livery, markings } = config;
  const segments = config.segments ?? 30;

  const fuselage = useMemo(
    () => applyLivery(fuselageGeometry(config.fuselage, segments), livery),
    [config.fuselage, segments, livery],
  );
  const radome = useMemo(
    () => (livery.radome ? radomeGeometry(config.fuselage, 1.6, segments) : null),
    [config.fuselage, segments, livery.radome],
  );
  const wing = useMemo(
    () => applyLivery(surfaceGeometry(config.wing), livery),
    [config.wing, livery],
  );

  const bodyLength = useMemo(() => {
    const zs = config.fuselage.map((s) => s.z);
    return Math.max(...zs) - Math.min(...zs);
  }, [config.fuselage]);

  const nose = useMemo(
    () => config.fuselage.reduce((a, b) => (a.z > b.z ? a : b)),
    [config.fuselage],
  );
  const tail = useMemo(
    () => config.fuselage.reduce((a, b) => (a.z < b.z ? a : b)),
    [config.fuselage],
  );

  // Winglets are their own small vertical surface planted at the wing tip.
  const wingletCfg = useMemo<SurfaceConfig | null>(() => {
    const w = config.wing;
    if (!w.winglet) return null;
    const tip = planformAt(w, 1);
    return {
      root: [0, tip.y, tip.zLE - tip.chord * 0.1],
      span: w.winglet,
      rootChord: tip.chord * 0.8,
      tipChord: tip.chord * 0.38,
      sweep: 38,
      thickness: 0.07,
      vertical: true,
    };
  }, [config.wing]);

  return (
    <group>
      <mesh geometry={fuselage} castShadow receiveShadow>
        <Airframe repeat={[7, Math.max(6, bodyLength / 2.2)]} />
      </mesh>

      {radome && (
        <mesh geometry={radome} castShadow>
          <meshStandardMaterial color={livery.radome} metalness={0.15} roughness={0.68} />
        </mesh>
      )}

      {config.noseBoom && <NoseBoom z={nose.z} length={config.noseBoom} />}
      {config.probe && <Probe position={config.probe.position} length={config.probe.length} />}

      <mesh geometry={wing} castShadow receiveShadow>
        <Airframe repeat={[5, Math.max(4, config.wing.span / 1.6)]} />
      </mesh>
      <ControlPanels cfg={config.wing} livery={livery} amplitude={animation.controlSurfaces} />

      {markings && (
        <AirframeMarkings
          markings={markings}
          stations={config.fuselage}
          wing={config.wing}
        />
      )}

      {config.stores && (
        <Stores wing={config.wing} stores={config.stores} colour={livery.lower} />
      )}

      <NavLights wing={config.wing} tailZ={tail.z} tailY={(tail.y ?? 0) + tail.height / 2} />

      {wingletCfg &&
        [1, -1].map((side) => (
          <VerticalSurface
            key={side}
            cfg={{
              ...wingletCfg,
              root: [side * config.wing.span, wingletCfg.root[1], wingletCfg.root[2]],
            }}
            livery={livery}
          />
        ))}

      {config.canard && (
        <HorizontalSurface
          cfg={config.canard}
          livery={livery}
          amplitude={animation.controlSurfaces}
          phase={Math.PI / 2}
        />
      )}

      {config.stabilator && (
        <HorizontalSurface
          cfg={config.stabilator}
          livery={livery}
          amplitude={animation.controlSurfaces}
        />
      )}

      {config.fins.map((fin, i) => (
        <VerticalSurface
          key={`fin-${i}`}
          cfg={fin}
          livery={livery}
          markings={markings}
          amplitude={animation.controlSurfaces}
        />
      ))}

      {config.ventralFins?.map((fin, i) => (
        <VerticalSurface key={`ventral-${i}`} cfg={fin} livery={livery} ventral />
      ))}

      {config.intakes?.flatMap((intake, i) => {
        const sides = intake.mirrored ? [1, -1] : [1];
        return sides.map((side) => (
          <Intake
            key={`intake-${i}-${side}`}
            position={[intake.position[0] * side, intake.position[1], intake.position[2]]}
            width={intake.width}
            height={intake.height}
            length={intake.length}
            livery={livery}
          />
        ));
      })}

      {config.engines.map((engine, i) => (
        <Engine
          key={`engine-${i}`}
          config={engine}
          livery={livery}
          afterburner={animation.afterburner}
          rotorsOn={animation.rotors}
        />
      ))}

      {config.canopy && (
        <>
          <Cockpit config={config.canopy} />
          <Canopy config={config.canopy} open={animation.canopy} />
        </>
      )}

      <LandingGear leg={config.gear.nose} deployed={animation.landingGear} livery={livery} />
      {config.gear.main.map((leg, i) => (
        <LandingGear
          key={`main-${i}`}
          leg={leg}
          deployed={animation.landingGear}
          livery={livery}
        />
      ))}
    </group>
  );
}
