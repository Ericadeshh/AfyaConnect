/** @type {import('next').NextConfig} */
const nextConfig = {
  // Empty turbopack config to prevent the warning/error
  turbopack: {},

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
