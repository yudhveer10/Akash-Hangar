import Link from "next/link";
import { HeroViewer } from "@/components/three/HeroViewer";
import { PHASES, PHASE_ORDER } from "@/components/three/environment/phases";
import { AircraftCard } from "@/components/ui/AircraftCard";
import { Brackets } from "@/components/ui/Brackets";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { FleetDrift } from "@/components/ui/FleetDrift";
import { Motto } from "@/components/ui/Motto";
import { Reveal } from "@/components/ui/Reveal";
import { getAllAircraft, getAircraftBySlug } from "@/lib/aircraft";
import { baseLocation, getAllBases, homeBaseOf } from "@/lib/bases";
import { modelExtent } from "@/lib/geometry";
import { CONTACT_EMAIL } from "@/lib/site";
import type { PhaseId } from "@/lib/types";

/**
 * Sky colours for the time-of-day tiles.
 *
 * Dusk and night are read from the phase definitions the 3D scene actually uses, so
 * the tiles cannot drift away from what the viewer shows. Day is the odd one out by
 * design: a phase is a set of pulls applied to a landscape, and day pulls at nothing,
 * so its colour belongs to the landscape rather than to the phase.
 */
const DAYLIGHT: [string, string] = ["#3f7cb8", "#c4dbef"];

function skyFor(phase: PhaseId): [string, string] {
  if (phase === "day") return DAYLIGHT;
  return [PHASES[phase].sky.zenith, PHASES[phase].sky.horizon];
}

