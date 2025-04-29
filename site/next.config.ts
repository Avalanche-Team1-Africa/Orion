import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  /* config options here */
  compiler: {
    // Remove console logs only in production
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
