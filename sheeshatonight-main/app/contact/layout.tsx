import { Metadata } from 'next';
import { createMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Contact SheeshaTonight | 24/7 VIP Concierge & Support Dubai',
  description:
    'Contact our 24/7 VIP concierge team for on-demand sheesha delivery inquiries, corporate event bookings, and bespoke luxury packages across Dubai & UAE.',
  keywords: [
    'contact sheesha tonight',
    'sheesha customer support dubai',
    'book sheesha master dubai',
    'sheesha concierge service',
    'order hookah dubai telephone',
  ],
  path: '/contact',
  image: '/contact-us-banner.webp',
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Contact Us', url: '/contact' },
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
