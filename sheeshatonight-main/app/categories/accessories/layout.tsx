import { Metadata } from 'next';
import { createMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Premium Hookah Accessories, Bowls & Coals Dubai | SheeshaTonight',
  description:
    'Shop authentic sheesha accessories in Dubai: phunnel bowls, heat management devices (HMD), coconut charcoal, silicone hoses, tongs, and wind covers.',
  keywords: [
    'sheesha accessories dubai',
    'hookah bowl uae',
    'coconut charcoal for shisha',
    'silicone hookah hose',
    'kaloud heat management dubai',
  ],
  path: '/categories/accessories',
  image: '/Categories/Accessories.webp',
});

export default function AccessoriesCategoryLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/shop' },
    { name: 'Accessories', url: '/categories/accessories' },
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
