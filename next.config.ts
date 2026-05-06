import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Tree-shake icon barrel imports so route bundles stay smaller → faster parse/hydrate.
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
