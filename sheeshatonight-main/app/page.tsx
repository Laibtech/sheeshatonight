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
  Clock,
  Sparkles,
  Award,
  Users,
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createMetadata } from '@/lib/seo';
import { prisma } from "@/lib/prisma";

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

// Fallback categories if none in DB
const fallbackCategories = [
  {
    name: "Sheesha Flavors",
    description: "Premium flavors for every mood.",
    image: "/Categories/flavor.webp",
    slug: "flavors",
  },
  {
    name: "Sheesha Setups",
    description: "Complete premium sheesha setups.",
    image: "/Categories/Sheesha%20Setups.webp",
    slug: "sheesha-setups",
  },
  {
    name: "Accessories",
    description: "Everything you need for your setup.",
    image: "/Categories/Accessories.webp",
    slug: "accessories",
  },
  {
    name: "Rent a Sheesha",
    description: "Premium setups delivered to you.",
    image: "/Categories/Rentals.webp",
    slug: "rentals",
  },
  {
    name: "Buy Sheesha",
    description: "Discover premium sheesha collections.",
    image: "/Categories/Buy%20Sheesha.webp",
    slug: "buy-sheesha",
  },
  {
    name: "Top Vendors",
    description: "Verified lounges & premium packages.",
    image: "/Categories/Top%20Vendors.webp",
    slug: "top-vendors",
  },
];

const experiences = [
  { title: "Villa", image: "/villa.png" },
  { title: "Yacht", image: "/yacht.png" },
  { title: "Corporate", image: "/corporate.jpg" },
  { title: "Weddings", image: "/wedding.webp" },
  { title: "Birthdays", image: "/bdy.webp" },
  { title: "Private Gatherings", image: "/private-gathering.png" },
];

function parseMainImage(images: any, fallback = "/Categories/Buy Sheesha.webp"): string {
  if (!images) return fallback;
  try {
    const parsed = typeof images === "string" ? JSON.parse(images) : images;
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]) {
      return parsed[0];
    } else if (typeof parsed === "string" && parsed.trim().length > 0) {
      return parsed;
    }
  } catch {
    if (typeof images === "string" && images.startsWith("/")) return images;
  }
  return fallback;
}

export const revalidate = 60;

