import { Metadata } from 'next';
import { createMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Buy Luxury Sheesha, Flavors & Accessories Dubai | SheeshaTonight Shop',
  description:
    'Shop authentic German & Russian hookahs, master artisan tobacco blends, heat management devices, and accessories in Dubai with instant delivery across the UAE.',
  keywords: [
    'buy sheesha dubai',
    'hookah shop uae',
    'buy shisha online dubai',
    'sheesha flavors store',
    'german hookahs dubai',
    'russian hookah dubai',
    'sheesha accessories uae',
    'coconut charcoal dubai',
  ],
  path: '/shop',
  image: '/SHOP-BANNER.webp',
});

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
