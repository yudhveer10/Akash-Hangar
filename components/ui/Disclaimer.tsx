/**
 * The project's independence statement.
 *
 * This is a legal requirement for the site, not decoration: it must appear on every
 * page. The root layout renders the `compact` form inside the footer, so any new
 * route inherits it automatically. Do not add a layout that bypasses the footer.
 */
export function Disclaimer({ variant = "compact" }: { variant?: "compact" | "full" }) {
  const text = (
    <>
      <strong className="font-medium text-slate-300">Akash Hangar</strong> is an
      independent, non-commercial fan and educational project. It is not affiliated
      with, endorsed by, or connected to the Indian Air Force, the Ministry of Defence,
      or the Government of India. All information presented is sourced from publicly
      available material.
    </>
  );

  if (variant === "full") {
    return (
      <div className="rounded-lg border border-amber-400/25 bg-amber-400/[0.04] p-5">
        <p className="font-mono text-xs uppercase tracking-widest text-amber-300/90">
          Disclaimer
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">{text}</p>
      </div>
    );
  }

  return <p className="max-w-3xl text-xs leading-relaxed text-slate-500">{text}</p>;
}
