import { Brackets } from "./Brackets";

/**
 * The Indian Air Force's motto, quoted.
 *
 * This is content, not branding — the distinction the whole project runs on. The site
 * has its own name and its own mark, and neither borrows anything from the service;
 * what is on this page is a published fact about the Air Force, attributed to it in
 * as many words and cited like every other fact here. It must never be moved into the
 * header, the logo, the favicon or the OG image, where it would stop reading as a
 * quotation and start reading as a claim to be official. See CLAUDE.md.
 *
 * Everything around the quotation is ornament and carries no claim: an original
 * wordless mark, a row of approach lamps, and a light sweeping the plate. Nothing here
 * is derived from an official insignia, and nothing here states a fact that is not
 * already in the caption with a source under it.
 */

/** Lamps either side of the plate, brightest at the centre — an approach lit inward. */
const LAMPS = 15;

function ApproachLights({ reversed = false }: { reversed?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="flex flex-1 items-center justify-center gap-[3px] sm:gap-1.5"
    >
      {Array.from({ length: LAMPS }, (_, i) => {
        // Nearest the plate is brightest and largest, so the row reads as running
        // away into the distance rather than as a flat dotted rule.
        const near = reversed ? i / (LAMPS - 1) : 1 - i / (LAMPS - 1);
        const size = 2 + near * 3.5;
        // The pulse travels toward the plate from both sides at once.
        const delay = (reversed ? i : LAMPS - 1 - i) * 0.075;
        return (
          <span
            key={i}
            className="approach-lamp shrink-0 rounded-full bg-sky-300"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity: 0.14 + near * 0.28,
              boxShadow: `0 0 ${4 + near * 8}px rgba(125, 211, 252, ${0.25 + near * 0.5})`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}

export function Motto() {
  return (
    <figure className="relative mx-auto max-w-4xl px-5">
      {/* The lamps run in from both edges and stop at the plate. */}
      <div className="mb-8 flex items-center gap-3 sm:gap-5">
        <ApproachLights />
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 shrink-0 rotate-45 border border-sky-400/50 bg-sky-400/20"
        />
        <ApproachLights reversed />
      </div>

      <div className="relative">
        {/* Pool of light behind the plate, so it sits on the page rather than in it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-10 -inset-y-8 -z-10"
          style={{
            background:
              "radial-gradient(55% 60% at 50% 50%, rgba(56,189,248,0.13), transparent 72%)",
          }}
        />

        <blockquote className="card-sheen relative overflow-hidden rounded-2xl border border-white/[0.09] bg-ink-950/55 px-6 py-10 text-center backdrop-blur-[2px] sm:px-12 sm:py-12">
          {/* A beacon crossing the panel. Ornament only. */}
          <span
            aria-hidden="true"
            className="plate-sweep pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-12 bg-gradient-to-r from-transparent via-sky-200/[0.045] to-transparent"
          />
          <Brackets className="inset-4" />

          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-sky-400/70">
            Motto of the service
          </p>

          <p
            lang="sa"
            className="text-gradient mt-6 font-devanagari text-4xl leading-[1.55] sm:text-5xl"
          >
            नभः स्पृशं दीप्तम्
          </p>

          {/* Set in the sans face, in its own case, at ordinary tracking: the mono face
              has no glyphs for these marks, and letter-spacing prises a combining mark
              off the letter it belongs to. */}
          <p className="mt-4 text-sm italic tracking-wide text-slate-400">
            Nabhaḥ Spṛśaṁ Dīptam
          </p>

          <div className="rule-fade mx-auto mt-7 max-w-[15rem]" />

          <p className="mt-7 text-xl font-medium text-sky-100 sm:text-2xl">
            &ldquo;Touch the Sky with Glory&rdquo;
          </p>
        </blockquote>
      </div>

      <figcaption className="mx-auto mt-6 max-w-xl text-center text-xs leading-relaxed text-slate-500">
        The motto of the Indian Air Force, taken from the Bhagavad Gita. Quoted here as
        the Air Force&apos;s own words — this site is independent of it and is not
        speaking for it.{" "}
        <a
          href="https://en.wikipedia.org/wiki/Indian_Air_Force"
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap underline decoration-white/20 underline-offset-4 transition-colors hover:text-sky-300 hover:decoration-sky-400/50"
        >
          Source
        </a>
      </figcaption>
    </figure>
  );
}
