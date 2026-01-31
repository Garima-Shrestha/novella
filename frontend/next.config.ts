import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        hostname: 'localhost',
        port: '5050',
        protocol: 'http',
        pathname: '/uploads/**',
      },
      {
        // another example
        hostname: 'unsplash.com',
        protocol: 'https'
      }
    ]
  }
};

export default nextConfig;
