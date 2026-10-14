import { Metadata } from 'next';
import { createMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Delivery & Shipping Policy | 45-Min Express Dubai | SheeshaTonight',
  description:
    'Review SheeshaTonight 45-minute on-demand delivery coverage, rates, and timing for Dubai Marina, Downtown, Palm Jumeirah, and all UAE Emirates.',
  path: '/shipping-policy',
});

export default function ShippingPolicyLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Delivery Policy', url: '/shipping-policy' },
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
