import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        // protocol: "https",
        hostname: "k.kakaocdn.net",
        port: "",
        search: "",
      },
      {
        protocol: "https",
        hostname: "krgsfzhqitjtaasgupsv.supabase.co",
        port: "",
        search: "",
      },
    ],
  },
};

export default nextConfig;
