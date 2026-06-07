import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Replit serves the dev server through its own *.replit.dev / *.repl.co proxy,
  // so allow those cross-origin requests during development.
  allowedDevOrigins: ["*.replit.dev", "*.repl.co", "*.replit.app"],
};

export default nextConfig;
