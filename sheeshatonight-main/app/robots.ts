import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sheeshatonight.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/checkout',
          '/cart',
          '/customer/',
          '/dashboard/',
          '/forgot-password',
          '/order-success',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
