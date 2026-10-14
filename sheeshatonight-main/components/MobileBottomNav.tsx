'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Sparkles, User, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuthContext } from '@/components/AuthProvider';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { cart } = useCart();
  const { user } = useAuthContext();
  const isAuthenticated = Boolean(user);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !pathname) {
    return null;
  }

  // Do not show on internal dashboard / admin / vendor screens
  const isExcluded =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname === '/vendor' ||
    pathname.startsWith('/vendor/') ||
    pathname.startsWith('/checkout');

  if (isExcluded) {
    return null;
  }

  const cartItemCount = cart?.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: 'Shop',
      href: '/shop',
      icon: ShoppingBag,
      isActive: pathname.startsWith('/shop') || pathname.startsWith('/products'),
    },
    {
      label: 'Rentals',
      href: '/rentals',
      icon: Sparkles,
      isActive: pathname.startsWith('/rentals'),
    },
    {
      label: 'Cart',
      href: '/cart',
      icon: ShoppingCart,
      badge: cartItemCount,
      isActive: pathname === '/cart',
    },
    {
      label: isAuthenticated ? 'Account' : 'Sign In',
      href: isAuthenticated ? '/dashboard' : '/auth/login',
      icon: User,
      isActive: pathname.startsWith('/dashboard') || pathname.startsWith('/auth'),
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-[9990] bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe transition-all"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 select-none ${
                item.isActive
                  ? 'text-[#74189B] font-bold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    item.isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 bg-[#74189B] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight truncate max-w-[56px]">
                {item.label}
              </span>
              {item.isActive && (
                <span className="absolute bottom-0 w-8 h-1 bg-[#74189B] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
