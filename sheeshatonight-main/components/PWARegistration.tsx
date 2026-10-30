'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWARegistration() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Check if already running in standalone PWA mode
    if (typeof window !== 'undefined') {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      if (isStandalone) {
        return;
      }
    }

    // In development mode, aggressively unregister any stale service workers to prevent HMR caching reload loops
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister();
        }
      });
      if ('caches' in window) {
        caches.keys().then((keys) => {
          keys.forEach((key) => caches.delete(key));
        });
      }
    }

    // Register Service Worker in production
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.warn('Service Worker registration failed:', err);
        });
      });
    }

    // Capture browser install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Initial display trigger after 3 seconds
    const initialTimer = setTimeout(() => {
      setShowInstallBanner(true);
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(initialTimer);
    };
  }, []);

  // Auto-collapse to icon after 6.5s if visible, expanded, and not hovered
  useEffect(() => {
    if (showInstallBanner && !isCollapsed && !isHovered) {
      const timer = setTimeout(() => {
        setIsCollapsed(true);
      }, 6500);
      return () => clearTimeout(timer);
    }
  }, [showInstallBanner, isCollapsed, isHovered]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      alert('To install SheeshaTonight:\n• On Chrome / Edge: Click the install icon in the URL address bar or browser menu.\n• On iPhone / iPad: Tap Share and choose "Add to Home Screen".');
      setIsCollapsed(true);
    }
  };

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCollapsed(true);
  };

  if (!showInstallBanner) return null;

  return (
    <div
      className={`fixed ${
        isCollapsed ? 'bottom-20' : 'bottom-36 sm:bottom-20'
      } md:bottom-6 left-4 md:left-6 lg:left-16 z-[9995] transition-all duration-300`}
    >
      <AnimatePresence mode="wait">
        {isCollapsed ? (
          /* ================= COLLAPSED ICON STATE ================= */
          <motion.div
            key="pwa-collapsed-icon"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="relative group"
          >
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsCollapsed(false)}
              className="flex items-center justify-center w-[56px] h-[56px] sm:w-[60px] sm:h-[60px] rounded-2xl bg-gradient-to-tr from-[#74189B] to-[#9c27b0] text-white shadow-[0_8px_25px_rgba(116,24,155,0.45)] hover:shadow-[0_12px_35px_rgba(116,24,155,0.7)] border border-white/20 transition-all cursor-pointer select-none"
              title="Install SheeshaTonight App"
              aria-label="Install SheeshaTonight App"
            >
              <Download className="w-6 h-6 text-white group-hover:translate-y-0.5 transition-transform" />

              {/* Notification Gold Live Indicator */}
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f1a51d] opacity-80"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#f1a51d] border-2 border-[#121216]"></span>
              </span>
            </motion.button>

            {/* Hover Tooltip Pill */}
            <div className="hidden sm:block absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#121216]/95 backdrop-blur-md text-white text-xs font-semibold rounded-xl shadow-xl border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
              Install App
            </div>
          </motion.div>
        ) : (
          /* ================= EXPANDED BANNER STATE ================= */
          <motion.div
            key="pwa-expanded-banner"
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="bg-[#121216] text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-[#74189B]/40 flex items-center justify-between gap-3 w-[calc(100vw-2rem)] sm:w-96 select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#74189B] to-[#9c27b0] flex items-center justify-center shrink-0 shadow-md">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div className="truncate">
                <h4 className="text-sm font-bold text-white leading-tight font-sans">
                  Install SheeshaTonight App
                </h4>
                <p className="text-xs text-slate-300 font-sans truncate">
                  Fast access, bookings & orders
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleInstallClick}
                className="px-3.5 py-1.5 bg-[#74189B] hover:bg-[#8e1fbe] text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-95 cursor-pointer font-sans"
              >
                Install
              </button>
              <button
                onClick={handleMinimize}
                aria-label="Minimize install banner to icon"
                title="Minimize to icon"
                className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
