import { MetadataRoute } from 'next';
// import prisma only when DATABASE_URL is set
let prisma: any = null;
if (process.env.DATABASE_URL) {
  // Dynamically import to avoid connection errors during build
  const { prisma: p } = require('@/lib/prisma');
  prisma = p;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sheeshatonight.com';
  const now = new Date();

  // Core static & category pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rentals`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/experiences`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/vendors`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/categories/flavors`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/categories/sheesha-setups`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/categories/accessories`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories/rentals`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/categories/buy-sheesha`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/categories/top-vendors`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faqs`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/shipping-policy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic products
  let productPages: MetadataRoute.Sitemap = [];
  if (prisma) {
    try {
      const products = await prisma.product.findMany({
        where: { isActive: true, deletedAt: null },
        select: { id: true, updatedAt: true },
        take: 250,
      });
      productPages = products.flatMap((p: { id: number; updatedAt: Date }) => [
        {
          url: `${baseUrl}/shop/${p.id}`,
          lastModified: p.updatedAt,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        },
        {
          url: `${baseUrl}/products/${p.id}`,
          lastModified: p.updatedAt,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        },
      ]);
    } catch (e) {
      console.error('Error loading products for sitemap:', e);
    }
  }

  // Dynamic vendors
  let vendorPages: MetadataRoute.Sitemap = [];
  if (prisma) {
    try {
      const vendors = await prisma.vendor.findMany({
        where: { isActive: true },
        select: { id: true, updatedAt: true },
        take: 100,
      });
      vendorPages = vendors.map((v: { id: number; updatedAt: Date }) => ({
        url: `${baseUrl}/vendors/${v.id}`,
        lastModified: v.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    } catch (e) {
      console.error('Error loading vendors for sitemap:', e);
    }
  }

  // Known blog articles
  const blogPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/blogs/best-shisha-flavors-2026`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.75,
    },
  ];

  return [...staticPages, ...productPages, ...vendorPages, ...blogPages];
}
