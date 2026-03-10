import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const withMDX = createMDX();

const nextConfig: NextConfig = {
  transpilePackages: [
    "@siren/core",
    "@siren/react",
    "@siren/presets",
    "@siren/themes",
    "@siren/schema",
  ],
  experimental: {
    optimizePackageImports: ["lucide-react", "@xyflow/react"],
  },
  async rewrites() {
    return [
      {
        source: "/docs/:path*.mdx",
        destination: "/docs/llms.mdx/:path*",
      },
    ];
  },
};

export default withMDX(nextConfig);
