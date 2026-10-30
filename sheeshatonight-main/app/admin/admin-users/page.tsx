'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/GlassCard';
import {
  Award,
  ShieldCheck,
  RefreshCw,
  UserPlus,
  Shield,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Key,
  Users,
  Search,
  Lock,
  Mail,
  Phone,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/components/admin/Toast';

interface AdminPermissions {
  cms?: boolean;
  products?: boolean;
  rentals?: boolean;
  vendors?: boolean;
  customers?: boolean;
  orders?: boolean;
  marketing?: boolean;
  finance?: boolean;
  settings?: boolean;
}

interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  adminRole?: string;
  adminPermissions?: AdminPermissions | null;
  status: string;
  createdAt: string;
}

const ALL_MODULES: { key: keyof AdminPermissions; label: string; desc: string }[] = [
  { key: 'cms', label: 'Website CMS & Builder', desc: 'Homepage, banners, pages, blogs, FAQs, media' },
  { key: 'products', label: 'Products & Catalog', desc: 'Catalog products, pricing, stock, categories' },
  { key: 'rentals', label: 'Rentals Marketplace', desc: 'Rental packages, equipment, hourly/daily rates' },
  { key: 'vendors', label: 'Vendor Management', desc: 'Vendor KYC, tiers, commission rates, approval' },
  { key: 'customers', label: 'Customer Management', desc: 'Customer accounts, 18+ verification, history' },
  { key: 'orders', label: 'Orders & Rental Bookings', desc: 'Order fulfillment, returns, refunds, dispatch' },
  { key: 'marketing', label: 'Promotions & Coupons', desc: 'Discount coupons, campaigns, limits' },
  { key: 'finance', label: 'Finance & Payouts', desc: 'Revenue analytics, vendor commissions, settlements' },
  { key: 'settings', label: 'Platform Settings', desc: 'Branding, staff management, payment gates' },
];

