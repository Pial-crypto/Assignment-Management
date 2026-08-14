import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Enable standalone output only for Docker builds.
  output:
    process.env.NEXT_STANDALONE === "true"
      ? "standalone"
      : undefined,
};

export default nextConfig;