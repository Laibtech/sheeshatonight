import { Metadata } from 'next';
import { createMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Luxury Sheesha Rental & Sommelier Catering Dubai | SheeshaTonight',
  description:
    'Book on-demand luxury sheesha catering with 45-min delivery across Dubai. Dedicated shisha sommelier, natural coconut coals, and artisan setups for villas, yachts & events.',
  keywords: [
    'rent sheesha dubai',
    'shisha delivery uae',
    'sheesha rental dubai marina',
    'yacht sheesha hire dubai',
    'villa hookah catering',
    'sheesha master on demand',
    'private party sheesha dubai',
  ],
  path: '/rentals',
  image: '/rentals-hero-banner.webp',
});

export default function RentalsLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Rentals', url: '/rentals' },
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
