'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WhatsAppFloat() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Show welcoming hint after 3 seconds on storefront pages
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Avoid SSR / static build mismatch
  if (!mounted || !pathname) {
    return null;
  }

  // Never render WhatsApp floating button on internal dashboards
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/vendor')
  ) {
    return null;
  }

  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '971509121111';
  const message = 'Hi SheeshaTonight! I would like to book a sheesha experience / inquiry.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[9998] flex items-center gap-3">
      {/* Tooltip Pill */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md text-[#29252B] py-2 px-3.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#74189B]/15 text-xs font-semibold"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Instant VIP Support & Bookings</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="text-gray-400 hover:text-gray-600 ml-1 font-bold text-xs"
              aria-label="Dismiss tooltip"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float !relative !bottom-auto !right-auto flex items-center justify-center w-[60px] h-[60px] rounded-full bg-gradient-to-tr from-[#25d366] to-[#128c7e] text-white shadow-[0_8px_25px_rgba(37,211,102,0.4)] hover:shadow-[0_10px_35px_rgba(37,211,102,0.6)] transition-all"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Chat with SheeshaTonight Concierge on WhatsApp"
        title="Chat with us on WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
      </motion.a>
    </div>
  );
}
