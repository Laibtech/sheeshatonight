'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, Package, Users, Store, X, ArrowRight, Loader2 } from 'lucide-react';

interface SearchResultItem {
  id: string;
  type: 'order' | 'product' | 'customer' | 'vendor';
  title: string;
  subtitle: string;
  url: string;
  badge?: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Keyboard shortcut Ctrl+K or Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.results) {
            setResults(data.results);
          }
        }
      } catch {
        // Fallback gracefully without console error
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const getIcon = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-purple-600" />;
      case 'product':
        return <Package className="w-4 h-4 text-amber-600" />;
      case 'customer':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'vendor':
        return <Store className="w-4 h-4 text-emerald-600" />;
    }
  };

  const handleSelect = (url: string) => {
    onClose();
    router.push(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-2xl border border-[#E9E3EB] shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#E9E3EB] flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-[#74189B]" />
          <input
            ref={inputRef}
            id="admin-global-search-input"
            name="admin-global-search-input"
            type="text"
            placeholder="Search orders, products, customers, vendors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            className="flex-1 bg-transparent text-sm text-[#29252B] focus:outline-none placeholder-slate-400 font-medium"
          />
          {loading && <Loader2 className="w-4 h-4 text-[#74189B] animate-spin" />}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results Area */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-[#E9E3EB]/50">
          {query.trim().length < 2 ? (
            <div className="p-8 text-center text-xs text-[#716975]">
              Type at least 2 characters to search across orders, products, customers, and vendors.
            </div>
          ) : loading ? (
            <div className="p-8 text-center text-xs text-[#716975] flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#74189B]" />
              <span>Searching real database records...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#716975]">
              No results found for &quot;{query}&quot;.
            </div>
          ) : (
            results.map((item) => (
              <button
                key={`${item.type}-${item.id}`}
                onClick={() => handleSelect(item.url)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#FAF8FB] transition text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                    {getIcon(item.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-[#29252B] group-hover:text-[#74189B] transition">
                        {item.title}
                      </p>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 rounded text-slate-600 font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#716975]">{item.subtitle}</p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#74189B] group-hover:translate-x-0.5 transition" />
              </button>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-2.5 bg-[#FAF8FB] border-t border-[#E9E3EB] flex items-center justify-between text-[11px] text-[#716975]">
          <span>Press <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px]">Esc</kbd> to close</span>
          <span>Orders • Products • Customers • Vendors</span>
        </div>
      </div>
    </div>
  );
};
