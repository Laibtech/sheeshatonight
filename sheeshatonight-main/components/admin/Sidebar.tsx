'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Store,
  Users,
  Tag,
  FileText,
  DollarSign,
  Bell,
  BarChart3,
  ShieldAlert,
  Settings,
  ChevronDown,
  X,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { clearAllClientAuth } from '@/lib/session';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  pendingCounts?: {
    orders?: number;
    vendors?: number;
    notifications?: number;
  };
}

interface SubMenuItem {
  title: string;
  href: string;
}

interface NavSection {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  subItems?: SubMenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  mobileOpen,
  onCloseMobile,
  pendingCounts = {},
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { logout } = useAuthStore();
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const handleSignOut = () => {
    if (logout) logout();
    clearAllClientAuth();
    window.location.href = '/auth/login';
  };

  const toggleSubMenu = (title: string) => {
    if (collapsed) return;
    setOpenSubMenu((prev) => (prev === title ? null : title));
  };

  const navItems: NavSection[] = React.useMemo(() => [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      title: 'Orders',
      href: '/admin/orders',
      icon: ShoppingBag,
      badge: pendingCounts.orders,
      subItems: [
        { title: 'All Orders', href: '/admin/orders' },
        { title: 'Pending', href: '/admin/orders?status=PREPARING' },
        { title: 'Processing', href: '/admin/orders?status=READY_FOR_PICKUP' },
        { title: 'Shipped', href: '/admin/orders?status=OUT_FOR_DELIVERY' },
        { title: 'Delivered', href: '/admin/orders?status=DELIVERED' },
        { title: 'Cancelled', href: '/admin/orders?status=CANCELLED' },
      ],
    },
    {
      title: 'Products',
      href: '/admin/products',
      icon: Package,
      subItems: [
        { title: 'All Products', href: '/admin/products' },
        { title: 'Rentals & Setups', href: '/admin/rentals' },
        { title: 'Categories', href: '/admin/categories' },
        { title: 'Add Product', href: '/admin/products/new' },
        { title: 'Inventory', href: '/admin/products?stock=low' },
      ],
    },
    {
      title: 'Vendors',
      href: '/admin/vendors',
      icon: Store,
      badge: pendingCounts.vendors,
      subItems: [
        { title: 'All Vendors', href: '/admin/vendors' },
        { title: 'Pending Vendors', href: '/admin/vendors?status=pending' },
        { title: 'Vendor Documents', href: '/admin/vendors/documents' },
      ],
    },
    {
      title: 'Customers',
      href: '/admin/customers',
      icon: Users,
      subItems: [
        { title: 'All Customers', href: '/admin/customers' },
        { title: 'Customer Reviews', href: '/admin/reviews' },
        { title: 'Wishlist Activity', href: '/admin/wishlist' },
      ],
    },
    {
      title: 'Marketing',
      href: '/admin/coupons',
      icon: Tag,
      subItems: [
        { title: 'Coupons', href: '/admin/coupons' },
        { title: 'Promotions', href: '/admin/coupons?tab=promotions' },
      ],
    },
    {
      title: 'Content',
      href: '/admin/cms',
      icon: FileText,
      subItems: [
        { title: 'CMS Control Hub', href: '/admin/cms' },
        { title: 'Homepage Builder', href: '/admin/cms/homepage' },
        { title: 'Banner Manager', href: '/admin/cms/banners' },
        { title: 'Page Builder', href: '/admin/cms/pages' },
        { title: 'Navigation & Footer', href: '/admin/cms/navigation' },
        { title: 'Media Library', href: '/admin/media' },
        { title: 'FAQs Manager', href: '/admin/cms/faqs' },
        { title: 'Blog Articles', href: '/admin/cms/blogs' },
        { title: 'SEO & Meta', href: '/admin/seo' },
      ],
    },
    {
      title: 'Finance',
      href: '/admin/finance',
      icon: DollarSign,
      subItems: [
        { title: 'Overview & Commission', href: '/admin/finance' },
        { title: 'Invoices', href: '/admin/invoices' },
        { title: 'Settlements', href: '/admin/settlements' },
      ],
    },
    {
      title: 'Notifications',
      href: '/admin/notifications',
      icon: Bell,
      badge: pendingCounts.notifications,
    },
    {
      title: 'Reports',
      href: '/admin/reports',
      icon: BarChart3,
    },
    {
      title: 'Audit Logs',
      href: '/admin/audit-logs',
      icon: ShieldAlert,
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      subItems: [
        { title: 'Platform Settings', href: '/admin/settings' },
        { title: 'Staff Roles & Admins', href: '/admin/admin-users' },
      ],
    },
  ], [pendingCounts.orders, pendingCounts.vendors, pendingCounts.notifications]);

  // Compute the single best matching active href across the navigation
  const activeHref = React.useMemo(() => {
    let bestHref: string | null = null;
    let bestScore = -1;

    const allHrefs: string[] = [];
    navItems.forEach((item) => {
      if (item.subItems && item.subItems.length > 0) {
        item.subItems.forEach((sub) => allHrefs.push(sub.href));
      } else {
        allHrefs.push(item.href);
      }
    });

    const currentQueryString = searchParams.toString();

    for (const href of allHrefs) {
      const [path, query] = href.split('?');
      if (!path) continue;

      let score = -1;

      if (path === '/admin') {
        if (pathname === '/admin') {
          score = 1000;
        }
      } else if (pathname === path) {
        if (query) {
          const [key, val] = query.split('=');
          if (key && searchParams.get(key) === (val || '')) {
            score = 1000 + href.length;
          }
        } else if (!currentQueryString) {
          score = 800 + href.length;
        } else {
          score = 600 + href.length;
        }
      } else if (pathname.startsWith(path + '/') && path !== '/admin') {
        score = 200 + path.length;
      }

      if (score > bestScore) {
        bestScore = score;
        bestHref = href;
      }
    }

    return bestHref;
  }, [pathname, searchParams, navItems]);

  const isLinkActive = (href: string) => {
    return activeHref === href;
  };

  const isParentActive = (item: NavSection) => {
    if (item.href === '/admin') return pathname === '/admin';
    if (activeHref === item.href) return true;
    if (item.subItems) {
      return item.subItems.some((sub) => sub.href === activeHref);
    }
    return false;
  };

  // Automatically keep the active route's parent accordion open
  React.useEffect(() => {
    const parent = navItems.find((item) =>
      item.subItems?.some((sub) => sub.href === activeHref)
    );
    if (parent) {
      setOpenSubMenu(parent.title);
    }
  }, [activeHref, navItems]);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#E9E3EB] select-none">
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-[#E9E3EB] flex items-center justify-between">
        {!collapsed ? (
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="SheeshaTonight"
              className="h-10 w-auto object-contain max-w-[140px]"
            />
            <span className="text-[10px] px-1.5 py-0.5 bg-[#F1A51D]/15 text-[#9E6500] font-black rounded-md uppercase tracking-wider border border-[#F1A51D]/30 shadow-2xs">
              ADMIN
            </span>
          </Link>
        ) : (
          <Link
            href="/admin"
            className="w-10 h-10 flex items-center justify-center mx-auto"
            title="SheeshaTonight Admin"
          >
            <img
              src="/logo.png"
              alt="SheeshaTonight"
              className="h-8 w-8 object-contain"
            />
          </Link>
        )}

        {mobileOpen && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-1 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const parentActive = isParentActive(item);
          const isOpen = openSubMenu === item.title;

          return (
            <div key={item.title} className="space-y-0.5">
              {hasSubItems ? (
                <div>
                  <button
                    onClick={() => toggleSubMenu(item.title)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition group ${
                      parentActive
                        ? 'bg-[#74189B]/10 text-[#74189B] font-bold'
                        : 'text-[#716975] hover:bg-[#FAF8FB] hover:text-[#29252B]'
                    } ${collapsed ? 'justify-center px-2' : ''}`}
                    title={collapsed ? item.title : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          parentActive ? 'text-[#74189B]' : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      {!collapsed && <span>{item.title}</span>}
                    </div>

                    {!collapsed && (
                      <div className="flex items-center gap-1.5">
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="px-1.5 py-0.2 bg-[#F1A51D] text-white text-[10px] font-black rounded-full shadow-xs">
                            {item.badge}
                          </span>
                        )}
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    )}
                  </button>

                  {/* Submenu items */}
                  {!collapsed && isOpen && (
                    <div className="ml-7 pl-2.5 border-l-2 border-[#E9E3EB] my-1 space-y-0.5">
                      {item.subItems!.map((sub) => {
                        const active = isLinkActive(sub.href);
                        return (
                          <Link
                            key={sub.title}
                            href={sub.href}
                            onClick={() => {
                              if (mobileOpen) onCloseMobile();
                            }}
                            className={`block py-1.5 px-2.5 rounded-lg text-xs transition ${
                              active
                                ? 'bg-[#74189B] text-white font-bold shadow-xs'
                                : 'text-[#716975] hover:bg-[#FAF8FB] hover:text-[#29252B]'
                            }`}
                          >
                            {sub.title}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => {
                    if (mobileOpen) onCloseMobile();
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition group ${
                    parentActive
                      ? 'bg-[#74189B] text-white font-bold shadow-xs'
                      : 'text-[#716975] hover:bg-[#FAF8FB] hover:text-[#29252B]'
                  } ${collapsed ? 'justify-center px-2' : ''}`}
                  title={collapsed ? item.title : undefined}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        parentActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    {!collapsed && <span>{item.title}</span>}
                  </div>

                  {!collapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.2 bg-[#F1A51D] text-white text-[10px] font-black rounded-full shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer link to public website & Logout */}
      <div className="p-3 border-t border-[#E9E3EB] bg-[#FAF8FB]/60 space-y-1.5">
        {!collapsed ? (
          <>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 bg-white hover:bg-slate-50 text-[#716975] hover:text-[#74189B] rounded-xl border border-[#E9E3EB] text-xs font-bold transition shadow-xs"
            >
              <span className="truncate">View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
            </a>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center justify-between px-3 py-2 bg-rose-50/80 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200/80 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <span className="truncate">Logout</span>
              <LogOut className="w-3.5 h-3.5 flex-shrink-0 text-rose-600" />
            </button>
          </>
        ) : (
          <>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-2 text-slate-400 hover:text-[#74189B] rounded-xl transition"
              title="View Storefront"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center justify-center p-2 text-rose-600 hover:bg-rose-100/80 rounded-xl transition cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside
        className={`hidden lg:block fixed top-0 bottom-0 left-0 z-30 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 h-full z-50 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
