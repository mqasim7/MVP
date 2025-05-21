import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'api.yourbackend.com'],
  },
  
};

export default nextConfig;

