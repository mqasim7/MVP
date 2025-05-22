import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'api.yourbackend.com'],
  },
  eslint: {
    // Disable linting during builds
    ignoreDuringBuilds: true,
  },
  
};

export default nextConfig;

