import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  transpilePackages: ['three'],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(gltf|glb)$/,
      type: 'asset/resource',
    });
    return config;
  },
};

export default nextConfig;
