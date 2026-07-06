import type { NextConfig } from "next";

// Product images are served by the API from local disk
// (e.g. http://localhost:3001/uploads/<file> in dev, or
// https://<api-host>/uploads/<file> in production). Allow next/image to load
// from wherever NEXT_PUBLIC_API_URL points, plus localhost for local dev.
const apiUrl = new URL(
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api",
);

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${apiUrl.origin}/api/:path*` },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/uploads/**",
      },
      {
        protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
        hostname: apiUrl.hostname,
        port: apiUrl.port,
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
