'use client';

import Link from 'next/link';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Store, TrendingUp, DollarSign, Users, Headphones, BookOpen, Award, CheckCircle } from 'lucide-react';

export default function VendorSupportPage() {
  const benefits = [
    {
      icon: TrendingUp,
      title: 'Grow Your Business',
      description: 'Reach thousands of potential customers across UAE'
    },
    {
      icon: DollarSign,
      title: 'Easy Payments',
      description: 'Secure and timely payment settlements'
    },
    {
      icon: Users,
      title: 'Customer Support',
      description: 'Dedicated support team for vendors'
    },
    {
      icon: Award,
      title: 'Build Reputation',
      description: 'Earn reviews and build your brand'
    }
  ];

  const features = [
    'Easy-to-use vendor dashboard',
    'Real-time booking notifications',
    'Inventory and pricing management',
    'Customer reviews and ratings',
    'Analytics and sales reports',
    'Marketing and promotional support',
    'Secure payment processing',
    '24/7 vendor support'
  ];

  const faqs = [
    {
      question: 'How do I become a vendor on SheeshaTonight?',
      answer: 'Click on "Join as Vendor" and complete the registration form with your business details. Our team will review your application and get back to you within 2-3 business days.'
    },
    {
      question: 'What are the requirements to join?',
      answer: 'You need a valid business license, quality shisha equipment, professional staff, and compliance with UAE regulations. You must also maintain high service standards.'
    },
    {
      question: 'How do payments work?',
      answer: 'Payments are processed securely through our platform. You receive your earnings within 3-5 business days after service completion, minus the platform commission.'
    },
    {
      question: 'What is the commission structure?',
      answer: 'Our commission is competitive and transparent. The exact percentage depends on your package tier and monthly volume. Contact us for detailed pricing.'
    },
    {
      question: 'Can I set my own prices?',
      answer: 'Yes, you have full control over your pricing. However, we recommend staying competitive within the market to attract more bookings.'
    },
    {
      question: 'How do I manage my bookings?',
      answer: 'Use our vendor dashboard to view, accept, or decline bookings. You\'ll receive real-time notifications for new booking requests.'
    }
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      {/* Hero Section */}
      <section className="site-page-hero">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-6">
              <Store className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Vendor <span className="text-[#D4AF37]">Support Center</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Everything you need to succeed as a SheeshaTonight vendor
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/auth/signup?role=vendor"
                className="px-8 py-4 bg-[#D4AF37] text-white rounded-lg font-semibold hover:bg-[#B8902A] transition shadow-lg"
              >
                Join as Vendor
              </Link>
              <Link 
                href="/auth/login"
                className="px-8 py-4 bg-white text-[#D4AF37] border-2 border-[#D4AF37] rounded-lg font-semibold hover:bg-[#D4AF37] hover:text-white transition"
              >
                Vendor Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Why Partner With Us?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-[#F8FAFC] to-white p-6 rounded-xl shadow-md hover:shadow-lg transition"
                >
                  <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{benefit.title}</h3>
                  <p className="text-slate-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Vendor Dashboard Features</h2>
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="grid md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <span className="text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">How It Works</h2>
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#D4AF37] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  1
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Sign Up</h3>
                <p className="text-sm text-slate-600">Register your business and submit required documents</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#D4AF37] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  2
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Get Approved</h3>
                <p className="text-sm text-slate-600">Our team reviews and approves your application</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#D4AF37] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  3
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Set Up Profile</h3>
                <p className="text-sm text-slate-600">Create your listings and set your prices</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#D4AF37] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  4
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Start Earning</h3>
                <p className="text-sm text-slate-600">Receive bookings and grow your business</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vendor FAQs */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Vendor FAQs</h2>
          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition"
                >
                  <h3 className="font-bold text-slate-900 pr-4">{faq.question}</h3>
                  <span className="text-[#D4AF37] text-2xl flex-shrink-0">
                    {openFaq === index ? '−' : '+'}
                  </span>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-slate-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Resources */}
      <section className="py-16 bg-gradient-to-br from-[#F8FAFC] to-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Support Resources</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <BookOpen className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
              <h3 className="font-bold text-slate-900 mb-2">Documentation</h3>
              <p className="text-sm text-slate-600 mb-4">Comprehensive guides and tutorials</p>
              <button className="text-[#D4AF37] font-semibold text-sm hover:underline">
                View Docs
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <Headphones className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
              <h3 className="font-bold text-slate-900 mb-2">Dedicated Support</h3>
              <p className="text-sm text-slate-600 mb-4">24/7 support for vendors</p>
              <a href="mailto:vendor-support@sheeshatonight.com" className="text-[#D4AF37] font-semibold text-sm hover:underline">
                Contact Support
              </a>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <Users className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
              <h3 className="font-bold text-slate-900 mb-2">Community</h3>
              <p className="text-sm text-slate-600 mb-4">Connect with other vendors</p>
              <button className="text-[#D4AF37] font-semibold text-sm hover:underline">
                Join Community
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-[#D4AF37] to-[#B8902A]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-white/90 mb-8">Join hundreds of successful vendors on our platform</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/auth/signup?role=vendor"
              className="px-8 py-4 bg-white text-[#D4AF37] rounded-lg font-semibold hover:bg-slate-100 transition shadow-lg"
            >
              Register Now
            </Link>
            <a 
              href="mailto:vendor-support@sheeshatonight.com"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-[#D4AF37] transition"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* Unified Global Footer */}
      <Footer />
    </div>
  );
}
