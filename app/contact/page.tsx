import type { Metadata } from "next";
import Link from "next/link";
import { CopyEmail } from "@/components/ui/CopyEmail";
import { Reveal } from "@/components/ui/Reveal";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch about Akash Hangar — corrections, questions or suggestions. Email yudhveerp10@gmail.com.",
};

/** Pre-filled subjects, so a correction arrives already sorted. */
const TOPICS = [
  {
    subject: "Akash Hangar — correction",
    label: "Report a correction",
    hint: "A figure, a date or a shape that is wrong",
  },
  {
    subject: "Akash Hangar — aircraft suggestion",
    label: "Suggest an aircraft",
    hint: "Something you would like modelled next",
  },
  {
    subject: "Akash Hangar — hello",
    label: "Anything else",
    hint: "Questions, notes, or just to say hello",
  },
];

const USEFUL = [
  {
    title: "Corrections",
    body: "Specifications, service dates and squadron details. A public source alongside it helps enormously — everything published here has to trace back to one.",
  },
  {
    title: "Shapes that look wrong",
    body: "The models are built from published dimensions and photographs, so errors in the geometry are entirely possible. If a wing sits too far aft or a fin looks off, say so.",
  },
  {
    title: "Aircraft to add",
    body: "The fleet is Indian Air Force types for now. Tell me what is missing, and what you would want to be able to see on it.",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-sky-400">Contact</p>
      <h1 className="text-gradient mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        Get in touch
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-slate-400">
        Corrections, questions and suggestions are all welcome. One person reads this,
        and reads all of it.
      </p>

      {/* ------------------------------------------------------------- Address */}
      <div className="card-sheen mt-10 overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900/60">
        <div className="bg-glow relative p-6 sm:p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
            Email
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-3">
            <a
              id="contact-address"
              href={`mailto:${CONTACT_EMAIL}`}
              className="break-all text-xl font-medium text-sky-400 underline decoration-sky-400/30 underline-offset-[6px] transition-colors hover:text-sky-300 sm:text-2xl"
            >
              {CONTACT_EMAIL}
            </a>
            <CopyEmail email={CONTACT_EMAIL} addressId="contact-address" />
          </div>
        </div>

        <ul className="grid divide-y divide-white/[0.06] border-t border-white/[0.06] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {TOPICS.map((topic) => (
            <li key={topic.subject}>
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(topic.subject)}`}
                className="group flex h-full flex-col gap-1 p-5 transition-colors hover:bg-white/[0.03]"
              >
                <span className="text-sm font-medium text-slate-200 transition-colors group-hover:text-sky-300">
                  {topic.label}
                  <span aria-hidden="true" className="ml-1.5 text-sky-400/70">
                    →
                  </span>
                </span>
                <span className="text-xs leading-relaxed text-slate-500">
                  {topic.hint}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* ------------------------------------------------------ What helps most */}
      <section className="mt-14">
        <h2 className="font-mono text-xs uppercase tracking-widest text-sky-400">
          Especially useful
        </h2>

        <div className="mt-6 space-y-3">
          {USEFUL.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.05}>
              <div className="card-sheen flex gap-4 rounded-xl border border-white/[0.08] bg-ink-900/40 p-5">
                <span className="mt-0.5 font-mono text-[10px] tracking-[0.2em] text-slate-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-sm font-medium text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {item.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- Caveats */}
      <section className="mt-14 rounded-xl border border-white/[0.08] bg-ink-900/40 p-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-slate-400">
          Before you write
        </h2>
        <ul className="mt-4 space-y-3">
          {[
            "This is a personal project run in spare time, so replies may take a while.",
            "It is not affiliated with the Indian Air Force, the Ministry of Defence or any manufacturer, and cannot answer anything on their behalf.",
            "Please don't send material that isn't already public. Everything here is built from published sources, and anything else cannot be used.",
          ].map((line) => (
            <li key={line} className="flex gap-3 text-sm leading-relaxed text-slate-400">
              <span
                aria-hidden="true"
                className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-600"
              />
              {line}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 text-sm leading-relaxed text-slate-500">
        Curious how any of this is put together?{" "}
        <Link
          href="/about"
          className="text-sky-400 underline underline-offset-4 hover:text-sky-300"
        >
          Read about the project
        </Link>
        , or see{" "}
        <Link
          href="/#next"
          className="text-sky-400 underline underline-offset-4 hover:text-sky-300"
        >
          what is coming next
        </Link>
        .
      </p>
    </div>
  );
}
