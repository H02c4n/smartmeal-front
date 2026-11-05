import type { NextConfig } from "next";

const INTERNAL_API =
  process.env.INTERNAL_API_BASE_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${INTERNAL_API}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;