'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { GlobalSearchModal } from './GlobalSearchModal';
import { ToastProvider } from './Toast';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [pendingCounts, setPendingCounts] = useState<{
    orders?: number;
    vendors?: number;
    notifications?: number;
  }>({});

  useEffect(() => {
    // Fetch live pending counts from actual database
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch('/api/admin/stats', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          const stats = data.data || data.stats;
          if (stats) {
            setPendingCounts({
              orders: stats.pendingOrders || 0,
              vendors: stats.pendingVendors || 0,
              notifications: stats.unreadNotifications || 0,
            });
          }
        }
      } catch {
        // Fallback gracefully without console error
      }
    };
    fetchCounts();
  }, []);

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#FAF8FB] flex flex-col text-[#29252B] font-sans">
        {/* Sidebar */}
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          pendingCounts={pendingCounts}
        />

        {/* Global Search Dialog */}
        <GlobalSearchModal
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
        />

        {/* Main Content Column */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            collapsed ? 'lg:pl-20' : 'lg:pl-64'
          }`}
        >
          {/* Topbar */}
          <Topbar
            onToggleSidebar={handleToggleSidebar}
            onOpenSearch={() => setSearchOpen(true)}
            unreadNotificationsCount={pendingCounts.notifications}
          />

          {/* Page Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
};
