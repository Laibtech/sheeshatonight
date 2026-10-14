import type { Metadata } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://sheeshatonight.com';
export const SITE_NAME = 'SheeshaTonight';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/hero-banner.png`;

export interface MetadataOptions {
  title: string;
  description: string;
  keywords?: string[] | string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
  publishedTime?: string;
  authors?: string[];
}

export function createMetadata({
  title,
  description,
  keywords,
  path = '',
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  noIndex = false,
  publishedTime,
  authors,
}: MetadataOptions): Metadata {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const canonicalUrl = `${SITE_URL}${cleanPath === '/' ? '' : cleanPath}`;
  const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image.startsWith('/') ? image : `/${image}`}`;

  const parsedKeywords = Array.isArray(keywords)
    ? keywords
    : typeof keywords === 'string'
    ? keywords.split(',').map((k) => k.trim())
    : [
        'sheesha delivery dubai',
        'rent shisha dubai',
        'luxury hookah uae',
        'sheesha catering dubai',
        'buy sheesha dubai',
        'shisha flavors online',
        'yacht sheesha rental',
        'villa hookah service',
        'sheeshatonight',
      ];

  return {
    title,
    description,
    keywords: parsedKeywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: 'en_AE',
      type,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime ? { publishedTime } : {}),
      ...(authors ? { authors } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@sheeshatonight',
      creator: '@sheeshatonight',
      images: [imageUrl],
    },
  };
}

/**
 * Generates Schema.org JSON-LD for an E-commerce Product
 */
export function generateProductJsonLd({
  id,
  name,
  description,
  price,
  currency = 'AED',
  image,
  category,
  brand = 'SheeshaTonight',
  inStock = true,
  rating = 4.9,
  reviewsCount = 18,
  vendorName,
}: {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  image?: string;
  category?: string;
  brand?: string;
  inStock?: boolean;
  rating?: number;
  reviewsCount?: number;
  vendorName?: string;
}) {
  const productUrl = `${SITE_URL}/shop/${id}`;
  const imageUrl = image
    ? image.startsWith('http')
      ? image
      : `${SITE_URL}${image.startsWith('/') ? image : `/${image}`}`
    : DEFAULT_OG_IMAGE;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    image: [imageUrl],
    description: description || `Buy ${name} at SheeshaTonight Dubai. Premium quality, instant delivery.`,
    sku: `ST-${id}`,
    brand: {
      '@type': 'Brand',
      name: brand || vendorName || 'SheeshaTonight',
    },
    category: category || 'Sheesha & Hookah Products',
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: currency,
      price: price.toFixed(2),
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: vendorName || 'SheeshaTonight UAE',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating.toString(),
      reviewCount: reviewsCount.toString(),
      bestRating: '5',
      worstRating: '1',
    },
  };
}

/**
 * Generates Schema.org JSON-LD for a Local Lounge / Vendor Store
 */
export function generateStoreJsonLd({
  id,
  name,
  description,
  image,
  phone,
  address,
  city = 'Dubai',
  rating = 4.9,
  reviewsCount = 32,
}: {
  id: string;
  name: string;
  description?: string;
  image?: string;
  phone?: string;
  address?: string;
  city?: string;
  rating?: number;
  reviewsCount?: number;
}) {
  const storeUrl = `${SITE_URL}/vendors/${id}`;
  const imageUrl = image
    ? image.startsWith('http')
      ? image
      : `${SITE_URL}${image.startsWith('/') ? image : `/${image}`}`
    : DEFAULT_OG_IMAGE;

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    image: imageUrl,
    url: storeUrl,
    telephone: phone || '+971 4 555 1234',
    description: description || `Verified premium hookah lounge and vendor ${name} in ${city}, UAE.`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address || 'Downtown Dubai',
      addressLocality: city,
      addressCountry: 'AE',
    },
    priceRange: '$$$',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating.toString(),
      reviewCount: reviewsCount.toString(),
    },
  };
}

/**
 * Generates BreadcrumbList Schema.org JSON-LD
 */
export function generateBreadcrumbsJsonLd(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Generates Article / BlogPosting Schema.org JSON-LD
 */
export function generateArticleJsonLd({
  slug,
  title,
  description,
  image,
  datePublished,
  dateModified,
  authorName = 'SheeshaTonight Sommelier',
}: {
  slug: string;
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
}) {
  const articleUrl = `${SITE_URL}/blogs/${slug}`;
  const imageUrl = image
    ? image.startsWith('http')
      ? image
      : `${SITE_URL}${image.startsWith('/') ? image : `/${image}`}`
    : DEFAULT_OG_IMAGE;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    headline: title,
    description,
    image: [imageUrl],
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
  };
}

/**
 * Generates FAQPage Schema.org JSON-LD
 */
export function generateFaqJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
