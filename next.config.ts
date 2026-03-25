import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'https://localhost:9409/api/:path*' },
      { source: '/hubs/:path*', destination: 'https://localhost:9409/hubs/:path*' },
    ];
  },
};

export default nextConfig;
