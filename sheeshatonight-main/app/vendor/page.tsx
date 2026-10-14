'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertCircle,
  Star,
  DollarSign,
  Plus,
  Store,
  Settings,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  Clock,
  ChevronRight,
  Eye,
  Filter,
  Zap,
} from 'lucide-react';


interface VendorDashboardData {
  vendor: {
    id: string;
    name: string;
    slug: string;
    tier: string;
    isActive: boolean;
    location: string;
    phone: string;
    userName: string;
    userEmail: string;
  };
  statistics: {
    revenue: {
      total: number;
      today: number;
      thisMonth: number;
    };
    balance: {
      available: number;
      pending: number;
      paid: number;
    };
    orders: {
      total: number;
      today: number;
      thisMonth: number;
      preparing: number;
      readyForPickup: number;
      outForDelivery: number;
      delivered: number;
      completed: number;
      cancelled: number;
    };
    products: {
      total: number;
      active: number;
      pendingApproval: number;
      approved: number;
      rejected: number;
    };
    reviews: {
      total: number;
      averageRating: number;
    };
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    currency: string;
    customerName: string;
    customerEmail: string;
    itemCount: number;
    items: Array<{ productTitle: string; quantity: number; price: number }>;
    createdAt: string;
  }>;
  topProducts: Array<{
    productTitle: string;
    productImage: string | null;
    totalSold: number;
    revenue: number;
  }>;
  salesChart: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
}

const formatAmount = (value: unknown): string => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : 'Unavailable';
};

