import { Metadata } from 'next';
import { createMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Sheesha Blog & Guides | Hookah Culture, Flavors & Tips Dubai | SheeshaTonight',
  description:
    'Read expert articles, top flavor rankings, hookah maintenance guides, and Dubai nightlife event tips from the masters at SheeshaTonight.',
  keywords: [
    'sheesha blog dubai',
    'shisha flavors guide 2026',
    'best hookah flavors',
    'yacht sheesha party guide',
    'hookah culture dubai',
  ],
  path: '/blogs',
  image: '/blog.webp',
});

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blogs' },
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
