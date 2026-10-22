'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  Settings,
  LogOut,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { clearSessionCookie, clearAllClientAuth } from '@/lib/session';

interface TopbarProps {
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  unreadNotificationsCount?: number;
}

export const Topbar: React.FC<TopbarProps> = ({
  onToggleSidebar,
  onOpenSearch,
  unreadNotificationsCount = 0,
}) => {
  const router = useRouter();
  const { userName, userEmail, userRole, logout } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    if (logout) logout();
    clearAllClientAuth();
    window.location.href = '/auth/login';
  };

  const displayName = userName || 'Admin';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-[#E9E3EB] sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left side: Toggle button and search bar */}
      <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-lg">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:bg-[#FAF8FB] hover:text-[#74189B] transition border border-transparent hover:border-[#E9E3EB]"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search trigger bar */}
        <button
          onClick={onOpenSearch}
          className="w-full max-w-sm flex items-center justify-between px-3.5 py-1.5 bg-[#FAF8FB] hover:bg-slate-100/80 border border-[#E9E3EB] rounded-xl text-xs text-slate-400 transition group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-[#74189B] transition" />
            <span className="truncate">Search orders, products, vendors...</span>
          </div>
          <kbd className="hidden sm:inline-block text-[10px] bg-white border border-[#E9E3EB] text-slate-500 px-1.5 py-0.5 rounded shadow-2xs font-semibold">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right side: Notifications & Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Role badge */}
        <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#74189B]/10 text-[#74189B] border border-[#74189B]/20 text-[10px] font-black tracking-wider uppercase">
          <Shield className="w-3 h-3" />
          <span>{userRole || 'ADMIN'}</span>
        </span>

        {/* Notifications Icon */}
        <button
          onClick={() => router.push('/admin/notifications')}
          className="p-2 rounded-xl text-slate-600 hover:bg-[#FAF8FB] hover:text-[#74189B] relative transition border border-transparent hover:border-[#E9E3EB]"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
          )}
        </button>

        {/* Quick Logout button */}
        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200/80 rounded-xl transition cursor-pointer"
          title="Logout from admin dashboard"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>

        {/* Profile Pill & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl hover:bg-[#FAF8FB] border border-transparent hover:border-[#E9E3EB] transition"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#74189B] to-[#571275] text-white font-black flex items-center justify-center text-xs shadow-xs border border-purple-900">
              {initial}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-xs font-bold text-[#29252B] truncate max-w-[120px]">
                {displayName}
              </p>
              <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                {userEmail || 'admin@sheeshatonight.ae'}
              </p>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                profileOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E9E3EB] rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2.5 border-b border-[#E9E3EB] sm:hidden">
                <p className="text-xs font-bold text-[#29252B]">{displayName}</p>
                <p className="text-[10px] text-slate-400">{userEmail}</p>
              </div>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  router.push('/admin/settings');
                }}
                className="w-full px-4 py-2 text-left text-xs font-semibold text-[#29252B] hover:bg-[#FAF8FB] hover:text-[#74189B] flex items-center gap-2.5 transition"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Admin Settings</span>
              </button>

              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-2 text-left text-xs font-semibold text-[#29252B] hover:bg-[#FAF8FB] hover:text-[#74189B] flex items-center gap-2.5 transition"
              >
                <ExternalLink className="w-4 h-4 text-slate-400" />
                <span>View Storefront</span>
              </a>

              <div className="my-1 border-t border-[#E9E3EB]" />

              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
