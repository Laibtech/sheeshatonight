'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  User,
  MapPin,
  ShoppingBag,
  Heart,
  Star,
  DollarSign,
  Calendar,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { useToast } from '@/components/admin/Toast';

interface CustomerDetail {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  verified: boolean;
  kycStatus: string;
  createdAt: string;
  totalSpent: number;
  addresses: Array<{
    id: string;
    label: string;
    street: string;
    building?: string;
    city: string;
    country: string;
    isDefault: boolean;
  }>;
  orders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    vendor?: { name: string };
    _count?: { items: number };
  }>;
  wishlistItems: Array<{
    id: string;
    product?: {
      id: string;
      title: string;
      price: number;
    };
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment?: string;
    status: string;
    createdAt: string;
  }>;
}

export default function AdminCustomerDetailPage({
  params,
}: {
  params?: Promise<{ id: string }> | { id: string };
}) {
  const routeParams = useParams();
  const unwrapped = params ? ('then' in params ? React.use(params) : params) : null;
  const customerId = (routeParams?.id as string) || unwrapped?.id || '';

  const { addToast } = useToast();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wishlist' | 'reviews'>('orders');

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!customerId) return;
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`/api/admin/customers/${customerId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const json = await res.json();
          setCustomer(json.data?.customer || json.customer);
        } else {
          addToast({
            type: 'error',
            title: 'Not Found',
            message: 'Customer could not be found.',
          });
        }
      } catch (err) {
        console.error('Error loading customer:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [customerId]);

  const formatAED = (amount: number = 0) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="w-8 h-8 text-[#74189B] animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold text-[#29252B]">Customer Not Found</h2>
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-2 mt-4 text-[#74189B] font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customers</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/customers"
          className="p-2 rounded-xl bg-white border border-[#E9E3EB] hover:bg-slate-50 text-slate-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#29252B] tracking-tight">
              {customer.name}
            </h1>
            <StatusBadge status={customer.status} />
          </div>
          <p className="text-xs text-[#716975] mt-0.5">
            Customer ID: {customer.id} • Registered{' '}
            {new Date(customer.createdAt).toLocaleDateString('en-AE')}
          </p>
        </div>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#E9E3EB] p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#74189B] flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#716975] uppercase">Total Spent</span>
            <p className="text-xl font-black text-[#29252B] mt-0.5">
              {formatAED(customer.totalSpent)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E9E3EB] p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#716975] uppercase">Total Orders</span>
            <p className="text-xl font-black text-[#29252B] mt-0.5">
              {customer.orders?.length || 0} Orders
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E9E3EB] p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#716975] uppercase">Verification / KYC</span>
            <p className="text-xs font-bold text-[#29252B] mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{customer.kycStatus}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E9E3EB] pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'orders'
              ? 'bg-[#74189B] text-white shadow-xs'
              : 'text-[#716975] hover:bg-[#FAF8FB]'
          }`}
        >
          Orders ({customer.orders?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'addresses'
              ? 'bg-[#74189B] text-white shadow-xs'
              : 'text-[#716975] hover:bg-[#FAF8FB]'
          }`}
        >
          Addresses ({customer.addresses?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'wishlist'
              ? 'bg-[#74189B] text-white shadow-xs'
              : 'text-[#716975] hover:bg-[#FAF8FB]'
          }`}
        >
          Wishlist ({customer.wishlistItems?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'reviews'
              ? 'bg-[#74189B] text-white shadow-xs'
              : 'text-[#716975] hover:bg-[#FAF8FB]'
          }`}
        >
          Reviews ({customer.reviews?.length || 0})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-[#E9E3EB] overflow-hidden shadow-xs">
          {customer.orders.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#716975]">
              No orders placed by this customer yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E9E3EB] bg-[#FAF8FB] text-[11px] font-bold text-[#716975] uppercase">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E3EB] text-xs">
                {customer.orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FAF8FB]">
                    <td className="py-3.5 px-4 font-bold text-[#74189B]">
                      #{ord.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 text-[#716975]">{ord.vendor?.name || 'Direct'}</td>
                    <td className="py-3.5 px-4 text-[#716975]">
                      {new Date(ord.createdAt).toLocaleDateString('en-AE')}
                    </td>
                    <td className="py-3.5 px-4 font-black">{formatAED(ord.totalAmount)}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={ord.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/orders/${ord.id}`}
                        className="text-xs font-bold text-[#74189B] hover:underline"
                      >
                        View Order &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'addresses' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {customer.addresses.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#716975] sm:col-span-2 bg-white rounded-2xl border border-[#E9E3EB]">
              No saved addresses recorded for this customer.
            </div>
          ) : (
            customer.addresses.map((addr) => (
              <div
                key={addr.id}
                className="bg-white rounded-2xl border border-[#E9E3EB] p-5 shadow-xs space-y-1 text-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[#29252B] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#74189B]" />
                    <span>{addr.label || 'Address'}</span>
                  </span>
                  {addr.isDefault && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-[#29252B]">{addr.street}</p>
                {addr.building && <p className="text-[#716975]">{addr.building}</p>}
                <p className="text-[#716975]">
                  {addr.city}, {addr.country}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div className="bg-white rounded-2xl border border-[#E9E3EB] p-5 shadow-xs">
          {customer.wishlistItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#716975]">
              No saved wishlist items for this customer.
            </div>
          ) : (
            <div className="divide-y divide-[#E9E3EB]">
              {customer.wishlistItems.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <div>
                      <p className="font-bold text-xs text-[#29252B]">
                        {item.product?.title || 'Saved Item'}
                      </p>
                    </div>
                  </div>
                  <span className="font-black text-xs text-[#29252B]">
                    {formatAED(item.product?.price)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="bg-white rounded-2xl border border-[#E9E3EB] p-5 shadow-xs">
          {customer.reviews.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#716975]">
              No reviews written by this customer.
            </div>
          ) : (
            <div className="divide-y divide-[#E9E3EB] space-y-3">
              {customer.reviews.map((rev) => (
                <div key={rev.id} className="pt-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <StatusBadge status={rev.status} />
                  </div>
                  <p className="text-[#29252B] italic">&quot;{rev.comment}&quot;</p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(rev.createdAt).toLocaleDateString('en-AE')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