export default function HomePage() {
  const fleet = getAllAircraft();
  const featured = getAircraftBySlug("su-30mki") ?? fleet[0];
  const stations = getAllBases();

  // The hero lands the aircraft at its own station, at the time of day that station
  // opens on — the same pairing the aircraft page would give it.
  const heroBase = homeBaseOf(featured) ?? stations[0];
  const heroPhase = heroBase.opensAt;

  const partCount = fleet.reduce((n, a) => n + (a.annotations?.length ?? 0), 0);
  const landscapes = new Set(stations.map((s) => s.terrain)).size;

  const stats = [
    { value: String(fleet.length), label: "Aircraft modelled" },
    { value: String(partCount), label: "Labelled parts" },
    { value: String(stations.length), label: "Air Force stations" },
    { value: "0", label: "Third-party models" },
  ];

  // One part from each of the first few aircraft that carry annotations, so the sample
  // spreads across the fleet instead of showing six labels off the same airframe.
  const sampleParts = fleet
    .flatMap((a) => {
      const first = a.annotations?.[0];
      return first ? [{ aircraft: a.shortName, ...first }] : [];
    })
    .slice(0, 6);

  const heroSpecs = [
    { label: "Length", value: featured.specs.length },
    { label: "Wingspan", value: featured.specs.wingspan },
    { label: "Crew", value: featured.specs.crew.replace(/\s*\(.*\)$/, "") },
  ];

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="bg-grid relative overflow-hidden border-b border-white/[0.06]">
        <div className="bg-glow pointer-events-none absolute inset-0" aria-hidden="true" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-[1fr_1.15fr] lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-sky-400/[0.07] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-sky-300">
              <span className="h-1 w-1 rounded-full bg-sky-400" />
              Indian Air Force · 3D fleet
            </p>

            <h1 className="text-gradient mt-6 text-balance text-5xl font-semibold leading-[0.98] tracking-tight sm:text-6xl lg:text-[4rem]">
              Every aircraft, from every angle.
            </h1>

            <p className="mt-6 max-w-lg text-pretty text-sm leading-relaxed text-slate-400 sm:text-[15px]">
              Akash Hangar is an interactive reference for the aircraft of the Indian Air
              Force. Orbit each airframe in 3D, drop the landing gear, light the
              afterburner, stand it on a runway at dusk, and read what every part of it
              actually does — all sourced from publicly available material.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/iaf"
                className="rounded-md bg-sky-500 px-5 py-2.5 text-sm font-medium text-ink-950 shadow-[0_10px_30px_-12px_rgba(56,189,248,0.9)] transition-colors hover:bg-sky-400"
              >
                Explore the fleet
              </Link>
              <Link
                href={`/aircraft/${featured.slug}`}
                className="rounded-md border border-white/15 px-5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-white/35 hover:text-white"
              >
                Start with the {featured.shortName}
              </Link>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dd className="font-mono text-3xl text-white">{stat.value}</dd>
                  <dt className="mt-1 font-mono text-[10px] uppercase leading-relaxed tracking-wider text-slate-500">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>

          <div className="card-sheen overflow-hidden rounded-2xl border border-white/10">
            <div className="bg-hangar relative aspect-[3/2]">
              <HeroViewer
                geometry={featured.geometry}
                extent={modelExtent(featured.geometry)}
                base={heroBase}
                opensAt={heroPhase}
              />
              <Brackets className="inset-3" />

              <div className="pointer-events-none absolute left-5 top-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-sky-300/90">
                  {featured.shortName}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400/80">
                  {featured.role}
                </p>
              </div>

              <div className="pointer-events-none absolute right-5 top-4 text-right">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-sky-300/75">
                  {heroBase.station}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400/70">
                  {baseLocation(heroBase)}
                </p>
              </div>

              {/* Hidden on a narrow card, where the phase buttons need the room. */}
              <p className="pointer-events-none absolute bottom-4 left-5 hidden font-mono text-[10px] uppercase tracking-wider text-slate-400/70 sm:block">
                Drag to look around
              </p>
            </div>

            <dl className="grid grid-cols-3 divide-x divide-white/[0.06] border-t border-white/[0.06] bg-ink-900/60">
              {heroSpecs.map((spec) => (
                <div key={spec.label} className="px-4 py-3">
                  <dt className="font-mono text-[9px] uppercase tracking-wider text-slate-600">
                    {spec.label}
                  </dt>
                  <dd className="mt-1 font-mono text-xs text-slate-300">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="relative isolate pb-16">
          <FleetDrift />
          <Motto />
        </div>
      </section>

      {/* ------------------------------------------------------- How it is made */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Built, not borrowed",
              body: "Every airframe is generated from an original description of its shape — fuselage sections, wing planform, engines, gear, pylons. No third-party models are used anywhere on this site.",
            },
            {
              title: "Public sources only",
              body: "Specifications and history come from the IAF's own published material, manufacturers and open references. Each aircraft page lists exactly where its figures came from.",
            },
            {
              title: "Labelled, not just shown",
              body: "Turn on the anatomy view and every significant part is marked and explained: why the Mirage has no tailplane, what a tandem rotor buys you, where a Jaguar's wing sits.",
            },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 0.05}>
              <div className="card-sheen h-full rounded-xl border border-white/[0.08] bg-ink-900/40 p-6">
                <span className="font-mono text-[10px] tracking-[0.2em] text-slate-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-4 font-mono text-xs uppercase tracking-widest text-sky-400">
                  {item.title}
                </h2>
                <p className="mt-3 text-[13px] leading-relaxed text-slate-400">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5">
        <div className="rule-fade" />
      </div>

      {/* ------------------------------------------------------------- Anatomy */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-sky-400">
              Anatomy
            </p>
            <h2 className="mt-4 text-balance text-3xl font-semibold leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl">
              {partCount} parts, named and explained
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-400">
              A photograph tells you what an aircraft looks like. It does not tell you why
              the intake is shaped that way, or what the fairing behind the canopy is for.
              Switch the anatomy panel on and the model marks every part worth knowing
              about, with a sentence on what it does — written from published material,
              never guessed at.
            </p>
            <Link
              href={`/aircraft/${featured.slug}`}
              className="mt-7 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-sky-400 transition-colors hover:text-sky-300"
            >
              Open the {featured.shortName} <span aria-hidden="true">→</span>
            </Link>
          </Reveal>

          <Reveal delay={0.08}>
            <ul className="card-sheen space-y-1 rounded-2xl border border-white/[0.08] bg-ink-900/50 p-4">
              {sampleParts.map((part, i) => (
                <li key={`${part.aircraft}-${part.label}`} className="flex gap-3 p-2.5">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-sky-400/40 font-mono text-[9px] text-sky-300">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-[13px] text-slate-200">
                      {part.label}
                      <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-slate-600">
                        {part.aircraft}
                      </span>
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                      {part.note}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ Airfields */}
      <section className="border-y border-white/[0.06] bg-ink-900/30">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-sky-400">
                Settings
              </p>
              <h2 className="mt-4 text-balance text-3xl font-semibold leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl">
                See it where it flies
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-400">
                Each aircraft opens on the station it is publicly associated with, and can
                be moved to any of the {stations.length} in the list, at any time of day.
                The runway is the same everywhere; the country around it is not —{" "}
                {landscapes} landscapes, from Himalayan valley floor to coastal flats, each
                generated rather than photographed.
              </p>
              <p className="mt-4 max-w-md text-xs leading-relaxed text-slate-500">
                Every station carries its own sources, and moving an aircraft somewhere it
                does not fly from is labelled as a setting rather than presented as fact.
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="grid grid-cols-3 gap-3">
                {PHASE_ORDER.map((phase) => {
                  const [zenith, horizon] = skyFor(phase);
                  return (
                    <div
                      key={phase}
                      className="card-sheen overflow-hidden rounded-xl border border-white/[0.08]"
                    >
                      <div
                        className="relative h-24"
                        style={{
                          background: `linear-gradient(180deg, ${zenith} 0%, ${horizon} 100%)`,
                        }}
                      >
                        <div className="absolute inset-x-0 bottom-0 h-6 bg-ink-950/80" />
                        <div className="absolute inset-x-8 bottom-0 h-1.5 bg-slate-400/70" />
                      </div>
                      <p className="border-t border-white/[0.06] bg-ink-900/60 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                        {PHASES[phase].label}
                      </p>
                    </div>
                  );
                })}
              </div>

              <ul className="mt-4 flex flex-wrap gap-2">
                {stations.map((station) => (
                  <li
                    key={station.id}
                    className="rounded-md border border-white/[0.08] bg-ink-900/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-400"
                  >
                    {station.short}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- Fleet */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-sky-400">
              The hangar
            </p>
            <h2 className="mt-4 text-balance text-3xl font-semibold leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl">
              {fleet.length} aircraft, frontline fighters to heavy lift
            </h2>
          </div>
          <Link
            href="/iaf"
            className="shrink-0 font-mono text-xs uppercase tracking-wider text-sky-400 transition-colors hover:text-sky-300"
          >
            View all →
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fleet.slice(0, 6).map((entry, i) => (
            <Reveal key={entry.slug} delay={Math.min(i, 5) * 0.04}>
              <AircraftCard entry={entry} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- Coming soon */}
      <div className="mx-auto max-w-6xl px-5 pb-20">
        <ComingSoon />
      </div>

      {/* ----------------------------------------------------------- Closing CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-8">
        <div className="card-sheen relative overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900/50 p-8 sm:p-10">
          <div
            className="bg-glow pointer-events-none absolute inset-0 opacity-70"
            aria-hidden="true"
          />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <h2 className="text-balance text-2xl font-semibold leading-tight text-white sm:text-3xl">
                Spotted something wrong?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Specifications, service dates and airframe shapes are all fair game.
                Corrections with a public source behind them are the fastest way to make
                this better — and suggestions for what to model next are welcome too.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="rounded-md bg-sky-500 px-5 py-2.5 text-sm font-medium text-ink-950 transition-colors hover:bg-sky-400"
              >
                Email me
              </a>
              <Link
                href="/about"
                className="rounded-md border border-white/15 px-5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-white/35 hover:text-white"
              >
                About the project
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
