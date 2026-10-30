'use client';

import { Calendar, User, ArrowRight, Clock, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  image?: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  published?: boolean;
}

const defaultBlogs: BlogPost[] = [
  {
    slug: 'best-shisha-flavors-2026',
    title: 'Top 10 Best Shisha Flavors to Try in 2026',
    excerpt: 'Discover the most popular and trending shisha flavors that will elevate your smoking experience this year in the UAE.',
    image: '/blog.webp',
    author: 'Ahmed Hassan',
    date: 'June 10, 2026',
    category: 'Flavors',
    readTime: '5 min read',
  },
  {
    slug: 'villa-party-setup-guide',
    title: 'Complete Guide to Hosting the Perfect Villa Party with Shisha',
    excerpt: 'Learn expert tips and tricks for organizing an unforgettable villa party with luxury shisha catering.',
    image: '/Categories/Rentals.webp',
    author: 'Sara Ali',
    date: 'June 8, 2026',
    category: 'Events',
    readTime: '8 min read',
  },
  {
    slug: 'yacht-party-shisha-guide',
    title: 'Yacht Party Shisha Rental: Everything You Need to Know',
    excerpt: 'Planning a yacht party? Here is your complete guide to booking and enjoying shisha on a yacht in Dubai marina.',
    image: '/yacht.png',
    author: 'Omar Mansoor',
    date: 'June 3, 2026',
    category: 'Events',
    readTime: '7 min read',
  },
];

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>(defaultBlogs);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/blogs')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
          setBlogs(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const categories = ['All', ...Array.from(new Set(blogs.map((b) => b.category).filter(Boolean)))];

  const filteredBlogs =
    selectedCategory === 'All'
      ? blogs
      : blogs.filter((blog) => blog.category?.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-purple-50/70 to-transparent py-16 border-b border-slate-100">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100/80 text-[#74189B] text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles size={14} /> SheeshaTonight Editorial
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Our <span className="text-[#74189B]">Journal & Guides</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Tips, guides, and insights about luxury shisha culture, exotic flavors, and premier event setups across Dubai and the UAE.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-6 bg-white border-b border-slate-200">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-2.5">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition ${
                  selectedCategory === category
                    ? 'bg-[#74189B] text-white shadow-xs'
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
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog) => (
              <article
                key={blog.slug}
                className="bg-white rounded-2xl overflow-hidden shadow-xs border border-slate-100 hover:shadow-lg transition group flex flex-col justify-between"
              >
                <div>
                  <div className="h-52 overflow-hidden bg-slate-100 relative">
                    <img
                      src={blog.image || '/blog.webp'}
                      alt={blog.title}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 bg-white/95 backdrop-blur-xs text-[#74189B] rounded-full text-[11px] font-bold shadow-xs">
                      {blog.category || 'Guide'}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-1 text-xs text-slate-400 mb-2">
                      <Clock className="w-3.5 h-3.5" />
                      {blog.readTime || '5 min read'}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-[#74189B] transition line-clamp-2">
                      {blog.title}
                    </h3>

                    <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                      {blog.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100/60 mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 py-3">
                    <div className="flex items-center gap-1.5 font-medium">
                      <User className="w-3.5 h-3.5 text-[#74189B]" />
                      {blog.author}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {blog.date}
                    </div>
                  </div>

                  <Link
                    href={`/blogs/${blog.slug}`}
                    className="flex items-center justify-between w-full py-2.5 px-4 rounded-xl bg-purple-50 text-[#74189B] hover:bg-[#74189B] hover:text-white font-bold text-xs transition"
                  >
                    <span>Read Full Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-[#74189B] to-[#571275]">
        <div className="container mx-auto px-6 text-center text-white max-w-2xl">
          <h2 className="text-3xl font-extrabold mb-3">Ready to Book Your Shisha Setup?</h2>
          <p className="text-base text-white/80 mb-6">
            Experience premium hand-crafted German & Russian hookahs with professional white-glove sommeliers.
          </p>
          <Link
            href="/rentals"
            className="inline-block px-8 py-3.5 bg-[#F1A51D] text-[#2B043D] rounded-xl font-bold hover:brightness-110 transition shadow-lg"
          >
            Explore Rental Packages
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
