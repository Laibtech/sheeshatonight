import { Metadata } from 'next';
import { createMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Refund & Cancellation Policy | SheeshaTonight UAE',
  description:
    'Information regarding refunds, returns, order cancellations, and customer satisfaction guarantees on SheeshaTonight.',
  path: '/refund-policy',
});

export default function RefundPolicyLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Refund Policy', url: '/refund-policy' },
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
