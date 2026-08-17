import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/site";
import { Disclaimer } from "./Disclaimer";

const LINKS = [
  { href: "/iaf", label: "IAF Fleet" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/[0.07] bg-ink-900/40">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="font-mono text-sm uppercase tracking-[0.2em] text-slate-300">
              Akash Hangar
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
              Interactive 3D models of Indian Air Force aircraft, built from original
              geometry and public sources.
            </p>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
              Explore
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-slate-400 transition-colors hover:text-sky-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/#next"
                  className="text-slate-400 transition-colors hover:text-sky-300"
                >
                  Coming soon
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
              Get in touch
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-3 inline-block break-all text-sm text-sky-400 transition-colors hover:text-sky-300"
            >
              {CONTACT_EMAIL}
            </a>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Corrections and suggestions welcome.
            </p>
          </div>
        </div>

        <hr className="my-8 border-white/[0.07]" />
        <Disclaimer />
      </div>
    </footer>
  );
}
