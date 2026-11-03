"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Instagram,
  Facebook,
  Linkedin,
  Music2,
  Mail,
  Phone,
  MapPin,
  Send,
} from "lucide-react";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterContentData {
  brandDescription?: string;
  newsletter?: {
    enabled?: boolean;
    title?: string;
    subtitle?: string;
  };
  columns?: FooterColumn[];
  contact?: {
    address?: string;
    phone?: string;
    email?: string;
  };
  social?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    tiktok?: string;
  };
  copyright?: string;
}

const defaultFooterData: FooterContentData = {
  brandDescription:
    "Your premium destination for sheesha rentals, products, flavors, accessories and unforgettable experiences across the UAE.",
  newsletter: {
    enabled: true,
    title: "Premium experiences, straight to your inbox.",
    subtitle: "Get exclusive offers, new arrivals and the latest sheesha experiences across the UAE.",
  },
  columns: [
    {
      title: "SHOP",
      links: [
        { label: "All Products", href: "/shop" },
        { label: "Sheesha Flavors", href: "/categories/flavors" },
        { label: "Sheesha Setups", href: "/categories/sheesha-setups" },
        { label: "Accessories", href: "/categories/accessories" },
        { label: "Buy Sheesha", href: "/categories/buy-sheesha" },
      ],
    },
    {
      title: "RENTALS",
      links: [
        { label: "All Rentals", href: "/rentals" },
        { label: "Villa", href: "/rentals?event=villa" },
        { label: "Yacht", href: "/rentals?event=yacht" },
        { label: "Corporate", href: "/rentals?event=corporate" },
        { label: "Weddings", href: "/rentals?event=weddings" },
        { label: "Birthdays", href: "/rentals?event=birthday" },
      ],
    },
    {
      title: "COMPANY",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Verified Vendors", href: "/vendors" },
        { label: "Join as Vendor", href: "/auth/signup?role=vendor" },
        { label: "Vendor Support", href: "/vendor-support" },
        { label: "Contact Us", href: "/contact" },
        { label: "FAQ", href: "/faqs" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms & Conditions", href: "/terms" },
      ],
    },
  ],
  contact: {
    address: "Dubai, United Arab Emirates",
    phone: "+971 50 912 1111",
    email: "support@sheeshatonight.com",
  },
  social: {
    instagram: "https://www.instagram.com/sheesha_tonight/",
    facebook: "https://www.facebook.com/sheeshatonight/",
    linkedin: "https://www.linkedin.com/company/sheesha-tonight/",
    tiktok: "https://www.tiktok.com/@sheesha.tonight",
  },
  copyright: `© ${new Date().getFullYear()} SheeshaTonight. All rights reserved.`,
};

