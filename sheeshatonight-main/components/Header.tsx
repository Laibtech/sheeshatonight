"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuthStore } from "@/lib/store";
import {
  Search,
  Heart,
  User,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface AnnouncementData {
  enabled: boolean;
  text: string;
  linkText?: string;
  linkUrl?: string;
  bgColor?: string;
  textColor?: string;
}

interface NavMenuItem {
  id: string;
  label: string;
  href: string;
  order: number;
  enabled: boolean;
  isExternal?: boolean;
}

export default function Header() {
  const pathname = usePathname() || "";
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isLoggedIn, userRole } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'shop' | 'rentals' | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Dynamic CMS States
  const [announcement, setAnnouncement] = useState<AnnouncementData>({
    enabled: true,
    text: "Premium Sheesha Experiences Across the UAE | Same-Day Delivery Available",
    linkText: "",
    linkUrl: "",
    bgColor: "#74189B",
    textColor: "#ffffff",
  });

  const [navItems, setNavItems] = useState<NavMenuItem[]>([
    { id: "1", label: "HOME", href: "/", order: 1, enabled: true },
    { id: "2", label: "SHOP", href: "/shop", order: 2, enabled: true },
    { id: "3", label: "RENTALS", href: "/rentals", order: 3, enabled: true },
    { id: "4", label: "EXPERIENCES", href: "/experiences", order: 4, enabled: true },
    { id: "5", label: "VENDORS", href: "/vendors", order: 5, enabled: true },
    { id: "6", label: "ABOUT US", href: "/about", order: 6, enabled: true },
    { id: "7", label: "CONTACT US", href: "/contact", order: 7, enabled: true },
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch dynamic CMS Header content
  useEffect(() => {
    const fetchCmsData = async () => {
      try {
        const [annRes, navRes] = await Promise.all([
          fetch("/api/cms/content/announcement_bar").catch(() => null),
          fetch("/api/cms/content/navigation_menu").catch(() => null),
        ]);

        if (annRes && annRes.ok) {
          const annJson = await annRes.json();
          if (annJson.success && annJson.data) {
            setAnnouncement({
              enabled: annJson.data.enabled !== false,
              text: annJson.data.text || "Premium Sheesha Experiences Across the UAE | Same-Day Delivery Available",
              linkText: annJson.data.linkText || "",
              linkUrl: annJson.data.linkUrl || "",
              bgColor: annJson.data.bgColor || "#74189B",
              textColor: annJson.data.textColor || "#ffffff",
            });
          }
        }

        if (navRes && navRes.ok) {
          const navJson = await navRes.json();
          if (navJson.success && Array.isArray(navJson.data) && navJson.data.length > 0) {
            setNavItems(
              navJson.data
                .filter((item: any) => item.enabled !== false)
                .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
            );
          }
        }
      } catch (e) {
        // Fallback gracefully to default items
      }
    };

    fetchCmsData();
  }, []);

  const accountHref = !isLoggedIn
    ? "/auth/login"
    : userRole === "VENDOR"
    ? "/vendor"
    : userRole === "ADMIN" || userRole === "SUPER_ADMIN"
    ? "/admin"
    : "/dashboard";

  const getLinkClass = (isActive: boolean) =>
    `relative text-[13px] tracking-wide font-semibold py-1 transition-colors ${
      isActive
        ? "text-[#74189B] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#74189B] after:rounded-full"
        : "text-slate-700 hover:text-[#74189B]"
    }`;

  const checkIsActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    const base = href.split("?")[0] || "";
    if (href !== "/" && base && pathname.startsWith(base)) return true;
    return false;
  };

  return (
    <div className="sticky top-0 z-[100] w-full transition-all duration-300">
      {/* Announcement Bar (Managed via CMS) */}
      {announcement.enabled && (
        <div
          suppressHydrationWarning
          style={{
            backgroundColor: announcement.bgColor || "#74189B",
            color: announcement.textColor || "#ffffff",
          }}
          className={`text-center text-[12px] sm:text-[13px] px-4 tracking-wide font-medium transition-all duration-300 overflow-hidden ${
            isScrolled ? "max-h-0 py-0 opacity-0 pointer-events-none" : "max-h-12 py-2 sm:py-2.5 opacity-100"
          }`}
        >
          <span>{announcement.text}</span>
          {announcement.linkUrl && announcement.linkText && (
            <Link
              href={announcement.linkUrl}
              className="ml-2 underline font-bold hover:brightness-125 transition"
            >
              {announcement.linkText}
            </Link>
          )}
        </div>
      )}

      <header
        suppressHydrationWarning
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-md shadow-purple-950/5"
            : "bg-white/98 backdrop-blur-xs border-b border-slate-100 shadow-xs"
        }`}
      >
        <div suppressHydrationWarning className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div
            suppressHydrationWarning
            className={`flex items-center justify-between gap-6 transition-all duration-300 ${
              isScrolled ? "h-[68px]" : "h-[76px]"
            }`}
          >
            {/* Logo */}
            <Link href="/" className="shrink-0 flex items-center">
              <img
                src="/logo.png"
                alt="SheeshaTonight"
                width={130}
                height={40}
                className="w-[120px] sm:w-[135px] h-auto object-contain transition-all"
                style={{ height: "auto", maxHeight: "44px", width: "auto", objectFit: "contain" }}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-7">
              {navItems.map((item) => {
                const normalizedLabel = item.label.trim().toUpperCase();
                const isShop = normalizedLabel === "SHOP";
                const isRentals = normalizedLabel === "RENTALS";
                const isActive = checkIsActive(item.href);

                // Shop Dropdown
                if (isShop) {
                  return (
                    <div
                      key={item.id}
                      className="relative"
                      onMouseEnter={() => setActiveDropdown('shop')}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <Link
                        href={item.href}
                        className={`flex items-center gap-1.5 ${getLinkClass(isActive)}`}
                      >
                        {item.label}
                        <ChevronDown size={14} />
                      </Link>

                      {activeDropdown === 'shop' && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4">
                          <div className="w-[700px] bg-white rounded-2xl border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,.12)] p-7">
                            <div className="grid grid-cols-3 gap-8">
                              <div>
                                <p className="text-[11px] uppercase tracking-[2px] text-[#F1A51D] font-bold mb-4">
                                  Shop Sheesha
                                </p>
                                <div className="space-y-3">
                                  <Link
                                    href="/categories/buy-sheesha"
                                    className="flex justify-between items-center group"
                                  >
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#74189B]">
                                      Buy Sheesha
                                    </span>
                                    <ChevronRight size={15} />
                                  </Link>
                                  <Link
                                    href="/categories/flavors"
                                    className="flex justify-between items-center group"
                                  >
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#74189B]">
                                      Sheesha Flavors
                                    </span>
                                    <ChevronRight size={15} />
                                  </Link>
                                  <Link
                                    href="/categories/accessories"
                                    className="flex justify-between items-center group"
                                  >
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#74189B]">
                                      Accessories
                                    </span>
                                    <ChevronRight size={15} />
                                  </Link>
                                </div>
                              </div>

                              <div>
                                <p className="text-[11px] uppercase tracking-[2px] text-[#F1A51D] font-bold mb-4">
                                  Featured
                                </p>
                                <div className="space-y-3">
                                  <Link
                                    href="/shop"
                                    className="flex justify-between items-center group"
                                  >
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#74189B]">
                                      Best Sellers
                                    </span>
                                    <ChevronRight size={15} />
                                  </Link>
                                  <Link
                                    href="/shop?sort=newest"
                                    className="flex justify-between items-center group"
                                  >
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#74189B]">
                                      New Arrivals
                                    </span>
                                    <ChevronRight size={15} />
                                  </Link>
                                  <Link
                                    href="/shop?sale=true"
                                    className="flex justify-between items-center group"
                                  >
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#74189B]">
                                      Special Offers
                                    </span>
                                    <ChevronRight size={15} />
                                  </Link>
                                </div>
                              </div>

                              <div className="bg-[#F8F2FA] rounded-xl p-5">
                                <span className="text-[10px] uppercase tracking-[2px] text-[#74189B] font-bold">
                                  Premium Collection
                                </span>
                                <h3 className="mt-2 text-lg font-bold text-[#571275]">
                                  Elevate Your Setup
                                </h3>
                                <p className="text-xs text-gray-500 mt-2 leading-5">
                                  Discover premium sheesha products, flavors and accessories.
                                </p>
                                <Link
                                  href="/shop"
                                  className="inline-flex items-center gap-1 mt-4 text-xs font-bold text-[#74189B]"
                                >
                                  Shop Collection
                                  <ChevronRight size={14} />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // Rentals Dropdown
                if (isRentals) {
                  return (
                    <div
                      key={item.id}
                      className="relative"
                      onMouseEnter={() => setActiveDropdown('rentals')}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <Link
                        href={item.href}
                        className={`flex items-center gap-1.5 ${getLinkClass(isActive)}`}
                      >
                        {item.label}
                        <ChevronDown size={14} />
                      </Link>

                      {activeDropdown === 'rentals' && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4">
                          <div className="w-[650px] bg-white rounded-2xl border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,.12)] p-7">
                            <div className="grid grid-cols-2 gap-8">
                              <div>
                                <p className="text-[11px] uppercase tracking-[2px] text-[#F1A51D] font-bold mb-4">
                                  Rent For
                                </p>
                                <div className="space-y-3">
                                  {[
                                    { name: "Villa", href: "/rentals?event=villa" },
                                    { name: "Yacht", href: "/rentals?event=yacht" },
                                    { name: "Corporate", href: "/rentals?event=corporate" },
                                    { name: "Weddings", href: "/rentals?event=weddings" },
                                    { name: "Birthdays", href: "/rentals?event=birthday" },
                                    { name: "Private Gatherings", href: "/rentals?event=private" },
                                  ].map(({ name, href }) => (
                                    <Link
                                      key={name}
                                      href={href}
                                      className="flex items-center justify-between text-sm font-medium text-gray-700 hover:text-[#74189B]"
                                    >
                                      {name}
                                      <ChevronRight size={15} />
                                    </Link>
                                  ))}
                                </div>
                              </div>

                              <div className="rounded-xl overflow-hidden min-h-[230px] relative">
                                <img
                                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=700&q=85"
                                  alt="Sheesha experience"
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#571275]/90 via-[#571275]/20 to-transparent" />
                                <div className="absolute bottom-5 left-5 right-5 text-white">
                                  <p className="text-[10px] uppercase tracking-[2px] text-[#F1A51D] font-bold">
                                    Premium Experiences
                                  </p>
                                  <h3 className="text-xl font-bold mt-1">Rent. Relax. Enjoy.</h3>
                                  <Link
                                    href="/rentals"
                                    className="inline-flex items-center gap-1 mt-3 text-xs font-semibold"
                                  >
                                    Explore Rentals
                                    <ChevronRight size={14} />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // Standard Nav Links
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    target={item.isExternal ? "_blank" : undefined}
                    rel={item.isExternal ? "noopener noreferrer" : undefined}
                    className={getLinkClass(isActive)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/shop"
                className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full hover:bg-[#F8F2FA] text-gray-700 hover:text-[#74189B] transition-colors"
                title="Search Shop"
              >
                <Search size={19} strokeWidth={1.8} />
              </Link>

              <Link
                href="/wishlist"
                className="relative hidden sm:flex w-10 h-10 items-center justify-center rounded-full hover:bg-[#F8F2FA] text-gray-700 hover:text-[#74189B] transition-colors"
                title="My Wishlist"
              >
                <Heart size={19} strokeWidth={1.8} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-[17px] h-[17px] rounded-full bg-[#74189B] text-white text-[9px] flex items-center justify-center font-bold shadow-2xs">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href={accountHref}
                title={
                  !isLoggedIn
                    ? "Sign In"
                    : userRole === "VENDOR"
                    ? "Vendor Dashboard"
                    : userRole === "ADMIN" || userRole === "SUPER_ADMIN"
                    ? "Admin Portal"
                    : "Customer Dashboard"
                }
                className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full hover:bg-[#F8F2FA] text-gray-700 hover:text-[#74189B] transition-colors"
              >
                <User size={19} strokeWidth={1.8} />
              </Link>

              <Link
                href="/cart"
                className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F8F2FA] text-gray-700 hover:text-[#74189B] transition-colors"
                title="Shopping Cart"
              >
                <ShoppingBag size={19} strokeWidth={1.8} />
                <span className="absolute -top-0.5 -right-0.5 w-[17px] h-[17px] rounded-full bg-[#F1A51D] text-white text-[9px] flex items-center justify-center font-bold shadow-2xs">
                  {itemCount}
                </span>
              </Link>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F8F2FA] text-slate-700 transition-colors"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white shadow-lg animate-in fade-in duration-200">
            <nav className="px-5 py-5 space-y-1">
              {navItems.map((item) => {
                const isActive = checkIsActive(item.href);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between py-3.5 border-b border-gray-100 text-sm font-semibold transition-colors ${
                      isActive ? "text-[#74189B] font-bold" : "text-slate-700 hover:text-[#74189B]"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronRight size={16} className={isActive ? "text-[#74189B]" : "text-slate-400"} />
                  </Link>
                );
              })}

              <div className="grid grid-cols-3 gap-2 pt-4">
                <Link
                  href="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className="bg-[#F8F2FA] rounded-xl py-3 text-center text-xs font-semibold text-[#74189B] hover:bg-purple-100/60 transition-colors"
                >
                  Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ""}
                </Link>

                <Link
                  href={accountHref}
                  onClick={() => setMobileOpen(false)}
                  className="bg-[#F8F2FA] rounded-xl py-3 text-center text-xs font-semibold text-[#74189B] hover:bg-purple-100/60 transition-colors"
                >
                  Account
                </Link>

                <Link
                  href="/cart"
                  onClick={() => setMobileOpen(false)}
                  className="bg-[#F8F2FA] rounded-xl py-3 text-center text-xs font-semibold text-[#74189B] hover:bg-purple-100/60 transition-colors"
                >
                  Cart
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}
