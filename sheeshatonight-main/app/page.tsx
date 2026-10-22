import type { Metadata } from 'next';
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Star,
  ShieldCheck,
  Truck,
  Headphones,
  CheckCircle2,
  Heart,
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'SheeshaTonight | Premium Luxury Sheesha Rental & Tobacco Marketplace Dubai',
  description:
    'Experience luxury on-demand sheesha delivery and event catering in Dubai & UAE. Handcrafted German & Russian pipes, exotic flavors, and white-glove sommelier masters.',
  keywords: [
    'sheesha rental dubai',
    'shisha delivery uae',
    'luxury hookah hire',
    'yacht sheesha service dubai',
    'private party sheesha master',
    'buy sheesha dubai',
    'sheesha tonight',
  ],
  path: '/',
  image: '/hero-banner.png',
});

const categories = [
  {
    title: "Sheesha Flavors",
    description: "Premium flavors for every mood.",
    image: "/Categories/flavor.webp",
    href: "/categories/flavors",
  },
  {
    title: "Sheesha Setups",
    description: "Complete premium sheesha setups.",
    image: "/Categories/Sheesha%20Setups.webp",
    href: "/categories/sheesha-setups",
  },
  {
    title: "Accessories",
    description: "Everything you need for your setup.",
    image: "/Categories/Accessories.webp",
    href: "/categories/accessories",
  },
  {
    title: "Rent a Sheesha",
    description: "Premium setups delivered to you.",
    image: "/Categories/Rentals.webp",
    href: "/categories/rentals",
  },
  {
    title: "Buy Sheesha",
    description: "Discover premium sheesha collections.",
    image: "/Categories/Buy%20Sheesha.webp",
    href: "/categories/buy-sheesha",
  },
  {
    title: "Top Vendors",
    description: "Verified lounges & premium packages.",
    image: "/Categories/Top%20Vendors.webp",
    href: "/categories/top-vendors",
  },
];

import { prisma } from "@/lib/prisma";

async function getLiveVendorProducts() {
  try {
    const dbProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 8,
      orderBy: {
        createdAt: "desc",
      },
    });

    return dbProducts.map((p) => {
      let mainImg = "/Categories/Buy Sheesha.webp";
      if (p.images) {
        try {
          const parsed =
            typeof p.images === "string" ? JSON.parse(p.images) : p.images;
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]) {
            mainImg = parsed[0];
          } else if (typeof parsed === "string") {
            mainImg = parsed;
          }
        } catch {}
      }

      return {
        id: p.id,
        name: p.title,
        vendor: p.vendor?.name || "Verified Lounge Partner",
        price: `AED ${Number(p.price)}`,
        oldPrice:
          Number(p.price) > 100
            ? `AED ${Math.round(Number(p.price) * 1.15)}`
            : "",
        rating: "4.9",
        image: mainImg,
        link: "/shop",
      };
    });
  } catch (e) {
    console.error("Failed to load products from database:", e);
    return [];
  }
}

const experiences = [
  {
    title: "Villa",
    image: "/villa.png",
  },
  {
    title: "Yacht",
    image: "/yacht.png",
  },
  {
    title: "Corporate",
    image: "/corporate.jpg",
  },
  {
    title: "Weddings",
    image: "/wedding.webp",
  },
  {
    title: "Birthdays",
    image: "/bdy.webp",
  },
  {
    title: "Private Gatherings",
    image: "/private-gathering.png",
  },
];

