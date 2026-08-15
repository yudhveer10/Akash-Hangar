import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-start px-5 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-sky-400">
        404 · No contact
      </p>
      <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
        Nothing on this bearing.
      </h1>
      <p className="mt-4 max-w-md leading-relaxed text-slate-400">
        The page you asked for is not in the hangar. It may have been moved, or the
        address may be slightly off.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/iaf"
          className="rounded-md bg-sky-500 px-5 py-2.5 text-sm font-medium text-ink-950 transition-colors hover:bg-sky-400"
        >
          Browse the fleet
        </Link>
        <Link
          href="/"
          className="rounded-md border border-white/15 px-5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-white/35 hover:text-white"
        >
          Back to the start
        </Link>
      </div>
    </div>
  );
}
