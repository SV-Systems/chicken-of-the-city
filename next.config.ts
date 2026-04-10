import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://www.datocms-assets.com/**")],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 dni — obrazki z DatoCMS się nie zmieniają często
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