export default async function HomePage() {
  const products = await getLiveVendorProducts();

  return (
    <div className="bg-white text-gray-900 font-sans">
      <Header />

      <section className="relative min-h-[620px] lg:min-h-[680px] overflow-hidden">
        <img
          src="/hero-banner.png"
          alt="Premium Dubai sheesha experience"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Smooth cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#38064F]/90 via-[#571275]/65 to-[#571275]/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 min-h-[620px] lg:min-h-[680px] flex items-center">
          <div className="max-w-[620px] py-16 sm:py-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white text-[10.5px] font-bold tracking-[1.5px] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E4AD36]" />
              Premium UAE Sheesha Marketplace
            </div>

            <h1 className="text-white text-3xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.15] mt-5 max-w-[620px]">
              Premium Sheesha, <br className="hidden sm:inline" />
              <span className="text-[#E4AD36]">
                Delivered to Your Experience.
              </span>
            </h1>

            <p className="text-white/85 text-sm sm:text-base leading-relaxed mt-4 max-w-[520px]">
              Discover premium sheesha rentals, curated setups, artisan flavors,
              and professional masters from verified licensed vendors across the UAE.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 mt-8">
              <Link
                href="/rentals"
                className="inline-flex justify-center items-center gap-2 bg-gradient-to-r from-[#E4AD36] to-[#C99120] hover:brightness-110 text-[#2B043D] px-7 py-3.5 rounded-xl font-bold text-sm shadow-md shadow-[#E4AD36]/25 transition"
              >
                Explore Rentals
                <ArrowRight size={17} />
              </Link>

              <Link
                href="/shop"
                className="inline-flex justify-center items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 text-white px-7 py-3.5 rounded-xl font-bold text-sm transition"
              >
                Shop Sheesha
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-5 sm:gap-7 mt-9 text-white/85 text-xs font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#E4AD36]" />
                Verified Licensed Vendors
              </div>

              <div className="flex items-center gap-2">
                <Truck size={18} className="text-[#E4AD36]" />
                45-Min UAE Delivery
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-[#E4AD36]" />
                100% Authentic Quality
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
            <div>
              <span className="text-[#74189B] text-[11px] uppercase tracking-[3px] font-bold">
                Explore Collection
              </span>

              <h2 className="text-3xl sm:text-4xl font-bold text-[#571275] mt-2">
                Everything for your experience
              </h2>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-1 text-sm font-bold text-[#74189B]"
            >
              View All
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {categories.map((category) => (
              <Link
                href={category.href}
                key={category.title}
                className="group relative overflow-hidden rounded-2xl aspect-[1.35] bg-gray-100"
              >
                <img
                  src={category.image}
                  alt={category.title}
                  className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#571275]/90 via-[#571275]/10 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  <h3 className="text-white text-lg sm:text-xl font-bold">
                    {category.title}
                  </h3>

                  <p className="text-white/65 text-xs sm:text-sm mt-1 hidden sm:block">
                    {category.description}
                  </p>

                  <div className="flex items-center gap-1 mt-3 text-[#F1A51D] text-xs font-bold">
                    Explore
                    <ChevronRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-[#FAF8FB]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
            <div>
              <span className="text-[#74189B] text-[11px] uppercase tracking-[3px] font-bold">
                Book Your Experience
              </span>

              <h2 className="text-3xl sm:text-4xl font-bold text-[#571275] mt-2">
                Featured Rentals
              </h2>

              <p className="text-gray-500 text-sm mt-3">
                Premium sheesha setups delivered to your door.
              </p>
            </div>

            <Link
              href="/rentals"
              className="inline-flex items-center gap-1 text-sm font-bold text-[#74189B]"
            >
              Explore Rentals
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <div
                key={product.name}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden group"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />

                  <button 
                    aria-label="Add to wishlist"
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white text-gray-500 hover:text-rose-500 transition"
                  >
                    <Heart size={16} />
                  </button>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Star
                      size={13}
                      fill="currentColor"
                      className="text-[#F1A51D]"
                    />
                    {product.rating}
                    <span className="mx-1">•</span>
                    Verified Vendor
                  </div>

                  <h3 className="font-bold text-[#571275] mt-2">
                    {product.name}
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    {product.vendor}
                  </p>

                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <span className="font-bold text-[#74189B]">
                        {product.price}
                      </span>

                      {product.oldPrice && (
                        <span className="text-xs text-gray-400 line-through ml-2">
                          {product.oldPrice}
                        </span>
                      )}
                    </div>

                    <Link
                      href={product.link || "/shop"}
                      className="w-9 h-9 rounded-lg bg-[#F8F2FA] text-[#74189B] flex items-center justify-center hover:bg-[#74189B] hover:text-white transition"
                    >
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-[650px] mx-auto mb-12">
            <span className="text-[#74189B] text-[11px] uppercase tracking-[3px] font-bold">
              Made For Every Occasion
            </span>

            <h2 className="text-3xl sm:text-4xl font-bold text-[#571275] mt-2">
              Your experience. Your way.
            </h2>

            <p className="text-gray-500 text-sm leading-6 mt-4">
              From intimate gatherings to luxury yacht nights, find a
              sheesha experience designed around your occasion.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {experiences.map((experience) => (
              <Link
                href={`/rentals?event=${experience.title.toLowerCase()}`}
                key={experience.title}
                className="relative aspect-[1.35] overflow-hidden rounded-2xl group"
              >
                <img
                  src={experience.image}
                  alt={experience.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />

                <div className="absolute inset-0 bg-[#571275]/20 group-hover:bg-[#571275]/40 transition" />

                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 bg-gradient-to-t from-black/70 to-transparent">
                  <h3 className="text-white text-lg sm:text-xl font-bold">
                    {experience.title}
                  </h3>

                  <span className="text-white/70 text-xs mt-1 inline-flex items-center gap-1">
                    Explore
                    <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-[#F8F2FA]">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <span className="text-[#74189B] text-[11px] uppercase tracking-[3px] font-bold">
              Simple & Easy
            </span>

            <h2 className="text-3xl sm:text-4xl font-bold text-[#571275] mt-2">
              How It Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {[
              {
                number: "01",
                title: "Choose",
                text: "Browse premium products, rentals and experiences from verified UAE vendors.",
              },
              {
                number: "02",
                title: "Book",
                text: "Select your date, location and setup. Complete your booking securely online.",
              },
              {
                number: "03",
                title: "Enjoy",
                text: "Relax and enjoy. Your premium sheesha experience arrives exactly when you need it.",
              },
            ].map((step) => (
              <div key={step.number} className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-white border border-[#74189B]/10 flex items-center justify-center text-[#74189B] font-bold text-lg shadow-sm">
                  {step.number}
                </div>

                <h3 className="text-xl font-bold text-[#571275] mt-5">
                  {step.title}
                </h3>

                <p className="text-gray-500 text-sm leading-6 mt-3 max-w-[280px] mx-auto">
                  {step.text}
                </p>
              </div>
            ))} 
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-gray-100 p-7">
              <ShieldCheck className="text-[#74189B]" size={28} />
              <h3 className="text-lg font-bold text-[#571275] mt-5">
                Verified Vendors
              </h3>
              <p className="text-sm text-gray-500 leading-6 mt-2">
                Every vendor is carefully verified so you can book with
                confidence.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 p-7">
              <Truck className="text-[#74189B]" size={28} />
              <h3 className="text-lg font-bold text-[#571275] mt-5">
                UAE-Wide Delivery
              </h3>
              <p className="text-sm text-gray-500 leading-6 mt-2">
                Premium products and experiences delivered across the UAE.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 p-7">
              <Headphones className="text-[#74189B]" size={28} />
              <h3 className="text-lg font-bold text-[#571275] mt-5">
                Dedicated Support
              </h3>
              <p className="text-sm text-gray-500 leading-6 mt-2">
                Our team is here to help before, during and after your
                experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="max-w-[1440px] mx-auto rounded-[30px] overflow-hidden relative min-h-[360px] flex items-center bg-cover bg-center" style={{ backgroundImage: "url('/made%20for%20dubai.webp')" }}>
          <div className="absolute inset-0 bg-gradient-to-r from-[#4a0d5c]/85 via-[#4a0d5c]/70 to-[#4a0d5c]/30" />

          <div className="relative z-10 p-8 sm:p-14 max-w-[650px]">
            <span className="text-[#F1A51D] text-[11px] uppercase tracking-[3px] font-bold">
              Ready For Your Next Experience?
            </span>

            <h2 className="text-white text-3xl sm:text-5xl font-bold mt-3 leading-tight">
              Make tonight
              <br />
              unforgettable.
            </h2>

            <p className="text-white/70 text-sm sm:text-base mt-4 leading-6">
              Explore premium sheesha rentals and products from trusted
              vendors across the UAE.
            </p>

            <Link
              href="/rentals"
              className="inline-flex items-center gap-2 bg-[#F1A51D] hover:bg-[#d9910f] text-white px-7 py-4 rounded-xl font-bold text-sm mt-7 transition"
            >
              Explore Experiences
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
