import { Metadata } from 'next';
import { createMetadata, generateBreadcrumbsJsonLd, generateFaqJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Frequently Asked Questions (FAQs) | SheeshaTonight Dubai',
  description:
    'Find answers to common questions about SheeshaTonight on-demand delivery, villa & yacht catering, packages, flavor options, and booking policies across the UAE.',
  keywords: [
    'sheesha delivery faq dubai',
    'shisha catering questions',
    'how to book sheesha master',
    'dubai sheesha rental prices',
    'hookah event catering uae',
  ],
  path: '/faqs',
});

const defaultFaqs = [
  {
    question: 'What areas do you serve in UAE?',
    answer:
      'We deliver premium shisha services across all Emirates including Dubai (Downtown, Marina, Palm Jumeirah, Business Bay), Abu Dhabi, Sharjah, and beyond with 45-min on-demand delivery.',
  },
  {
    question: 'What is included in each sheesha catering package?',
    answer:
      'All packages include handcrafted shisha units, a dedicated sommelier master, premium flavors, unlimited coconut coals, head changes, and full cleanup service.',
  },
  {
    question: 'Do you cater to yachts and outdoor villa gatherings?',
    answer:
      'Yes, our portable sommelier setups are customized for private yachts, luxury villas, rooftop events, and beach gatherings across Dubai.',
  },
  {
    question: 'Can I choose and customize my sheesha flavors?',
    answer:
      'Yes, we offer classic Double Apple, Lemon Mint, Grape, Blueberry, and exclusive artisan blends from verified licensed tobacco brands.',
  },
];

export default function FaqsLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', url: '/' },
    { name: 'FAQs', url: '/faqs' },
  ]);

  const faqJsonLd = generateFaqJsonLd(defaultFaqs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