export default function VendorDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('30_days');
  const [data, setData] = useState<VendorDashboardData | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getAuthToken = () => {
    if (typeof window === 'undefined') return '';
    let token = localStorage.getItem('auth_token');
    if (!token) {
      const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
      if (match && match[1]) token = decodeURIComponent(match[1]);
    }
    return token || '';
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const res = await fetch('/api/vendor/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success && result.data) {
        setData(result.data);
        if (result.data.vendor?.name) {
          localStorage.setItem('vendor_name', result.data.vendor.name);
          window.dispatchEvent(new CustomEvent('vendor_profile_updated', { detail: { name: result.data.vendor.name } }));
        }
      }
    } catch (err) {
      console.error('Failed to load vendor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PREPARING':
      case 'CONFIRMED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'OUT_FOR_DELIVERY':
      case 'ACTIVE_RENTAL':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="p-8 min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#8A277E] animate-spin mb-3" />
        <p className="text-slate-500 font-semibold text-sm">Loading Store Dashboard...</p>
      </div>
    );
  }

  const stats = data?.statistics;
  const vendor = data?.vendor;

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-full">
      {/* PAGE HEADER & FILTER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Vendor Dashboard
            </h1>
            {vendor?.isActive && (
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                Active Store
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Manage your store ({vendor?.name || 'Your Store'}), products, orders, earnings and customer activity.
          </p>
        </div>

        {/* TIME FILTER */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="7_days">Last 7 Days</option>
              <option value="30_days">Last 30 Days</option>
              <option value="3_months">Last 3 Months</option>
              <option value="12_months">Last 12 Months</option>
            </select>
          </div>
          <button
            onClick={() => router.push('/vendor/products?add=true')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#8A277E] hover:bg-[#721e67] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* TOP KPI CARDS (6 CARDS GRID) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* CARD 1: TOTAL SALES */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Sales</span>
            <div className="w-9 h-9 bg-purple-50 text-[#8A277E] rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            AED {formatAmount(stats?.revenue?.thisMonth)}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">This Month</p>
        </div>

        {/* CARD 2: TOTAL ORDERS */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Orders</span>
            <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.orders?.total || 0}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Orders received</p>
        </div>

        {/* CARD 3: ACTIVE PRODUCTS */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Products</span>
            <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.products?.active || 0}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Currently listed</p>
        </div>

        {/* CARD 4: PENDING ORDERS */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Orders</span>
            <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.orders?.preparing || 0}</p>
          <p className="text-xs text-amber-700 font-bold mt-1">Need attention</p>
        </div>

        {/* CARD 5: STORE RATING */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Store Rating</span>
            <div className="w-9 h-9 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 fill-current" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.reviews?.averageRating || 4.9}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">{stats?.reviews?.total || 12} reviews</p>
        </div>

        {/* CARD 6: AVAILABLE BALANCE */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Available Balance</span>
            <div className="w-9 h-9 bg-purple-50 text-[#8A277E] rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#8A277E]">
            AED {formatAmount(stats?.balance?.available)}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">Available for payout</p>
        </div>
      </div>

      {/* MIDDLE SECTION: RECENT ORDERS & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RECENT ORDERS TABLE (2 COLS) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-200/80 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#8A277E]" />
                Recent Store Orders
              </h2>
              <p className="text-xs text-slate-500 mt-1">Latest customer orders for your store products</p>
            </div>
            <Link href="/vendor/orders" className="text-xs text-[#8A277E] font-bold hover:underline flex items-center gap-1">
              View All Orders <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {(!data?.recentOrders || data.recentOrders.length === 0) ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 text-sm">No orders received yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Once customers order your listed products, orders will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="px-6 py-3.5">Order ID</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Items</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Total</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        #{order.orderNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 text-xs">{order.customerName}</div>
                        <div className="text-[11px] text-slate-400">{order.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium">
                        {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        AED {formatAmount(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${getStatusBadge(order.status)}`}>
                          {formatStatus(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RIGHT SIDE: QUICK ACTIONS & PENDING ACTIONS */}
        <div className="space-y-6">
          {/* QUICK ACTIONS */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#8A277E]" />
              Quick Actions
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push('/vendor/products?add=true')}
                className="p-3 bg-purple-50 hover:bg-purple-100 text-[#8A277E] rounded-xl font-bold text-xs text-left transition-colors border border-purple-100 flex flex-col justify-between h-20"
              >
                <Plus className="w-5 h-5" />
                <span>+ Add Product</span>
              </button>

              <button
                onClick={() => router.push('/vendor/products')}
                className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs text-left transition-colors border border-slate-200 flex flex-col justify-between h-20"
              >
                <Package className="w-5 h-5 text-slate-600" />
                <span>Manage Products</span>
              </button>

              <button
                onClick={() => router.push('/vendor/orders')}
                className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs text-left transition-colors border border-slate-200 flex flex-col justify-between h-20"
              >
                <ShoppingBag className="w-5 h-5 text-slate-600" />
                <span>View Orders</span>
              </button>

              <button
                onClick={() => router.push('/vendor/settings')}
                className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs text-left transition-colors border border-slate-200 flex flex-col justify-between h-20"
              >
                <Store className="w-5 h-5 text-slate-600" />
                <span>Store Settings</span>
              </button>
            </div>
          </div>

          {/* PENDING ACTIONS / ALERTS */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Required Store Actions
            </h3>

            {(stats?.orders?.preparing || 0) > 0 ? (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-900">{stats?.orders?.preparing} Pending Orders</p>
                  <p className="text-[11px] text-amber-700">Orders require preparation</p>
                </div>
                <Link href="/vendor/orders" className="text-xs font-bold text-[#8A277E] hover:underline">
                  Review →
                </Link>
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                All pending orders fulfilled!
              </div>
            )}

            {(stats?.products?.pendingApproval || 0) > 0 && (
              <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-purple-950">{stats?.products?.pendingApproval} Products Pending Approval</p>
                  <p className="text-[11px] text-purple-700">Awaiting admin review</p>
                </div>
                <Link href="/vendor/products" className="text-xs font-bold text-[#8A277E] hover:underline">
                  View →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: TOP PRODUCTS & SALES CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TOP SELLING PRODUCTS */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#8A277E]" />
              Top Selling Products
            </h3>
            <Link href="/vendor/products" className="text-xs text-[#8A277E] font-bold hover:underline">
              View All Products →
            </Link>
          </div>

          {(!data?.topProducts || data.topProducts.length === 0) ? (
            <p className="text-xs text-slate-500 py-6 text-center">No sales recorded yet for top products</p>
          ) : (
            <div className="space-y-3">
              {data.topProducts.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0">
                      <img src={p.productImage || 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=200'} alt={p.productTitle} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{p.productTitle}</h4>
                      <p className="text-[11px] text-slate-500">{p.totalSold} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <strong className="text-sm font-bold text-slate-900">AED {formatAmount(p.revenue)}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* STORE METRICS / SUMMARY */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Store className="w-5 h-5 text-[#8A277E]" />
            Store Overview
          </h3>
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="font-medium text-slate-500">Store Name:</span>
              <span className="font-bold text-slate-900">{vendor?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="font-medium text-slate-500">Tier:</span>
              <span className="font-bold text-[#8A277E] uppercase">{vendor?.tier}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="font-medium text-slate-500">Contact Phone:</span>
              <span className="font-bold text-slate-900">{vendor?.phone}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium text-slate-500">Location:</span>
              <span className="font-bold text-slate-900">{vendor?.location || 'Dubai, UAE'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ZapIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}
