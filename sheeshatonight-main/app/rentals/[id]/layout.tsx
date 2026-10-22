import { Metadata } from 'next';
import { createMetadata, generateBreadcrumbsJsonLd, generateProductJsonLd } from '@/lib/seo';

interface Props {
  params: Promise<{ id: string }> | { id: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  return createMetadata({
    title: `Luxury Sheesha Rental Package | SheeshaTonight Dubai`,
    description:
      'Book this premium sheesha rental package in Dubai. Complete hookah setup, personal shisha sommelier, coals, and free 45-min delivery across the UAE.',
    keywords: [
      'sheesha rental package',
      'hourly hookah rental dubai',
      'villa sheesha catering',
      'yacht shisha hire',
      'sheesha sommelier service',
    ],
    path: `/rentals/${id}`,
    image: '/rentals-hero-banner.webp',
  });
}

export default async function RentalDetailLayout({ params, children }: Props) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const productJsonLd = generateProductJsonLd({
    id,
    name: 'Luxury Sheesha Rental Package Dubai',
    description: 'On-demand premium sheesha rental with personal sommelier and 45-minute delivery in Dubai.',
    price: 349,
    currency: 'AED',
    image: '/rentals-hero-banner.webp',
    category: 'Sheesha Rental Packages',
  });

  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Rentals', url: '/rentals' },
    { name: 'Package Details', url: `/rentals/${id}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