export default function Footer() {
  const [data, setData] = useState<FooterContentData>(defaultFooterData);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    fetch("/api/cms/content/footer_content")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success && json.data) {
          setData((prev) => ({
            ...prev,
            ...json.data,
            columns: json.data.columns || prev.columns,
            contact: { ...prev.contact, ...(json.data.contact || {}) },
            social: { ...prev.social, ...(json.data.social || {}) },
            newsletter: { ...prev.newsletter, ...(json.data.newsletter || {}) },
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const newsletter = data.newsletter || defaultFooterData.newsletter;
  const contact = data.contact || defaultFooterData.contact;
  const social = data.social || defaultFooterData.social;
  const columns = data.columns && data.columns.length > 0 ? data.columns : defaultFooterData.columns!;

  return (
    <footer className="bg-[#571275] text-white">
      {/* Newsletter Section */}
      {newsletter?.enabled !== false && (
        <section className="border-b border-white/10">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-[#F1A51D] text-[11px] uppercase tracking-[3px] font-bold">
                  Stay In The Loop
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold mt-2">
                  {newsletter?.title || "Premium experiences, straight to your inbox."}
                </h2>
                <p className="text-white/60 text-sm mt-4 max-w-lg">
                  {newsletter?.subtitle || "Get exclusive offers, new arrivals and the latest sheesha experiences across the UAE."}
                </p>
              </div>

              <div>
                {subscribed ? (
                  <div className="p-4 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl text-emerald-200 text-sm font-bold text-center">
                    Thank you! You have subscribed to SheeshaTonight updates.
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubscribe}
                    className="flex flex-row items-center bg-white rounded-2xl p-1.5 sm:p-2 max-w-[540px] w-full lg:ml-auto shadow-lg min-h-[58px] sm:min-h-[64px]"
                    style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
                  >
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      autoComplete="email"
                      className="flex-1 min-w-0 px-3 sm:px-6 py-3 bg-transparent outline-none text-sm sm:text-base text-gray-800 placeholder-gray-400 font-medium"
                    />
                    <button
                      type="submit"
                      className="bg-[#F1A51D] hover:bg-[#d99010] text-white px-5 sm:px-9 py-2.5 sm:py-3.5 rounded-xl text-sm sm:text-base font-bold transition shadow-sm hover:shadow-md shrink-0 flex items-center justify-center gap-1.5"
                    >
                      <span>Subscribe</span>
                      <Send size={15} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Footer Links */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/">
              <img
                src="/logo.png"
                alt="SheeshaTonight"
                className="w-[125px] h-auto brightness-0 invert"
              />
            </Link>

            <p className="text-white/60 text-sm leading-6 mt-5 max-w-[370px]">
              {data.brandDescription || defaultFooterData.brandDescription}
            </p>

            {/* Social Icons */}
            <div className="flex gap-3 mt-6">
              {social?.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#F1A51D] flex items-center justify-center transition"
                  title="Instagram"
                >
                  <Instagram size={17} />
                </a>
              )}

              {social?.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#F1A51D] flex items-center justify-center transition"
                  title="Facebook"
                >
                  <Facebook size={17} />
                </a>
              )}

              {social?.linkedin && (
                <a
                  href={social.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#F1A51D] flex items-center justify-center transition"
                  title="LinkedIn"
                >
                  <Linkedin size={17} />
                </a>
              )}

              {social?.tiktok && (
                <a
                  href={social.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#F1A51D] flex items-center justify-center transition"
                  title="TikTok"
                >
                  <Music2 size={17} />
                </a>
              )}
            </div>
          </div>

          {/* Dynamic Navigation Columns */}
          {columns.map((col, idx) => (
            <div key={idx}>
              <h3 className="text-sm font-bold mb-5 tracking-wider uppercase text-white/90">
                {col.title}
              </h3>
              <div className="space-y-3 text-sm text-white/60">
                {col.links &&
                  col.links.map((link, lIdx) => (
                    <Link
                      key={lIdx}
                      href={link.href}
                      className="block hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Info Row */}
        <div className="grid sm:grid-cols-3 gap-4 mt-12 pt-8 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <MapPin size={17} />
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Location</p>
              <p className="text-sm font-medium">{contact?.address || "Dubai, United Arab Emirates"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Phone size={17} />
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Phone</p>
              <a
                href={`tel:${(contact?.phone || "+971509121111").replace(/\s+/g, "")}`}
                className="text-sm font-medium hover:text-[#F1A51D] transition"
              >
                {contact?.phone || "+971 50 912 1111"}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Mail size={17} />
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Email</p>
              <a
                href={`mailto:${contact?.email || "support@sheeshatonight.com"}`}
                className="text-sm font-medium hover:text-[#F1A51D] transition"
              >
                {contact?.email || "support@sheeshatonight.com"}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40 text-center sm:text-left">
            {data.copyright || `© ${new Date().getFullYear()} SheeshaTonight. All rights reserved.`}
          </p>

          <div className="flex items-center gap-2 text-xs text-white/40">
            <span className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center font-bold text-[10px]">
              18+
            </span>
            For adults only. Please enjoy responsibly.
          </div>
        </div>

        <div className="border-t border-white/5 bg-black/20 py-3 pb-20 md:pb-3">
          <p className="text-[11.5px] text-white/50 text-center tracking-wide">
            Web designed and managed by{" "}
            <a
              href="https://wwmcltd.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F1A51D] hover:text-white font-semibold transition-colors underline underline-offset-2"
            >
              WWMC LTD
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
