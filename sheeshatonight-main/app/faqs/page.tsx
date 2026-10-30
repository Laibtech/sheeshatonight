import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FaqAccordion, { FaqItem } from '@/components/FaqAccordion';
import { prisma } from '@/lib/prisma';
import { HelpCircle, Sparkles } from 'lucide-react';

export const revalidate = 60;

const defaultFaqs: FaqItem[] = [
  {
    question: 'What areas do you serve in UAE?',
    answer: 'We deliver premium shisha services across all Emirates including Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah, and Umm Al Quwain. Free delivery is included in all our packages.'
  },
  {
    question: 'How far in advance should I book?',
    answer: 'We recommend booking at least 3-7 days in advance to ensure availability, especially during weekends and public holidays. However, we can accommodate last-minute bookings subject to availability.'
  },
  {
    question: 'What is included in each package?',
    answer: 'All packages include shisha units, a professional shisha master, premium tobacco flavors, unlimited charcoal and head changes, portable burner, free delivery, and 4 hours of service plus 1 FREE extra hour.'
  },
  {
    question: 'Can I customize the flavors?',
    answer: 'Absolutely! You can choose any flavors you prefer from our extensive selection. We offer classic flavors like Double Apple, refreshing options like Lemon Mint, and fruity choices like Watermelon and Blueberry.'
  },
  {
    question: 'What happens if I need service beyond 5 hours?',
    answer: 'Each package includes 4 hours plus 1 FREE extra hour (total 5 hours). If you need additional time, you can extend the service at an hourly rate. Contact us for pricing details.'
  },
  {
    question: 'Do you provide shisha for outdoor events?',
    answer: 'Yes! We cater to all types of events including villa parties, yacht gatherings, beach events, rooftop celebrations, weddings, and corporate functions. Our portable setup works perfectly for outdoor venues.'
  },
  {
    question: 'Is a deposit required for booking?',
    answer: 'Yes, we require a 50% deposit to confirm your booking. The remaining balance can be paid on the day of the event. We accept bank transfers, credit cards, and cash payments.'
  },
  {
    question: 'What if I need to cancel or reschedule?',
    answer: 'We understand plans can change. If you need to cancel or reschedule, please notify us at least 48 hours in advance for a full refund of your deposit. Cancellations within 48 hours are subject to a 25% cancellation fee.'
  },
  {
    question: 'Are your shisha masters trained professionals?',
    answer: 'Yes, all our shisha masters are highly trained professionals with years of experience. They handle setup, maintenance, charcoal management, and ensure optimal smoke quality throughout your event.'
  },
  {
    question: 'What brands of tobacco do you use?',
    answer: 'We use only premium, authentic tobacco from trusted international brands to ensure the best flavor and smoking experience. All our products comply with UAE regulations.'
  },
];

export default async function FAQsPage() {
  const [dbPage, faqsContent] = await Promise.all([
    prisma.cmsPage.findFirst({
      where: {
        slug: { in: ['faqs', 'faq'] },
        isActive: true,
      },
    }).catch(() => null),
    prisma.cmsContent.findUnique({
      where: { key: 'faqs_list' },
    }).catch(() => null),
  ]);

  const dbPageContent = dbPage?.content || null;
  const dbTitle = dbPage?.title || null;

  let faqs: FaqItem[] = defaultFaqs;
  if (faqsContent?.value && Array.isArray(faqsContent.value) && faqsContent.value.length > 0) {
    const activeFaqs = (faqsContent.value as any[])
      .filter((f) => f.enabled !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((f) => ({
        question: f.question,
        answer: f.answer,
      }));

    if (activeFaqs.length > 0) {
      faqs = activeFaqs;
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-purple-50/50 to-transparent py-14 border-b border-slate-100">
          <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100/80 text-[#74189B] text-xs font-bold uppercase tracking-wider mb-4">
              <HelpCircle size={14} /> Help & Assistance
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              Frequently Asked <span className="text-[#74189B]">Questions</span>
            </h1>
            <p className="text-slate-600 max-w-xl mx-auto text-base sm:text-lg">
              Find answers to common questions about our premium shisha rentals, catering, and marketplace delivery across the UAE.
            </p>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="py-12 max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
          {dbPageContent && (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm mb-8">
              <div className="flex items-center gap-2 text-[#F1A51D] text-xs font-bold uppercase tracking-widest mb-2">
                <Sparkles size={14} /> Official FAQ Guidelines
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">{dbTitle || 'Frequently Asked Questions'}</h2>
              <div className="text-slate-600 leading-relaxed whitespace-pre-wrap text-[15px]">{dbPageContent}</div>
            </div>
          )}

          <FaqAccordion items={faqs} />
        </section>

        {/* Still Have Questions CTA */}
        <section className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-gradient-to-br from-[#74189B] to-[#571275] rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Still Have Questions?</h2>
            <p className="text-white/80 max-w-lg mx-auto mb-8 text-sm sm:text-base">
              Our concierge team is available daily from 10:00 AM to 2:00 AM to assist you with tailored packages and bookings.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/contact"
                className="px-6 py-3 bg-[#F1A51D] hover:bg-[#d99010] text-white rounded-xl font-bold transition shadow-md text-sm"
              >
                Contact Support
              </Link>
              <a 
                href="tel:+971509121111"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-bold transition text-sm"
              >
                Call: +971 50 912 1111
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
