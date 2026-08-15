import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every route prerenders, so the whole site ships as static HTML and any CDN can
  // host it with no Next.js server runtime. See the deployment notes in README.
  output: "export",
  // three.js ships untranspiled ESM examples; Next handles this fine, but being
  // explicit keeps the dev/prod builds consistent across Node versions.
  transpilePackages: ["three"],
};

export default nextConfig;
