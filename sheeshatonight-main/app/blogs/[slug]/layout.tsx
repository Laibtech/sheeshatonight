import { Metadata } from 'next';
import { createMetadata, generateArticleJsonLd, generateBreadcrumbsJsonLd } from '@/lib/seo';

interface Props {
  params: Promise<{ slug: string }> | { slug: string };
  children: React.ReactNode;
}

const blogLookup: Record<string, { title: string; description: string; author: string; date: string; image: string }> = {
  'best-shisha-flavors-2026': {
    title: 'Top 10 Best Shisha Flavors to Try in 2026 | SheeshaTonight',
    description:
      'Discover the most popular and trending shisha flavors elevating the UAE hookah scene in 2026, from classic Double Apple to modern artisan blends.',
    author: 'Ahmed Hassan',
    date: '2026-06-10T12:00:00Z',
    image: '/blog.webp',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const post = blogLookup[slug];

  if (post) {
    return createMetadata({
      title: post.title,
      description: post.description,
      keywords: [
        'shisha flavors 2026',
        'best sheesha dubai',
        'top hookah flavors',
        'double apple flavor dubai',
        'sheesha guide uae',
      ],
      path: `/blogs/${slug}`,
      image: post.image,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    });
  }

  return createMetadata({
    title: 'Sheesha Culture & Guides | SheeshaTonight Dubai',
    description: 'Expert hookah guides, flavor reviews, and nightlife tips from SheeshaTonight sommeliers.',
    path: `/blogs/${slug}`,
    type: 'article',
  });
}

export default async function BlogDetailLayout({ params, children }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const post = blogLookup[slug] || {
    title: 'Expert Hookah Guide',
    description: 'A comprehensive guide to luxury sheesha setups and blends in Dubai.',
    author: 'SheeshaTonight Sommelier',
    date: '2026-06-10T12:00:00Z',
    image: '/blog.webp',
  };

  const articleJsonLd = generateArticleJsonLd({
    slug,
    title: post.title,
    description: post.description,
    image: post.image,
    datePublished: post.date,
    authorName: post.author,
  });

  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blogs' },
    { name: post.title, url: `/blogs/${slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
