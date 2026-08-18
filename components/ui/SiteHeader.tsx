"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/iaf", label: "IAF Fleet" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/** Original wordmark. Deliberately not derived from any official insignia. */
function Mark() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
      <path d="M16 4 L27 25 L16 19.2 L5 25 Z" fill="#38bdf8" />
      <path d="M16 4 L16 19.2 L5 25 Z" fill="#0284c7" />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();

  // An aircraft page is part of the fleet, so the fleet link stays marked while the
  // visitor is down inside one.
  const isCurrent = (href: string) =>
    href === "/iaf"
      ? pathname === "/iaf" || pathname.startsWith("/aircraft/")
      : pathname === href;

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-ink-950/80 backdrop-blur-md">
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5"
        aria-label="Primary"
      >
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-white"
          aria-current={pathname === "/" ? "page" : undefined}
        >
          <span className="transition-transform duration-300 group-hover:-translate-y-0.5">
            <Mark />
          </span>
          <span className="font-mono text-sm font-medium uppercase tracking-[0.2em]">
            Akash Hangar
          </span>
        </Link>

        <ul className="ml-auto flex items-center gap-1 text-sm">
          {NAV.map((item) => {
            const current = isCurrent(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  className={`relative rounded-md px-3 py-2 transition-colors ${
                    current
                      ? "text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                  {/* A lit bar under the section you are in, rather than a colour
                      change alone — at this size a slate-to-white shift is not a
                      difference most people see. */}
                  {current && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3 -bottom-px h-px bg-sky-400 shadow-[0_0_10px_1px_rgba(56,189,248,0.75)]"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
