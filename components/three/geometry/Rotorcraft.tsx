"use client";

import { useMemo } from "react";
import type { Livery, RotorcraftConfig } from "@/lib/types";
import { applyLivery, fuselageGeometry, radomeGeometry, surfaceGeometry } from "./loft";
import { Airframe, Canopy, Engine, LandingGear, Rotor, SolidAirframe } from "./parts";
import { Cockpit, Stores } from "./details";
import { AirframeMarkings } from "./markings";
import { HorizontalSurface, VerticalSurface } from "./surfaces";
import type { AnimationState } from "./animation";

function Skids({
  height,
  length,
  width,
  livery,
}: {
  height: number;
  length: number;
  width: number;
  livery: Livery;
}) {
  const halfWidth = width / 2;
  return (
    <group>
      {[1, -1].map((side) => (
        <group key={side}>
          {/* Skid tube, turned to run fore and aft. */}
          <mesh
            position={[side * halfWidth, -height, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          >
            <cylinderGeometry args={[height * 0.075, height * 0.075, length, 10]} />
            <meshStandardMaterial color="#4a5058" metalness={0.7} roughness={0.4} />
          </mesh>
          {/* Cross struts, splayed out to the skid. */}
          {[length * 0.24, -length * 0.24].map((z) => (
            <mesh
              key={z}
              position={[side * halfWidth * 0.55, -height * 0.5, z]}
              rotation={[0, 0, side * 0.42]}
              castShadow
            >
              <cylinderGeometry args={[height * 0.055, height * 0.055, height * 1.1, 8]} />
              <SolidAirframe color={livery.lower} dark={0.25} repeat={[1, 2]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

export function Rotorcraft({
  config,
  animation,
}: {
  config: RotorcraftConfig;
  animation: AnimationState;
}) {
  const { livery, markings } = config;
  const segments = config.segments ?? 26;

  const fuselage = useMemo(
    () => applyLivery(fuselageGeometry(config.fuselage, segments), livery),
    [config.fuselage, segments, livery],
  );
  const boom = useMemo(
    () => (config.boom ? applyLivery(fuselageGeometry(config.boom, 20), livery) : null),
    [config.boom, livery],
  );
  const radome = useMemo(
    () => (livery.radome ? radomeGeometry(config.fuselage, 1.1, segments) : null),
    [config.fuselage, segments, livery.radome],
  );
  const stubWings = useMemo(
    () => (config.stubWings ? applyLivery(surfaceGeometry(config.stubWings), livery) : null),
    [config.stubWings, livery],
  );

  return (
    <group>
      <mesh geometry={fuselage} castShadow receiveShadow>
        <Airframe repeat={[6, 7]} />
      </mesh>

      {boom && (
        <mesh geometry={boom} castShadow receiveShadow>
          <Airframe repeat={[3, 6]} />
        </mesh>
      )}

      {radome && (
        <mesh geometry={radome} castShadow>
          <meshStandardMaterial color={livery.radome} metalness={0.15} roughness={0.68} />
        </mesh>
      )}

      {stubWings && (
        <mesh geometry={stubWings} castShadow receiveShadow>
          <Airframe repeat={[3, 3]} />
        </mesh>
      )}

      {markings && (
        <AirframeMarkings markings={markings} stations={config.fuselage} />
      )}

      {config.stubWings && config.stores && (
        <Stores wing={config.stubWings} stores={config.stores} colour={livery.lower} />
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
          markings={i === 0 ? markings : undefined}
          amplitude={animation.controlSurfaces}
        />
      ))}

      {config.engines.map((engine, i) => (
        <Engine
          key={`engine-${i}`}
          config={engine}
          livery={livery}
          afterburner={0}
          rotorsOn={animation.rotors}
        />
      ))}

      {config.rotors.map((rotor, i) => (
        <Rotor key={`rotor-${i}`} config={rotor} spin={animation.rotors} />
      ))}

      {config.canopy && (
        <>
          <Cockpit config={config.canopy} />
          <Canopy config={config.canopy} open={animation.canopy} />
        </>
      )}

      {config.gear.type === "skids" ? (
        <Skids
          height={config.gear.height}
          length={config.gear.length}
          width={config.gear.width}
          livery={livery}
        />
      ) : (
        <>
          {config.gear.nose && (
            <LandingGear
              leg={config.gear.nose}
              deployed={animation.landingGear}
              livery={livery}
            />
          )}
          {config.gear.main.map((leg, i) => (
            <LandingGear
              key={`main-${i}`}
              leg={leg}
              deployed={animation.landingGear}
              livery={livery}
            />
          ))}
          {config.gear.tail && (
            <LandingGear
              leg={config.gear.tail}
              deployed={animation.landingGear}
              livery={livery}
            />
          )}
        </>
      )}
    </group>
  );
}
