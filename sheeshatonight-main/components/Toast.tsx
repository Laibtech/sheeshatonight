'use client';

import React, { useEffect } from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  open: boolean;
  message: string;
  variant?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ open, message, variant = 'info', onClose }) => {
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(onClose, 3500);
    return () => window.clearTimeout(timer);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="status"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#160E22]/95 backdrop-blur-xl border border-[#F1A51D]/35 text-white shadow-[0_20px_50px_rgba(116,24,155,0.4),0_10px_24px_rgba(0,0,0,0.4)] animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-[92vw]"
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${
          variant === 'success'
            ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
            : variant === 'error'
            ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white'
            : 'bg-gradient-to-br from-[#74189B] to-purple-600 text-white'
        }`}
      >
        {variant === 'success' ? (
          <Check size={16} strokeWidth={2.5} />
        ) : variant === 'error' ? (
          <AlertCircle size={16} strokeWidth={2.5} />
        ) : (
          <Info size={16} strokeWidth={2.5} />
        )}
      </div>

      <span className="text-[13px] font-semibold text-slate-100 pr-1 truncate max-w-[280px] sm:max-w-[360px]">
        {message}
      </span>

      <button
        type="button"
        onClick={onClose}
        className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition"
        aria-label="Dismiss notification"
      >
        <X size={13} />
      </button>
    </div>
  );
};
