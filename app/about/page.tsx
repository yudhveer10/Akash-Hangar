import type { Metadata } from "next";
import Link from "next/link";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { getAllAircraft } from "@/lib/aircraft";

export const metadata: Metadata = {
  title: "About",
  description:
    "What Akash Hangar is, where its information comes from, and how its 3D models are made.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="font-mono text-xs uppercase tracking-widest text-sky-400">{title}</h2>
      <div className="mt-4 space-y-4 text-pretty leading-relaxed text-slate-300">
        {children}
      </div>
    </section>
  );
}

export default function AboutPage() {
  const fleet = getAllAircraft();

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="text-3xl font-semibold text-white sm:text-4xl">About this project</h1>
      <p className="mt-4 text-lg leading-relaxed text-slate-400">
        Akash Hangar is a personal project about aircraft, built for people who want to
        look at them properly rather than read a specification list.
      </p>

      <div className="mt-10">
        <Disclaimer variant="full" />
      </div>

      <Section title="What it is">
        <p>
          The site presents {fleet.length} aircraft operated by the Indian Air Force as
          interactive 3D models. Each one can be orbited and zoomed, and has working
          controls for the things that actually move — landing gear, canopies, rotors,
          afterburners and flight control surfaces. Alongside each model sits its
          specifications, a short account of its design and role, and a list of sources.
        </p>
        <p>
          It is educational and non-commercial. There is no advertising, nothing is sold
          here, and no user accounts or tracking are involved.
        </p>
      </Section>

      <Section title="Where the information comes from">
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

      <Section title="How the models are made">
        <p>
          The 3D models are not downloaded from anywhere. Each airframe is described in
          code as a set of parameters — the cross-sections of the fuselage, the planform
          of the wing, the sweep of the fins, where the engines and gear sit — and the
          geometry is generated from that description in the browser when you open the
          page.
        </p>
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

      <Section title="Markings and branding">
        <p>
          The name, logo and visual identity of this site are original. No official crest,
          roundel or state emblem is used as branding anywhere on the site, and none of
          the manufacturers or services named here are associated with it. Aircraft and
          manufacturer names are used descriptively, to identify the aircraft being shown.
        </p>
      </Section>

      <Section title="What is not here yet">
        <p>
          A section on notable aircraft from other air forces is planned but not built.
          The fleet currently covers Indian Air Force types only.
        </p>
        <p>
          Corrections are welcome — particularly on specifications, service dates and
          airframe shapes.{" "}
          <Link href="/contact" className="text-sky-400 underline underline-offset-4 hover:text-sky-300">
            Get in touch
          </Link>
          .
        </p>
      </Section>
    </div>
  );
}
