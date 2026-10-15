import type { NextConfig } from 'next';

const nextConfig = (): NextConfig => ({
  output: (process.env.NEXT_OUTPUT as 'standalone') || undefined,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.anisora.ai',
      },
    ],
    unoptimized: true,
  },
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      { source: '/docs/self-hosting', destination: '/index-anisora', permanent: true },
      { source: '/anisora-v3.2', destination: '/anisora-v3-2', permanent: true },
      { source: '/anisora-v3.1', destination: '/anisora-v3', permanent: true },
      { source: '/anisora', destination: '/index-anisora', permanent: true },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://eu-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://eu.i.posthog.com/:path*',
      },
      {
        source: '/ingest/flags',
        destination: 'https://eu.i.posthog.com/flags',
      },
    ];
  },
  skipTrailingSlashRedirect: true,
});

export default nextConfig;
