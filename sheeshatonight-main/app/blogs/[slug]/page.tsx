'use client';

import Link from 'next/link';
import { Calendar, User, ArrowLeft, Clock, Share2, FileText } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // Sample blog data (in production, fetch from API)
  const blogData: Record<string, any> = {
    'best-shisha-flavors-2026': {
      title: 'Top 10 Best Shisha Flavors to Try in 2026',
      author: 'Ahmed Hassan',
      date: 'June 10, 2026',
      readTime: '5 min read',
      category: 'Flavors',
      content: `
        <p>Shisha culture has evolved significantly over the years, and 2026 brings an exciting array of flavors that cater to both traditional enthusiasts and modern experimenters. In this comprehensive guide, we'll explore the top 10 flavors that are making waves in the UAE shisha scene.</p>

        <h2>1. Double Apple - The Timeless Classic</h2>
        <p>Double Apple remains the gold standard for shisha lovers worldwide. This iconic flavor combines sweet red apple with a hint of anise, creating a smooth and aromatic experience. Perfect for both beginners and seasoned smokers, Double Apple is a must-try at any gathering.</p>

        <h2>2. Lemon Mint - Refreshing Excellence</h2>
        <p>The perfect balance of zesty lemon and cool mint creates an incredibly refreshing smoking experience. Ideal for Dubai's warm evenings, this flavor cleanses the palate and provides a crisp, invigorating sensation with every puff.</p>

        <h2>3. Watermelon - Summer Vibes</h2>
        <p>Sweet, juicy, and incredibly smooth, watermelon flavor has become a favorite for villa parties and outdoor events. Its natural sweetness doesn't overpower, making it perfect for extended smoking sessions.</p>

        <h2>4. Blueberry - Berry Perfection</h2>
        <p>Rich, sweet, and slightly tart, blueberry offers a sophisticated flavor profile that appeals to those seeking something fruity yet refined. It's excellent on its own or mixed with mint for an extra dimension.</p>

        <h2>5. Grape - Bold and Sweet</h2>
        <p>Grape flavor provides a bold, sweet experience reminiscent of fresh grapes straight from the vine. It's particularly popular for evening sessions and pairs wonderfully with mint variations.</p>

        <h2>Choosing the Right Flavor</h2>
        <p>When selecting flavors for your event, consider your guests' preferences, the time of day, and the overall atmosphere you want to create. Our professional shisha masters can help you select the perfect combinations for your gathering.</p>

        <h2>Premium Quality Matters</h2>
        <p>At SheeshaTonight, we use only authentic, premium-quality tobacco from trusted brands. This ensures consistent flavor, smooth smoke, and an overall exceptional experience for you and your guests.</p>

        <h2>Book Your Premium Setup</h2>
        <p>Ready to experience these amazing flavors at your next event? Book one of our premium packages and let our expert team bring the finest shisha experience directly to your venue.</p>
      `
    },
    'villa-party-setup-guide': {
      title: 'Complete Guide to Hosting the Perfect Villa Party with Shisha',
      author: 'Sara Ali',
      date: 'June 8, 2026',
      readTime: '8 min read',
      category: 'Events',
      content: `
        <p>Hosting a villa party in Dubai with premium shisha setup can transform a regular gathering into an unforgettable experience. This comprehensive guide will walk you through everything you need to know to plan and execute the perfect event.</p>

        <h2>Planning Your Villa Party</h2>
        <p>Start planning at least 2-3 weeks in advance. Consider your guest count, preferred date and time, and the overall theme of your event. This will help determine which shisha package is right for you.</p>

        <h2>Choosing the Right Package</h2>
        <p>For intimate gatherings of 10-15 people, our Silver package (4 shisha units) works perfectly. Medium-sized parties of 20-30 guests benefit from our Gold package (6 units), while larger celebrations of 35+ guests should consider our Platinum package (9 units).</p>

        <h2>Setup Location</h2>
        <p>Designate a comfortable outdoor or well-ventilated indoor area for the shisha setup. Ensure there's adequate seating, good lighting, and protection from wind if outdoors. Our team will work with you to optimize the setup location.</p>

        <h2>Flavor Selection</h2>
        <p>Offer variety by selecting different flavors that cater to various preferences. Include classics like Double Apple, refreshing options like Lemon Mint, and fruity favorites like Watermelon and Blueberry.</p>

        <h2>Professional Service</h2>
        <p>Our experienced shisha masters handle everything from setup to continuous maintenance throughout your event. They manage charcoal changes, head replacements, and ensure optimal smoke quality at all times.</p>

        <h2>Booking Your Setup</h2>
        <p>Contact us at least one week before your event to ensure availability. Provide details about your guest count, preferred package, flavors, and any special requirements. Our team will coordinate all logistics with you.</p>
      `
    }
  };

  const blog = blogData[slug] || {
    title: 'Blog Post Not Found',
    author: 'Unknown',
    date: 'N/A',
    readTime: 'N/A',
    category: 'General',
    content: '<p>This blog post could not be found. Please check the URL or return to the blog listing page.</p>'
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      {/* Back Button */}
      <div className="pt-6 pb-6">
        <div className="container mx-auto px-6">
          <Link 
            href="/blogs"
            className="inline-flex items-center gap-2 text-[#74189B] hover:text-[#571275] font-semibold text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blogs
          </Link>
        </div>
      </div>

      {/* Blog Header */}
      <article className="pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Category Badge */}
            <div className="mb-4">
              <span className="px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full text-sm font-semibold">
                {blog.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              {blog.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-8 pb-8 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{blog.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{blog.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{blog.readTime}</span>
              </div>
              <button className="flex items-center gap-2 text-[#D4AF37] hover:text-[#B8902A] ml-auto">
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>
            </div>

            {/* Featured Image */}
            <div className="mb-12 rounded-xl overflow-hidden">
              <div className="w-full h-96 bg-gradient-to-br from-[#D4AF37]/20 to-[#B8902A]/20 flex items-center justify-center">
                <FileText className="w-24 h-24 text-[#D4AF37]" />
              </div>
            </div>

            {/* Blog Content */}
            <div 
              className="prose prose-lg max-w-none prose-headings:text-slate-900 prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-4 prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-6"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* CTA Box */}
            <div className="mt-16 bg-gradient-to-br from-[#D4AF37] to-[#B8902A] rounded-2xl p-8 text-center text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to Book Your Premium Shisha Setup?</h3>
              <p className="text-lg mb-6 text-white/90">Experience the finest shisha service in Dubai</p>
              <Link 
                href="/rentals"
                className="inline-block px-8 py-4 bg-white text-[#D4AF37] rounded-lg font-semibold hover:bg-slate-100 transition"
              >
                View Our Packages
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* Unified Global Footer */}
      <Footer />
    </div>
  );
}
