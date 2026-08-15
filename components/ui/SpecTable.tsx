import type { Specs } from "@/lib/types";

const ROWS: { key: keyof Specs; label: string }[] = [
  { key: "length", label: "Length" },
  { key: "wingspan", label: "Wingspan" },
  { key: "height", label: "Height" },
  { key: "maxSpeed", label: "Max speed" },
  { key: "range", label: "Range" },
  { key: "engine", label: "Powerplant" },
  { key: "crew", label: "Crew" },
];

export function SpecTable({ specs }: { specs: Specs }) {
  return (
    <dl className="divide-y divide-white/[0.06] overflow-hidden rounded-lg border border-white/[0.08] bg-ink-900/40">
      {ROWS.map(({ key, label }) => (
        <div
          key={key}
          className="grid gap-1 px-4 py-3 transition-colors hover:bg-white/[0.02] sm:grid-cols-[7.5rem_1fr] sm:gap-4"
        >
          <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500 sm:pt-0.5">
            {label}
          </dt>
          <dd className="font-mono text-[13px] leading-relaxed text-slate-200">
            {specs[key]}
          </dd>
        </div>
      ))}
    </dl>
  );
}
