import { Metadata } from 'next';
// Conditionally import prisma only if DATABASE_URL is set
let prisma:any=null;
if (process.env.DATABASE_URL){
  const mod=require('@/lib/prisma');
  prisma=mod.prisma;
}
import { createMetadata, generateProductJsonLd, generateBreadcrumbsJsonLd } from '@/lib/seo';

interface Props {
  params: { id: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { vendor: true },
    });

    if (product) {
      let imageUrl = '/hero-banner.png';
      if (product.images) {
        try {
          const imgs = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
          if (Array.isArray(imgs) && imgs.length > 0) {
            imageUrl = imgs[0];
          }
        } catch (e) {}
      }

      return createMetadata({
        title: `${product.title} | SheeshaTonight Dubai`,
        description:
          product.description ||
          `Order ${product.title} by ${product.vendor?.name || 'SheeshaTonight'}. Premium quality hookah gear with fast delivery in Dubai & UAE.`,
        keywords: [
          product.title.toLowerCase(),
          `${product.title.toLowerCase()} dubai`,
          'buy sheesha dubai',
          product.vendor?.name?.toLowerCase() || 'sheeshatonight',
          'hookah product uae',
        ],
        path: `/products/${id}`,
        image: imageUrl,
      });
    }
  } catch (error) {
    console.error('Error in product generateMetadata:', error);
  }

  // Fallback metadata for dynamic product
  return createMetadata({
    title: 'Luxury Hookah Product | SheeshaTonight Dubai',
    description:
      'Buy authentic sheesha pipes, artisan flavors, and premium accessories with on-demand 45-min delivery across Dubai and the UAE.',
    path: `/products/${id}`,
  });
}

export default async function ProductLayout({ params, children }: Props) {
  const id = params.id;
  let productJsonLd: any = null;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { vendor: true },
    });

    if (product) {
      let imageUrl = '/hero-banner.png';
      if (product.images) {
        try {
          const imgs = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
          if (Array.isArray(imgs) && imgs.length > 0) {
            imageUrl = imgs[0];
          }
        } catch (e) {}
      }

      productJsonLd = generateProductJsonLd({
        id: product.id,
        name: product.title,
        description: product.description || undefined,
        price: Number(product.price),
        currency: product.currency || 'AED',
        image: imageUrl,
        vendorName: product.vendor?.name,
        inStock: product.stock > 0,
      });
    }
  } catch (e) {}

  if (!productJsonLd) {
    productJsonLd = generateProductJsonLd({
      id,
      name: 'Premium Sheesha Product',
      price: 299,
      currency: 'AED',
      inStock: true,
    });
  }

  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
    { name: 'Product Details', url: `/products/${id}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
