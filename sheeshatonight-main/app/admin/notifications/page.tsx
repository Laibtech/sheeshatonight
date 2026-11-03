'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  Send, 
  CheckCheck, 
  Check, 
  Clock, 
  ShieldAlert, 
  ShoppingBag, 
  Store, 
  Info, 
  Plus, 
  RefreshCw,
  X,
  Loader2,
  Trash2,
  RotateCcw,
  Search
} from 'lucide-react';
import { EmptyState } from '@/components/admin/EmptyState';
import { TableSkeleton } from '@/components/admin/LoadingSkeleton';
import { useToast } from '@/components/admin/Toast';

interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: string | null;
  read: boolean;
  createdAt: string;
}

interface NotificationCounts {
  all: number;
  unread: number;
  read: number;
}

export default function AdminNotificationsPage() {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filteredTotal, setFilteredTotal] = useState(0);

  // Global persistent notification counts from the database
  const [counts, setCounts] = useState<NotificationCounts>({
    all: 0,
    unread: 0,
    read: 0,
  });

  // Send Broadcast / Notification Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState<'ALL' | 'VENDORS' | 'CUSTOMERS'>('ALL');
  const [type, setType] = useState('SYSTEM');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (activeFilter = filter, activePage = page, activeSearch = search) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams({
        page: activePage.toString(),
        pageSize: '15',
      });

      if (activeFilter === 'UNREAD') params.append('read', 'false');
      if (activeFilter === 'READ') params.append('read', 'true');
      if (activeSearch.trim()) params.append('search', activeSearch.trim());

      const res = await fetch(`/api/admin/notifications?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      if (data.success) {
        setNotifications(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setFilteredTotal(data.pagination?.total || 0);

        // ALWAYS maintain and update the true complete database counts
        if (data.counts) {
          setCounts({
            all: Number(data.counts.all) || 0,
            unread: Number(data.counts.unread) || 0,
            read: Number(data.counts.read) || 0,
          });
        }
      } else {
        showToast(data.message || 'Failed to load notifications', 'error');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      showToast('Error loading notifications', 'error');
    } finally {
      setLoading(false);
    }
  }, [filter, page, search, showToast]);

  useEffect(() => {
    fetchNotifications(filter, page, search);
  }, [filter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchNotifications(filter, 1, search);
  };

  const handleToggleRead = async (id: string, currentReadState: boolean) => {
    try {
      setActionLoadingId(id);
      const token = localStorage.getItem('auth_token');
      const targetRead = !currentReadState;

      const res = await fetch('/api/admin/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id, read: targetRead }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.counts) {
          setCounts(data.counts);
        } else {
          setCounts((prev) => ({
            all: prev.all,
            unread: targetRead ? Math.max(0, prev.unread - 1) : prev.unread + 1,
            read: targetRead ? prev.read + 1 : Math.max(0, prev.read - 1),
          }));
        }

        showToast(
          targetRead ? 'Notification marked as read' : 'Notification marked as unread',
          'success'
        );

        // Refresh current list so tabs filter correctly
        fetchNotifications(filter, page, search);
      } else {
        showToast(data.message || 'Failed to update notification', 'error');
      }
    } catch (err) {
      showToast('Failed to update notification', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ readAll: true }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.counts) {
          setCounts(data.counts);
        } else {
          setCounts((prev) => ({
            all: prev.all,
            unread: 0,
            read: prev.all,
          }));
        }

        showToast('All notifications marked as read', 'success');
        fetchNotifications(filter, 1, search);
      } else {
        showToast(data.message || 'Failed to mark all as read', 'error');
      }
    } catch (err) {
      showToast('Failed to mark all as read', 'error');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this notification record?')) {
      return;
    }

    try {
      setActionLoadingId(id);
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/admin/notifications?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      if (data.success) {
        if (data.counts) {
          setCounts(data.counts);
        }
        showToast('Notification deleted successfully', 'success');
        fetchNotifications(filter, page, search);
      } else {
        showToast(data.message || 'Failed to delete notification', 'error');
      }
    } catch (err) {
      showToast('Failed to delete notification', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast('Please fill in title and message', 'error');
      return;
    }

    try {
      setSending(true);
      const token = localStorage.getItem('auth_token');

      // Fetch user ID to associate system notification
      const userRes = await fetch('/api/admin/customers?pageSize=1', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const userData = await userRes.json();
      const fallbackUserId = userData?.data?.[0]?.id;

      if (!fallbackUserId) {
        showToast('No user record found to anchor notification', 'error');
        return;
      }

      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userId: fallbackUserId,
          type,
          title,
          message,
          data: { targetRole },
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('System announcement broadcast successfully!', 'success');
        setIsModalOpen(false);
        setTitle('');
        setMessage('');

        if (data.counts) {
          setCounts(data.counts);
        }

        fetchNotifications(filter, 1, search);
      } else {
        showToast(data.message || 'Failed to broadcast notification', 'error');
      }
    } catch (err) {
      showToast('Failed to broadcast notification', 'error');
    } finally {
      setSending(false);
    }
  };

  const getTypeIcon = (nType: string) => {
    switch (nType.toUpperCase()) {
      case 'ORDER':
      case 'ORDER_STATUS':
        return <ShoppingBag size={16} className="text-blue-600" />;
      case 'VENDOR':
        return <Store size={16} className="text-[#F1A51D]" />;
      case 'SECURITY':
        return <ShieldAlert size={16} className="text-rose-600" />;
      default:
        return <Info size={16} className="text-[#74189B]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Notifications & Alerts</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#74189B]/10 text-[#74189B]">
              {counts.all} Total
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time event logs, order notifications, vendor updates, and marketplace announcements.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => fetchNotifications(filter, page, search)}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-xs disabled:opacity-50 cursor-pointer"
            title="Refresh notifications"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleMarkAllRead}
            disabled={counts.unread === 0 || loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <CheckCheck size={16} className="text-emerald-600" />
            Mark All Read
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-[#74189B] text-white hover:bg-[#571275] transition shadow-md shadow-purple-900/10 cursor-pointer"
          >
            <Plus size={16} />
            Send Announcement
          </button>
        </div>
      </div>

      {/* Filter Tabs & Quick Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Persistent Tab Counters (All, Unread, Read) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-1.5 flex items-center gap-1.5 w-fit">
          <button
            type="button"
            onClick={() => {
              if (filter !== 'ALL') {
                setFilter('ALL');
                setPage(1);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer select-none ${
              filter === 'ALL'
                ? 'bg-[#74189B] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>All</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                filter === 'ALL'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (filter !== 'UNREAD') {
                setFilter('UNREAD');
                setPage(1);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer select-none ${
              filter === 'UNREAD'
                ? 'bg-[#74189B] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>Unread</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                filter === 'UNREAD'
                  ? 'bg-white/20 text-white'
                  : counts.unread > 0
                  ? 'bg-[#F1A51D] text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {counts.unread}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (filter !== 'READ') {
                setFilter('READ');
                setPage(1);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer select-none ${
              filter === 'READ'
                ? 'bg-[#74189B] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>Read</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                filter === 'READ'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {counts.read}
            </span>
          </button>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search alerts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#74189B]/20 focus:border-[#74189B]"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setPage(1);
                fetchNotifications(filter, 1, '');
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </form>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={5} cols={4} />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            title="No notifications recorded"
            description={
              filter === 'UNREAD'
                ? "You're all caught up! There are no unread system alerts in the database."
                : filter === 'READ'
                ? 'No read notifications found. Mark an unread notification to see it archived here.'
                : 'No platform notifications or alerts have been generated in the database yet.'
            }
            actionLabel="Send Announcement"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-5 flex items-start gap-4 transition hover:bg-slate-50/70 ${
                  !n.read ? 'bg-purple-50/30' : ''
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    !n.read ? 'bg-purple-100/70' : 'bg-slate-100'
                  }`}
                >
                  {getTypeIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-slate-900 text-sm">{n.title}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 uppercase font-mono">
                      {n.type}
                    </span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-[#74189B] shrink-0" title="Unread" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                    <Clock size={12} />
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggleRead(n.id, n.read)}
                    disabled={actionLoadingId === n.id}
                    className={`p-2 rounded-lg transition ${
                      !n.read
                        ? 'text-slate-400 hover:text-emerald-700 hover:bg-emerald-50'
                        : 'text-slate-400 hover:text-purple-700 hover:bg-purple-50'
                    }`}
                    title={n.read ? 'Mark as unread' : 'Mark as read'}
                  >
                    {actionLoadingId === n.id ? (
                      <Loader2 size={16} className="animate-spin text-slate-400" />
                    ) : n.read ? (
                      <RotateCcw size={15} />
                    ) : (
                      <Check size={16} />
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteNotification(n.id)}
                    disabled={actionLoadingId === n.id}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete notification"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing Page {page} of {totalPages} ({filteredTotal} matching)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 font-bold cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 font-bold cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Broadcast Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-[#74189B]" />
                <h3 className="font-bold text-slate-900">Send System Announcement</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Audience</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#74189B]/20 focus:border-[#74189B]"
                >
                  <option value="ALL">All Marketplace Users</option>
                  <option value="VENDORS">Vendors Only</option>
                  <option value="CUSTOMERS">Customers Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Notification Category</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#74189B]/20 focus:border-[#74189B]"
                >
                  <option value="SYSTEM">System Announcement</option>
                  <option value="ORDER">Order Update</option>
                  <option value="VENDOR">Vendor Alert</option>
                  <option value="SECURITY">Security Advisory</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Scheduled Maintenance Notice"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#74189B]/20 focus:border-[#74189B]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Message Content</label>
                <textarea
                  placeholder="Enter message details for recipients..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#74189B]/20 focus:border-[#74189B]"
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-[#74189B] text-white hover:bg-[#571275] transition shadow-md shadow-purple-900/10 disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Broadcasting...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Broadcast Now
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
