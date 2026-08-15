import type { Metadata } from "next";
import { AircraftCard } from "@/components/ui/AircraftCard";
import { Reveal } from "@/components/ui/Reveal";
import { getAircraftByCategory, groupByClass } from "@/lib/aircraft";

export const metadata: Metadata = {
  title: "IAF Fleet",
  description:
    "Interactive 3D models of Indian Air Force aircraft — fighters, attack and transport helicopters, and heavy-lift transports.",
};

export default function IafPage() {
  const fleet = getAircraftByCategory("iaf");
  const groups = groupByClass(fleet);

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <header className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-sky-400">Fleet</p>
        <h1 className="text-gradient mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Indian Air Force
        </h1>
        <p className="mt-5 leading-relaxed text-slate-400">
          {fleet.length} aircraft currently modelled. Each opens into a full 3D viewer with
          working controls, a labelled breakdown of its parts, and its specifications and
          sources.
        </p>
      </header>

      {groups.map(([name, items], gi) => (
        <section key={name} className="mt-14">
          <div className="flex items-center gap-4">
            <h2 className="font-mono text-xs uppercase tracking-widest text-slate-400">
              {name}
            </h2>
            <span className="font-mono text-xs text-slate-600">{items.length}</span>
            <div className="rule-fade flex-1" />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((entry, i) => (
              <Reveal key={entry.slug} delay={Math.min(i, 5) * 0.04 + gi * 0.02}>
                <AircraftCard entry={entry} />
              </Reveal>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
