import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // Local uploads are served from /public/uploads/
    // Add production CDN domains here when ready
    remotePatterns: [],
    // Allow local filesystem paths (unoptimized for dev)
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
