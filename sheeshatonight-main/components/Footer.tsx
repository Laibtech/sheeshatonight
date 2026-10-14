"use client";

import Link from "next/link";
import {
  Instagram,
  Facebook,
  Linkedin,
  Music2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#571275] text-white">
      <section className="border-b border-white/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-[#F1A51D] text-[11px] uppercase tracking-[3px] font-bold">
                Stay In The Loop
              </span>

              <h2 className="text-3xl sm:text-4xl font-bold mt-2">
                Premium experiences,
                <br />
                straight to your inbox.
              </h2>

              <p className="text-white/60 text-sm mt-4 max-w-lg">
                Get exclusive offers, new arrivals and the latest sheesha
                experiences across the UAE.
              </p>
            </div>

            <div>
              <div className="flex items-center bg-white rounded-2xl p-2 max-w-[540px] lg:ml-auto shadow-lg min-h-[58px] sm:min-h-[64px]">
                <input
                  id="footer-newsletter-email"
                  name="footer-newsletter-email"
                  type="email"
                  placeholder="Enter your email address"
                  autoComplete="email"
                  className="flex-1 min-w-0 px-4 sm:px-6 py-3 bg-transparent outline-none text-sm sm:text-base text-gray-800 placeholder-gray-400 font-medium"
                />

                <button className="bg-[#F1A51D] hover:bg-[#d99010] text-white px-6 sm:px-9 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-bold transition shadow-sm hover:shadow-md shrink-0">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/">
              <img
                src="/logo.png"
                alt="SheeshaTonight"
                className="w-[125px] h-auto brightness-0 invert"
              />
            </Link>

            <p className="text-white/60 text-sm leading-6 mt-5 max-w-[370px]">
              Your premium destination for sheesha rentals, products,
              flavors, accessories and unforgettable experiences across
              the UAE.
            </p>

            <div className="flex gap-3 mt-6">
              <a
                href="https://www.instagram.com/sheesha_tonight/"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#F1A51D] flex items-center justify-center transition"
              >
                <Instagram size={17} />
              </a>

              <a
                href="https://www.facebook.com/sheeshatonight/"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#F1A51D] flex items-center justify-center transition"
              >
                <Facebook size={17} />
              </a>

              <a
                href="https://www.linkedin.com/company/sheesha-tonight/"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#F1A51D] flex items-center justify-center transition"
              >
                <Linkedin size={17} />
              </a>

              <a
                href="https://www.tiktok.com/@sheesha.tonight"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#F1A51D] flex items-center justify-center transition"
              >
                <Music2 size={17} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-5">SHOP</h3>

            <div className="space-y-3 text-sm text-white/60">
              <Link href="/shop" className="block hover:text-white">
                All Products
              </Link>
              <Link href="/categories/flavors" className="block hover:text-white">
                Sheesha Flavors
              </Link>
              <Link href="/categories/sheesha-setups" className="block hover:text-white">
                Sheesha Setups
              </Link>
              <Link href="/categories/accessories" className="block hover:text-white">
                Accessories
              </Link>
              <Link href="/categories/buy-sheesha" className="block hover:text-white">
                Buy Sheesha
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-5">RENTALS</h3>

            <div className="space-y-3 text-sm text-white/60">
              <Link href="/rentals" className="block hover:text-white">
                All Rentals
              </Link>
              <Link href="/rentals?event=villa" className="block hover:text-white">
                Villa
              </Link>
              <Link href="/rentals?event=yacht" className="block hover:text-white">
                Yacht
              </Link>
              <Link href="/rentals?event=corporate" className="block hover:text-white">
                Corporate
              </Link>
              <Link href="/rentals?event=weddings" className="block hover:text-white">
                Weddings
              </Link>
              <Link href="/rentals?event=birthday" className="block hover:text-white">
                Birthdays
              </Link>
              <Link href="/rentals?event=private" className="block hover:text-white">
                Private Events
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-5">COMPANY</h3>

            <div className="space-y-3 text-sm text-white/60">
              <Link href="/about" className="block hover:text-white">
                About Us
              </Link>
              <Link href="/vendors" className="block hover:text-white">
                Verified Vendors
              </Link>
              <Link href="/auth/signup?role=vendor" className="block hover:text-white">
                Join as Vendor
              </Link>
              <Link href="/vendor-support" className="block hover:text-white">
                Vendor Support
              </Link>
              <Link href="/contact" className="block hover:text-white">
                Contact
              </Link>
              <Link href="/faqs" className="block hover:text-white">
                FAQ
              </Link>
              <Link href="/privacy" className="block hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms" className="block hover:text-white">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-12 pt-8 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <MapPin size={17} />
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">
                Location
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Dubai%2C+United+Arab+Emirates"
                target="_blank"
                rel="noreferrer"
                className="text-sm hover:text-[#F1A51D]"
              >
                Dubai, United Arab Emirates
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Phone size={17} />
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">
                Phone
              </p>
              <a href="tel:+971509121111" className="text-sm hover:text-[#F1A51D]">
                +971 50 912 1111
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Mail size={17} />
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">
                Email
              </p>
              <a
                href="mailto:support@sheeshatonight.com"
                className="text-sm hover:text-[#F1A51D]"
              >
                support@sheeshatonight.com
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40 text-center sm:text-left">
            © {new Date().getFullYear()} SheeshaTonight. All rights reserved.
          </p>

          <div className="flex items-center gap-2 text-xs text-white/40">
            <span className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center font-bold">
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
