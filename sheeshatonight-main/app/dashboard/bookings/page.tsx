'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Clock,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Store,
  FileText,
  CheckCircle,
  AlertCircle,
  Phone,
} from 'lucide-react';
import Link from 'next/link';
import { TaxInvoiceModal, TaxInvoiceData } from '@/components/TaxInvoiceModal';

interface BookingItem {
  id?: string;
  product?: {
    id: string;
    title: string;
    type?: string;
  };
  quantity: number;
  price?: number;
}

interface Booking {
  id: string;
  orderNumber?: string;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  rentalStartDate: string | null;
  rentalEndDate: string | null;
  notes?: string | null;
  vendor?: {
    id: string;
    name: string;
    phone?: string;
  };
  items?: BookingItem[];
  invoice?: {
    id: string;
    invoiceNumber: string;
    issuedAt: string;
  };
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('auth_token');
  if (token) return token;
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  return match && match[1] ? decodeURIComponent(match[1]) : null;
}

function formatAmount(value: unknown, currency = 'AED') {
  const amount = Number(value);
  return Number.isFinite(amount) ? `${currency} ${amount.toFixed(2)}` : 'AED 0.00';
}

function formatDate(value: string | null) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : date.toLocaleDateString('en-AE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
}

function formatStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invoice modal state
  const [selectedInvoice, setSelectedInvoice] = useState<TaxInvoiceData | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch('/api/bookings', { headers, cache: 'no-store' });
      const result = await response.json();
      if (!response.ok || !result.success || !Array.isArray(result.data)) {
        throw new Error(result.error || 'Unable to load bookings.');
      }
      setBookings(result.data);
    } catch (fetchError) {
      console.error('Failed to fetch bookings:', fetchError);
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load bookings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const [nowTime] = useState(() => Date.now());

  const upcomingCount = useMemo(
    () =>
      bookings.filter((booking) => {
        const start = booking.rentalStartDate ? new Date(booking.rentalStartDate).getTime() : 0;
        return start >= nowTime && booking.status !== 'CANCELLED';
      }).length,
    [bookings, nowTime]
  );

  const currentMonthCount = useMemo(
    () =>
      bookings.filter((booking) => {
        const date = new Date(booking.createdAt);
        const nowDate = new Date(nowTime);
        return date.getFullYear() === nowDate.getFullYear() && date.getMonth() === nowDate.getMonth();
      }).length,
    [bookings, nowTime]
  );

  const totalSpent = bookings.reduce((sum, booking) => {
    const amount = Number(booking.totalAmount);
    return Number.isFinite(amount) ? sum + amount : sum;
  }, 0);

  const openInvoiceForBooking = (booking: Booking) => {
    const total = Number(booking.totalAmount || 0);
    const subtotal = total / 1.05;
    const tax = total - subtotal;

    const data: TaxInvoiceData = {
      id: booking.invoice?.id || booking.id,
      invoiceNumber: booking.invoice?.invoiceNumber || `INV-${booking.orderNumber || booking.id.substring(0, 8)}`,
      orderNumber: booking.orderNumber || booking.id.substring(0, 8),
      orderId: booking.id,
      issuedAt: booking.invoice?.issuedAt || booking.createdAt,
      status: booking.status,
      paymentMethod: 'Cash / Card on Delivery',
      customer: {
        name: 'Customer',
        email: '',
        address: 'Dubai, UAE',
        city: 'Dubai',
      },
      vendor: {
        name: booking.vendor?.name || 'SheeshaTonight Certified Partner',
        location: 'Dubai, UAE',
        phone: booking.vendor?.phone,
      },
      items:
        booking.items && booking.items.length > 0
          ? booking.items.map((it) => ({
              title: it.product?.title || 'Premium Sheesha Rental Equipment',
              quantity: it.quantity || 1,
              price: Number(it.price || subtotal),
              total: Number(it.price || subtotal) * (it.quantity || 1),
            }))
          : [
              {
                title: 'Sheesha Rental & Session Package',
                quantity: 1,
                price: subtotal,
                total: subtotal,
              },
            ],
      subtotal,
      tax,
      total,
    };

    setSelectedInvoice(data);
    setIsInvoiceOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE_RENTAL':
        return (
          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Active Rental
          </span>
        );
      case 'DELIVERED':
      case 'COMPLETED':
        return (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1.5">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case 'PREPARING':
      case 'READY_FOR_PICKUP':
        return (
          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {formatStatus(status)}
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
            {formatStatus(status)}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-8 min-h-full bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-semibold">Loading rental bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 min-h-full bg-slate-50 flex items-center justify-center">
        <div className="bg-white border border-red-200 rounded-2xl p-8 text-center max-w-md shadow-sm">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">Bookings unavailable</h1>
          <p className="text-sm text-slate-600 mb-5">{error}</p>
          <button
            onClick={fetchBookings}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-white rounded-xl font-bold shadow-md hover:bg-[#b8902a] transition text-xs"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#D4AF37]" />
            My Bookings & Rentals
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Track your sheesha rentals, delivery schedules, and session durations
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-medium text-xs transition shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Booking Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Upcoming Rentals</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{upcomingCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">This Month Bookings</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{currentMonthCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Rental Total Spend</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{formatAmount(totalSpent)}</p>
        </div>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
          <Calendar className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">No bookings yet</h3>
          <p className="text-slate-500 text-xs mb-6 max-w-sm mx-auto">
            Book top-of-the-line sheeshas, premium coals, and fruit bowls delivered directly to your villa or gathering.
          </p>
          <Link
            href="/dashboard/browse"
            className="inline-flex px-5 py-2.5 bg-[#D4AF37] text-slate-950 font-bold rounded-xl text-xs hover:bg-[#b8902a] transition shadow-md"
          >
            Browse Sheesha & Book
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-md transition"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-black text-slate-900 font-mono">
                      #{booking.orderNumber || booking.id.substring(0, 10)}
                    </h3>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {booking.items?.[0]?.product?.title || 'Sheesha Rental Package'}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-[#D4AF37]" />
                      Vendor: {booking.vendor?.name || 'SheeshaTonight Certified Vendor'}
                      {booking.vendor?.phone && ` (${booking.vendor.phone})`}
                    </p>
                  </div>

                  {/* Schedule Details */}
                  <div className="flex flex-wrap gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <strong>Starts:</strong> {formatDate(booking.rentalStartDate)}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <strong>Ends:</strong> {formatDate(booking.rentalEndDate)}
                    </span>
                  </div>

                  {booking.notes && (
                    <p className="text-xs text-slate-500 italic">Notes: &quot;{booking.notes}&quot;</p>
                  )}
                </div>

                {/* Amount and Action */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Rental Cost</span>
                    <p className="text-2xl font-black text-[#D4AF37] font-mono">
                      {formatAmount(booking.totalAmount, booking.currency)}
                    </p>
                  </div>

                  <button
                    onClick={() => openInvoiceForBooking(booking)}
                    className="px-4 py-2 bg-[#74189B]/10 hover:bg-[#74189B]/20 text-[#74189B] rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Tax Invoice</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tax Invoice Modal */}
      <TaxInvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        data={selectedInvoice}
      />
    </div>
  );
}
