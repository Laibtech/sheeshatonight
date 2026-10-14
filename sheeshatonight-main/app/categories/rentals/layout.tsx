import { Metadata } from 'next';
import { createMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'On-Demand Sheesha Rental Packages Dubai | SheeshaTonight',
  description:
    'Browse flexible sheesha rental packages in Dubai. Solo sessions, couples lounges, VIP villa setups, and yacht master services with 45-min delivery.',
  keywords: [
    'sheesha rental packages dubai',
    'hourly shisha hire uae',
    'shisha to villa packages',
    'yacht hookah packages dubai',
  ],
  path: '/categories/rentals',
  image: '/Categories/Rentals.webp',
});

export default function CategoryRentalsLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Rentals', url: '/rentals' },
    { name: 'Rental Packages', url: '/categories/rentals' },
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
