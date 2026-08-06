import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  cleanDistDir: true,
  allowedDevOrigins: ["192.168.1.115"],
};

export default nextConfig;
