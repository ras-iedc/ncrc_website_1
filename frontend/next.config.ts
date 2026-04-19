import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Frontend calls backend API directly via NEXT_PUBLIC_API_URL.
  // No rewrites needed — avoids conflict with NextAuth's /api/auth routes.
};

export default nextConfig;
