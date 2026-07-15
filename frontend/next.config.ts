import type { NextConfig } from "next";

/**
 * Browser calls same-origin `/api/v1/*`.
 * Next.js (server) proxies to the Laravel container on the Docker network.
 */
const apiInternal = (
  process.env.API_INTERNAL_URL ||
  process.env.BACKEND_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:8000"
    : "http://backend")
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "**" },
      { protocol: "https", hostname: "**" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiInternal}/api/v1/:path*`,
      },
      {
        source: "/storage/:path*",
        destination: `${apiInternal}/storage/:path*`,
      },
    ];
  },
};

export default nextConfig;
