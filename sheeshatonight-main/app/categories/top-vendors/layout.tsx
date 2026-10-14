import { Metadata } from 'next';
import { createMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Top Rated Sheesha Lounges & Masters Dubai | SheeshaTonight',
  description:
    'Discover top-rated sheesha lounges and masters in Dubai. Verified customer reviews, exclusive catering packages, and VIP sommelier services.',
  keywords: [
    'top sheesha lounges dubai',
    'best hookah master uae',
    'highest rated shisha dubai',
    'dubai luxury lounge directory',
  ],
  path: '/categories/top-vendors',
  image: '/Categories/Top%20Vendors.webp',
});

export default function TopVendorsCategoryLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Vendors', url: '/vendors' },
    { name: 'Top Rated Lounges', url: '/categories/top-vendors' },
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
