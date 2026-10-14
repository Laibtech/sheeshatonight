import { Metadata } from 'next';
import { createMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Premium Sheesha Flavors & Artisan Tobacco Blends Dubai | SheeshaTonight',
  description:
    'Discover Dubai’s best selection of authentic sheesha flavors: Double Apple, Lemon Mint, Blueberry, Grape, and exclusive sommelier mixes. Fast delivery in UAE.',
  keywords: [
    'sheesha flavors dubai',
    'buy shisha tobacco online uae',
    'double apple flavor dubai',
    'lemon mint hookah tobacco',
    'artisan sheesha flavors',
    'al fakher delivery dubai',
  ],
  path: '/categories/flavors',
  image: '/Categories/flavor.webp',
});

export default function FlavorsCategoryLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/shop' },
    { name: 'Sheesha Flavors', url: '/categories/flavors' },
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
