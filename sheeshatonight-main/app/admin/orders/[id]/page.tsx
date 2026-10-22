'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  User,
  MapPin,
  Package,
  Calendar,
  DollarSign,
  Truck,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Store,
  Printer,
} from 'lucide-react';

import { StatusBadge, StatusType } from '@/components/admin/StatusBadge';
import { useToast } from '@/components/admin/Toast';
import { TaxInvoiceModal } from '@/components/TaxInvoiceModal';

interface OrderDetailData {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  subtotal?: number;
  platformFee?: number;
  vendorNet?: number;
  commissionRate?: number;
  payoutStatus?: string;
  currency: string;
  rentalStartDate?: string;
  rentalEndDate?: string;
  deliveryDate?: string;
  notes?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    addresses?: Array<{
      id: string;
      label: string;
      street: string;
      building?: string;
      city: string;
      country: string;
      isDefault: boolean;
    }>;
  };
  vendor: {
    id: string;
    name: string;
    slug: string;
    phone?: string;
    location?: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      title: string;
      sku?: string;
      images?: any;
    };
  }>;
  invoice?: {
    id: string;
    invoiceNumber: string;
    subtotal: number;
    tax: number;
    total: number;
    issuedAt: string;
  };
  tracking?: {
    status: string;
    events?: Array<{
      status: string;
      note?: string;
      timestamp: string;
    }>;
  };
}

