import type { NextConfig } from "next";

// Product images are served by the API from local disk in dev
// (e.g. http://localhost:3001/uploads/<file>). Allow that origin for next/image.
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