const ROLE_PRESETS: Record<string, AdminPermissions> = {
  SUPER_ADMIN: {
    cms: true,
    products: true,
    rentals: true,
    vendors: true,
    customers: true,
    orders: true,
    marketing: true,
    finance: true,
    settings: true,
  },
  ADMIN_MANAGER: {
    cms: true,
    products: true,
    rentals: true,
    vendors: true,
    customers: true,
    orders: true,
    marketing: true,
    finance: false,
    settings: false,
  },
  ACCOUNTANT: {
    cms: false,
    products: false,
    rentals: false,
    vendors: true,
    customers: false,
    orders: true,
    marketing: false,
    finance: true,
    settings: false,
  },
  ORDER_PROCESSOR: {
    cms: false,
    products: true,
    rentals: true,
    vendors: false,
    customers: true,
    orders: true,
    marketing: false,
    finance: false,
    settings: false,
  },
};

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const [adminUsers, setAdminUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [adminRole, setAdminRole] = useState('ADMIN_MANAGER');
  const [status, setStatus] = useState('ACTIVE');
  const [permissions, setPermissions] = useState<AdminPermissions>(ROLE_PRESETS.ADMIN_MANAGER || {});

  const getAuthToken = () => {
    if (typeof window === 'undefined') return '';
    let token = localStorage.getItem('auth_token');
    if (!token) {
      const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
      if (match && match[1]) token = decodeURIComponent(match[1]);
    }
    return token || '';
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const fetchAdminUsers = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const res = await fetch('/api/admin/users?role=ADMIN', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setAdminUsers(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin users:', err);
      showToast('Failed to load administrator accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setAdminRole('ADMIN_MANAGER');
    setStatus('ACTIVE');
    setPermissions(ROLE_PRESETS.ADMIN_MANAGER || {});
    setIsModalOpen(true);
  };

  const openEditModal = (u: AdminUserItem) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPhone(u.phone || '');
    setPassword('');
    setAdminRole(u.adminRole || 'ADMIN_MANAGER');
    setStatus(u.status || 'ACTIVE');

    let userPerms = ROLE_PRESETS[u.adminRole || 'ADMIN_MANAGER'] || {};
    if (u.adminPermissions && typeof u.adminPermissions === 'object') {
      userPerms = { ...userPerms, ...u.adminPermissions };
    }
    setPermissions(userPerms);
    setIsModalOpen(true);
  };

  const handleRolePresetChange = (r: string) => {
    setAdminRole(r);
    if (ROLE_PRESETS[r]) {
      setPermissions(ROLE_PRESETS[r]);
    }
  };

  const handleTogglePermission = (key: keyof AdminPermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      if (editingUser) {
        // Update user
        const res = await fetch('/api/admin/users', {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            id: editingUser.id,
            name,
            phone,
            adminRole,
            adminPermissions: permissions,
            status,
            password: password ? password : undefined,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast('Staff permissions updated successfully in MySQL!', 'success');
          setIsModalOpen(false);
          fetchAdminUsers();
        } else {
          showToast(data.message || 'Failed to update user', 'error');
        }
      } else {
        // Create user
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name,
            email,
            password,
            phone,
            role: 'ADMIN',
            adminRole,
            adminPermissions: permissions,
            status,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast('New staff administrator invited successfully!', 'success');
          setIsModalOpen(false);
          fetchAdminUsers();
        } else {
          showToast(data.message || 'Failed to create user', 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'An error occurred', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: AdminUserItem) => {
    if (!confirm(`Are you sure you want to permanently delete administrator account for ${u.name}?`)) {
      return;
    }

    const token = getAuthToken();
    try {
      const res = await fetch(`/api/admin/users?id=${u.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        showToast('Administrator deleted successfully', 'success');
        fetchAdminUsers();
      } else {
        showToast(data.message || 'Failed to delete user', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete user', 'error');
    }
  };

  const filteredUsers = adminUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.adminRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (roleName?: string) => {
    switch (roleName) {
      case 'SUPER_ADMIN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-100 text-[#74189B] border border-purple-200 flex items-center gap-1 w-max">
            <ShieldCheck size={12} className="text-[#74189B]" /> Super Admin
          </span>
        );
      case 'ADMIN_MANAGER':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 w-max">
            <Shield size={12} className="text-blue-600" /> Admin Manager
          </span>
        );
      case 'ACCOUNTANT':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-max">
            <Award size={12} className="text-emerald-600" /> Accountant
          </span>
        );
      case 'ORDER_PROCESSOR':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-max">
            <Users size={12} className="text-amber-600" /> Order Processor
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 w-max">
            {roleName || 'Administrator'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-7 h-7 text-[#D4AF37]" />
            Administrator Roles & Staff Privileges
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage administrative personnel, RBAC roles (Super Admin, Manager, Accountant, Order Processor), and granular module permissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-[#74189B] text-white hover:bg-[#571275] transition shadow-md shadow-purple-900/10"
          >
            <UserPlus size={16} />
            <span>Invite Staff Admin</span>
          </button>

          <button
            onClick={fetchAdminUsers}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition"
            title="Refresh list"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Super Admin', count: adminUsers.filter((u) => u.adminRole === 'SUPER_ADMIN').length, color: 'text-purple-600 bg-purple-50' },
          { label: 'Admin Managers', count: adminUsers.filter((u) => u.adminRole === 'ADMIN_MANAGER').length, color: 'text-blue-600 bg-blue-50' },
          { label: 'Accountants', count: adminUsers.filter((u) => u.adminRole === 'ACCOUNTANT').length, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Order Processors', count: adminUsers.filter((u) => u.adminRole === 'ORDER_PROCESSOR').length, color: 'text-amber-600 bg-amber-50' },
        ].map((r, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500">{r.label}</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{r.count}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${r.color}`}>
              <ShieldCheck size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search administrator name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#74189B]/20 focus:border-[#74189B]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-500 shrink-0">Filter Role:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#74189B]/20"
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN_MANAGER">Admin Manager</option>
            <option value="ACCOUNTANT">Accountant</option>
            <option value="ORDER_PROCESSOR">Order Processor</option>
          </select>
        </div>
      </div>

      {/* Administrators Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Admin Name</th>
                <th className="py-3 px-4">Email & Phone</th>
                <th className="py-3 px-4">System Role</th>
                <th className="py-3 px-4">Privileges Scope</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-[#74189B]" />
                    Loading administrator directory...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No administrators found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const perms = u.adminPermissions || ROLE_PRESETS[u.adminRole || 'ADMIN_MANAGER'] || {};
                  const enabledCount = Object.values(perms).filter(Boolean).length;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-[#74189B] flex items-center justify-center font-bold uppercase text-xs">
                            {u.name.substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-[10px] text-slate-400">
                              Joined {new Date(u.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-700">{u.email}</div>
                        {u.phone && <div className="text-[10px] text-slate-400">{u.phone}</div>}
                      </td>

                      <td className="py-3 px-4">{getRoleBadge(u.adminRole)}</td>

                      <td className="py-3 px-4">
                        {u.adminRole === 'SUPER_ADMIN' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">
                            Full Unrestricted Access
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-700">
                              {enabledCount} of {ALL_MODULES.length}
                            </span>
                            <span className="text-[10px] text-slate-400">modules granted</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {u.status === 'ACTIVE' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Suspended
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#74189B] hover:border-[#74189B]/40 transition"
                            title="Edit Role & Permissions"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-300 transition"
                            title="Delete Administrator"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Administrator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#74189B] flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {editingUser ? `Edit Privileges: ${editingUser.name}` : 'Invite New Staff Administrator'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure administrative role, security credentials, and granular module access.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 mt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tariq Mansoor"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#74189B]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    disabled={!!editingUser}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. staff@sheeshatonight.com"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#74189B]/20 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {editingUser ? 'Reset Password (optional)' : 'Password *'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={editingUser ? 'Leave blank to keep existing password' : 'Min 6 characters'}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#74189B]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+971 50 123 4567"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#74189B]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">System Role Preset</label>
                  <select
                    value={adminRole}
                    onChange={(e) => handleRolePresetChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#74189B]/20"
                  >
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Full Platform Control)</option>
                    <option value="ADMIN_MANAGER">ADMIN_MANAGER (Catalog, Vendors, CMS)</option>
                    <option value="ACCOUNTANT">ACCOUNTANT (Finance, Settlements, Orders)</option>
                    <option value="ORDER_PROCESSOR">ORDER_PROCESSOR (Orders, Rentals, Dispatch)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Account Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#74189B]/20"
                  >
                    <option value="ACTIVE">ACTIVE (Granted Login)</option>
                    <option value="SUSPENDED">SUSPENDED (Temporarily Disabled)</option>
                  </select>
                </div>
              </div>

              {/* Granular Permissions Checkbox Matrix */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Module Access Permissions
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Customize which dashboard sections this administrator can read or write
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const allOn: AdminPermissions = {};
                        ALL_MODULES.forEach((m) => (allOn[m.key] = true));
                        setPermissions(allOn);
                      }}
                      className="text-[10px] font-bold text-[#74189B] hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setPermissions({})}
                      className="text-[10px] font-bold text-slate-500 hover:underline"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ALL_MODULES.map((m) => {
                    const isChecked = !!permissions[m.key];
                    return (
                      <label
                        key={m.key}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer ${
                          isChecked
                            ? 'bg-purple-50/50 border-[#74189B]/30'
                            : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePermission(m.key)}
                          className="mt-0.5 w-4 h-4 rounded text-[#74189B] focus:ring-[#74189B] border-slate-300"
                        />
                        <div>
                          <p className={`text-xs font-bold ${isChecked ? 'text-[#74189B]' : 'text-slate-800'}`}>
                            {m.label}
                          </p>
                          <p className="text-[10.5px] text-slate-500 leading-tight mt-0.5">{m.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-[#74189B] text-white hover:bg-[#571275] transition shadow-md shadow-purple-900/10 disabled:opacity-50"
                >
                  {saving ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <ShieldCheck size={14} />
                  )}
                  <span>{editingUser ? 'Update Privileges' : 'Create Staff Administrator'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
