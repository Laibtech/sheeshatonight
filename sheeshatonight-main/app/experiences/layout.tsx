import { Metadata } from 'next';
import { createMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'VIP Sheesha Experiences | Villa, Yacht & Luxury Event Lounges Dubai',
  description:
    'Tailored luxury sheesha setups for intimate gatherings, birthdays, corporate lounges, and luxury yacht nights in Dubai. White-glove master sommelier service.',
  keywords: [
    'yacht sheesha dubai',
    'villa hookah experience',
    'corporate shisha lounge',
    'luxury sheesha party dubai',
    'wedding sheesha catering',
    'dubai vip hookah service',
  ],
  path: '/experiences',
  image: '/experience-hero-banner.webp',
});

export default function ExperiencesLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Experiences', url: '/experiences' },
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
