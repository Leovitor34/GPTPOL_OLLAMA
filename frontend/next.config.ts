import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: {
    buildActivity: false, // 👈 Isso remove o botão "N"
  },
};

export default nextConfig;
