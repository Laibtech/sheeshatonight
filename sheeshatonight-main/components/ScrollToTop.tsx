'use client';

import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;

      // Show after scrolling 260px down
      if (currentScrollY > 260) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Calculate scroll progress percentage (0 - 100)
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (currentScrollY / totalHeight) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // SVG circular progress parameters
  const size = 48;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed right-4 md:right-6 bottom-36 md:bottom-24 z-[9995] group"
        >
          {/* Tooltip on hover */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0 hidden sm:block">
            <span className="whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#38064F] text-amber-300 shadow-lg border border-[#F1A51D]/30 backdrop-blur-md">
              Back to Top
            </span>
          </div>

          <motion.button
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll to top of page"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="relative w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-tr from-[#38064F] via-[#571275] to-[#74189B] text-amber-300 shadow-[0_8px_25px_rgba(87,18,117,0.45)] hover:shadow-[0_12px_30px_rgba(241,165,29,0.4)] border border-[#F1A51D]/40 transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#F1A51D]/60"
          >
            {/* SVG Circular Scroll Progress Ring */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
              width={size}
              height={size}
            >
              {/* Background Track Ring */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                className="stroke-white/15"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Active Golden Progress Ring */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                className="stroke-[#F1A51D] transition-[stroke-dashoffset] duration-150 ease-out"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>

            {/* Upward Chevron Icon */}
            <ChevronUp
              size={20}
              className="relative z-10 transition-transform duration-200 group-hover:-translate-y-0.5 text-[#F1A51D] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
              strokeWidth={2.6}
            />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
