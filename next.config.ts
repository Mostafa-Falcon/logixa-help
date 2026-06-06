import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [],
  experimental: {
    scrollRestoration: true,
  },
};

export default nextConfig;
