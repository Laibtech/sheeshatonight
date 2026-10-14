'use client';

import Link from 'next/link';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Search, BookOpen, Package, CreditCard, Users, Headphones, Clock, MapPin } from 'lucide-react';

export default function HelpPage() {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const helpCategories = [
    {
      icon: BookOpen,
      title: 'Getting Started',
      description: 'Learn how to book and use our services',
      articles: [
        'How to create an account',
        'How to book a shisha setup',
        'Understanding our packages',
        'Choosing the right flavors'
      ]
    },
    {
      icon: Package,
      title: 'Booking & Orders',
      description: 'Manage your bookings and track orders',
      articles: [
        'How to modify a booking',
        'Cancellation policy',
        'Rescheduling an event',
        'Checking booking status'
      ]
    },
    {
      icon: CreditCard,
      title: 'Payments & Billing',
      description: 'Payment methods and billing information',
      articles: [
        'Accepted payment methods',
        'How deposits work',
        'Refund policy',
        'Payment security'
      ]
    },
    {
      icon: Users,
      title: 'For Vendors',
      description: 'Information for service providers',
      articles: [
        'Becoming a vendor',
        'Vendor dashboard guide',
        'Managing your listings',
        'Payment settlements'
      ]
    },
    {
      icon: Headphones,
      title: 'Customer Support',
      description: 'Get help from our support team',
      articles: [
        'Contact support',
        'Report an issue',
        'Submit feedback',
        'Emergency contacts'
      ]
    },
    {
      icon: Clock,
      title: 'Service Details',
      description: 'Learn about our service offerings',
      articles: [
        'Service hours explained',
        'What\'s included in packages',
        'Flavor selection guide',
        'Equipment maintenance'
      ]
    }
  ];

  const popularArticles = [
    {
      title: 'How far in advance should I book?',
      category: 'Booking & Orders',
      views: '1.2K'
    },
    {
      title: 'What payment methods do you accept?',
      category: 'Payments & Billing',
      views: '980'
    },
    {
      title: 'Can I cancel or reschedule my booking?',
      category: 'Booking & Orders',
      views: '856'
    },
    {
      title: 'What areas do you serve in UAE?',
      category: 'Getting Started',
      views: '745'
    },
    {
      title: 'How do I become a vendor?',
      category: 'For Vendors',
      views: '623'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      {/* Hero Section with Search */}
      <section className="site-page-hero">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              How Can We <span className="text-[#D4AF37]">Help You?</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Search our knowledge base or browse categories below
            </p>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-slate-400" />
              <input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 py-4 rounded-xl border-2 border-slate-200 focus:border-[#D4AF37] focus:outline-none text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Browse by Category</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {helpCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition group cursor-pointer"
                >
                  <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#D4AF37] transition">
                    <Icon className="w-7 h-7 text-[#D4AF37] group-hover:text-white transition" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{category.title}</h3>
                  <p className="text-slate-600 text-sm mb-4">{category.description}</p>
                  <ul className="space-y-2">
                    {category.articles.map((article, idx) => (
                      <li key={idx} className="text-sm text-slate-500 hover:text-[#D4AF37] transition cursor-pointer">
                        • {article}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Popular Articles */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Popular Articles</h2>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {popularArticles.map((article, index) => (
                <div 
                  key={index}
                  className={`p-6 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between ${
                    index !== popularArticles.length - 1 ? 'border-b border-slate-100' : ''
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1 hover:text-[#D4AF37] transition">
                      {article.title}
                    </h3>
                    <p className="text-sm text-slate-500">{article.category}</p>
                  </div>
                  <div className="text-sm text-slate-400">
                    {article.views} views
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Still Need Help?</h2>
            <p className="text-lg text-slate-600 mb-8">
              Our support team is available 24/7 to assist you
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-[#F8FAFC] to-white p-6 rounded-xl shadow-md">
                <Headphones className="w-10 h-10 text-[#D4AF37] mx-auto mb-3" />
                <h3 className="font-bold text-slate-900 mb-2">Live Chat</h3>
                <p className="text-sm text-slate-600 mb-4">Chat with our team instantly</p>
                <button className="text-[#D4AF37] font-semibold text-sm hover:underline">
                  Start Chat
                </button>
              </div>

              <div className="bg-gradient-to-br from-[#F8FAFC] to-white p-6 rounded-xl shadow-md">
                <MapPin className="w-10 h-10 text-[#D4AF37] mx-auto mb-3" />
                <h3 className="font-bold text-slate-900 mb-2">Email Support</h3>
                <p className="text-sm text-slate-600 mb-4">Get help via email</p>
                <a href="mailto:support@sheeshatonight.com" className="text-[#D4AF37] font-semibold text-sm hover:underline">
                  Send Email
                </a>
              </div>

              <div className="bg-gradient-to-br from-[#F8FAFC] to-white p-6 rounded-xl shadow-md">
                <Clock className="w-10 h-10 text-[#D4AF37] mx-auto mb-3" />
                <h3 className="font-bold text-slate-900 mb-2">Phone Support</h3>
                <p className="text-sm text-slate-600 mb-4">Call us 24/7</p>
                <a href="tel:+971501231111" className="text-[#D4AF37] font-semibold text-sm hover:underline">
                  +971 50 123 1111
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-gradient-to-br from-[#D4AF37] to-[#B8902A]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Quick Links</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/faqs"
              className="px-6 py-3 bg-white text-[#D4AF37] rounded-lg font-semibold hover:bg-slate-100 transition"
            >
              FAQs
            </Link>
            <Link 
              href="/contact"
              className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-[#D4AF37] transition"
            >
              Contact Us
            </Link>
            <Link 
              href="/vendor-support"
              className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-[#D4AF37] transition"
            >
              Vendor Support
            </Link>
          </div>
        </div>
      </section>

      {/* Unified Global Footer */}
      <Footer />
    </div>
  );
}
