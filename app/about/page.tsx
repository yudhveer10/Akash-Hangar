import type { Metadata } from "next";
import Link from "next/link";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { Planform } from "@/components/ui/Planform";
import { Reveal } from "@/components/ui/Reveal";
import { getAircraftBySlug, getAllAircraft } from "@/lib/aircraft";
import { getAllBases } from "@/lib/bases";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "What Akash Hangar is, where its information comes from, and how its 3D models are made.",
};

function Section({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14 border-t border-white/[0.06] pt-8">
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-[10px] tracking-[0.2em] text-slate-600">
          {String(index).padStart(2, "0")}
        </span>
        <h2 className="font-mono text-xs uppercase tracking-widest text-sky-400">
          {title}
        </h2>
      </div>
      <div className="mt-5 space-y-4 text-pretty leading-relaxed text-slate-300">
        {children}
      </div>
    </section>
  );
}

export default function AboutPage() {
  const fleet = getAllAircraft();
  const stations = getAllBases();
  const featured = getAircraftBySlug("su-30mki") ?? fleet[0];

  const sourceCount =
    fleet.reduce((n, a) => n + a.sources.length, 0) +
    stations.reduce((n, b) => n + b.sources.length, 0);

  const stats = [
    { value: String(fleet.length), label: "Aircraft" },
    { value: String(stations.length), label: "Stations" },
    { value: String(sourceCount), label: "Sources cited" },
    { value: "0", label: "Models downloaded" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-sky-400">About</p>
      <h1 className="text-gradient mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        About this project
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-slate-400">
        Akash Hangar is a personal project about aircraft, built for people who want to
        look at them properly rather than read a specification list.
      </p>

      <dl className="mt-10 grid grid-cols-2 gap-6 rounded-2xl border border-white/[0.08] bg-ink-900/40 p-6 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dd className="font-mono text-2xl text-white">{stat.value}</dd>
            <dt className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slate-500">
              {stat.label}
            </dt>
          </div>
        ))}
      </dl>

      <div className="mt-6">
        <Disclaimer variant="full" />
      </div>

      <Section index={1} title="What it is">
        <p>
          The site presents {fleet.length} aircraft operated by the Indian Air Force as
          interactive 3D models. Each one can be orbited and zoomed, and has working
          controls for the things that actually move — landing gear, canopies, rotors,
          afterburners and flight control surfaces. Alongside each model sits its
          specifications, a short account of its design and role, and a list of sources.
        </p>
        <p>
          Any aircraft can also be stood on a runway at one of {stations.length} Air Force
          stations, at three times of day. Where a type is shown somewhere it does not fly
          from, the viewer says so.
        </p>
        <p>
          It is educational and non-commercial. There is no advertising, nothing is sold
          here, and no user accounts or tracking are involved.
        </p>
      </Section>

      <Section index={2} title="Where the information comes from">
        <p>
          Everything published here is drawn from material that is already public: the
          Indian Air Force&apos;s own website, manufacturers such as HAL, Dassault, Boeing
          and Lockheed Martin, open reference works, and press and airshow material.
        </p>
        <p>
          Nothing on this site attempts to describe non-public capability. Where a figure
          could not be sourced, it has been left out rather than estimated. Published
          figures also vary between variants and configurations, so specifications should
          be read as indicative of the type rather than of any individual aircraft. Every
          aircraft page lists its sources so you can check them yourself.
        </p>
      </Section>

      <Section index={3} title="How the models are made">
        <p>
          The 3D models are not downloaded from anywhere. Each airframe is described in
          code as a set of parameters — the cross-sections of the fuselage, the planform
          of the wing, the sweep of the fins, where the engines and gear sit — and the
          geometry is generated from that description in the browser when you open the
          page.
        </p>

        <Reveal>
          <figure className="my-6 overflow-hidden rounded-xl border border-white/[0.08] bg-ink-900/50">
            <div className="bg-hangar flex h-44 items-center justify-center px-8">
              <Planform
                geometry={featured.geometry}
                className="h-full w-full text-slate-500"
              />
            </div>
            <figcaption className="border-t border-white/[0.06] px-5 py-3 font-mono text-[10px] uppercase leading-relaxed tracking-wider text-slate-500">
              {featured.shortName} — outline drawn from the same description the 3D viewer
              builds from
            </figcaption>
          </figure>
        </Reveal>

        <p>
          This was a deliberate choice. Aircraft models available online are almost always
          licensed in ways that do not permit republishing them on a website, and a
          project like this has no business using them. Building the geometry from
          original descriptions means every model here is this project&apos;s own work.
        </p>
        <p>
          The trade-off is honesty about fidelity: these are accurate in layout and
          proportion, not engineering drawings. They are meant to help you understand how
          an aircraft is arranged — why the Mirage has no tailplane, what a tandem rotor
          does, where a Jaguar&apos;s wing sits — rather than to count rivets.
        </p>
      </Section>

      <Section index={4} title="Markings and branding">
        <p>
          The name, logo and visual identity of this site are original. No official crest,
          roundel or state emblem is used as branding anywhere on the site, and none of
          the manufacturers or services named here are associated with it. Aircraft and
          manufacturer names are used descriptively, to identify the aircraft being shown.
        </p>
      </Section>

      <Section index={5} title="What is not here yet">
        <p>
          A section on notable aircraft from other air forces is planned but not built.
          The fleet currently covers Indian Air Force types only. A cockpit view — the
          same aircraft seen from the seat rather than from outside — is the feature being
          worked on now.
        </p>
        <ComingSoon variant="list" />
      </Section>

      <Section index={6} title="Who makes it">
        <p>
          One person, in spare time, with no connection to any of the organisations named
          on this site. Corrections are welcome — particularly on specifications, service
          dates and airframe shapes.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="rounded-md bg-sky-500 px-5 py-2.5 text-sm font-medium text-ink-950 transition-colors hover:bg-sky-400"
          >
            {CONTACT_EMAIL}
          </a>
          <Link
            href="/contact"
            className="rounded-md border border-white/15 px-5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-white/35 hover:text-white"
          >
            Contact page
          </Link>
        </div>
      </Section>
    </div>
  );
}
