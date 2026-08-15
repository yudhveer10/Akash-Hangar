import Link from "next/link";
import type { Aircraft } from "@/lib/types";
import { aircraftClass } from "@/lib/aircraft";
import { Planform } from "./Planform";

/** Strips the parenthetical qualifier so "1987 (UPG upgrade from 2012)" reads as "1987". */
function firstYear(value: string) {
  return value.replace(/\s*\(.*\)$/, "");
}

export function AircraftCard({ entry }: { entry: Aircraft }) {
  const cls = aircraftClass(entry);

  return (
    <Link
      href={`/aircraft/${entry.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-ink-900/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-400/45 hover:bg-ink-850/80 hover:shadow-[0_18px_40px_-24px_rgba(56,189,248,0.65)]"
    >
      <div className="bg-hangar relative flex h-40 items-center justify-center overflow-hidden px-6">
        <Planform
          geometry={entry.geometry}
          className="h-full w-full text-slate-500 transition-all duration-500 group-hover:scale-[1.04] group-hover:text-sky-300"
        />
        <span className="absolute left-3 top-3 rounded border border-white/10 bg-ink-950/70 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-400 backdrop-blur-sm">
          {cls}
        </span>
        {entry.annotations && (
          <span className="absolute right-3 top-3 rounded border border-sky-400/25 bg-sky-400/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-sky-300/90">
            {entry.annotations.length} parts
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 border-t border-white/[0.06] p-4">
        <h3 className="font-medium text-white transition-colors group-hover:text-sky-200">
          {entry.shortName}
        </h3>
        <p className="text-sm text-slate-400">{entry.role}</p>

        <dl className="mt-3 flex gap-5 border-t border-white/[0.05] pt-3">
          <div>
            <dt className="font-mono text-[9px] uppercase tracking-wider text-slate-600">
              In service
            </dt>
            <dd className="mt-0.5 font-mono text-xs text-slate-300">
              {firstYear(entry.inServiceSince)}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[9px] uppercase tracking-wider text-slate-600">
              Crew
            </dt>
            <dd className="mt-0.5 font-mono text-xs text-slate-300">
              {entry.specs.crew.replace(/\s*\(.*\)$/, "")}
            </dd>
          </div>
        </dl>
      </div>
    </Link>
  );
}
