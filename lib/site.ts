/**
 * Canonical origin for metadata, canonical links, the sitemap and robots.txt.
 *
 * Resolved at build time, falling through:
 *   1. NEXT_PUBLIC_SITE_URL — set this once the real domain is live.
 *   2. CF_PAGES_URL — injected by Cloudflare Pages, so a *.pages.dev deploy
 *      advertises its own address rather than a domain that does not exist yet.
 *   3. localhost, for development.
 *
 * Hardcoding the domain would mean every social preview and every sitemap entry
 * pointed somewhere unreachable until the domain was bought.
 */
function resolve(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const pages = process.env.CF_PAGES_URL;
  if (pages) return pages.replace(/\/$/, "");

  return "http://localhost:3000";
}

export const SITE_URL = resolve();
