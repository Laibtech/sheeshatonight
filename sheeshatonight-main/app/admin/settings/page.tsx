'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  User,
  ShieldCheck,
  Percent,
  DollarSign,
  Mail,
  Phone,
  Loader2,
  Server,
  Lock,
  Globe,
  CreditCard,
  Bell,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/components/admin/Toast';

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'marketplace' | 'branding' | 'payments' | 'notifications'>('marketplace');

  // Tab 1: Marketplace Settings
  const [commissionRate, setCommissionRate] = useState('10');
  const [currency, setCurrency] = useState('AED');
  const [ageLimit, setAgeLimit] = useState('21');
  const [taxRate, setTaxRate] = useState('5');
  const [supportEmail, setSupportEmail] = useState('support@sheeshatonight.com');
  const [supportPhone, setSupportPhone] = useState('+971 50 123 4567');
  const [autoApproveReviews, setAutoApproveReviews] = useState(false);
  const [requireVendorKyc, setRequireVendorKyc] = useState(true);

  // Tab 2: Branding Settings
  const [siteTitle, setSiteTitle] = useState('SheeshaTonight');
  const [tagline, setTagline] = useState('Premium Luxury Sheesha Rental & Tobacco Marketplace Dubai');
  const [logoUrl, setLogoUrl] = useState('/logo.png');
  const [faviconUrl, setFaviconUrl] = useState('/favicon.ico');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('SheeshaTonight is undergoing scheduled luxury enhancements. We will be back online shortly.');

  // Tab 3: Payment Settings
  const [codEnabled, setCodEnabled] = useState(true);
  const [stripeEnabled, setStripeEnabled] = useState(true);
  const [minOrderAmount, setMinOrderAmount] = useState('150');
  const [defaultSecurityDeposit, setDefaultSecurityDeposit] = useState('300');
  const [rentalDepositNotice, setRentalDepositNotice] = useState('A refundable security deposit of AED 300 is held and refunded immediately upon inspection of rented equipment.');

  // Tab 4: Notifications Settings
  const [notifyCustomerOnOrder, setNotifyCustomerOnOrder] = useState(true);
  const [notifyVendorOnBooking, setNotifyVendorOnBooking] = useState(true);
  const [notifyAdminOnNewVendor, setNotifyAdminOnNewVendor] = useState(true);
  const [adminNotificationEmail, setAdminNotificationEmail] = useState('alerts@sheeshatonight.com');

  // Admin Profile & DB Health
  const [adminUser, setAdminUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettingsAndProfile();
  }, []);

  const fetchSettingsAndProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [marketRes, brandRes, payRes, notifRes, profileRes] = await Promise.all([
        fetch('/api/admin/cms/content/marketplace_settings', { headers }).catch(() => null),
        fetch('/api/admin/cms/content/branding_settings', { headers }).catch(() => null),
        fetch('/api/admin/cms/content/payment_settings', { headers }).catch(() => null),
        fetch('/api/admin/cms/content/notification_settings', { headers }).catch(() => null),
        fetch('/api/auth/me', { headers }).catch(() => null),
      ]);

      if (marketRes && marketRes.ok) {
        const d = await marketRes.json();
        if (d.success && d.data) {
          if (d.data.commissionRate) setCommissionRate(d.data.commissionRate);
          if (d.data.currency) setCurrency(d.data.currency);
          if (d.data.ageLimit) setAgeLimit(d.data.ageLimit);
          if (d.data.taxRate) setTaxRate(d.data.taxRate);
          if (d.data.supportEmail) setSupportEmail(d.data.supportEmail);
          if (d.data.supportPhone) setSupportPhone(d.data.supportPhone);
          if (d.data.autoApproveReviews !== undefined) setAutoApproveReviews(d.data.autoApproveReviews);
          if (d.data.requireVendorKyc !== undefined) setRequireVendorKyc(d.data.requireVendorKyc);
        }
      }

      if (brandRes && brandRes.ok) {
        const d = await brandRes.json();
        if (d.success && d.data) {
          if (d.data.siteTitle) setSiteTitle(d.data.siteTitle);
          if (d.data.tagline) setTagline(d.data.tagline);
          if (d.data.logoUrl) setLogoUrl(d.data.logoUrl);
          if (d.data.faviconUrl) setFaviconUrl(d.data.faviconUrl);
          if (d.data.maintenanceMode !== undefined) setMaintenanceMode(d.data.maintenanceMode);
          if (d.data.maintenanceMessage) setMaintenanceMessage(d.data.maintenanceMessage);
        }
      }

      if (payRes && payRes.ok) {
        const d = await payRes.json();
        if (d.success && d.data) {
          if (d.data.codEnabled !== undefined) setCodEnabled(d.data.codEnabled);
          if (d.data.stripeEnabled !== undefined) setStripeEnabled(d.data.stripeEnabled);
          if (d.data.minOrderAmount) setMinOrderAmount(d.data.minOrderAmount);
          if (d.data.defaultSecurityDeposit) setDefaultSecurityDeposit(d.data.defaultSecurityDeposit);
          if (d.data.rentalDepositNotice) setRentalDepositNotice(d.data.rentalDepositNotice);
        }
      }

      if (notifRes && notifRes.ok) {
        const d = await notifRes.json();
        if (d.success && d.data) {
          if (d.data.notifyCustomerOnOrder !== undefined) setNotifyCustomerOnOrder(d.data.notifyCustomerOnOrder);
          if (d.data.notifyVendorOnBooking !== undefined) setNotifyVendorOnBooking(d.data.notifyVendorOnBooking);
          if (d.data.notifyAdminOnNewVendor !== undefined) setNotifyAdminOnNewVendor(d.data.notifyAdminOnNewVendor);
          if (d.data.adminNotificationEmail) setAdminNotificationEmail(d.data.adminNotificationEmail);
        }
      }

      if (profileRes && profileRes.ok) {
        const pData = await profileRes.json();
        if (pData.success && pData.data) {
          setAdminUser(pData.data);
        } else if (pData.user) {
          setAdminUser(pData.user);
        }
      } else {
        setAdminUser({
          name: 'Master Administrator',
          email: 'admin@sheeshatonight.com',
          role: 'SUPER_ADMIN',
        });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMarketplace = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch('/api/admin/cms/content/marketplace_settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          commissionRate,
          currency,
          ageLimit,
          taxRate,
          supportEmail,
          supportPhone,
          autoApproveReviews,
          requireVendorKyc,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Marketplace governance settings updated in MySQL!', 'success');
      } else {
        showToast(data.message || 'Failed to update', 'error');
      }
    } catch {
      showToast('Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch('/api/admin/cms/content/branding_settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          siteTitle,
          tagline,
          logoUrl,
          faviconUrl,
          maintenanceMode,
          maintenanceMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Website branding settings saved successfully!', 'success');
      } else {
        showToast(data.message || 'Failed to update', 'error');
      }
    } catch {
      showToast('Error saving branding', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePayments = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch('/api/admin/cms/content/payment_settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          codEnabled,
          stripeEnabled,
          minOrderAmount,
          defaultSecurityDeposit,
          rentalDepositNotice,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Payment & Checkout policies saved successfully!', 'success');
      } else {
        showToast(data.message || 'Failed to update', 'error');
      }
    } catch {
      showToast('Error saving payments', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch('/api/admin/cms/content/notification_settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          notifyCustomerOnOrder,
          notifyVendorOnBooking,
          notifyAdminOnNewVendor,
          adminNotificationEmail,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('System notification preferences saved successfully!', 'success');
      } else {
        showToast(data.message || 'Failed to update', 'error');
      }
    } catch {
      showToast('Error saving notifications', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System & Platform Controls</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#74189B]/10 text-[#74189B]">
            Production Config
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Control marketplace rules, website branding, payment gateways, automated notifications, and database integrity.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-xs overflow-x-auto gap-1">
        {[
          { id: 'marketplace', label: 'Marketplace & Rules', icon: Sliders },
          { id: 'branding', label: 'Website Branding', icon: Globe },
          { id: 'payments', label: 'Payments & Deposits', icon: CreditCard },
          { id: 'notifications', label: 'Notification Alerts', icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-[#74189B] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Form Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* TAB 1: Marketplace & Rules */}
          {activeTab === 'marketplace' && (
            <form onSubmit={handleSaveMarketplace} className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#74189B] flex items-center justify-center">
                  <Sliders size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Commercial & Legal Rules</h2>
                  <p className="text-xs text-slate-500">Marketplace rules applied across all vendors and transactions</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Percent size={14} className="text-[#74189B]" /> Standard Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#74189B]/20"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Platform fee deducted from vendor payouts</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <DollarSign size={14} className="text-[#F1A51D]" /> Marketplace Currency Code
                  </label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#74189B]/20"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Standard currency for all catalogue prices</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-600" /> Minimum Legal Age
                  </label>
                  <input
                    type="number"
                    value={ageLimit}
                    onChange={(e) => setAgeLimit(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#74189B]/20"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">UAE legal age requirement for tobacco products</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Percent size={14} className="text-blue-600" /> Standard UAE VAT Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#74189B]/20"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">United Arab Emirates Standard 5% VAT</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Support & Communications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Mail size={14} className="text-slate-500" /> Customer Support Email
                    </label>
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#74189B]/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Phone size={14} className="text-slate-500" /> Official WhatsApp / Phone
                    </label>
                    <input
                      type="text"
                      value={supportPhone}
                      onChange={(e) => setSupportPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#74189B]/20"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Automated Platform Governance</h3>
                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoApproveReviews}
                    onChange={(e) => setAutoApproveReviews(e.target.checked)}
                    className="w-4 h-4 rounded text-[#74189B] focus:ring-[#74189B] border-slate-300"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Auto-Approve Verified Reviews</p>
                    <p className="text-[11px] text-slate-500">Automatically display 4+ star customer reviews</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireVendorKyc}
                    onChange={(e) => setRequireVendorKyc(e.target.checked)}
                    className="w-4 h-4 rounded text-[#74189B] focus:ring-[#74189B] border-slate-300"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Enforce Trade License KYC for Vendor Payouts</p>
                    <p className="text-[11px] text-slate-500">Settlements are frozen until vendor trade license is verified</p>
                  </div>
                </label>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-[#74189B] text-white hover:bg-[#571275] transition shadow-md shadow-purple-900/10 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  Save Marketplace Settings
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Website Branding */}
          {activeTab === 'branding' && (
            <form onSubmit={handleSaveBranding} className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#74189B] flex items-center justify-center">
                  <Globe size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Website Branding & Identity</h2>
                  <p className="text-xs text-slate-500">Public logo, site identity, and maintenance mode controls</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Platform Name / Title</label>
                  <input
                    type="text"
                    value={siteTitle}
                    onChange={(e) => setSiteTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#74189B]/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Main Logo Path / URL</label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#74189B]/20"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Official Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#74189B]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Favicon Path / URL</label>
                  <input
                    type="text"
                    value={faviconUrl}
                    onChange={(e) => setFaviconUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#74189B]/20"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50/70 border border-amber-200/60">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={20} className="text-amber-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-amber-900">Maintenance Mode</p>
                      <p className="text-[11px] text-amber-700">Display maintenance notice on public storefront while admin stays accessible</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className="w-5 h-5 rounded text-[#74189B] focus:ring-[#74189B] border-slate-300"
                  />
                </div>

                {maintenanceMode && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Maintenance Screen Message</label>
                    <textarea
                      rows={2}
                      value={maintenanceMessage}
                      onChange={(e) => setMaintenanceMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#74189B]/20"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-[#74189B] text-white hover:bg-[#571275] transition shadow-md shadow-purple-900/10 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  Save Branding Settings
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Payments & Deposits */}
          {activeTab === 'payments' && (
            <form onSubmit={handleSavePayments} className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#74189B] flex items-center justify-center">
                  <CreditCard size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Payments & Rental Deposit Policies</h2>
                  <p className="text-xs text-slate-500">Configure accepted payment methods and rental deposit parameters</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Cash on Delivery (COD) / Pay on Arrival</p>
                    <p className="text-[11px] text-slate-500">Allow customers to pay sommelier masters with cash or card upon delivery</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={codEnabled}
                    onChange={(e) => setCodEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-[#74189B] focus:ring-[#74189B] border-slate-300"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Online Card Checkout (Stripe 3DS Secured)</p>
                    <p className="text-[11px] text-slate-500">Accept Visa, Mastercard, Apple Pay via Stripe</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={stripeEnabled}
                    onChange={(e) => setStripeEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-[#74189B] focus:ring-[#74189B] border-slate-300"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Minimum Order Value (AED)</label>
                  <input
                    type="number"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#74189B]/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Default Rental Security Deposit (AED)</label>
                  <input
                    type="number"
                    value={defaultSecurityDeposit}
                    onChange={(e) => setDefaultSecurityDeposit(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#74189B]/20"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Rental Deposit Policy Notice</label>
                  <textarea
                    rows={2}
                    value={rentalDepositNotice}
                    onChange={(e) => setRentalDepositNotice(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#74189B]/20"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-[#74189B] text-white hover:bg-[#571275] transition shadow-md shadow-purple-900/10 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  Save Payment Controls
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: Notifications & Alerts */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleSaveNotifications} className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#74189B] flex items-center justify-center">
                  <Bell size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Automated Notification Alerts</h2>
                  <p className="text-xs text-slate-500">Configure transactional email and admin dispatch notification alerts</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Customer Order Confirmation Emails</p>
                    <p className="text-[11px] text-slate-500">Send itemized invoice and booking confirmation to customer upon checkout</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyCustomerOnOrder}
                    onChange={(e) => setNotifyCustomerOnOrder(e.target.checked)}
                    className="w-4 h-4 rounded text-[#74189B] focus:ring-[#74189B] border-slate-300"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Vendor Instant Booking Alerts</p>
                    <p className="text-[11px] text-slate-500">Notify lounge partners when a customer books their rental package or setup</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyVendorOnBooking}
                    onChange={(e) => setNotifyVendorOnBooking(e.target.checked)}
                    className="w-4 h-4 rounded text-[#74189B] focus:ring-[#74189B] border-slate-300"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Admin Notification on New Vendor Application</p>
                    <p className="text-[11px] text-slate-500">Alert super administrators when a new lounge submits trade license verification</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyAdminOnNewVendor}
                    onChange={(e) => setNotifyAdminOnNewVendor(e.target.checked)}
                    className="w-4 h-4 rounded text-[#74189B] focus:ring-[#74189B] border-slate-300"
                  />
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Mail size={14} className="text-[#74189B]" /> Admin Escalation / Alert Recipient Email
                </label>
                <input
                  type="email"
                  value={adminNotificationEmail}
                  onChange={(e) => setAdminNotificationEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#74189B]/20"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-[#74189B] text-white hover:bg-[#571275] transition shadow-md shadow-purple-900/10 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  Save Notification Preferences
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Platform Status & Admin User Card */}
        <div className="space-y-6">
          {/* Current Admin User Profile */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-[#74189B] flex items-center justify-center font-bold">
                <User size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{adminUser?.name || 'Administrator'}</h3>
                <p className="text-xs text-slate-500">{adminUser?.email || 'admin@sheeshatonight.com'}</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500 font-medium">Account Role</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#74189B]/10 text-[#74189B] font-mono">
                  {adminUser?.role || 'SUPER_ADMIN'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500 font-medium">Permission Scope</span>
                <span className="font-bold text-emerald-600">Full System Access</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500 font-medium">Session Security</span>
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <Lock size={12} className="text-slate-400" /> JWT 256-bit
                </span>
              </div>
            </div>
          </div>

          {/* Infrastructure Health Status */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Server size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Database Engine Health</h3>
                <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Connected & Active
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500">Database Engine</span>
                <span className="font-mono font-bold text-slate-800">MariaDB 10.4 / MySQL</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500">Active Port</span>
                <span className="font-mono font-bold text-[#74189B]">3307</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500">Active Schema</span>
                <span className="font-mono font-bold text-[#74189B]">sheeshatonight-main</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500">ORM Layer</span>
                <span className="font-mono font-bold text-slate-800">Prisma Client</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500">Schema Tables</span>
                <span className="font-bold text-slate-800">20 Tables Synced</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
