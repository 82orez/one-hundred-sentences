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
    ],
  },
};

export default nextConfig;
