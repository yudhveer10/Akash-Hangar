/**
 * The Indian Air Force's motto, quoted.
 *
 * This is content, not branding — the distinction the whole project runs on. The site
 * has its own name and its own mark, and neither borrows anything from the service;
 * what is on this page is a published fact about the Air Force, attributed to it in
 * as many words and cited like every other fact here. It must never be moved into the
 * header, the logo, the favicon or the OG image, where it would stop reading as a
 * quotation and start reading as a claim to be official. See CLAUDE.md.
 */
export function Motto() {
  return (
    <figure className="relative mx-auto max-w-3xl px-5 text-center">
      <div className="rule-fade mb-10" />

      <blockquote>
        <p
          lang="sa"
          className="font-devanagari text-3xl leading-[1.6] text-slate-100 sm:text-4xl"
        >
          नभः स्पृशं दीप्तम्
        </p>
        {/* Set in the sans face, in its own case, at ordinary tracking: the mono face
            has no glyphs for these marks, and letter-spacing prises a combining mark
            off the letter it belongs to. */}
        <p className="mt-4 text-sm italic tracking-wide text-slate-400">
          Nabhaḥ Spṛśaṁ Dīptam
        </p>
        <p className="text-gradient mt-5 text-xl font-medium sm:text-2xl">
          “Touch the Sky with Glory”
        </p>
      </blockquote>

      <figcaption className="mt-5 text-xs leading-relaxed text-slate-500">
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

      <div className="rule-fade mt-10" />
    </figure>
  );
}
