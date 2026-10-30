'use client';

import Link from 'next/link';
import { Calendar, User, ArrowLeft, Clock, Share2, Sparkles, BookOpen } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { sanitizeHtml } from '@/lib/utils';

// Static fallback articles if not yet in database
const fallbackArticles: Record<string, any> = {
  'best-shisha-flavors-2026': {
    title: 'Top 10 Best Shisha Flavors to Try in 2026',
    author: 'Ahmed Hassan',
    date: 'June 10, 2026',
    readTime: '5 min read',
    category: 'Flavors',
    image: '/blog.webp',
    content: `
      <p>Shisha culture has evolved significantly over the years, and 2026 brings an exciting array of flavors that cater to both traditional enthusiasts and modern experimenters. In this comprehensive guide, we explore the top flavors that are making waves in the UAE luxury lounge scene.</p>
      <h2>1. Double Apple - The Timeless Classic</h2>
      <p>Double Apple remains the gold standard for shisha lovers worldwide. This iconic flavor combines sweet red apple with a hint of anise, creating a smooth and aromatic experience. Perfect for both beginners and seasoned smokers, Double Apple is a must-try at any gathering.</p>
      <h2>2. Lemon Mint - Refreshing Excellence</h2>
      <p>The perfect balance of zesty lemon and cool mint creates an incredibly refreshing smoking experience. Ideal for Dubai's warm evenings, this flavor cleanses the palate and provides a crisp, invigorating sensation with every puff.</p>
      <h2>3. Watermelon - Summer Vibes</h2>
      <p>Sweet, juicy, and incredibly smooth, watermelon flavor has become a favorite for villa parties and outdoor events. Its natural sweetness doesn't overpower, making it perfect for extended smoking sessions.</p>
      <h2>4. Blueberry - Berry Perfection</h2>
      <p>Rich, sweet, and slightly tart, blueberry offers a sophisticated flavor profile that appeals to those seeking something fruity yet refined. It is excellent on its own or mixed with mint for an extra dimension.</p>
      <h2>5. Grape - Bold and Sweet</h2>
      <p>Grape flavor provides a bold, sweet experience reminiscent of fresh grapes straight from the vine. It is particularly popular for evening sessions and pairs wonderfully with mint variations.</p>
      <h2>Book Your Premium Setup</h2>
      <p>Ready to experience these amazing flavors at your next event? Book one of our premium packages and let our expert team bring the finest shisha experience directly to your venue.</p>
    `,
  },
  'villa-party-setup-guide': {
    title: 'Complete Guide to Hosting the Perfect Villa Party with Shisha',
    author: 'Sara Ali',
    date: 'June 8, 2026',
    readTime: '8 min read',
    category: 'Events',
    image: '/Categories/Rentals.webp',
    content: `
      <p>Hosting a villa party in Dubai with premium shisha setup can transform a regular gathering into an unforgettable experience. This comprehensive guide will walk you through everything you need to know to plan and execute the perfect event.</p>
      <h2>Planning Your Villa Party</h2>
      <p>Start planning at least 2-3 weeks in advance. Consider your guest count, preferred date and time, and the overall theme of your event. This will help determine which shisha package is right for you.</p>
      <h2>Choosing the Right Package</h2>
      <p>For intimate gatherings of 10-15 people, our Silver package works perfectly. Medium-sized parties of 20-30 guests benefit from our Gold package, while larger celebrations of 35+ guests should consider our Platinum package.</p>
      <h2>Professional Sommelier Masters</h2>
      <p>Our experienced shisha masters handle everything from setup to continuous maintenance throughout your event. They manage charcoal changes, head replacements, and ensure optimal smoke quality at all times.</p>
    `,
  },
};

export default function BlogDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';
  const [blog, setBlog] = useState<any>(fallbackArticles[slug] || null);
  const [loading, setLoading] = useState(!fallbackArticles[slug]);

  useEffect(() => {
    fetch('/api/blogs')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success && Array.isArray(json.data)) {
          const match = json.data.find((b: any) => b.slug === slug);
          if (match) {
            setBlog(match);
          } else if (!fallbackArticles[slug]) {
            setBlog({
              title: 'Blog Article Not Found',
              author: 'SheeshaTonight',
              date: 'N/A',
              readTime: 'N/A',
              category: 'General',
              content: '<p>The requested blog article could not be found or has not been published yet.</p>',
            });
          }
        }
      })
      .catch(() => {
        if (!blog && !fallbackArticles[slug]) {
          setBlog({
            title: 'Article Unavailable',
            author: 'SheeshaTonight',
            date: 'N/A',
            readTime: 'N/A',
            category: 'General',
            content: '<p>Failed to load the article. Please check your connection.</p>',
          });
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const currentBlog = blog || fallbackArticles[slug] || {
    title: 'Loading Article...',
    author: 'SheeshaTonight',
    date: '',
    readTime: '',
    category: 'Editorial',
    content: '<p>Loading article content...</p>',
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      {/* Back Button */}
      <div className="pt-8 pb-4">
        <div className="container mx-auto px-6 max-w-4xl">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-[#74189B] hover:text-[#571275] font-bold text-xs transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Journal & Articles
          </Link>
        </div>
      </div>

      {/* Blog Article */}
      <article className="pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Category Badge */}
          <div className="mb-4">
            <span className="px-3.5 py-1.5 bg-[#74189B]/10 text-[#74189B] rounded-full text-xs font-bold uppercase tracking-wider">
              {currentBlog.category || 'Editorial'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
            {currentBlog.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-5 text-xs text-slate-500 mb-8 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-1.5 font-medium text-slate-800">
              <User className="w-4 h-4 text-[#74189B]" />
              <span>{currentBlog.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{currentBlog.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{currentBlog.readTime || '5 min read'}</span>
            </div>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: currentBlog.title, url: window.location.href }).catch(() => {});
                } else if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Article link copied to clipboard!');
                }
              }}
              className="flex items-center gap-1.5 text-[#74189B] hover:underline font-bold ml-auto cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Article</span>
            </button>
          </div>

          {/* Featured Image */}
          {currentBlog.image && (
            <div className="mb-10 rounded-2xl overflow-hidden shadow-sm max-h-[420px] bg-slate-100">
              <img
                src={currentBlog.image}
                alt={currentBlog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Blog Content */}
          <div
            className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-black prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-base prose-a:text-[#74189B]"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(currentBlog.content || '') }}
          />

          {/* CTA Box */}
          <div className="mt-16 bg-gradient-to-br from-[#74189B] to-[#571275] rounded-3xl p-8 sm:p-10 text-center text-white shadow-xl">
            <span className="text-[#F1A51D] text-xs uppercase tracking-widest font-black block mb-2">
              White-Glove Concierge
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold mb-3">
              Ready to Book Your Luxury Shisha Experience?
            </h3>
            <p className="text-sm sm:text-base mb-6 text-white/80 max-w-lg mx-auto">
              Our master sommeliers arrive at your villa, yacht, or event venue with complete gear, coals, and premium tobaccos.
            </p>
            <Link
              href="/rentals"
              className="inline-block px-8 py-3.5 bg-[#F1A51D] text-[#2B043D] rounded-xl font-bold hover:brightness-110 transition shadow-lg text-sm"
            >
              Explore Packages & Book Now
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