export default function AdminOrderDetailPage({
  params,
}: {
  params?: Promise<{ id: string }> | { id: string };
}) {
  const router = useRouter();
  const routeParams = useParams();
  const unwrapped = params ? ('then' in params ? React.use(params) : params) : null;
  const orderId = (routeParams?.id as string) || unwrapped?.id || '';

  const { addToast } = useToast();
  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusNote, setStatusNote] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const fetchOrder = async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        const ord = data.data?.order || data.order;
        setOrder(ord);
        setNewStatus(ord.status);
      } else {
        addToast({
          type: 'error',
          title: 'Order Not Found',
          message: 'Unable to load order details.',
        });
      }
    } catch (err) {
      console.error('Error loading order details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatus || newStatus === order?.status) return;

    try {
      setUpdating(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          status: newStatus,
          trackingNote: statusNote || `Status changed to ${newStatus}`,
        }),
      });

      if (res.ok) {
        addToast({
          type: 'success',
          title: 'Order Updated',
          message: `Order #${order?.orderNumber} status changed to ${newStatus}.`,
        });
        setStatusNote('');
        fetchOrder();
      } else {
        addToast({
          type: 'error',
          title: 'Update Failed',
          message: 'Could not update order status.',
        });
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const formatAED = (amount: number = 0) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="w-8 h-8 text-[#74189B] animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold text-[#29252B]">Order Not Found</h2>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 mt-4 text-[#74189B] font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </Link>
      </div>
    );
  }

  const subtotal = (order.items || []).reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );
  const tax = order.invoice ? order.invoice.tax : subtotal * 0.05; // 5% UAE VAT
  const total = order.totalAmount || subtotal + tax;

  const defaultAddress = order.user?.addresses?.find((a) => a.isDefault) || order.user?.addresses?.[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-xl bg-white border border-[#E9E3EB] hover:bg-slate-50 text-slate-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-[#29252B] tracking-tight">
                Order #{order.orderNumber}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-[#716975] mt-0.5">
              Placed on{' '}
              {new Date(order.createdAt).toLocaleDateString('en-AE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {order.invoice && (
            <Link
              href={`/admin/invoices/${order.invoice.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-[#E9E3EB] text-xs font-bold text-[#74189B] transition shadow-xs"
            >
              <FileText className="w-4 h-4" />
              <span>Invoice #{order.invoice.invoiceNumber}</span>
            </Link>
          )}

          <button
            onClick={() => setShowInvoiceModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#74189B] hover:bg-[#571275] text-white text-xs font-bold transition shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Tax Invoice</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left details, Right sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Products, Status update, Pricing */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products Table */}
          <div className="bg-white rounded-2xl border border-[#E9E3EB] p-5 shadow-xs">
            <h2 className="text-sm font-bold text-[#29252B] mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#74189B]" />
              <span>Ordered Items ({(order.items || []).length})</span>
            </h2>

            <div className="divide-y divide-[#E9E3EB]/70">
              {(order.items || []).map((item) => (
                <div
                  key={item.id}
                  className="py-3.5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#FAF8FB] border border-[#E9E3EB] flex items-center justify-center flex-shrink-0 text-[#74189B]">
                      <Package className="w-5 h-5 opacity-70" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#29252B]">
                        {item.product?.title || 'Custom Sheesha Item'}
                      </h4>
                      <p className="text-[11px] text-[#716975] mt-0.5">
                        SKU: {item.product?.sku || 'N/A'} • Qty: {item.quantity} × {formatAED(item.price)}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-black text-[#29252B]">
                    {formatAED((item.price || 0) * (item.quantity || 1))}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Summary Breakdown */}
            <div className="mt-4 pt-4 border-t border-[#E9E3EB] space-y-2 text-xs">
              <div className="flex justify-between text-[#716975]">
                <span>Subtotal</span>
                <span>{formatAED(order.subtotal || subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#716975]">
                <span>VAT (5% UAE)</span>
                <span>{formatAED(tax)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-[#29252B] pt-2 border-t border-[#E9E3EB]">
                <span>Gross Paid by Customer</span>
                <span className="text-[#74189B]">{formatAED(total)}</span>
              </div>
              <div className="pt-2 border-t border-dashed border-[#E9E3EB] space-y-1.5">
                <div className="flex justify-between text-rose-600 font-mono">
                  <span>Platform Commission ({order.commissionRate || 10}%):</span>
                  <span>+{formatAED(order.platformFee || 0)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-mono font-bold">
                  <span>Vendor Net Share:</span>
                  <span>{formatAED(order.vendorNet || (total - (order.platformFee || 0)))}</span>
                </div>
                <div className="flex justify-between items-center pt-1 text-[11px] text-[#716975]">
                  <span>Payout Settlement Status:</span>
                  <span className="font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {order.payoutStatus || 'PENDING'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Update Control */}
          <div className="bg-white rounded-2xl border border-[#E9E3EB] p-5 shadow-xs">
            <h2 className="text-sm font-bold text-[#29252B] mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#74189B]" />
              <span>Update Order Status</span>
            </h2>
            <p className="text-xs text-[#716975] mb-4">
              Changing order status updates customer tracking and triggers timeline logs.
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#716975] uppercase mb-1">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8FB] border border-[#E9E3EB] rounded-xl text-xs font-semibold text-[#29252B] focus:outline-none focus:border-[#74189B]"
                  >
                    <option value="PREPARING">Preparing</option>
                    <option value="READY_FOR_PICKUP">Ready For Pickup</option>
                    <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="ACTIVE_RENTAL">Active Rental</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#716975] uppercase mb-1">
                    Tracking Note / Reason
                  </label>
                  <input
                    type="text"
                    placeholder="Optional tracking comment..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8FB] border border-[#E9E3EB] rounded-xl text-xs text-[#29252B] focus:outline-none focus:border-[#74189B]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={updating || newStatus === order.status}
                  className="px-4 py-2 bg-[#74189B] hover:bg-[#571275] text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {updating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Apply Status Change</span>
                </button>
              </div>
            </form>
          </div>

          {/* Timeline / Tracking Events */}
          {order.tracking?.events && order.tracking.events.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E9E3EB] p-5 shadow-xs">
              <h2 className="text-sm font-bold text-[#29252B] mb-4 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#74189B]" />
                <span>Order Timeline & Tracking Events</span>
              </h2>

              <div className="relative pl-6 border-l-2 border-[#E9E3EB] space-y-4 my-2">
                {order.tracking.events.map((evt, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-3 h-3 rounded-full bg-[#74189B] ring-4 ring-white" />
                    <p className="text-xs font-bold text-[#29252B]">
                      {evt.status}
                    </p>
                    {evt.note && (
                      <p className="text-[11px] text-[#716975] mt-0.5">{evt.note}</p>
                    )}
                    <span className="text-[10px] text-slate-400">
                      {new Date(evt.timestamp).toLocaleString('en-AE')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Customer & Vendor info */}
        <div className="space-y-6">
          {/* Customer Info Card */}
          <div className="bg-white rounded-2xl border border-[#E9E3EB] p-5 shadow-xs">
            <h2 className="text-sm font-bold text-[#29252B] mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-[#74189B]" />
              <span>Customer Information</span>
            </h2>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] font-bold text-[#716975] uppercase block">
                  Name
                </span>
                <Link
                  href={`/admin/customers/${order.user?.id}`}
                  className="font-bold text-[#74189B] hover:underline"
                >
                  {order.user?.name || 'Guest'}
                </Link>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#716975] uppercase block">
                  Email
                </span>
                <a
                  href={`mailto:${order.user?.email}`}
                  className="text-[#29252B] hover:underline"
                >
                  {order.user?.email}
                </a>
              </div>

              {order.user?.phone && (
                <div>
                  <span className="text-[10px] font-bold text-[#716975] uppercase block">
                    Phone
                  </span>
                  <a
                    href={`tel:${order.user?.phone}`}
                    className="text-[#29252B] hover:underline"
                  >
                    {order.user.phone}
                  </a>
                </div>
              )}
            </div>

            {/* Address */}
            <div className="mt-4 pt-4 border-t border-[#E9E3EB]">
              <span className="text-[10px] font-bold text-[#716975] uppercase flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3 text-[#74189B]" />
                <span>Shipping Address</span>
              </span>

              {defaultAddress ? (
                <div className="text-xs text-[#29252B] leading-relaxed">
                  <p className="font-semibold">{defaultAddress.label || 'Home'}</p>
                  <p>{defaultAddress.street}</p>
                  {defaultAddress.building && <p>{defaultAddress.building}</p>}
                  <p>
                    {defaultAddress.city}, {defaultAddress.country}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No saved address recorded for user.
                </p>
              )}
            </div>
          </div>

          {/* Vendor Info Card */}
          <div className="bg-white rounded-2xl border border-[#E9E3EB] p-5 shadow-xs">
            <h2 className="text-sm font-bold text-[#29252B] mb-3 flex items-center gap-2">
              <Store className="w-4 h-4 text-[#74189B]" />
              <span>Assigned Vendor</span>
            </h2>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] font-bold text-[#716975] uppercase block">
                  Vendor Name
                </span>
                <Link
                  href={`/admin/vendors/${order.vendor?.id}`}
                  className="font-bold text-[#74189B] hover:underline"
                >
                  {order.vendor?.name}
                </Link>
              </div>

              {order.vendor?.phone && (
                <div>
                  <span className="text-[10px] font-bold text-[#716975] uppercase block">
                    Phone
                  </span>
                  <span>{order.vendor.phone}</span>
                </div>
              )}

              {order.vendor?.location && (
                <div>
                  <span className="text-[10px] font-bold text-[#716975] uppercase block">
                    Location
                  </span>
                  <span>{order.vendor.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Official UAE Tax Invoice Modal */}
      <TaxInvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        data={{
          id: order.invoice?.id || order.id,
          invoiceNumber: order.invoice?.invoiceNumber || `INV-${order.orderNumber}`,
          orderNumber: order.orderNumber,
          orderId: order.id,
          issuedAt: order.invoice?.issuedAt || order.createdAt,
          status: order.status,
          customer: {
            name: order.user?.name || 'Customer',
            email: order.user?.email || '',
            phone: order.user?.phone,
            address: defaultAddress?.street,
            city: defaultAddress?.city,
          },
          vendor: {
            name: order.vendor?.name,
            location: order.vendor?.location,
            phone: order.vendor?.phone,
          },
          items: (order.items || []).map((it) => ({
            id: it.id,
            title: it.product?.title || 'Sheesha Product',
            quantity: it.quantity,
            price: it.price,
            total: it.price * it.quantity,
          })),
          subtotal,
          tax,
          total,
        }}
      />
    </div>
  );
}
