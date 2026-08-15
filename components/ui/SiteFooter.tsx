import Link from "next/link";
import { Disclaimer } from "./Disclaimer";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/[0.07] bg-ink-900/40">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.2em] text-slate-300">
              Akash Hangar
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Interactive 3D models of Indian Air Force aircraft.
            </p>
          </div>

          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {[
              { href: "/iaf", label: "IAF Fleet" },
              { href: "/about", label: "About" },
              { href: "/contact", label: "Contact" },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-slate-400 transition-colors hover:text-sky-300"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <hr className="my-8 border-white/[0.07]" />
        <Disclaimer />
      </div>
    </footer>
  );
}
