import type { Source } from "@/lib/types";

/**
 * Every aircraft page has to show where its figures came from. This renders that
 * list; the data schema makes `sources` required so a page cannot ship without one.
 */
export function SourceList({ sources }: { sources: Source[] }) {
  return (
    <div>
      <h2 className="font-mono text-xs uppercase tracking-widest text-slate-500">
        Sources
      </h2>
      <ul className="mt-3 space-y-1.5">
        {sources.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-400 underline decoration-white/20 underline-offset-4 transition-colors hover:text-sky-300 hover:decoration-sky-400/50"
            >
              {source.label}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-4 max-w-prose text-xs leading-relaxed text-slate-600">
        Figures are quoted from published material and can differ between variants and
        configurations. Where sources disagree, the most commonly cited public figure is
        used.
      </p>
    </div>
  );
}
