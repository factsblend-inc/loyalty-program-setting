import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/loyalty-program-setting',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
