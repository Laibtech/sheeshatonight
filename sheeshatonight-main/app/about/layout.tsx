import { Metadata } from 'next';
import { createMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: "About SheeshaTonight | UAE's First Luxury Sheesha Marketplace",
  description:
    'Discover SheeshaTonight, connecting verified UAE licensed lounges, master sommeliers, and hookah connoisseurs with on-demand delivery.',
  keywords: [
    'about sheesha tonight',
    'luxury shisha brand dubai',
    'sheesha marketplace uae',
    'licensed hookah lounges dubai',
    'dubai sheesha delivery network',
  ],
  path: '/about',
  image: '/made for dubai.webp',
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', url: '/' },
    { name: 'About Us', url: '/about' },
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
