'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { clearSessionCookie, clearAllClientAuth } from '@/lib/session';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import {
  Search,
  MapPin,
  ChevronDown,
  Heart,
  ShoppingBag,
  LayoutDashboard,
  Calendar,
  Settings,
  HelpCircle,
  Crown,
  Sparkles,
  Shield,
  ExternalLink,
  LogOut,
  Menu,
  X,
  User,
  UserRound,
  Store,
  CreditCard,
} from 'lucide-react';
import '@/app/dashboard/CustomerDashboard.css';

export function CustomerPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { userName, userEmail, userRole, logout } = useAuthStore();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();

  const [mounted, setMounted] = useState(false);
  const [customerName, setCustomerName] = useState('Customer');
  const [customerEmail, setCustomerEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Dubai');
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    setMounted(true);

    // If an Admin or Vendor enters the customer portal, route them to their proper home
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      router.replace('/admin');
      return;
    }
    if (userRole === 'VENDOR') {
      router.replace('/vendor');
      return;
    }

    if (userName && userName.trim()) {
      setCustomerName(userName);
    } else {
      const match = document.cookie.match(/(?:^|; )user_name=([^;]*)/);
      if (match && match[1]) {
        setCustomerName(decodeURIComponent(match[1]));
      }
    }

    if (userEmail && userEmail.trim()) {
      setCustomerEmail(userEmail);
    } else {
      const match = document.cookie.match(/(?:^|; )user_email=([^;]*)/);
      if (match && match[1]) {
        setCustomerEmail(decodeURIComponent(match[1]));
      }
    }

    // Verify authenticated customer data from /api/auth/me to ensure real DB values
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    fetch('/api/auth/me', { headers, credentials: 'include', cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const u = data?.data || data?.user;
        if (u) {
          if (u.role === 'ADMIN' || u.role === 'SUPER_ADMIN') {
            router.replace('/admin');
            return;
          }
          if (u.name) setCustomerName(u.name);
          if (u.email) setCustomerEmail(u.email);
        }
      })
      .catch(() => {});
  }, [userName, userEmail, userRole, router]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/shop');
    }
  };

  const handleSignOut = () => {
    if (logout) logout();
    clearAllClientAuth();
    router.push('/auth/login');
  };

  const isNavActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(path);
  };

  return (
    <div className="customer-dashboard">
      {/* ================= HEADER ================= */}
      <header className="dashboard-header">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="customer-mobile-menu-btn"
          aria-label="Open sidebar menu"
          title="Open Menu"
        >
          <Menu size={22} />
        </button>

        <div className="brand">
          <Link href="/">
            <img
              src="/logo.png"
              alt="SheeshaTonight"
              className="h-9 w-auto object-contain"
              style={{ height: '36px', maxHeight: '36px', width: 'auto', objectFit: 'contain', display: 'block' }}
            />
          </Link>
        </div>

        <form onSubmit={handleSearchSubmit} className="header-search">
          <Search size={15} className="text-slate-400 flex-shrink-0" />
          <input
            id="customer-portal-search-input"
            name="customer-portal-search"
            type="text"
            placeholder="Search for sheesha products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
        </form>

        <div className="header-actions">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLocationMenu(!showLocationMenu)}
              className="location-selector"
            >
              <MapPin size={13} className="text-[#822576] flex-shrink-0" />
              <span>{selectedLocation}</span>
              <ChevronDown size={12} className="text-slate-400 flex-shrink-0" />
            </button>

            {showLocationMenu && (
              <div className="absolute top-full mt-1.5 left-0 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50">
                {['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman'].map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      setSelectedLocation(loc);
                      setShowLocationMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-purple-50 hover:text-[#7b2377] transition"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link href="/dashboard/wishlist" className="header-icon" title="Wishlist">
            <Heart size={18} className="text-[#211D24]" />
            {mounted && wishlistCount > 0 && <small>{wishlistCount}</small>}
          </Link>

          <Link href="/cart" className="header-icon cart" title="View Cart">
            <ShoppingBag size={18} className="text-[#211D24]" />
            {mounted && itemCount > 0 && <small>{itemCount}</small>}
          </Link>

          <div className="relative">
            <div
              className="user-menu"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#74189B] to-[#EFB63B] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {(customerName || 'C').charAt(0).toUpperCase()}
              </div>
              <span className="user-name-text">{customerName || 'Customer'}</span>
              <ChevronDown size={12} className="text-slate-400 flex-shrink-0 user-name-chevron" />
            </div>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800 truncate">{customerName}</p>
                  <p className="text-[10px] text-slate-500 truncate">{customerEmail}</p>
                </div>

                <Link
                  href="/dashboard"
                  onClick={() => setShowUserMenu(false)}
                  className="block px-4 py-2 text-xs text-slate-600 hover:bg-purple-50 hover:text-[#7b2377] transition"
                >
                  Dashboard Home
                </Link>
                <Link
                  href="/dashboard/orders"
                  onClick={() => setShowUserMenu(false)}
                  className="block px-4 py-2 text-xs text-slate-600 hover:bg-purple-50 hover:text-[#7b2377] transition"
                >
                  My Orders
                </Link>
                <Link
                  href="/dashboard/wishlist"
                  onClick={() => setShowUserMenu(false)}
                  className="block px-4 py-2 text-xs text-slate-600 hover:bg-purple-50 hover:text-[#7b2377] transition"
                >
                  My Wishlist
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="block px-4 py-2 text-xs text-slate-600 hover:bg-purple-50 hover:text-[#7b2377] transition"
                >
                  Account Settings
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition border-t border-slate-100 cursor-pointer"
                >
                  <LogOut size={13} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ================= MOBILE DRAWER BACKDROP ================= */}
      {mobileSidebarOpen && (
        <div
          className="customer-drawer-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ================= MOBILE SLIDE-OVER DRAWER ================= */}
      <aside className={`customer-mobile-drawer ${mobileSidebarOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <Link href="/" onClick={() => setMobileSidebarOpen(false)}>
            <img
              src="/logo.png"
              alt="SheeshaTonight"
              style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
            />
          </Link>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="drawer-close-btn"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Customer Profile Banner */}
        <div className="drawer-user-card">
          <div className="drawer-avatar">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#74189B] to-[#EFB63B] text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-md">
              {(customerName || 'C').charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="drawer-user-info">
            <h4>{customerName || 'Customer'}</h4>
            <p>{customerEmail || 'Customer Portal'}</p>
            <span className="drawer-role-badge">Customer Portal</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="drawer-nav">
          <Link
            href="/dashboard"
            onClick={() => setMobileSidebarOpen(false)}
            className={isNavActive('/dashboard') && pathname === '/dashboard' ? 'active' : ''}
          >
            <span className="icon"><LayoutDashboard size={18} /></span>
            <span>Dashboard</span>
          </Link>

          <Link
            href="/dashboard/orders"
            onClick={() => setMobileSidebarOpen(false)}
            className={isNavActive('/dashboard/orders') ? 'active' : ''}
          >
            <span className="icon"><ShoppingBag size={18} /></span>
            <span>My Orders</span>
          </Link>

          <Link
            href="/dashboard/wishlist"
            onClick={() => setMobileSidebarOpen(false)}
            className={isNavActive('/dashboard/wishlist') ? 'active' : ''}
          >
            <span className="icon"><Heart size={18} /></span>
            <span>Wishlist</span>
            {mounted && wishlistCount > 0 && (
              <span className="ml-auto bg-[#74189B] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            href="/dashboard/bookings"
            onClick={() => setMobileSidebarOpen(false)}
            className={isNavActive('/dashboard/bookings') ? 'active' : ''}
          >
            <span className="icon"><Calendar size={18} /></span>
            <span>Bookings</span>
          </Link>

          <Link
            href="/dashboard/settings"
            onClick={() => setMobileSidebarOpen(false)}
            className={isNavActive('/dashboard/settings') ? 'active' : ''}
          >
            <span className="icon"><Settings size={18} /></span>
            <span>Account Settings</span>
          </Link>

          <Link
            href="/vendor-support"
            onClick={() => setMobileSidebarOpen(false)}
            className={pathname === '/vendor-support' ? 'active' : ''}
          >
            <span className="icon"><Store size={18} /></span>
            <span>Become a Vendor</span>
          </Link>

          <Link
            href="/contact"
            onClick={() => setMobileSidebarOpen(false)}
            className={pathname === '/contact' ? 'active' : ''}
          >
            <span className="icon"><HelpCircle size={18} /></span>
            <span>Help & Support</span>
          </Link>
        </nav>

        {/* Promo Banner */}
        <div className="drawer-promo">
          <div className="promo-icon">
            <Crown size={20} color="#EFB63B" />
          </div>
          <h3>Premium Sheesha Setup</h3>
          <p>Certified UAE Vendors & White-Glove Service</p>
          <Link
            href="/shop"
            onClick={() => setMobileSidebarOpen(false)}
            className="drawer-promo-link"
          >
            Explore Marketplace →
          </Link>
        </div>

        {/* Logout Button */}
        <div className="drawer-footer">
          <button
            type="button"
            onClick={() => {
              setMobileSidebarOpen(false);
              handleSignOut();
            }}
            className="drawer-logout-btn"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ================= BODY ================= */}
      <div className="dashboard-body">
        {/* ================= SIDEBAR ================= */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <Link href="/dashboard" className={isNavActive('/dashboard') && pathname === '/dashboard' ? 'active' : ''}>
              <span className="icon"><LayoutDashboard size={17} /></span>
              Dashboard
            </Link>

            <Link href="/dashboard/orders" className={isNavActive('/dashboard/orders') ? 'active' : ''}>
              <span className="icon"><ShoppingBag size={17} /></span>
              My Orders
            </Link>

            <Link href="/dashboard/wishlist" className={isNavActive('/dashboard/wishlist') ? 'active' : ''}>
              <span className="icon"><Heart size={17} /></span>
              <span>Wishlist</span>
              {mounted && wishlistCount > 0 && (
                <span className="ml-auto bg-[#74189B] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/dashboard/bookings" className={isNavActive('/dashboard/bookings') ? 'active' : ''}>
              <span className="icon"><Calendar size={17} /></span>
              Bookings
            </Link>

            <Link href="/dashboard/settings" className={isNavActive('/dashboard/settings') ? 'active' : ''}>
              <span className="icon"><Settings size={17} /></span>
              Settings
            </Link>

            <Link href="/vendor-support" className={pathname === '/vendor-support' ? 'active' : ''}>
              <span className="icon"><Store size={17} /></span>
              Become a Vendor
            </Link>

            <Link href="/contact" className={pathname === '/contact' ? 'active' : ''}>
              <span className="icon"><HelpCircle size={17} /></span>
              Support
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              className="logout-nav-btn"
              title="Logout from account"
            >
              <span className="icon"><LogOut size={17} /></span>
              <span>Logout</span>
            </button>
          </nav>

          <div className="sidebar-promo">
            <div className="promo-icon">
              <Crown size={22} color="#EFB63B" />
            </div>

            <h3>
              Premium Sheesha
              <br />
              Products & Accessories
            </h3>

            <p>Quality. Authenticity. Luxury.</p>

            <div className="gold-line">
              <Sparkles size={14} color="#EFB63B" />
            </div>
          </div>
        </aside>

        {/* ================= CONTENT ================= */}
        <div className="dashboard-content-area" style={{ flex: 1, minWidth: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
