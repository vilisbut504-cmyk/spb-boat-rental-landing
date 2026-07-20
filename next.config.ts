import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Timeweb: set NEXT_IMAGE_UNOPTIMIZED=true to avoid EACCES on /.next/cache/images
    // when runtime image optimization cannot write cache. Local/Vercel keep optimizer on.
    unoptimized: process.env.NEXT_IMAGE_UNOPTIMIZED === "true",
  },
};

export default nextConfig;
