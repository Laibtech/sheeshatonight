import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Shield, Lock, Eye, UserCheck, FileText, AlertCircle } from 'lucide-react';
// Conditionally import prisma only if DATABASE_URL is set
let prisma:any=null;
if (process.env.DATABASE_URL){
  const mod=require('@/lib/prisma');
  prisma=mod.prisma;
}

export const revalidate = 60;

export default async function PrivacyPage() {
  const dbPage = await prisma.cmsPage.findUnique({
    where: { slug: 'privacy' },
  }).catch(() => null);

  const dbPageContent = dbPage?.content || null;
  const dbTitle = dbPage?.title || null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="site-page-hero site-page-hero-compact">
        <div className="container mx-auto px-6 text-center">
          <div className="w-20 h-20 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Privacy <span className="text-[#D4AF37]">Policy</span>
          </h1>
          <p className="text-lg text-slate-600">Last Updated: June 12, 2026</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {dbPageContent && (
              <div className="bg-white rounded-xl p-8 shadow-lg mb-8 prose max-w-none border-l-4 border-[#D4AF37]">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">{dbTitle || 'Privacy Policy'}</h2>
                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">{dbPageContent}</div>
              </div>
            )}

            {/* Introduction */}
            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Introduction</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                At SheeshaTonight, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
              </p>
              <p className="text-slate-600 leading-relaxed">
                By using our platform, you consent to the data practices described in this policy. If you do not agree with our policies and practices, please do not use our services.
              </p>
            </div>

            {/* Information We Collect */}
            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Information We Collect</h2>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-3 mt-6">Personal Information</h3>
              <p className="text-slate-600 mb-3">We may collect the following personal information:</p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 mb-6">
                <li>Name and contact information (email address, phone number)</li>
                <li>Delivery address and location details</li>
                <li>Payment and billing information</li>
                <li>Account credentials (username and password)</li>
                <li>Event details and preferences</li>
              </ul>

              <h3 className="text-xl font-bold text-slate-900 mb-3">Automatically Collected Information</h3>
              <p className="text-slate-600 mb-3">When you visit our website, we automatically collect:</p>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>IP address and browser type</li>
                <li>Device information and operating system</li>
                <li>Pages visited and time spent on our site</li>
                <li>Referring website addresses</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>

            {/* How We Use Your Information */}
            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">How We Use Your Information</h2>
              </div>

              <p className="text-slate-600 mb-4">We use the information we collect to:</p>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>Process and fulfill your bookings and orders</li>
                <li>Communicate with you about your reservations</li>
                <li>Send you promotional offers and updates (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Analyze user behavior and preferences</li>
                <li>Prevent fraud and ensure platform security</li>
                <li>Comply with legal obligations</li>
                <li>Provide customer support and respond to inquiries</li>
              </ul>
            </div>

            {/* Information Sharing */}
            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Information Sharing and Disclosure</h2>
              </div>

              <p className="text-slate-600 mb-4">We may share your information with:</p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 mb-6">
                <li><strong>Service Providers:</strong> Third-party vendors who assist in service delivery, payment processing, and website hosting</li>
                <li><strong>Business Partners:</strong> Verified vendors and partners who fulfill your orders</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>

              <p className="text-slate-600">
                We <strong>do not sell</strong> your personal information to third parties for marketing purposes.
              </p>
            </div>

            {/* Data Security */}
            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center">
                  <Lock className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Data Security</h2>
              </div>

              <p className="text-slate-600 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 mb-4">
                <li>Secure Socket Layer (SSL) encryption for data transmission</li>
                <li>Regular security assessments and monitoring</li>
                <li>Restricted access to personal information</li>
                <li>Secure payment processing through trusted providers</li>
              </ul>
              <p className="text-slate-600 leading-relaxed">
                However, no method of transmission over the Internet is 100% secure. While we strive to protect your personal information, we cannot guarantee absolute security.
              </p>
            </div>

            {/* Your Rights */}
            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Your Rights and Choices</h2>
              </div>

              <p className="text-slate-600 mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 mb-6">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Data Portability:</strong> Request your data in a portable format</li>
                <li><strong>Object:</strong> Object to processing of your personal information</li>
              </ul>

              <p className="text-slate-600">
                To exercise these rights, please contact us at <a href="mailto:privacy@sheeshatonight.com" className="text-[#D4AF37] hover:underline">privacy@sheeshatonight.com</a>
              </p>
            </div>

            {/* Cookies */}
            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Cookies and Tracking</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and understand user preferences. You can control cookie settings through your browser preferences.
              </p>
              <p className="text-slate-600 leading-relaxed">
                By continuing to use our website, you consent to our use of cookies as described in this policy.
              </p>
            </div>

            {/* Children's Privacy */}
            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Children&apos;s Privacy</h2>
              <p className="text-slate-600 leading-relaxed">
                Our services are intended for users aged 21 and above. We do not knowingly collect personal information from individuals under 21 years of age. If you believe we have collected information from someone under 21, please contact us immediately.
              </p>
            </div>

            {/* Changes to Policy */}
            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Changes to This Policy</h2>
              <p className="text-slate-600 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last Updated&quot; date. We encourage you to review this policy periodically.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-gradient-to-br from-[#D4AF37] to-[#B8902A] rounded-xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <p className="mb-4">If you have questions or concerns about this Privacy Policy, please contact us:</p>
              <div className="space-y-2">
                <p><strong>Email:</strong> privacy@sheeshatonight.com</p>
                <p><strong>Phone:</strong> +971 50 123 1111</p>
                <p><strong>Address:</strong> Dubai, United Arab Emirates</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Standard Footer */}
      <Footer />
    </div>
  );
}
