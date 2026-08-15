import type { MetadataRoute } from "next";
import { getAllAircraft } from "@/lib/aircraft";
import { SITE_URL } from "@/lib/site";

// Generated as a file at build time so it works on a purely static host.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/iaf", "/about", "/contact"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const aircraftRoutes = getAllAircraft().map((entry) => ({
    url: `${SITE_URL}/aircraft/${entry.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...aircraftRoutes];
}
