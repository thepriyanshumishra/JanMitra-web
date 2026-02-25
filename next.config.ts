import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {}, // Silence Next 16 Turbopack/Webpack mismatch warning
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          }, // To fix Firebase Auth Google Login popup error
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
