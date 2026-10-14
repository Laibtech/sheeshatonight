import { Metadata } from 'next';
import { createMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Buy Premium Hookahs Online UAE | SheeshaTonight',
  description:
    'Explore our curated collection of luxury hookahs for sale in Dubai. Featuring top European, Russian, and international pipe designers with warranty.',
  keywords: [
    'buy sheesha online uae',
    'luxury hookahs for sale',
    'buy hookah dubai marina',
    'modern sheesha pipes shop',
  ],
  path: '/categories/buy-sheesha',
  image: '/Categories/Buy%20Sheesha.webp',
});

export default function BuySheeshaCategoryLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
    { name: 'Buy Sheesha', url: '/categories/buy-sheesha' },
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
