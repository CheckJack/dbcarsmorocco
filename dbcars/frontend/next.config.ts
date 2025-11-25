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
  // Exclude server-only packages from client bundles
  serverComponentsExternalPackages: [
    'axios',
    'form-data',
    'combined-stream',
    'delayed-stream',
    'mime-types',
    'mime-db',
  ],
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    // Fix Turbopack workspace root detection
    turbopack: {
      root: __dirname,
    },
  },
  // Webpack configuration to handle Node.js modules (for non-Turbopack builds)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude Node.js modules from client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
