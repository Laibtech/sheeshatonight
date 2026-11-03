'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Store, Eye, CheckCircle2, XCircle, ShieldCheck, FileText, Trash2 } from 'lucide-react';
import { DataTable, Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { useToast } from '@/components/admin/Toast';

interface VendorRecord {
  id: string;
  name: string;
  slug: string;
  tier: string;
  isActive: boolean;
  location?: string;
  phone?: string;
  productsCount: number;
  ordersCount: number;
  revenue: number;
  createdAt: string;
  user?: {
    name: string;
    email: string;
    phone?: string;
    kycStatus: string;
  };
}

function VendorsContent() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');
  const { addToast } = useToast();

  const [vendors, setVendors] = useState<VendorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState(
    statusParam === 'pending' ? 'false' : 'ALL'
  );
  const [tierFilter, setTierFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVendors, setTotalVendors] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<VendorRecord | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [forceDelete, setForceDelete] = useState(false);

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};


      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('pageSize', '10');
      if (search) params.set('search', search);
      if (activeFilter !== 'ALL') params.set('isActive', activeFilter);
      if (tierFilter !== 'ALL') params.set('tier', tierFilter);

      const res = await fetch(`/api/admin/vendors?${params.toString()}`, { headers });
      if (res.ok) {
        const json = await res.json();
        const vendorList = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.data?.data)
          ? json.data.data
          : Array.isArray(json.vendors)
          ? json.vendors
          : [];
        setVendors(vendorList);

        const pag = json.pagination || json.data?.pagination;
        if (pag) {
          setTotalPages(pag.totalPages || 1);
          setTotalVendors(pag.total || vendorList.length || 0);
        } else {
          setTotalVendors(vendorList.length);
        }
      }
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, activeFilter, tierFilter]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const formatAED = (amount: number = 0) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleDeleteVendor = async (force = false) => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      const token = localStorage.getItem('auth_token');
      const url = `/api/admin/vendors/${deleteTarget.id}${force ? '?force=true' : ''}`;
      const res = await fetch(url, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        addToast({
          type: 'success',
          title: 'Vendor Deleted',
          message: data.message || `Vendor "${deleteTarget.name}" was successfully deleted.`,
        });
        setDeleteTarget(null);
        setForceDelete(false);
        fetchVendors();
      } else if (data.requiresForce) {
        setForceDelete(true);
      } else {
        addToast({
          type: 'error',
          title: 'Delete Failed',
          message: data.error || data.message || 'Failed to delete vendor',
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: err.message || 'Network error occurred while deleting vendor',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<VendorRecord>[] = [
    {
      header: 'Business Name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#74189B] border border-purple-100 flex items-center justify-center flex-shrink-0 font-bold text-xs">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <Link
              href={`/admin/vendors/${row.id}`}
              className="font-bold text-[#29252B] hover:text-[#74189B] transition block"
            >
              {row.name}
            </Link>
            <p className="text-[11px] text-[#716975] font-mono">/{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Owner',
      cell: (row) => (
        <div>
          <p className="font-bold text-[#29252B]">{row.user?.name || 'Owner'}</p>
          <p className="text-[11px] text-[#716975]">{row.user?.email}</p>
        </div>
      ),
    },
    {
      header: 'Tier',
      cell: (row) => (
        <span className="px-2.5 py-0.5 rounded-full bg-[#FAF8FB] border border-[#E9E3EB] text-[10px] font-black text-[#74189B] uppercase">
          {row.tier}
        </span>
      ),
    },
    {
      header: 'Products',
      cell: (row) => <span className="font-bold">{row.productsCount}</span>,
    },
    {
      header: 'Orders',
      cell: (row) => <span className="font-bold">{row.ordersCount}</span>,
    },
    {
      header: 'Revenue',
      cell: (row) => (
        <span className="font-black text-[#29252B]">
          {formatAED(row.revenue)}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => (
        <StatusBadge status={row.isActive ? 'APPROVED' : 'PENDING'} />
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/admin/vendors/${row.id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAF8FB] hover:bg-[#74189B] text-[#74189B] hover:text-white border border-[#E9E3EB] text-xs font-bold transition shadow-xs"
            title="Manage Vendor"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Manage</span>
          </Link>

          <button
            onClick={() => {
              setDeleteTarget(row);
              setForceDelete(false);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition"
            title="Delete Vendor"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#29252B] tracking-tight">
              Vendors Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#74189B]/10 text-[#74189B] text-xs font-bold border border-[#74189B]/20">
              {totalVendors} Vendors
            </span>
          </div>
          <p className="text-xs text-[#716975] mt-1">
            Registered sheesha providers, rental specialists, and event partners across UAE.
          </p>
        </div>

        <Link
          href="/admin/vendors/documents"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-[#E9E3EB] text-xs font-bold text-[#74189B] transition shadow-xs"
        >
          <FileText className="w-4 h-4" />
          <span>Verification Documents</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={activeFilter}
          onChange={(e) => {
            setActiveFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 bg-white border border-[#E9E3EB] rounded-xl text-xs font-semibold text-[#29252B] focus:outline-none focus:border-[#74189B]"
        >
          <option value="ALL">All Vendor Statuses</option>
          <option value="true">Active / Approved</option>
          <option value="false">Pending Approval</option>
        </select>

        <select
          value={tierFilter}
          onChange={(e) => {
            setTierFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 bg-white border border-[#E9E3EB] rounded-xl text-xs font-semibold text-[#29252B] focus:outline-none focus:border-[#74189B]"
        >
          <option value="ALL">All Tiers</option>
          <option value="SOLO">Solo Tier</option>
          <option value="MASTER">Master Tier</option>
          <option value="ADVANCED">Advanced Tier</option>
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={vendors}
        loading={loading}
        emptyTitle="No vendors found"
        emptyDescription="Vendor applications will appear here as partners apply to join."
        searchPlaceholder="Search vendor name, owner, email..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalVendors}
        onPageChange={setPage}
      />

      {/* Delete Vendor Confirmation Modal */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => {
            setDeleteTarget(null);
            setForceDelete(false);
          }}
          onConfirm={() => handleDeleteVendor(forceDelete)}
          title={forceDelete ? 'Warning: Vendor Has Active Orders' : 'Delete Vendor Store'}
          message={
            forceDelete
              ? `Vendor "${deleteTarget.name}" has ${deleteTarget.ordersCount || 'existing'} order(s). Confirming permanent deletion will completely remove this vendor along with all associated historical order records and products. Are you sure you wish to proceed?`
              : `Are you sure you want to permanently delete vendor "${deleteTarget.name}"? This will remove the store profile, unpublish catalog items, and demote the account.`
          }
          confirmLabel={forceDelete ? 'Force Delete Vendor' : 'Delete Vendor'}
          cancelText="Cancel"
          isDanger={true}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}

export default function AdminVendorsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-[#716975] text-sm animate-pulse">
          Loading vendors directory...
        </div>
      }
    >
      <VendorsContent />
    </Suspense>
  );
}
