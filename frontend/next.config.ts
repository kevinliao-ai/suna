import type { NextConfig } from 'next';
import path from 'path';

const nextConfig = (): NextConfig => ({
  output: (process.env.NEXT_OUTPUT as 'standalone') || undefined,
});

export default nextConfig;
