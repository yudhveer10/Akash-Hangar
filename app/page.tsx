import Link from "next/link";
import { HeroViewer } from "@/components/three/HeroViewer";
import { AircraftCard } from "@/components/ui/AircraftCard";
import { Reveal } from "@/components/ui/Reveal";
import { getAircraftBySlug, getAllAircraft } from "@/lib/aircraft";
import { modelExtent } from "@/lib/geometry";

export default function HomePage() {
  const fleet = getAllAircraft();
  const featured = getAircraftBySlug("su-30mki") ?? fleet[0];

  const partCount = fleet.reduce((n, a) => n + (a.annotations?.length ?? 0), 0);
  const stats = [
    { value: String(fleet.length), label: "Aircraft modelled" },
    { value: String(partCount), label: "Labelled parts" },
    { value: "0", label: "Third-party models" },
  ];

  return (
    <>
      <section className="bg-grid relative overflow-hidden border-b border-white/[0.06]">
        <div className="bg-glow pointer-events-none absolute inset-0" aria-hidden="true" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-[1fr_1.2fr] lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-sky-400/[0.07] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-sky-300">
              <span className="h-1 w-1 rounded-full bg-sky-400" />
              Indian Air Force · 3D fleet
            </p>

            <h1 className="text-gradient mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Every aircraft, from every angle.
            </h1>

            <p className="mt-6 max-w-xl text-pretty leading-relaxed text-slate-400">
              Akash Hangar is an interactive reference for the aircraft of the Indian Air
              Force. Orbit each airframe in 3D, drop the landing gear, light the
              afterburner, and read what every part of it actually does — all sourced from
              publicly available material.
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

            <dl className="mt-12 flex gap-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dd className="font-mono text-2xl text-white">{stat.value}</dd>
                  <dt className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>

          <div className="bg-hangar relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <HeroViewer
              geometry={featured.geometry}
              extent={modelExtent(featured.geometry)}
            />
            <div className="pointer-events-none absolute bottom-4 left-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-sky-300/90">
                {featured.shortName}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                Drag to look around
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <div className="grid gap-10 sm:grid-cols-3">
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
            ].map((item) => (
              <div key={item.title}>
                <h2 className="font-mono text-xs uppercase tracking-widest text-sky-400">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <div className="mx-auto max-w-6xl px-5">
        <div className="rule-fade" />
      </div>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">In the hangar</h2>
            <p className="mt-2 text-sm text-slate-400">
              {fleet.length} aircraft, from frontline fighters to heavy lift.
            </p>
          </div>
          <Link
            href="/iaf"
            className="shrink-0 font-mono text-xs uppercase tracking-wider text-sky-400 transition-colors hover:text-sky-300"
          >
            View all →
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fleet.slice(0, 6).map((entry, i) => (
            <Reveal key={entry.slug} delay={i * 0.04}>
              <AircraftCard entry={entry} />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
