import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Generated as a file at build time so it works on a purely static host.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
