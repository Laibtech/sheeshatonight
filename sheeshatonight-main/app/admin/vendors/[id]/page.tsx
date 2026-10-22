'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Store,
  User,
  Phone,
  MapPin,
  Package,
  ShoppingBag,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { useToast } from '@/components/admin/Toast';

interface VendorDetailData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  tier: string;
  isActive: boolean;
  location?: string;
  phone?: string;
  createdAt: string;
  totalRevenue: number;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    kycStatus: string;
    status: string;
    createdAt: string;
  };
  documents: Array<{
    id: string;
    type: string;
    url: string;
    status: string;
    notes?: string;
    createdAt: string;
  }>;
  products: Array<{
    id: string;
    title: string;
    price: number;
    stock: number;
    type: string;
    isActive: boolean;
  }>;
  orders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    user?: { name: string; email: string };
  }>;
  settlements: Array<{
    id: string;
    period: string;
    amount: number;
    commission: number;
    status: string;
    createdAt: string;
  }>;
}

export default function AdminVendorDetailPage({
  params,
}: {
  params?: Promise<{ id: string }> | { id: string };
}) {
  const routeParams = useParams();
  const unwrapped = params ? ('then' in params ? React.use(params) : params) : null;
  const vendorId = (routeParams?.id as string) || unwrapped?.id || '';

  const { addToast } = useToast();
  const [vendor, setVendor] = useState<VendorDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'documents' | 'settlements'>('products');

  const fetchVendor = async () => {
    if (!vendorId) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/admin/vendors/${vendorId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        setVendor(json.data?.vendor || json.vendor);
      } else {
        addToast({
          type: 'error',
          title: 'Not Found',
          message: 'Vendor could not be loaded.',
        });
      }
    } catch (err) {
      console.error('Error fetching vendor:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendor();
  }, [vendorId]);

  const handleToggleStatus = async () => {
    if (!vendor || !vendorId) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          isActive: !vendor.isActive,
        }),
      });

      if (res.ok) {
        addToast({
          type: 'success',
          title: 'Status Updated',
          message: `Vendor is now ${!vendor.isActive ? 'Active' : 'Inactive'}.`,
        });
        fetchVendor();
      }
    } catch (err) {
      console.error('Error toggling vendor status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDocumentAction = async (docId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/vendors/documents', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          documentId: docId,
          status,
        }),
      });

      if (res.ok) {
        addToast({
          type: 'success',
          title: 'Document Updated',
          message: `Document status changed to ${status}.`,
        });
        fetchVendor();
      }
    } catch (err) {
      console.error('Error updating document:', err);
    }
  };

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

  if (!vendor) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold text-[#29252B]">Vendor Not Found</h2>
        <Link
          href="/admin/vendors"
          className="inline-flex items-center gap-2 mt-4 text-[#74189B] font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Vendors</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/vendors"
            className="p-2 rounded-xl bg-white border border-[#E9E3EB] hover:bg-slate-50 text-slate-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-[#29252B] tracking-tight">
                {vendor.name}
              </h1>
              <StatusBadge status={vendor.isActive ? 'APPROVED' : 'PENDING'} />
              <span className="px-2 py-0.5 rounded-full bg-[#FAF8FB] border border-[#E9E3EB] text-[10px] font-black text-[#74189B]">
                {vendor.tier}
              </span>
            </div>
            <p className="text-xs text-[#716975] mt-0.5 font-mono">
              /{vendor.slug} • Joined {new Date(vendor.createdAt).toLocaleDateString('en-AE')}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleStatus}
          disabled={actionLoading}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2 ${
            vendor.isActive
              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>{vendor.isActive ? 'Suspend Vendor' : 'Approve & Activate'}</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#E9E3EB] p-5 shadow-xs">
          <span className="text-[10px] font-bold text-[#716975] uppercase">Total Revenue</span>
          <p className="text-xl font-black text-[#74189B] mt-1">{formatAED(vendor.totalRevenue)}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E9E3EB] p-5 shadow-xs">
          <span className="text-[10px] font-bold text-[#716975] uppercase">Orders Fulfilled</span>
          <p className="text-xl font-black text-[#29252B] mt-1">{vendor.orders?.length || 0}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E9E3EB] p-5 shadow-xs">
          <span className="text-[10px] font-bold text-[#716975] uppercase">Products Listed</span>
          <p className="text-xl font-black text-[#29252B] mt-1">{vendor.products?.length || 0}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E9E3EB] p-5 shadow-xs">
          <span className="text-[10px] font-bold text-[#716975] uppercase">Verification Docs</span>
          <p className="text-xl font-black text-[#F1A51D] mt-1">{vendor.documents?.length || 0}</p>
        </div>
      </div>

      {/* Info Card: Owner & Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[#E9E3EB] p-5 shadow-xs space-y-2 text-xs">
          <h3 className="font-bold text-[#29252B] flex items-center gap-1.5 mb-2">
            <User className="w-4 h-4 text-[#74189B]" />
            <span>Owner Information</span>
          </h3>
          <p>
            <strong className="text-[#716975]">Name:</strong> {vendor.user?.name}
          </p>
          <p>
            <strong className="text-[#716975]">Email:</strong> {vendor.user?.email}
          </p>
          <p>
            <strong className="text-[#716975]">Account Status:</strong> {vendor.user?.status}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E9E3EB] p-5 shadow-xs space-y-2 text-xs">
          <h3 className="font-bold text-[#29252B] flex items-center gap-1.5 mb-2">
            <Store className="w-4 h-4 text-[#74189B]" />
            <span>Business Details</span>
          </h3>
          <p>
            <strong className="text-[#716975]">Phone:</strong> {vendor.phone || vendor.user?.phone || '—'}
          </p>
          <p>
            <strong className="text-[#716975]">Location:</strong> {vendor.location || 'Dubai, UAE'}
          </p>
          <p>
            <strong className="text-[#716975]">Description:</strong>{' '}
            {vendor.description || 'No description provided.'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E9E3EB] pb-2">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'products'
              ? 'bg-[#74189B] text-white shadow-xs'
              : 'text-[#716975] hover:bg-[#FAF8FB]'
          }`}
        >
          Products ({vendor.products?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'orders'
              ? 'bg-[#74189B] text-white shadow-xs'
              : 'text-[#716975] hover:bg-[#FAF8FB]'
          }`}
        >
          Orders ({vendor.orders?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'documents'
              ? 'bg-[#74189B] text-white shadow-xs'
              : 'text-[#716975] hover:bg-[#FAF8FB]'
          }`}
        >
          Documents ({vendor.documents?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('settlements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'settlements'
              ? 'bg-[#74189B] text-white shadow-xs'
              : 'text-[#716975] hover:bg-[#FAF8FB]'
          }`}
        >
          Settlements ({vendor.settlements?.length || 0})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-[#E9E3EB] overflow-hidden shadow-xs">
          {vendor.products.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#716975]">
              No products assigned to this vendor.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E9E3EB] bg-[#FAF8FB] text-[11px] font-bold text-[#716975] uppercase">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E3EB] text-xs">
                {vendor.products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF8FB]">
                    <td className="py-3.5 px-4 font-bold text-[#29252B]">{p.title}</td>
                    <td className="py-3.5 px-4 text-[#716975]">{p.type}</td>
                    <td className="py-3.5 px-4 font-black">{formatAED(p.price)}</td>
                    <td className="py-3.5 px-4">{p.stock} units</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={p.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="text-xs font-bold text-[#74189B] hover:underline"
                      >
                        Edit &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-[#E9E3EB] overflow-hidden shadow-xs">
          {vendor.orders.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#716975]">
              No orders fulfilled by this vendor.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E9E3EB] bg-[#FAF8FB] text-[11px] font-bold text-[#716975] uppercase">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E3EB] text-xs">
                {vendor.orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FAF8FB]">
                    <td className="py-3.5 px-4 font-bold text-[#74189B]">#{ord.orderNumber}</td>
                    <td className="py-3.5 px-4">{ord.user?.name || 'Customer'}</td>
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

      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-[#E9E3EB] p-5 shadow-xs">
          {vendor.documents.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#716975]">
              No verification documents uploaded by this vendor.
            </div>
          ) : (
            <div className="divide-y divide-[#E9E3EB]">
              {vendor.documents.map((doc) => (
                <div key={doc.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#74189B]" />
                      <span className="font-bold text-xs text-[#29252B]">{doc.type}</span>
                      <StatusBadge status={doc.status} />
                    </div>
                    {doc.notes && (
                      <p className="text-[11px] text-[#716975] mt-0.5">{doc.notes}</p>
                    )}
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#74189B] hover:underline mt-1 block"
                    >
                      View Document URL &rarr;
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDocumentAction(doc.id, 'APPROVED')}
                      className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDocumentAction(doc.id, 'REJECTED')}
                      className="px-3 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settlements' && (
        <div className="bg-white rounded-2xl border border-[#E9E3EB] overflow-hidden shadow-xs">
          {vendor.settlements.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#716975]">
              No settlements recorded for this vendor.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E9E3EB] bg-[#FAF8FB] text-[11px] font-bold text-[#716975] uppercase">
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Gross Amount</th>
                  <th className="py-3 px-4">Commission</th>
                  <th className="py-3 px-4">Net Payout</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E3EB] text-xs">
                {vendor.settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-[#FAF8FB]">
                    <td className="py-3.5 px-4 font-bold">{s.period}</td>
                    <td className="py-3.5 px-4 font-black">{formatAED(s.amount)}</td>
                    <td className="py-3.5 px-4 text-[#716975]">{formatAED(s.commission)}</td>
                    <td className="py-3.5 px-4 font-black text-emerald-600">
                      {formatAED(s.amount - s.commission)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={s.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
