import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Turbopack alias resolution (your existing config)
  turbopack: {
    resolveAlias: {
      "convex/generated/*": path.join(
        process.cwd(),
        "../backend/convex/_generated/*",
      ),
    },
  },

  // Add webpack fallback to prevent browser build errors for Node-only modules
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      stream: false,
      zlib: false,
    };
    return config;
  },
};

export default nextConfig;
