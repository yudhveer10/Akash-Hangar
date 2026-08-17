import {
  featuredRoadmapItem,
  roadmap,
  STATUS_LABEL,
  type RoadmapStatus,
} from "@/data/roadmap";
import { Brackets } from "./Brackets";
import { CockpitFrame } from "./CockpitFrame";
import { Reveal } from "./Reveal";

/** In-build is the only status that earns the accent colour. */
function StatusPill({ status }: { status: RoadmapStatus }) {
  const live = status === "building";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${
        live
          ? "border-sky-400/30 bg-sky-400/[0.08] text-sky-300"
          : "border-white/10 bg-white/[0.03] text-slate-400"
      }`}
    >
      <span
        className={`h-1 w-1 rounded-full ${live ? "bg-sky-400" : "bg-slate-500"}`}
        aria-hidden="true"
      />
      {STATUS_LABEL[status]}
    </span>
  );
}

/**
 * What is being built next.
 *
 * `variant="list"` drops the artwork and the featured treatment, for pages where this
 * is a footnote rather than a headline.
 */
export function ComingSoon({ variant = "full" }: { variant?: "full" | "list" }) {
  const items = variant === "full" ? roadmap : [featuredRoadmapItem, ...roadmap];

  return (
    <section id="next" className="scroll-mt-24">
      {variant === "full" && (
        <>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-sky-400">
                Coming soon
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
                What is being built next
              </h2>
            </div>
            <p className="hidden max-w-xs text-right text-xs leading-relaxed text-slate-500 sm:block">
              Everything below is under way or planned. Nothing here is shipped yet.
            </p>
          </div>

          <Reveal className="mt-8">
            <article className="card-sheen overflow-hidden rounded-2xl border border-sky-400/20 bg-ink-900/60">
              <div className="grid gap-0 lg:grid-cols-[1.05fr_1fr]">
                <div className="order-2 p-6 sm:p-8 lg:order-1">
                  <StatusPill status={featuredRoadmapItem.status} />

                  <h3 className="mt-5 text-2xl font-semibold text-white sm:text-3xl">
                    {featuredRoadmapItem.title}
                  </h3>
                  <p className="mt-2 text-lg leading-relaxed text-sky-100/80">
                    {featuredRoadmapItem.summary}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-slate-400">
                    {featuredRoadmapItem.detail}
                  </p>

                  <ul className="mt-6 space-y-2.5 border-t border-white/[0.07] pt-6">
                    {featuredRoadmapItem.bullets?.map((line) => (
                      <li
                        key={line}
                        className="flex gap-3 text-sm leading-relaxed text-slate-300"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 border border-sky-400/70"
                        />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-hangar relative order-1 min-h-56 border-b border-white/[0.07] lg:order-2 lg:min-h-full lg:border-b-0 lg:border-l">
                  <CockpitFrame className="h-full w-full p-6" />
                  <Brackets className="inset-4" />
                  <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                    Illustration · not the finished view
                  </p>
                </div>
              </div>
            </article>
          </Reveal>
        </>
      )}

      <div
        className={`grid gap-4 sm:grid-cols-2 ${variant === "full" ? "mt-4 lg:grid-cols-4" : "mt-6"}`}
      >
        {items.map((item, i) => (
          <Reveal key={item.id} delay={Math.min(i, 4) * 0.05}>
            <article className="card-sheen flex h-full flex-col rounded-xl border border-white/[0.08] bg-ink-900/50 p-5 transition-colors hover:border-white/20">
              <StatusPill status={item.status} />
              <h3 className="mt-4 font-medium text-white">{item.title}</h3>
              <p className="mt-1.5 text-sm text-slate-400">{item.summary}</p>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">{item.detail}</p>
            </article>
          </Reveal>
        ))}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-slate-600">
        No dates are given, and the order can change. This is a spare-time project, and
        anything added has to clear the same rules as everything already here: original
        geometry, public sources, no implied affiliation.
      </p>
    </section>
  );
}
