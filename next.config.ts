import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Tree-shake icon barrel imports so route bundles stay smaller → faster parse/hydrate.
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.convex.cloud",
        pathname: "/api/storage/**",
      },
      {
        protocol: "https",
        hostname: "*.convex.site",
        pathname: "/api/storage/**",
      },
    ],
  },
};

export default nextConfig;
