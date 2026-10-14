'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Store, 
  Package, 
  TrendingUp, 
  Calendar,
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { useToast } from '@/components/admin/Toast';

interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalVendors: number;
  totalProducts: number;
  lowStockCount: number;
  pendingReviews: number;
  averageOrderValue: number;
}

export default function AdminReportsPage() {
  const { showToast } = useToast();
  const [stats, setStats] = useState<AdminStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalVendors: 0,
    totalProducts: 0,
    lowStockCount: 0,
    pendingReviews: 0,
    averageOrderValue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportingType, setExportingType] = useState<string | null>(null);

  useEffect(() => {
    fetchReportsData();
  }, []);

  const downloadCsv = (filename: string, rows: (string | number)[][]) => {
    const csvContent = rows.map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [statsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/orders?pageSize=10', { headers }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success && statsData.data) {
          const d = statsData.data;
          setStats({
            totalRevenue: Number(d.totalRevenue || 0),
            totalOrders: Number(d.totalOrders || 0),
            totalUsers: Number(d.totalUsers || 0),
            totalVendors: Number(d.totalVendors || 0),
            totalProducts: Number(d.totalProducts || 0),
            lowStockCount: Number(d.lowStockCount ?? d.lowStockProducts ?? 0),
            pendingReviews: Number(d.pendingReviews || 0),
            averageOrderValue: Number(d.averageOrderValue || 0),
          });
        }
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        const rawOrders = ordersData.data || ordersData.orders || [];
        if (Array.isArray(rawOrders)) {
          setRecentOrders(
            rawOrders.map((o: any) => ({
              ...o,
              total: Number(o.totalAmount ?? o.total ?? 0),
              totalAmount: Number(o.totalAmount ?? o.total ?? 0),
            }))
          );
        }
      }
    } catch (err) {
      console.error('Failed to load reports data:', err);
      showToast('Failed to load analytical reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportSummaryCsv = () => {
    setExportingType('summary');
    try {
      const rows = [
        ['SheeshaTonight - Platform Analytics & Financial Summary'],
        [`Generated On: "${new Date().toLocaleString()}"`],
        [''],
        ['Metric', 'Value'],
        ['Gross Platform Revenue (AED)', Number(stats.totalRevenue || 0).toFixed(2)],
        ['Total Orders Processed', String(stats.totalOrders || 0)],
        ['Average Order Value (AED)', Number(stats.averageOrderValue || 0).toFixed(2)],
        ['Total Registered Users', String(stats.totalUsers || 0)],
        ['Verified Store Vendors', String(stats.totalVendors || 0)],
        ['Total Products in Catalogue', String(stats.totalProducts || 0)],
        ['Low Stock Inventory Items', String(stats.lowStockCount ?? 0)],
        ['Pending Product Reviews', String(stats.pendingReviews || 0)],
      ];

      downloadCsv(
        `sheeshatonight_executive_summary_${new Date().toISOString().substring(0, 10)}.csv`,
        rows
      );
      showToast('Executive Summary CSV exported successfully!', 'success');
    } catch (err) {
      console.error('Failed to export summary CSV:', err);
      showToast('Failed to generate CSV export', 'error');
    } finally {
      setExportingType(null);
    }
  };

  const exportOrdersCsv = async () => {
    setExportingType('orders');
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/orders?pageSize=100', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      const orders = data.data || [];

      const rows = [
        ['Order ID', 'Customer Name', 'Customer Email', 'Status', 'Payment Method', 'Payment Status', 'Total (AED)', 'Date'],
        ...orders.map((o: any) => [
          `"${o.id || ''}"`,
          `"${o.user?.name || 'Customer'}"`,
          `"${o.user?.email || 'N/A'}"`,
          `"${o.status || 'PENDING'}"`,
          `"${o.paymentMethod || 'CARD'}"`,
          `"${o.paymentStatus || 'COMPLETED'}"`,
          Number(o.totalAmount ?? o.total ?? 0).toFixed(2),
          `"${new Date(o.createdAt || Date.now()).toISOString()}"`,
        ]),
      ];

      downloadCsv(
        `sheeshatonight_orders_ledger_${new Date().toISOString().substring(0, 10)}.csv`,
        rows
      );
      showToast('Orders Ledger CSV exported successfully!', 'success');
    } catch (err) {
      console.error('Failed to export orders CSV:', err);
      showToast('Failed to export orders ledger', 'error');
    } finally {
      setExportingType(null);
    }
  };

  const exportCustomersCsv = async () => {
    setExportingType('customers');
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/customers?pageSize=100', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      const customers = data.data || [];

      const rows = [
        ['User ID', 'Name', 'Email', 'Role', 'Total Orders', 'Total Spent (AED)', 'Joined Date'],
        ...customers.map((c: any) => [
          `"${c.id || ''}"`,
          `"${c.name || 'Customer'}"`,
          `"${c.email || 'N/A'}"`,
          `"${c.role || 'CUSTOMER'}"`,
          c.ordersCount ?? c.orderCount ?? 0,
          Number(c.totalSpent || 0).toFixed(2),
          `"${new Date(c.createdAt || Date.now()).toISOString()}"`,
        ]),
      ];

      downloadCsv(
        `sheeshatonight_customers_directory_${new Date().toISOString().substring(0, 10)}.csv`,
        rows
      );
      showToast('Customer Directory CSV exported successfully!', 'success');
    } catch (err) {
      console.error('Failed to export customers CSV:', err);
      showToast('Failed to export customer directory', 'error');
    } finally {
      setExportingType(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Financial & Platform Reports</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#74189B]/10 text-[#74189B]">
              Aggregated from MySQL
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Audit revenue performance, average order metrics, store distribution, and export data ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchReportsData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
            title="Refresh reports"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={exportSummaryCsv}
            disabled={exportingType === 'summary'}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
          >
            <Download size={15} className="text-[#74189B]" />
            Summary CSV
          </button>
          <button
            onClick={exportOrdersCsv}
            disabled={exportingType === 'orders'}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-[#74189B] text-white hover:bg-[#571275] transition shadow-md shadow-purple-900/10 disabled:opacity-50"
          >
            <FileSpreadsheet size={15} className="text-[#F1A51D]" />
            Orders Ledger CSV
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Gross Platform Revenue"
          value={`AED ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          subtitle="All paid and completed orders"
          highlight={true}
        />
        <StatCard
          title="Completed Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          subtitle={`Average: AED ${stats.averageOrderValue.toFixed(0)} / order`}
        />
        <StatCard
          title="Registered Customers"
          value={stats.totalUsers}
          icon={Users}
          subtitle="Active customer accounts in database"
        />
        <StatCard
          title="Active Vendors & Stores"
          value={stats.totalVendors}
          icon={Store}
          subtitle="Approved UAE rental & shop vendors"
        />
      </div>


      {/* Deep Dive Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Health Summary */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Financial Breakdown</h2>
            <DollarSign size={18} className="text-[#74189B]" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-700">Gross Sales</p>
                <p className="text-[11px] text-slate-400">Total transaction volume</p>
              </div>
              <span className="text-sm font-black text-slate-900 font-mono">
                AED {stats.totalRevenue.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-700">Average Order Value (AOV)</p>
                <p className="text-[11px] text-slate-400">Revenue per order</p>
              </div>
              <span className="text-sm font-black text-[#74189B] font-mono">
                AED {stats.averageOrderValue.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-700">Estimated Commission (10%)</p>
                <p className="text-[11px] text-slate-400">Platform marketplace fee</p>
              </div>
              <span className="text-sm font-black text-emerald-600 font-mono">
                AED {(stats.totalRevenue * 0.1).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Inventory & Operations Alert */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Inventory & Catalogue</h2>
            <Package size={18} className="text-[#F1A51D]" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-700">Catalogue Products</p>
                <p className="text-[11px] text-slate-400">Active rental & retail items</p>
              </div>
              <span className="text-sm font-black text-slate-900 font-mono">
                {stats.totalProducts} Items
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50/50 border border-amber-200">
              <div>
                <p className="text-xs font-bold text-amber-900">Low Stock Warning (≤ 5 units)</p>
                <p className="text-[11px] text-amber-700">Urgent restock required</p>
              </div>
              <span className="text-sm font-black text-amber-900 font-mono">
                {stats.lowStockCount} Products
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-700">Customer Reviews Pending</p>
                <p className="text-[11px] text-slate-400">Awaiting admin moderation</p>
              </div>
              <span className="text-sm font-black text-slate-900 font-mono">
                {stats.pendingReviews}
              </span>
            </div>
          </div>
        </div>

        {/* Data Exports Suite */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Export Raw Reports</h2>
            <Download size={18} className="text-emerald-600" />
          </div>

          <div className="space-y-3">
            <button
              onClick={exportSummaryCsv}
              disabled={exportingType === 'summary'}
              className="w-full p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition flex items-center justify-between text-left group"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-[#74189B] transition">Executive Platform Summary</p>
                <p className="text-[11px] text-slate-400">High-level KPIs & gross margins</p>
              </div>
              <ArrowUpRight size={16} className="text-slate-400 group-hover:text-[#74189B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </button>

            <button
              onClick={exportOrdersCsv}
              disabled={exportingType === 'orders'}
              className="w-full p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition flex items-center justify-between text-left group"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-[#74189B] transition">Comprehensive Orders Ledger</p>
                <p className="text-[11px] text-slate-400">Transaction IDs, customer info, statuses</p>
              </div>
              <ArrowUpRight size={16} className="text-slate-400 group-hover:text-[#74189B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </button>

            <button
              onClick={exportCustomersCsv}
              disabled={exportingType === 'customers'}
              className="w-full p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition flex items-center justify-between text-left group"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-[#74189B] transition">Customer Accounts Directory</p>
                <p className="text-[11px] text-slate-400">Lifetime orders & user emails</p>
              </div>
              <ArrowUpRight size={16} className="text-slate-400 group-hover:text-[#74189B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Orders Ledger Table Preview */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Transactions Sample</h2>
            <p className="text-xs text-slate-500 mt-0.5">Most recent order records pulled from database</p>
          </div>
          <button
            onClick={exportOrdersCsv}
            className="text-xs font-bold text-[#74189B] hover:underline flex items-center gap-1"
          >
            Export All Orders <ArrowUpRight size={13} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5">Order ID</th>
                <th className="py-3 px-5">Customer</th>
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5">Payment</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No orders logged in database yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                      #{o.id.substring(0, 8)}
                    </td>
                    <td className="py-3.5 px-5">
                      <p className="font-bold text-slate-900">{o.user?.name || 'Customer'}</p>
                      <p className="text-[11px] text-slate-400">{o.user?.email || 'N/A'}</p>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-mono text-[11px] font-bold text-slate-700 uppercase">
                        {o.paymentMethod || 'CARD'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-black font-mono text-slate-900">
                      AED {Number(o.totalAmount ?? o.total ?? 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
