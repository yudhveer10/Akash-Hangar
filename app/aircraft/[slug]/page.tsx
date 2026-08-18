import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AircraftStage } from "@/components/three/AircraftStage";
import { SpecTable } from "@/components/ui/SpecTable";
import { SourceList } from "@/components/ui/SourceList";
import {
  aircraftClass,
  getAdjacent,
  getAircraftBySlug,
  getAllAircraft,
  resolveModel,
} from "@/lib/aircraft";
import { baseLocation, homeBaseOf } from "@/lib/bases";
import type { Source } from "@/lib/types";

type Params = { params: Promise<{ slug: string }> };

// Only the slugs below are generated; anything else is a 404 served by the host.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllAircraft().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const entry = getAircraftBySlug(slug);
  if (!entry) return { title: "Aircraft not found" };

  const summary = `${entry.name} — ${entry.role}. ${entry.description[0].slice(0, 150)}…`;
  return {
    title: entry.name,
    description: summary,
    alternates: { canonical: `/aircraft/${entry.slug}` },
    openGraph: {
      title: `${entry.name} · Akash Hangar`,
      description: summary,
      url: `/aircraft/${entry.slug}`,
      type: "article",
    },
  };
}

export default async function AircraftPage({ params }: Params) {
  const { slug } = await params;
  const entry = getAircraftBySlug(slug);
  if (!entry) notFound();

  const { glbUrl } = resolveModel(entry);
  const adjacent = getAdjacent(entry.slug);
  const base = homeBaseOf(entry);

  const headline = [
    { label: "Class", value: aircraftClass(entry) },
    { label: "In service", value: entry.inServiceSince },
    { label: "Crew", value: entry.specs.crew },
    { label: "Max speed", value: entry.specs.maxSpeed },
    ...(base ? [{ label: "Home base", value: baseLocation(base) }] : []),
  ];

  // The page states where the type flies from, so that station's sources belong in
  // the same list as the aircraft's own.
  const sources: Source[] = [...entry.sources, ...(base?.sources ?? [])].filter(
    (source, i, all) => all.findIndex((other) => other.url === source.url) === i,
  );

  return (
    <article>
      <div className="bg-grid relative border-b border-white/[0.06]">
        <div className="bg-glow pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-5 pb-10 pt-8">
          <nav className="font-mono text-xs uppercase tracking-wider text-slate-500">
            <Link href="/iaf" className="transition-colors hover:text-sky-300">
              IAF Fleet
            </Link>
            <span className="mx-2 text-slate-700">/</span>
            <span className="text-slate-400">{entry.shortName}</span>
          </nav>

          <h1 className="text-gradient mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
            {entry.name}
          </h1>
          <p className="mt-3 text-lg text-slate-400">{entry.role}</p>
          <p className="mt-1 text-sm text-slate-500">{entry.manufacturer}</p>

          <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4 sm:flex sm:flex-wrap sm:gap-x-12">
            {headline.map((item) => (
              <div key={item.label}>
                <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
                  {item.label}
                </dt>
                <dd className="mt-1 text-sm text-slate-200">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-10">
        <AircraftStage aircraft={entry} glbUrl={glbUrl} />

        <div className="mt-16 grid gap-14 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="font-mono text-xs uppercase tracking-widest text-sky-400">
              Overview
            </h2>
            <div className="mt-5 space-y-5">
              {entry.description.map((paragraph, i) => (
                <p key={i} className="text-pretty leading-relaxed text-slate-300">
                  {paragraph}
                </p>
              ))}
            </div>

            {entry.serviceNote && (
              <p className="mt-7 border-l-2 border-sky-400/40 pl-4 text-sm leading-relaxed text-slate-400">
                {entry.serviceNote}
              </p>
            )}
          </div>

          <div className="space-y-10">
            <div>
              <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-sky-400">
                Specifications
              </h2>
              <SpecTable specs={entry.specs} />
            </div>

            <div className="rounded-lg border border-white/[0.07] bg-ink-900/40 p-4">
              <h2 className="font-mono text-xs uppercase tracking-widest text-slate-500">
                About this model
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                {glbUrl
                  ? "This aircraft is shown using a supplied 3D model file."
                  : "This airframe is generated from an original parametric description of its shape, written for this project. It is a faithful representation of the aircraft's layout and proportions rather than a scale-accurate engineering model."}
              </p>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-slate-600">
                Model licence — {entry.modelLicense}
              </p>
            </div>

            <SourceList sources={sources} />
          </div>
        </div>

        {adjacent && (
          <nav className="mt-20 flex flex-col gap-3 border-t border-white/[0.07] pt-8 sm:flex-row sm:justify-between">
            <Link
              href={`/aircraft/${adjacent.prev.slug}`}
              className="group text-sm text-slate-400 transition-colors hover:text-white"
            >
              <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-600">
                Previous
              </span>
              <span className="group-hover:text-sky-300">← {adjacent.prev.shortName}</span>
            </Link>
            <Link
              href={`/aircraft/${adjacent.next.slug}`}
              className="group text-sm text-slate-400 transition-colors hover:text-white sm:text-right"
            >
              <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-600">
                Next
              </span>
              <span className="group-hover:text-sky-300">{adjacent.next.shortName} →</span>
            </Link>
          </nav>
        )}
      </div>
    </article>
  );
}
