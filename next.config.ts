import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Uncomment and set basePath to your repo name for GitHub Pages
  // basePath: '/your-repo-name',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
