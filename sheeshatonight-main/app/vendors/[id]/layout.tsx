import { Metadata } from 'next';
// Conditionally import prisma only if DATABASE_URL is set
let prisma:any=null;
if (process.env.DATABASE_URL){
  const mod=require('@/lib/prisma');
  prisma=mod.prisma;
}
import { createMetadata, generateStoreJsonLd, generateBreadcrumbsJsonLd } from '@/lib/seo';

interface Props {
  params: { id: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;

  try {
    const vendor = await prisma.vendor.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (vendor) {
      return createMetadata({
        title: `${vendor.name} - Luxury Sheesha Lounge & Catering Dubai | SheeshaTonight`,
        description:
          vendor.description ||
          `Experience ${vendor.name} in Dubai. Verified licensed hookah lounge offering bespoke sheesha setups, sommelier master catering, and exotic flavors.`,
        keywords: [
          vendor.name.toLowerCase(),
          `${vendor.name.toLowerCase()} dubai`,
          'sheesha lounge dubai',
          'hookah caterer uae',
          'verified sheesha vendor',
        ],
        path: `/vendors/${id}`,
      });
    }
  } catch (error) {
    console.error('Error in vendor generateMetadata:', error);
  }

  return createMetadata({
    title: 'Verified Sheesha Lounge & Caterer | SheeshaTonight Dubai',
    description:
      'Explore verified luxury sheesha lounges and masters in Dubai with on-demand delivery, event catering, and premium setups.',
    path: `/vendors/${id}`,
  });
}

export default async function VendorLayout({ params, children }: Props) {
  const id = params.id;
  let storeJsonLd: any = null;

  try {
    const vendor = await prisma.vendor.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (vendor) {
      storeJsonLd = generateStoreJsonLd({
        id: vendor.id,
        name: vendor.name,
        description: vendor.description || undefined,
        phone: vendor.phone || undefined,
      });
    }
  } catch (e) {}

  if (!storeJsonLd) {
    storeJsonLd = generateStoreJsonLd({
      id,
      name: 'Verified Sheesha Lounge',
      description: 'Licensed luxury sheesha lounge partner on SheeshaTonight Dubai.',
    });
  }

  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Vendors', url: '/vendors' },
    { name: 'Storefront', url: `/vendors/${id}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
