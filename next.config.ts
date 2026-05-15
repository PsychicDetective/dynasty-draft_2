import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "sleepercdn.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "www.youtube.com" },
      { protocol: "https", hostname: "www.youtube-nocookie.com" },
      { protocol: "https", hostname: "www.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
};
export default nextConfig;
