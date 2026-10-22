"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Wallet,
  Store,
  Settings,
  Star,
  Users,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  ChevronRight,
  Plus,
  FileText,
} from "lucide-react";
import React, { useState, useEffect, ReactNode } from "react";
import { useAuthStore } from "@/lib/store";

const PRIMARY = "#74189B";

const navigation = [
  {
    label: "OVERVIEW",
    items: [
      {
        label: "Dashboard",
        href: "/vendor",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "CATALOG",
    items: [
      {
        label: "Products",
        href: "/vendor/products",
        icon: Package,
      },
      {
        label: "Add Product",
        href: "/vendor/products?add=true",
        icon: Plus,
      },
      {
        label: "Categories",
        href: "/vendor/categories",
        icon: FileText,
      },
    ],
  },
  {
    label: "ORDERS",
    items: [
      {
        label: "Orders",
        href: "/vendor/orders",
        icon: ShoppingBag,
      },
    ],
  },
  {
    label: "FINANCE",
    items: [
      {
        label: "Earnings",
        href: "/vendor/earnings",
        icon: Wallet,
      },
      {
        label: "Payouts",
        href: "/vendor/payouts",
        icon: Wallet,
      },
    ],
  },
  {
    label: "STORE",
    items: [
      {
        label: "My Store",
        href: "/vendor/store",
        icon: Store,
      },
      {
        label: "Store Settings",
        href: "/vendor/settings",
        icon: Settings,
      },
    ],
  },
  {
    label: "ENGAGEMENT",
    items: [
      {
        label: "Reviews",
        href: "/vendor/reviews",
        icon: Star,
      },
      {
        label: "Customers",
        href: "/vendor/customers",
        icon: Users,
      },
    ],
  },
];

interface VendorDashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function VendorDashboardLayout({
  children,
  title: initialTitle,
}: VendorDashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { userName, logout } = useAuthStore();
  const [vendorName, setVendorName] = useState<string>("Vendor Account");

  useEffect(() => {
    let isMounted = true;

    // Fast initial check from storage or username
    const storedName = localStorage.getItem("vendor_name") || userName;
    if (storedName) {
      setVendorName(storedName);
    }

    // Always fetch active server session profile to prevent stale local cache
    const syncVendorProfile = async () => {
      try {
        let token = localStorage.getItem("auth_token");
        if (!token && typeof document !== "undefined") {
          const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
          if (match && match[1]) token = decodeURIComponent(match[1]);
        }

        const res = await fetch("/api/auth/me", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const realName = json.data.vendor?.name || json.data.name || "Vendor Account";
            if (isMounted) {
              setVendorName(realName);
            }
            if (typeof window !== "undefined") {
              localStorage.setItem("vendor_name", realName);
            }
          }
        }
      } catch (err) {
        console.error("Failed to sync vendor layout:", err);
      }
    };

    syncVendorProfile();

    const handleVendorUpdate = (e: any) => {
      if (e?.detail?.name && isMounted) {
        setVendorName(e.detail.name);
      }
    };

    window.addEventListener("vendor_profile_updated", handleVendorUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("vendor_profile_updated", handleVendorUpdate);
    };
  }, [userName]);

  const getAutoTitle = () => {
    if (initialTitle && initialTitle !== "Vendor Dashboard") return initialTitle;
    if (pathname === "/vendor") return "Dashboard";
    if (pathname.startsWith("/vendor/products")) return "Products Catalog";
    if (pathname.startsWith("/vendor/categories")) return "Categories";
    if (pathname.startsWith("/vendor/orders")) return "Orders Management";
    if (pathname.startsWith("/vendor/earnings")) return "Earnings & Financials";
    if (pathname.startsWith("/vendor/payouts")) return "Payouts & Settlements";
    if (pathname.startsWith("/vendor/store")) return "My Store";
    if (pathname.startsWith("/vendor/settings")) return "Store Settings";
    if (pathname.startsWith("/vendor/reviews")) return "Customer Reviews";
    if (pathname.startsWith("/vendor/customers")) return "Store Customers";
    return initialTitle || "Vendor Dashboard";
  };

  const title = getAutoTitle();

  // Deterministic single-active calculation to avoid multiple active highlights
  const activeHref = React.useMemo(() => {
    const currentPath = pathname || "/vendor";
    const isAdd = searchParams?.get("add") === "true";

    // Products page vs Add Product query
    if (currentPath === "/vendor/products") {
      return isAdd ? "/vendor/products?add=true" : "/vendor/products";
    }

    if (currentPath === "/vendor") {
      return "/vendor";
    }

    // Check exact matches
    const allHrefs: string[] = [];
    navigation.forEach((sec) => sec.items.forEach((it) => allHrefs.push(it.href)));

    const exact = allHrefs.find((h) => h === currentPath);
    if (exact) return exact;

    // Prefix matches for subroutes (excluding /vendor root)
    const prefix = allHrefs.find((h) => {
      if (h === "/vendor") return false;
      const basePath = h.split("?")[0] || "";
      return basePath.length > 0 && currentPath.startsWith(basePath);
    });
    return prefix || null;
  }, [pathname, searchParams]);

  const isItemActive = (href: string) => {
    return activeHref === href;
  };

  const handleLogout = () => {
    if (logout) logout();
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_name");
      localStorage.removeItem("vendor_name");
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie = "user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie = "user_name=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie = "vendor_name=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie = "user_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    }
    window.location.href = "/auth/login";
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/vendor/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="vendor-shell">
      {/* DESKTOP SIDEBAR */}
      <aside className="vendor-sidebar">
        <div className="vendor-logo">
          <Link href="/vendor" className="vendor-brand-link">
            <img
              src="/logo.png"
              alt="SheeshaTonight"
              className="vendor-logo-img"
            />
            <span className="vendor-badge">VENDOR</span>
          </Link>
        </div>

        <nav className="vendor-nav">
          {navigation.map((section) => (
            <div className="nav-section" key={section.label}>
              <div className="nav-section-title">{section.label}</div>

              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`vendor-nav-item ${
                      active ? "active" : ""
                    }`}
                  >
                    <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />

                    <span>{item.label}</span>

                    {active && (
                      <span className="active-indicator" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <Link href="/vendor/settings" className="vendor-account">
            <div className="account-avatar">
              {vendorName ? vendorName.charAt(0).toUpperCase() : "V"}
            </div>

            <div className="overflow-hidden">
              <strong className="truncate max-w-[150px]">{vendorName}</strong>
              <span>Store Management</span>
            </div>
          </Link>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <button
          className="vendor-mobile-overlay"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR */}
      <aside
        className={`vendor-mobile-sidebar ${
          mobileOpen ? "open" : ""
        }`}
      >
        <div className="mobile-sidebar-header">
          <Image
            src="/logo.png"
            alt="SheeshaTonight"
            width={155}
            height={48}
          />

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="vendor-nav">
          {navigation.map((section) => (
            <div className="nav-section" key={section.label}>
              <div className="nav-section-title">
                {section.label}
              </div>

              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`vendor-nav-item ${
                      active ? "active" : ""
                    }`}
                  >
                    <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />

                    <span>{item.label}</span>

                    {active && (
                      <span className="active-indicator" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <Link
            href="/vendor/settings"
            className="vendor-account"
            onClick={() => setMobileOpen(false)}
          >
            <div className="account-avatar">
              {vendorName ? vendorName.charAt(0).toUpperCase() : "V"}
            </div>

            <div className="overflow-hidden">
              <strong className="truncate max-w-[150px]">{vendorName}</strong>
              <span>Store Management</span>
            </div>
          </Link>

          <button
            type="button"
            className="logout-button"
            onClick={() => {
              setMobileOpen(false);
              handleLogout();
            }}
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="vendor-main">
        {/* TOP HEADER */}
        <header className="vendor-header">
          <div className="header-left">
            <button
              type="button"
              className="mobile-menu-button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>

            <div>
              <div className="breadcrumb">
                Vendor
                <ChevronRight size={13} />
                {title}
              </div>

              <h1>{title}</h1>
            </div>
          </div>

          <div className="header-right">
            <form onSubmit={handleSearchSubmit} className="header-search">
              <Search size={17} />
              <input
                id="vendor-dashboard-search-input"
                name="vendor-dashboard-search"
                type="search"
                placeholder="Search products, orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />
            </form>

            <Link
              href="/vendor/notifications"
              className="notification-button"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <span />
            </Link>

            <Link href="/vendor/settings" className="header-profile">
              <div className="profile-avatar">
                {vendorName ? vendorName.charAt(0).toUpperCase() : "V"}
              </div>

              <div className="profile-text">
                <strong className="truncate max-w-[130px]">{vendorName}</strong>
                <span>Store Account</span>
              </div>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="header-logout-button"
              title="Logout from vendor dashboard"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="vendor-content">{children}</main>
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #faf9fb;
          color: #29242b;
          font-family: 'Montserrat', sans-serif;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        button,
        input,
        select {
          font: inherit;
        }

        .vendor-shell {
          min-height: 100vh;
          display: flex;
          background: #faf9fb;
        }

        /* SIDEBAR */

        .vendor-sidebar {
          position: fixed;
          inset: 0 auto 0 0;
          z-index: 50;
          width: 258px;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #ebe6ed;
          background: #ffffff;
        }

        .vendor-logo {
          height: 64px;
          padding: 0 20px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #E9E3EB;
        }

        .vendor-brand-link {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .vendor-logo-img {
          height: 38px;
          width: auto;
          max-width: 130px;
          object-fit: contain;
        }

        .vendor-badge {
          font-size: 10px;
          padding: 2px 7px;
          background: rgba(241, 165, 29, 0.15);
          color: #9E6500;
          font-weight: 900;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border: 1px solid rgba(241, 165, 29, 0.3);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }

        .vendor-nav {
          flex: 1;
          overflow-y: auto;
          padding: 18px 12px;
        }

        .nav-section {
          margin-bottom: 22px;
        }

        .nav-section-title {
          padding: 0 12px;
          margin-bottom: 6px;
          color: #94a3b8;
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.15em;
        }

        .vendor-nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 41px;
          margin-bottom: 3px;
          padding: 0 12px;
          border-radius: 9px;
          color: #64748b;
          font-size: 13px;
          font-weight: 600;
          transition: 0.15s ease;
        }

        .vendor-nav-item:hover {
          background: #FAF5FB;
          color: #74189B;
        }

        .vendor-nav-item.active {
          background: #FAF5FB;
          color: #74189B;
          font-weight: 700;
          border: 1px solid rgba(116, 24, 155, 0.14);
          box-shadow: 0 1px 3px rgba(116, 24, 155, 0.04);
        }

        .active-indicator {
          position: absolute;
          left: 0;
          width: 3.5px;
          height: 22px;
          border-radius: 0 4px 4px 0;
          background: #74189B;
        }

        .sidebar-bottom {
          padding: 17px 15px;
          border-top: 1px solid #eee9f0;
        }

        .vendor-account {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px;
          border-radius: 9px;
        }

        .vendor-account:hover {
          background: #faf8fb;
        }

        .account-avatar,
        .profile-avatar {
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #f0e2ef;
          color: #8a277e;
          font-weight: 800;
        }

        .account-avatar {
          width: 35px;
          height: 35px;
          font-size: 12px;
          flex-shrink: 0;
        }

        .vendor-account strong,
        .vendor-account span {
          display: block;
        }

        .vendor-account strong {
          font-size: 12px;
        }

        .vendor-account span {
          margin-top: 3px;
          color: #99919c;
          font-size: 10px;
        }

        .logout-button {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 9px;
          padding: 10px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #817983;
          cursor: pointer;
          font-size: 12px;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .logout-button:hover {
          background: #FAF5FB;
          color: #74189B;
        }

        /* MAIN */

        .vendor-main {
          width: calc(100% - 258px);
          margin-left: 258px;
        }

        .vendor-header {
          position: sticky;
          top: 0;
          z-index: 30;
          height: 64px;
          min-height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 0 28px;
          border-bottom: 1px solid #E9E3EB;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(12px);
        }

        .header-left,
        .header-right {
          display: flex;
          align-items: center;
        }

        .header-left {
          gap: 15px;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 600;
        }

        .header-left h1 {
          margin: 2px 0 0;
          color: #1e293b;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .header-right {
          gap: 13px;
        }

        .header-search {
          width: 260px;
          height: 38px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 12px;
          border: 1px solid #e2e8f0;
          border-radius: 9px;
          background: #fff;
          color: #94a3b8;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .header-search:focus-within {
          border-color: #74189B;
          box-shadow: 0 0 0 3px rgba(116, 24, 155, 0.08);
        }

        .header-search input {
          width: 100%;
          border: 0;
          outline: 0;
          color: #342d36;
          background: transparent;
          font-size: 12px;
        }

        .notification-button {
          position: relative;
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border: 1px solid #e5dfe7;
          border-radius: 8px;
          background: #fff;
          color: #645d66;
          cursor: pointer;
        }

        .notification-button span {
          position: absolute;
          top: 9px;
          right: 10px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #f1a51d;
        }

        .header-profile {
          display: flex;
          align-items: center;
          gap: 9px;
          padding-left: 5px;
        }

        .profile-avatar {
          width: 36px;
          height: 36px;
          font-size: 12px;
          flex-shrink: 0;
        }

        .profile-text strong,
        .profile-text span {
          display: block;
        }

        .profile-text strong {
          font-size: 11px;
        }

        .profile-text span {
          margin-top: 2px;
          color: #99919c;
          font-size: 9px;
        }

        .header-logout-button {
          height: 38px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 0 12px;
          border: 1px solid #fee2e2;
          border-radius: 9px;
          background: #fff;
          color: #e11d48;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .header-logout-button:hover {
          background: #fff1f2;
          border-color: #fca5a5;
          color: #be123c;
        }

        .vendor-content {
          width: min(1440px, 100%);
          margin: 0 auto;
          padding: 32px;
        }

        .mobile-menu-button,
        .vendor-mobile-sidebar,
        .vendor-mobile-overlay {
          display: none;
        }

        @media (max-width: 1050px) {
          .vendor-sidebar {
            width: 225px;
          }

          .vendor-main {
            width: calc(100% - 225px);
            margin-left: 225px;
          }

          .header-search {
            width: 190px;
          }

          .profile-text {
            display: none;
          }
        }

        @media (max-width: 800px) {
          .vendor-sidebar {
            display: none;
          }

          .vendor-main {
            width: 100%;
            margin-left: 0;
          }

          .vendor-header {
            min-height: 68px;
            padding: 0 18px;
          }

          .mobile-menu-button {
            width: 38px;
            height: 38px;
            display: grid;
            place-items: center;
            border: 1px solid #e7e1e8;
            border-radius: 8px;
            background: #fff;
            color: #4d464f;
            cursor: pointer;
          }

          .header-search {
            display: none;
          }

          .vendor-content {
            padding: 22px 17px;
          }

          .vendor-mobile-overlay {
            position: fixed;
            inset: 0;
            z-index: 70;
            display: block;
            border: 0;
            background: rgba(25, 17, 27, 0.38);
          }

          .vendor-mobile-sidebar {
            position: fixed;
            inset: 0 auto 0 0;
            z-index: 80;
            width: min(300px, 88vw);
            display: flex;
            flex-direction: column;
            transform: translateX(-105%);
            transition: transform 0.22s ease;
            background: #fff;
            box-shadow: 15px 0 40px rgba(35, 20, 40, 0.12);
          }

          .vendor-mobile-sidebar.open {
            transform: translateX(0);
          }

          .mobile-sidebar-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 21px 18px;
            border-bottom: 1px solid #eee8ef;
          }

          .mobile-sidebar-header button {
            width: 36px;
            height: 36px;
            display: grid;
            place-items: center;
            border: 1px solid #e6e0e7;
            border-radius: 8px;
            background: #fff;
            cursor: pointer;
          }

          .vendor-mobile-sidebar .vendor-nav {
            flex: 1;
            overflow-y: auto;
          }

          .vendor-mobile-sidebar .sidebar-bottom {
            margin-top: auto;
            flex-shrink: 0;
            background: #fff;
          }
        }

        @media (max-width: 480px) {
          .header-left h1 {
            font-size: 16px;
          }

          .breadcrumb {
            display: none;
          }

          .header-profile {
            padding: 0;
          }

          .vendor-content {
            padding: 17px 13px;
          }
        }
      `}</style>
    </div>
  );
}

export default VendorDashboardLayout;