export default async function HomePage() {
  // 1. Fetch CMS configurations
  const [
    heroContent,
    sectionsContent,
    statsContent,
    dbCategories,
    dbRentals,
    dbProducts,
    dbBanners,
  ] = await Promise.all([
    prisma.cmsContent.findUnique({ where: { key: "homepage_hero" } }).catch(() => null),
    prisma.cmsContent.findUnique({ where: { key: "homepage_sections" } }).catch(() => null),
    prisma.cmsContent.findUnique({ where: { key: "homepage_stats" } }).catch(() => null),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 6,
    }).catch(() => []),
    prisma.product.findMany({
      where: { type: "RENTAL_PACKAGE", isActive: true, deletedAt: null },
      include: { vendor: { select: { id: true, name: true } } },
      take: 4,
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
    prisma.product.findMany({
      where: { type: { not: "RENTAL_PACKAGE" }, isActive: true, deletedAt: null },
      include: { vendor: { select: { id: true, name: true } } },
      take: 8,
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
    prisma.cmsBanner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }).catch(() => []),
  ]);

  // Default values for hero
  const heroData = (heroContent?.value as any) || {
    badge: "Premium UAE Sheesha Marketplace",
    titleLine1: "Premium Sheesha,",
    titleHighlight: "Delivered to Your Experience.",
    description:
      "Discover premium sheesha rentals, curated setups, artisan flavors, and professional masters from verified licensed vendors across the UAE.",
    primaryBtnText: "Explore Rentals",
    primaryBtnUrl: "/rentals",
    secondaryBtnText: "Shop Sheesha",
    secondaryBtnUrl: "/shop",
    bgImage: "/hero-banner.png",
    trustBadge1: "Verified Licensed Vendors",
    trustBadge2: "45-Min UAE Delivery",
    trustBadge3: "100% Authentic Quality",
  };

  // Section list and ordering
  const defaultSections = [
    { id: "hero", name: "Hero Banner", enabled: true, order: 1 },
    { id: "categories", name: "Popular Categories", enabled: true, order: 2 },
    { id: "featured_rentals", name: "Featured Rentals", enabled: true, order: 3 },
    { id: "stats", name: "Platform Statistics", enabled: true, order: 4 },
    { id: "vendor_products", name: "Products Marketplace", enabled: true, order: 5 },
    { id: "experiences", name: "Occasions & Experiences", enabled: true, order: 6 },
    { id: "how_it_works", name: "How It Works", enabled: true, order: 7 },
    { id: "trust_features", name: "Trust Badges & Guarantees", enabled: true, order: 8 },
    { id: "cta_banner", name: "Promotional CTA Banner", enabled: true, order: 9 },
  ];

  let activeSections = defaultSections;
  if (sectionsContent?.value && Array.isArray(sectionsContent.value)) {
    activeSections = (sectionsContent.value as any[]).sort((a, b) => a.order - b.order);
  }

  // Active stats
  const statsList = (statsContent?.value as any[]) || [
    { label: "Verified Vendors", value: "50+", icon: "ShieldCheck" },
    { label: "Curated Setups & Flavors", value: "200+", icon: "Sparkles" },
    { label: "Express Delivery", value: "45 Mins", icon: "Clock" },
    { label: "Satisfied Customers", value: "10,000+", icon: "Users" },
  ];

  // Active categories
  const categoriesToRender =
    dbCategories && dbCategories.length > 0
      ? dbCategories.map((c) => ({
          title: c.name,
          description: c.description || `Browse luxury ${c.name.toLowerCase()}`,
          image: c.image || "/Categories/Buy Sheesha.webp",
          href: `/categories/${c.slug}`,
        }))
      : fallbackCategories.map((c) => ({
          title: c.name,
          description: c.description,
          image: c.image,
          href: `/categories/${c.slug}`,
        }));

  return (
    <div className="bg-white text-gray-900 font-sans">
      <Header />

      {/* Render sections dynamically according to admin-configured order */}
      {activeSections.map((sec) => {
        if (!sec.enabled) return null;

        switch (sec.id) {
          case "hero":
            return (
              <section key="sec-hero" className="relative min-h-[620px] lg:min-h-[680px] overflow-hidden">
                <img
                  src={heroData.bgImage || "/hero-banner.png"}
                  alt="Premium Dubai sheesha experience"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-r from-[#38064F]/90 via-[#571275]/65 to-[#571275]/15" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 min-h-[620px] lg:min-h-[680px] flex items-center">
                  <div className="max-w-[620px] py-16 sm:py-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white text-[10.5px] font-bold tracking-[1.5px] uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E4AD36]" />
                      {heroData.badge || "Premium UAE Sheesha Marketplace"}
                    </div>

                    <h1 className="text-white text-3xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.15] mt-5 max-w-[620px]">
                      {heroData.titleLine1 || "Premium Sheesha,"} <br className="hidden sm:inline" />
                      <span className="text-[#E4AD36]">
                        {heroData.titleHighlight || "Delivered to Your Experience."}
                      </span>
                    </h1>

                    <p className="text-white/85 text-sm sm:text-base leading-relaxed mt-4 max-w-[520px]">
                      {heroData.description ||
                        "Discover premium sheesha rentals, curated setups, artisan flavors, and professional masters from verified licensed vendors across the UAE."}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3.5 mt-8">
                      <Link
                        href={heroData.primaryBtnUrl || "/rentals"}
                        className="inline-flex justify-center items-center gap-2 bg-gradient-to-r from-[#E4AD36] to-[#C99120] hover:brightness-110 text-[#2B043D] px-7 py-3.5 rounded-xl font-bold text-sm shadow-md shadow-[#E4AD36]/25 transition"
                      >
                        {heroData.primaryBtnText || "Explore Rentals"}
                        <ArrowRight size={17} />
                      </Link>

                      <Link
                        href={heroData.secondaryBtnUrl || "/shop"}
                        className="inline-flex justify-center items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 text-white px-7 py-3.5 rounded-xl font-bold text-sm transition"
                      >
                        {heroData.secondaryBtnText || "Shop Sheesha"}
                      </Link>
                    </div>

                    <div className="flex flex-wrap items-center gap-5 sm:gap-7 mt-9 text-white/85 text-xs font-medium">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={18} className="text-[#E4AD36]" />
                        {heroData.trustBadge1 || "Verified Licensed Vendors"}
                      </div>

                      <div className="flex items-center gap-2">
                        <Truck size={18} className="text-[#E4AD36]" />
                        {heroData.trustBadge2 || "45-Min UAE Delivery"}
                      </div>

                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-[#E4AD36]" />
                        {heroData.trustBadge3 || "100% Authentic Quality"}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );

          case "categories":
            return (
              <section key="sec-categories" className="py-12 sm:py-16 bg-white">
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
                    {categoriesToRender.map((category) => (
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
            );

          case "featured_rentals":
            return (
              <section key="sec-rentals" className="py-12 sm:py-16 bg-[#FAF8FB]">
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
                        Premium sheesha setups delivered to your door with professional sommelier masters.
                      </p>
                    </div>

                    <Link
                      href="/rentals"
                      className="inline-flex items-center gap-1 text-sm font-bold text-[#74189B]"
                    >
                      Explore All Rentals
                      <ArrowRight size={16} />
                    </Link>
                  </div>

                  {dbRentals && dbRentals.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {dbRentals.map((rental) => {
                        const img = parseMainImage(rental.images, "/Categories/Rentals.webp");
                        return (
                          <div
                            key={rental.id}
                            className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-md transition"
                          >
                            <div className="relative aspect-square overflow-hidden bg-gray-100">
                              <img
                                src={img}
                                alt={rental.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                              />
                              <div className="absolute top-3 left-3 bg-[#74189B] text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                Rental Package
                              </div>
                            </div>

                            <div className="p-5">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Star size={13} fill="currentColor" className="text-[#F1A51D]" />
                                5.0
                                <span className="mx-1">•</span>
                                {rental.vendor?.name || "Verified Sommelier"}
                              </div>

                              <h3 className="font-bold text-[#571275] mt-2 line-clamp-1">
                                {rental.title}
                              </h3>

                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {rental.description || "Complete luxury setup with coals, flavors & pipe."}
                              </p>

                              <div className="flex items-center justify-between mt-4">
                                <div>
                                  <span className="font-black text-sm text-[#74189B]">
                                    AED {Number(rental.price)}
                                  </span>
                                  {rental.rentalHourlyPrice && (
                                    <span className="text-[10px] text-gray-400 block">
                                      AED {Number(rental.rentalHourlyPrice)} / hr
                                    </span>
                                  )}
                                </div>

                                <Link
                                  href={`/rentals`}
                                  className="px-3 py-1.5 rounded-lg bg-[#F8F2FA] text-[#74189B] text-xs font-bold hover:bg-[#74189B] hover:text-white transition"
                                >
                                  Book Setup
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                      <p className="text-gray-500 text-sm">Rentals are being updated by our sommelier team.</p>
                      <Link href="/rentals" className="mt-3 inline-block text-xs font-bold text-[#74189B]">
                        View Rental Packages →
                      </Link>
                    </div>
                  )}
                </div>
              </section>
            );

          case "stats":
            return (
              <section key="sec-stats" className="py-10 bg-gradient-to-r from-[#571275] to-[#74189B] text-white">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {statsList.map((stat, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                        <div className="text-2xl sm:text-4xl font-black text-[#F1A51D] mb-1">
                          {stat.value}
                        </div>
                        <div className="text-xs sm:text-sm text-white/80 font-medium">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          case "vendor_products":
            return (
              <section key="sec-products" className="py-12 sm:py-16 bg-white">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
                    <div>
                      <span className="text-[#74189B] text-[11px] uppercase tracking-[3px] font-bold">
                        Top Marketplace Picks
                      </span>
                      <h2 className="text-3xl sm:text-4xl font-bold text-[#571275] mt-2">
                        Premium Sheesha & Flavors
                      </h2>
                    </div>

                    <Link
                      href="/shop"
                      className="inline-flex items-center gap-1 text-sm font-bold text-[#74189B]"
                    >
                      Shop All Products
                      <ArrowRight size={16} />
                    </Link>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {dbProducts.map((product) => {
                      const img = parseMainImage(product.images, "/Categories/Buy Sheesha.webp");
                      return (
                        <div
                          key={product.id}
                          className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-md transition"
                        >
                          <div className="relative aspect-square overflow-hidden bg-gray-100">
                            <img
                              src={img}
                              alt={product.title}
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
                              <Star size={13} fill="currentColor" className="text-[#F1A51D]" />
                              4.9
                              <span className="mx-1">•</span>
                              {(product as any).vendor?.name || "Verified Partner"}
                            </div>

                            <h3 className="font-bold text-[#571275] mt-2 line-clamp-1">
                              {product.title}
                            </h3>

                            <div className="flex items-center justify-between mt-4">
                              <div>
                                <span className="font-bold text-[#74189B]">
                                  AED {Number(product.price)}
                                </span>
                                {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                                  <span className="text-xs text-gray-400 line-through ml-2">
                                    AED {Number(product.compareAtPrice)}
                                  </span>
                                )}
                              </div>

                              <Link
                                href="/shop"
                                className="w-9 h-9 rounded-lg bg-[#F8F2FA] text-[#74189B] flex items-center justify-center hover:bg-[#74189B] hover:text-white transition"
                              >
                                <ArrowRight size={16} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );

          case "experiences":
            return (
              <section key="sec-experiences" className="py-12 sm:py-16 bg-[#FAF8FB]">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center max-w-[650px] mx-auto mb-12">
                    <span className="text-[#74189B] text-[11px] uppercase tracking-[3px] font-bold">
                      Made For Every Occasion
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-[#571275] mt-2">
                      Your experience. Your way.
                    </h2>
                    <p className="text-gray-500 text-sm leading-6 mt-4">
                      From intimate gatherings to luxury yacht nights, find a sheesha experience designed around your occasion.
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
            );

          case "how_it_works":
            return (
              <section key="sec-howitworks" className="py-12 sm:py-16 bg-white">
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
            );

          case "trust_features":
            return (
              <section key="sec-trust" className="py-12 sm:py-16 bg-[#F8F2FA]">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid md:grid-cols-3 gap-5">
                    <div className="rounded-2xl bg-white border border-gray-100 p-7 shadow-xs">
                      <ShieldCheck className="text-[#74189B]" size={28} />
                      <h3 className="text-lg font-bold text-[#571275] mt-5">
                        Verified Vendors
                      </h3>
                      <p className="text-sm text-gray-500 leading-6 mt-2">
                        Every vendor is carefully verified so you can book with confidence.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white border border-gray-100 p-7 shadow-xs">
                      <Truck className="text-[#74189B]" size={28} />
                      <h3 className="text-lg font-bold text-[#571275] mt-5">
                        UAE-Wide Delivery
                      </h3>
                      <p className="text-sm text-gray-500 leading-6 mt-2">
                        Premium products and experiences delivered across the UAE.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white border border-gray-100 p-7 shadow-xs">
                      <Headphones className="text-[#74189B]" size={28} />
                      <h3 className="text-lg font-bold text-[#571275] mt-5">
                        Dedicated Support
                      </h3>
                      <p className="text-sm text-gray-500 leading-6 mt-2">
                        Our team is here to help before, during and after your experience.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            );

          case "cta_banner":
            return (
              <section key="sec-cta" className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 bg-white">
                <div
                  className="max-w-[1440px] mx-auto rounded-[30px] overflow-hidden relative min-h-[360px] flex items-center bg-cover bg-center"
                  style={{ backgroundImage: "url('/made%20for%20dubai.webp')" }}
                >
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
                      Explore premium sheesha rentals and products from trusted vendors across the UAE.
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
            );

          default:
            return null;
        }
      })}

      <Footer />
    </div>
  );
}
