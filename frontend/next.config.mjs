/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'build8now.com'],
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      {
        source: '/products/old-ultratech-cement',
        destination: '/products/ultratech-super-cement-50kg',
        permanent: true, // HTTP 301 Permanent Redirect
      },
      {
        source: '/cement/ultratech-50kg',
        destination: '/products/ultratech-super-cement-50kg',
        permanent: true, // HTTP 301 Permanent Redirect
      },
    ];
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ],
};

export default nextConfig;
