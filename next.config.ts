// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export', // Включаем статическую генерацию
  basePath: '/three', // Замените на имя вашего репозитория
  images: {
    unoptimized: true, // Необходимо для статической генерации
  },
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
