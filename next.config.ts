import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/webp'],
    dangerouslyAllowSVG: true,
    unoptimized: process.env.NODE_ENV === 'development',
  },
  
  // Performance optimizations for faster compilation
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // Faster compilation in development
  swcMinify: true,
  
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@prisma/client'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Headers for better caching and security
  async headers() {
    // Completely disable CSP in development to avoid font loading issues
    return [
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
