'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Package, Truck, Home } from 'lucide-react';
import PageLayout from '@/components/PageLayout';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumbers = searchParams.get('orders')?.split(',').filter(Boolean) || [];
  const [dates] = useState(() => {
    const now = Date.now();
    return {
      estimatedDelivery: new Date(now + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      orderDate: new Date(now).toLocaleDateString('en-GB')
    };
  });

  return (
    <PageLayout>
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-4">Order Placed Successfully!</h1>
              <p className="text-xl text-slate-600">
                Thank you for your order. We&apos;ve received your booking and will process it shortly.
              </p>
            </div>

            {/* Order Details Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <div className="border-b border-slate-200 pb-6 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Order Number</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {orderNumbers.length > 0 ? orderNumbers.join(', ') : 'Order details unavailable'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 mb-1">Order Date</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {dates.orderDate}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-1">Order Confirmed</h3>
                    <p className="text-sm text-slate-600">Your order has been received and confirmed</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-slate-100 rounded-full p-2 flex-shrink-0">
                    <Package className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-1">Processing</h3>
                    <p className="text-sm text-slate-600">We&apos;re preparing your sheesha setup</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-slate-100 rounded-full p-2 flex-shrink-0">
                    <Truck className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-1">Delivery</h3>
                    <p className="text-sm text-slate-600">
                      Estimated delivery: <span className="font-semibold">{dates.estimatedDelivery}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Confirmation Email */}
              <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg p-4">
                <p className="text-sm text-slate-700">
                  A confirmation email has been sent to your registered email address with order details and tracking information.
                </p>
              </div>
            </div>

            {/* What's Next */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">What&apos;s Next?</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-[#D4AF37] rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Order Preparation</h3>
                    <p className="text-sm text-slate-600">
                      Our team will carefully prepare your premium sheesha setup with all the requested items and flavors.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-[#D4AF37] rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Quality Check</h3>
                    <p className="text-sm text-slate-600">
                      Every item goes through rigorous quality inspection to ensure you receive the best experience.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-[#D4AF37] rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Delivery & Setup</h3>
                    <p className="text-sm text-slate-600">
                      Our professional team will deliver and set up your sheesha at your location, ready to enjoy.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                href="/dashboard/orders"
                className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8902A] text-white rounded-lg font-semibold hover:shadow-xl transition"
              >
                <Package className="w-5 h-5" />
                View Order
              </Link>
              
              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition"
              >
                <Home className="w-5 h-5" />
                Back to Home
              </Link>
            </div>

            {/* Support */}
            <div className="mt-8 text-center">
              <p className="text-slate-600 mb-2">Need help with your order?</p>
              <Link
                href="/contact"
                className="text-[#D4AF37] hover:text-[#B8902A] font-semibold"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <PageLayout>
        <div className="pt-32 pb-20">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-4">Loading your order...</h1>
            </div>
          </div>
        </div>
      </PageLayout>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
