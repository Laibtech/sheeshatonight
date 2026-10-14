'use client';

import { Calendar, User, ArrowRight, Clock } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function BlogsPage() {
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const blogs = [
    {
      slug: 'best-shisha-flavors-2026',
      title: 'Top 10 Best Shisha Flavors to Try in 2026',
      excerpt: 'Discover the most popular and trending shisha flavors that will elevate your smoking experience this year.',
      image: '/blog.webp',
      author: 'Ahmed Hassan',
      date: 'June 10, 2026',
      category: 'Flavors',
      readTime: '5 min read'
    },
    // {
    //   slug: 'villa-party-setup-guide',
    //   title: 'Complete Guide to Hosting the Perfect Villa Party with Shisha',
    //   excerpt: 'Learn expert tips and tricks for organizing an unforgettable villa party with premium shisha setup.',
    //   image: '/blog.webp',
    //   author: 'Sara Ali',
    //   date: 'June 8, 2026',
    //   category: 'Events',
    //   readTime: '8 min read'
    // },
    // {
    //   slug: 'shisha-health-facts',
    //   title: 'Understanding Shisha: Health Facts You Should Know',
    //   excerpt: 'An informative guide about responsible shisha smoking and what you need to know about health considerations.',
    //   image: '/blog.webp',
    //   author: 'Dr. Khalid Rahman',
    //   date: 'June 5, 2026',
    //   category: 'Health',
    //   readTime: '6 min read'
    // },
    // {
    //   slug: 'yacht-party-shisha-guide',
    //   title: 'Yacht Party Shisha Rental: Everything You Need to Know',
    //   excerpt: 'Planning a yacht party? Here\'s your complete guide to booking and enjoying shisha on a yacht in Dubai.',
    //   image: '/blog.webp',
    //   author: 'Omar Mansoor',
    //   date: 'June 3, 2026',
    //   category: 'Events',
    //   readTime: '7 min read'
    // },
    // {
    //   slug: 'premium-vs-regular-shisha',
    //   title: 'Premium vs Regular Shisha: What\'s the Difference?',
    //   excerpt: 'Understand the key differences between premium and regular shisha setups and why quality matters.',
    //   image: '/blog.webp',
    //   author: 'Ahmed Hassan',
    //   date: 'May 30, 2026',
    //   category: 'Guide',
    //   readTime: '4 min read'
    // },
    // {
    //   slug: 'wedding-shisha-setup',
    //   title: 'Adding Shisha to Your Wedding: A Modern Touch',
    //   excerpt: 'Learn how to incorporate luxury shisha rental into your wedding celebration for a memorable experience.',
    //   image: '/blog.webp',
    //   author: 'Layla Ahmed',
    //   date: 'May 28, 2026',
    //   category: 'Weddings',
    //   readTime: '6 min read'
    // },
    // {
    //   slug: 'home-shisha-etiquette',
    //   title: 'Shisha Etiquette at Home: Do’s and Don’ts for Guests',
    //   excerpt: 'A practical guide to hosting and enjoying shisha at home while keeping guests comfortable and happy.',
    //   image: '/blog.webp',
    //   author: 'Nadia Karim',
    //   date: 'May 25, 2026',
    //   category: 'Lifestyle',
    //   readTime: '5 min read'
    // },
    // {
    //   slug: 'best-sheesha-accessories',
    //   title: 'Must-Have Shisha Accessories for a Premium Experience',
    //   excerpt: 'Explore the essential shisha accessories that make every session smoother, safer, and more luxurious.',
    //   image: '/blog.webp',
    //   author: 'Yasir Malik',
    //   date: 'May 22, 2026',
    //   category: 'Guide',
    //   readTime: '6 min read'
    // },
    // {
    //   slug: 'sheesha-vs-hookah',
    //   title: 'Shisha vs Hookah: What’s the Real Difference?',
    //   excerpt: 'Learn the distinctions between shisha and hookah, and find out which setup fits your event best.',
    //   image: '/blog.webp',
    //   author: 'Mona Saleh',
    //   date: 'May 18, 2026',
    //   category: 'Guide',
    //   readTime: '5 min read'
    // },
    // {
    //   slug: 'seasonal-shisha-flavors',
    //   title: 'Best Seasonal Shisha Flavors for Summer in the UAE',
    //   excerpt: 'Discover cooling summer shisha flavor combinations that are perfect for rooftop nights and poolside gatherings.',
    //   image: '/blog.webp',
    //   author: 'Ahmed Hassan',
    //   date: 'May 14, 2026',
    //   category: 'Flavors',
    //   readTime: '4 min read'
    // },
    // {
    //   slug: 'corporate-event-shisha',
    //   title: 'Corporate Events with Shisha: Professional and Stylish Setups',
    //   excerpt: 'Tips for delivering polished shisha services at corporate events, networking nights, and branded gatherings.',
    //   image: '/blog.webp',
    //   author: 'Sana Rahman',
    //   date: 'May 10, 2026',
    //   category: 'Events',
    //   readTime: '7 min read'
    // }
  ];

  const categories = ['All', 'Flavors', 'Events', 'Health', 'Guide', 'Weddings'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredBlogs = selectedCategory === 'All' 
    ? blogs 
    : blogs.filter(blog => blog.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      {/* Hero Section */}
      <section className="site-page-hero">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Our <span className="text-[#D4AF37]">Blog</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Tips, guides, and insights about shisha culture, events, and premium experiences
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b border-slate-200">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition ${
                  selectedCategory === category
                    ? 'bg-[#D4AF37] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog) => (
              <article 
                key={blog.slug} 
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition group"
              >
                <div className="h-48 overflow-hidden rounded-t-xl">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full text-xs font-semibold">
                      {blog.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      {blog.readTime}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#D4AF37] transition">
                    {blog.title}
                  </h3>

                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {blog.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {blog.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {blog.date}
                      </div>
                    </div>
                  </div>

                  <Link 
                    href={`/blogs/${blog.slug}`}
                    className="mt-4 flex items-center gap-2 text-[#D4AF37] hover:text-[#B8902A] font-semibold text-sm group/link"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-[#D4AF37] to-[#B8902A]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Book Your Shisha Setup?</h2>
          <p className="text-xl text-white/90 mb-8">Experience premium quality with professional service</p>
          <Link 
            href="/rentals"
            className="inline-block px-8 py-4 bg-white text-[#D4AF37] rounded-lg font-semibold hover:bg-slate-100 transition"
          >
            View Packages
          </Link>
        </div>
      </section>

      {/* Unified Global Footer */}
      <Footer />
    </div>
  );
}
