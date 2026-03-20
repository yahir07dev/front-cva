import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Opciones de configuración */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com", // Esto permite lh3, lh4, lh5, etc.
      },
    ],
  },
};

export default nextConfig;