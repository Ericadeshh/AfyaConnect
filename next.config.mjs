import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Turbopack alias resolution
  turbopack: {
    resolveAlias: {
      "convex/generated/*": path.join(
        process.cwd(),
        "../backend/convex/_generated/*",
      ),
    },
  },
};

export default nextConfig;
