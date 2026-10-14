import { Metadata } from 'next';
import { createMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'How It Works | On-Demand Sheesha Delivery & Catering Dubai | SheeshaTonight',
  description:
    'Learn how easy it is to order luxury sheesha delivery or book a private hookah sommelier for your villa or yacht in Dubai in 5 simple steps.',
  keywords: [
    'how sheesha delivery works',
    'book hookah catering dubai',
    'sheesha ordering guide',
    'shisha to villa dubai',
    'order sheesha tonight',
  ],
  path: '/how-it-works',
});

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', url: '/' },
    { name: 'How It Works', url: '/how-it-works' },
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
