import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch about Akash Hangar — corrections, questions or suggestions.",
};

const EMAIL = "hello@akashhangar.in";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="text-3xl font-semibold text-white sm:text-4xl">Contact</h1>
      <p className="mt-4 text-lg leading-relaxed text-slate-400">
        Corrections, questions and suggestions are all welcome.
      </p>

      <div className="mt-10 rounded-xl border border-white/[0.08] bg-ink-900/60 p-6">
        <p className="font-mono text-xs uppercase tracking-widest text-slate-500">Email</p>
        <a
          href={`mailto:${EMAIL}`}
          className="mt-3 inline-block text-lg text-sky-400 underline decoration-sky-400/30 underline-offset-4 transition-colors hover:text-sky-300"
        >
          {EMAIL}
        </a>
      </div>

      <section className="mt-12">
        <h2 className="font-mono text-xs uppercase tracking-widest text-sky-400">
          Especially useful
        </h2>
        <ul className="mt-4 space-y-3 text-slate-300">
          {[
            "Corrections to specifications, service dates or squadron details — with a public source, if you have one to hand.",
            "Aircraft shapes that look wrong. The models are built from published dimensions and photographs, and errors in the geometry are entirely possible.",
            "Aircraft you would like to see added.",
          ].map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-relaxed">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sky-400" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-12 text-sm leading-relaxed text-slate-500">
        This site is a personal project run in spare time, so replies may take a while.
        It is not affiliated with the Indian Air Force or any manufacturer, and cannot
        answer questions on their behalf.
      </p>
    </div>
  );
}
