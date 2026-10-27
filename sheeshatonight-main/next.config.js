/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Add empty turbopack config to silence Turbopack warnings
  turbopack: {},
  experimental: {
    agentUpgrade: 'security',
  },
  allowedDevOrigins: [
    'substance-manor-combines-minimize.trycloudflare.com',
    '*.trycloudflare.com',
    'localhost:3000',
    '127.0.0.1:3000',
  ],
  redirects: async () => [{ source: '/products', destination: '/shop', permanent: true }],
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'Content-Security-Policy', value: "default-src 'self' https:; img-src 'self' https: data: blob:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' https: data:; connect-src 'self' https: ws: wss:;" },
      ],
    },
  ],
};

module.exports = nextConfig;
