'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  ShoppingBag,
  Store,
  Users,
  DollarSign,
  TrendingUp,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Package,
} from 'lucide-react';
import { DataTable, Column } from '@/components/admin/DataTable';

interface WishlistRecord {
  id: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  product: {
    id: string;
    title: string;
    price: number;
    images?: any;
    type?: string;
    stock?: number;
    vendor?: {
      id: string;
      name: string;
      slug?: string;
    };
  };
}

interface TopProduct {
  id: string;
  title: string;
  price: number;
  images?: any;
  type: string;
  stock: number;
  vendorName: string;
  savesCount: number;
}

interface WishlistStats {
  totalSavedItems: number;
  uniqueCustomers: number;
  potentialDemandValue: number;
  topProductsCount: number;
}

export default function AdminWishlistPage() {
  const [items, setItems] = useState<WishlistRecord[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [stats, setStats] = useState<WishlistStats>({
    totalSavedItems: 0,
    uniqueCustomers: 0,
    potentialDemandValue: 0,
    topProductsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [activeTab, setActiveTab] = useState<'activity' | 'top_products'>('activity');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('pageSize', '12');
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/wishlist?${params.toString()}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setItems(data.data || []);
        if (data.stats) setStats(data.stats);
        if (data.topProducts) setTopProducts(data.topProducts);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalItems(data.pagination.total || 0);
        }
      }
    } catch (err) {
      console.error('Failed to load admin wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatAED = (amount: number = 0) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getImageUrl = (images: any) => {
    if (!images) return '/Categories/Buy Sheesha.webp';
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed) && parsed[0]) return parsed[0];
      } catch {
        if (images.startsWith('http') || images.startsWith('/')) return images;
      }
    } else if (Array.isArray(images) && images.length > 0) {
      return images[0];
    }
    return '/Categories/Buy Sheesha.webp';
  };

  // Activity columns
  const activityColumns: Column<WishlistRecord>[] = [
    {
      header: 'Customer',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#74189B] to-[#571275] text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-xs">
            {row.user?.name ? row.user.name.charAt(0).toUpperCase() : 'C'}
          </div>
          <div>
            <Link
              href={`/admin/customers/${row.user?.id}`}
              className="font-bold text-[#29252B] hover:text-[#74189B] transition block text-xs"
            >
              {row.user?.name || 'Customer'}
            </Link>
            <p className="text-[11px] text-[#716975]">{row.user?.email || '—'}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Saved Product',
      cell: (row) => {
        const imgSrc = getImageUrl(row.product?.images);
        return (
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-[#E9E3EB] bg-[#FAF8FB] flex-shrink-0">
              <Image
                src={imgSrc}
                alt={row.product?.title || 'Sheesha'}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div>
              <Link
                href={`/products/${row.product?.id}`}
                target="_blank"
                className="font-bold text-[#29252B] hover:text-[#74189B] transition block text-xs flex items-center gap-1 line-clamp-1"
              >
                <span>{row.product?.title || 'Unknown Product'}</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>
              <span className="text-[10px] text-[#74189B] font-semibold uppercase">
                {row.product?.type?.replace(/_/g, ' ') || 'SHEESHA'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Vendor',
      cell: (row) => (
        <span className="text-xs text-[#716975] font-medium flex items-center gap-1.5">
          <Store className="w-3.5 h-3.5 text-[#74189B]" />
          {row.product?.vendor?.name || 'Storefront'}
        </span>
      ),
    },
    {
      header: 'Product Price',
      cell: (row) => (
        <span className="font-extrabold text-xs text-[#29252B]">
          {formatAED(Number(row.product?.price) || 0)}
        </span>
      ),
    },
    {
      header: 'Stock Status',
      cell: (row) => {
        const inStock = (row.product?.stock ?? 1) > 0;
        return (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              inStock
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        );
      },
    },
    {
      header: 'Date Saved',
      cell: (row) => (
        <span className="text-xs text-[#716975]">
          {new Date(row.createdAt).toLocaleDateString('en-AE', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF0F8] border border-[#EDD5E8] flex items-center justify-center text-[#822576]">
              <Heart className="w-5 h-5 fill-[#822576]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#29252B] tracking-tight">
                Wishlist & Customer Demand
              </h1>
              <p className="text-xs text-[#716975] mt-0.5">
                Track what customers are saving, favorite luxury hookahs, and potential order revenue.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E9E3EB] bg-white hover:bg-[#FAF8FB] text-[#716975] hover:text-[#29252B] text-xs font-bold transition shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E9E3EB] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#716975]">
              Total Saved Items
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#74189B]/10 text-[#74189B] flex items-center justify-center">
              <Heart className="w-4 h-4 fill-[#74189B]" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#29252B]">
            {stats.totalSavedItems}
          </div>
          <p className="text-[11px] text-[#716975] mt-1">Across all registered customers</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E9E3EB] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#716975]">
              Active Customer Wishlists
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#29252B]">
            {stats.uniqueCustomers}
          </div>
          <p className="text-[11px] text-[#716975] mt-1">Shoppers actively watching items</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E9E3EB] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#716975]">
              Potential Demand Value
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#29252B]">
            {formatAED(stats.potentialDemandValue)}
          </div>
          <p className="text-[11px] text-[#716975] mt-1">Total value in customer wishlists</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E9E3EB] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#716975]">
              Top Desired Products
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#29252B]">
            {topProducts.length}
          </div>
          <p className="text-[11px] text-[#716975] mt-1">Products with repeated saves</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-[#E9E3EB] pb-2">
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'activity'
              ? 'bg-[#74189B] text-white shadow-xs'
              : 'text-[#716975] hover:bg-[#FAF8FB] hover:text-[#29252B]'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Live Customer Wishlist Activity ({totalItems})</span>
        </button>

        <button
          onClick={() => setActiveTab('top_products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'top_products'
              ? 'bg-[#74189B] text-white shadow-xs'
              : 'text-[#716975] hover:bg-[#FAF8FB] hover:text-[#29252B]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Most Wishlisted Products ({topProducts.length})</span>
        </button>
      </div>

      {/* Content depending on Tab */}
      {activeTab === 'activity' ? (
        <DataTable
          columns={activityColumns}
          data={items}
          loading={loading}
          emptyTitle="No Wishlist Items Found"
          emptyDescription="When customers save sheeshas or flavors to their wishlist, they will appear here in real-time."
          searchPlaceholder="Search by customer name, email, or product title..."
          searchValue={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
        />
      ) : (
        /* Top Products Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {topProducts.map((product, idx) => {
            const imgSrc = getImageUrl(product.images);
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-[#E9E3EB] overflow-hidden p-4 shadow-xs flex flex-col justify-between group hover:border-[#74189B]/40 transition"
              >
                <div>
                  <div className="relative w-full h-44 rounded-xl overflow-hidden bg-[#FAF8FB] border border-[#E9E3EB] mb-3">
                    <Image
                      src={imgSrc}
                      alt={product.title}
                      fill
                      sizes="300px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#74189B] text-white text-[10px] font-black shadow-xs">
                      #{idx + 1} MOST SAVED
                    </div>
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[#822576] text-[11px] font-black flex items-center gap-1 shadow-xs">
                      <Heart className="w-3 h-3 fill-[#822576]" />
                      <span>{product.savesCount} saves</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-[#74189B] uppercase tracking-wider block mb-1">
                    {product.type.replace(/_/g, ' ')}
                  </span>
                  <h3 className="font-extrabold text-sm text-[#29252B] line-clamp-2 leading-snug">
                    {product.title}
                  </h3>
                  <p className="text-[11px] text-[#716975] flex items-center gap-1 mt-1.5">
                    <Store className="w-3 h-3 text-[#74189B]" />
                    <span>{product.vendorName}</span>
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#E9E3EB] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#716975] uppercase block">Price</span>
                    <span className="text-sm font-black text-[#29252B]">
                      {formatAED(product.price)}
                    </span>
                  </div>

                  <Link
                    href={`/products/${product.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAF8FB] hover:bg-[#74189B] text-[#74189B] hover:text-white border border-[#E9E3EB] text-xs font-bold transition shadow-xs"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
