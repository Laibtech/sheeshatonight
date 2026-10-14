'use client';

import React, { useEffect, useState } from 'react';
import { Star, CheckCircle2, XCircle, Trash2, MessageSquare, AlertCircle } from 'lucide-react';
import { DataTable, Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { useToast } from '@/components/admin/Toast';

interface ReviewRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  productId?: string | null;
  productTitle?: string | null;
  vendorId?: string | null;
  vendorName?: string | null;
  rating: number;
  comment?: string | null;
  status: string;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const { addToast } = useToast();

  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [deleteTarget, setDeleteTarget] = useState<ReviewRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};


      const url = statusFilter !== 'ALL'
        ? `/api/admin/reviews?status=${statusFilter}`
        : '/api/admin/reviews';

      const res = await fetch(url, { headers });
      if (res.ok) {
        const json = await res.json();
        setReviews(json.data?.reviews || json.reviews || []);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        addToast({
          type: 'success',
          title: 'Review Moderated',
          message: `Review was marked as ${newStatus}.`,
        });
        fetchReviews();
      }
    } catch (err) {
      console.error('Error updating review:', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/admin/reviews/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        addToast({
          type: 'success',
          title: 'Review Deleted',
          message: 'Review was permanently removed.',
        });
        setDeleteTarget(null);
        fetchReviews();
      }
    } catch (err) {
      console.error('Error deleting review:', err);
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<ReviewRecord>[] = [
    {
      header: 'Customer',
      cell: (row) => (
        <div>
          <p className="font-bold text-[#29252B]">{row.userName}</p>
          <p className="text-[11px] text-[#716975]">{row.userEmail}</p>
        </div>
      ),
    },
    {
      header: 'Item Reviewed',
      cell: (row) => (
        <div>
          <p className="font-bold text-[#29252B]">
            {row.productTitle ? `Product: ${row.productTitle}` : `Vendor: ${row.vendorName || 'Vendor'}`}
          </p>
        </div>
      ),
    },
    {
      header: 'Rating',
      cell: (row) => (
        <div className="flex items-center gap-1 text-amber-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < row.rating ? 'fill-current' : 'text-slate-200'
              }`}
            />
          ))}
          <span className="text-xs font-bold text-[#29252B] ml-1">({row.rating}/5)</span>
        </div>
      ),
    },
    {
      header: 'Review Comment',
      cell: (row) => (
        <p className="text-xs text-[#29252B] italic line-clamp-2 max-w-sm">
          &quot;{row.comment || 'No written comment.'}&quot;
        </p>
      ),
    },
    {
      header: 'Date',
      cell: (row) => (
        <span className="text-[#716975]">
          {new Date(row.createdAt).toLocaleDateString('en-AE', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status !== 'APPROVED' && (
            <button
              onClick={() => handleStatusUpdate(row.id, 'APPROVED')}
              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition"
            >
              Approve
            </button>
          )}

          {row.status !== 'REJECTED' && (
            <button
              onClick={() => handleStatusUpdate(row.id, 'REJECTED')}
              className="px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg text-xs font-bold transition"
            >
              Reject
            </button>
          )}

          <button
            onClick={() => setDeleteTarget(row)}
            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Delete Review"
          >
            <Trash2 className="w-4 h-4" />
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
              Customer Reviews Moderation
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#74189B]/10 text-[#74189B] text-xs font-bold border border-[#74189B]/20">
              {reviews.length} Reviews
            </span>
          </div>
          <p className="text-xs text-[#716975] mt-1">
            Review, approve, or reject customer feedback on products and vendors across UAE.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
              statusFilter === status
                ? 'bg-[#74189B] text-white border-[#74189B] shadow-xs'
                : 'bg-white text-[#716975] border-[#E9E3EB] hover:bg-[#FAF8FB]'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={reviews}
        loading={loading}
        emptyTitle="No reviews found"
        emptyDescription="Customer product and vendor reviews will appear here for moderation."
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Review"
        message="Are you sure you want to permanently delete this customer review?"
        confirmText="Delete Review"
        isDangerous={true}
        loading={deleting}
      />
    </div>
  );
}
