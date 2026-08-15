import Link from "next/link";

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
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-ink-950/80 backdrop-blur-md">
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5"
        aria-label="Primary"
      >
        <Link href="/" className="flex items-center gap-2.5 text-white">
          <Mark />
          <span className="font-mono text-sm font-medium uppercase tracking-[0.2em]">
            Akash Hangar
          </span>
        </Link>

        <ul className="ml-auto flex items-center gap-1 text-sm">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="rounded-md px-3 py-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
