import { Metadata } from 'next';
import { createMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Complete Luxury Sheesha Setups & Pipes Dubai | SheeshaTonight',
  description:
    'Buy and rent complete luxury German and Russian sheesha setups in Dubai. High-grade stainless steel, crystal vases, and modern designer hookahs.',
  keywords: [
    'sheesha setups dubai',
    'buy complete hookah setup',
    'russian sheesha pipe uae',
    'german stainless steel hookah',
    'luxury hookah set dubai',
  ],
  path: '/categories/sheesha-setups',
  image: '/Categories/Sheesha%20Setups.webp',
});

export default function SheeshaSetupsCategoryLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/shop' },
    { name: 'Sheesha Setups', url: '/categories/sheesha-setups' },
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
