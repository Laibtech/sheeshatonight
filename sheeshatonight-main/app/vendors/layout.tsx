import { Metadata } from 'next';
import { createMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Verified Sheesha Lounges & Caterers Directory Dubai | SheeshaTonight',
  description:
    'Browse licensed and verified luxury sheesha lounges, certified masters, and top catering providers across Dubai, Abu Dhabi, and the UAE.',
  keywords: [
    'sheesha lounges dubai',
    'verified shisha vendors uae',
    'shisha catering directory',
    'best hookah masters dubai',
    'dubai sheesha cafe list',
  ],
  path: '/vendors',
});

export default function VendorsLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Vendors', url: '/vendors' },
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
