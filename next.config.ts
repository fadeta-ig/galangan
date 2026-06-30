import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 100],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' ws: wss:; frame-src 'self';" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: '/id/about', destination: '/id/tentang-kami', permanent: true },
      { source: '/id/services', destination: '/id/layanan', permanent: true },
      { source: '/id/services/:slug*', destination: '/id/layanan/:slug*', permanent: true },
      { source: '/id/experience', destination: '/id/pengalaman', permanent: true },
      { source: '/id/experience/:slug*', destination: '/id/pengalaman/:slug*', permanent: true },
      { source: '/id/news', destination: '/id/berita', permanent: true },
      { source: '/id/news/:slug*', destination: '/id/berita/:slug*', permanent: true },
      { source: '/id/gallery', destination: '/id/galeri', permanent: true },
      { source: '/id/contact', destination: '/id/kontak', permanent: true },
    ];
  },
  async rewrites() {
    return [
      { source: '/id/tentang-kami', destination: '/id/about' },
      { source: '/id/layanan', destination: '/id/services' },
      { source: '/id/layanan/:slug*', destination: '/id/services/:slug*' },
      { source: '/id/pengalaman', destination: '/id/experience' },
      { source: '/id/pengalaman/:slug*', destination: '/id/experience/:slug*' },
      { source: '/id/berita', destination: '/id/news' },
      { source: '/id/berita/:slug*', destination: '/id/news/:slug*' },
      { source: '/id/galeri', destination: '/id/gallery' },
      { source: '/id/kontak', destination: '/id/contact' },
    ];
  },
};

export default nextConfig;
