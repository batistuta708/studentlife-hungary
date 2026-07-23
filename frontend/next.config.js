/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // don't advertise "X-Powered-By: Next.js" — no functional benefit, minor recon info for attackers
  compiler: {
    // Strips console.log/console.debug from production builds automatically —
    // keeps console.error/warn so real runtime errors are still visible in the
    // browser console if something does go wrong live.
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  images: {
    // Cloudinary-hosted images (listings, avatars, blog covers) — remotePatterns keeps
    // next/image's optimization/CDN pipeline working for externally-hosted assets.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" }, // Google avatar URLs
    ],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  eslint: { ignoreDuringBuilds: false },
};

module.exports = nextConfig;
