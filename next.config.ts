import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co", // Supabase Storage-এর জন্য
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // ফ্যালব্যাক ডাটার জন্য
      },
    ],
  },
};

export default nextConfig;