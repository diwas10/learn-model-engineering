import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === 'true' || process.env.GITHUB_ACTIONS === 'true';
const basePath = isGithubPages ? '/learn-model-engineering' : '';

const nextConfig: NextConfig = {
  output: isGithubPages ? 'export' : undefined,
  basePath: basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
