import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    unoptimized: false,
  },
  // Enable compression
  compress: true,
  // Enable React strict mode for better performance
  reactStrictMode: true,
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
  },
  // Configure Turbopack root directory
  turbopack: {
    root: __dirname,
    resolveAlias: {
      // Ensure proper resolution
    },
  },
};

export default nextConfig;
