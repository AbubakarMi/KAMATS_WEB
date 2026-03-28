import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'http://localhost:9410/api/:path*' },
      { source: '/hubs/:path*', destination: 'http://localhost:9410/hubs/:path*' },
    ];
  },
};

export default nextConfig;
