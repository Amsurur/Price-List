import type { NextConfig } from "next";

// Everything the browser asks for goes through this rewrite on the relative
// /api path — API calls, and product images the API serves from Postgres at
// /api/products/images/<id>. That's deliberate: it keeps the admin_token
// cookie same-origin (Safari ITP), and it means NEXT_PUBLIC_API_URL never has
// to be reachable from the browser. In the Docker deploy it isn't — it points
// at the internal service http://api:3001/api.
//
// No images.remotePatterns needed: image sources are same-origin, and every
// <Image> passes `unoptimized` so nothing goes through /_next/image.
const apiUrl = new URL(
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api",
);

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${apiUrl.origin}/api/:path*` },
    ];
  },
};

export default nextConfig;
