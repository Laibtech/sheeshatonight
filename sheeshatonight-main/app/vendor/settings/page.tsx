'use client';

import React, { useState, useEffect } from 'react';
import { Store, Mail, Clock, Bell, Save, RefreshCw, User, MapPin, Phone, Globe, CheckCircle2, AlertCircle } from 'lucide-react';

export default function VendorSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [settings, setSettings] = useState({
    shopName: '',
    contactEmail: '',
    businessHours: '5:00 PM - 2:00 AM',
    notificationEmail: '',
    ownerName: '',
    phone: '',
    address: '',
    description: '',
    website: '',
  });

  const getAuthToken = () => {
    if (typeof window === 'undefined') return '';
    let token = localStorage.getItem('auth_token');
    if (!token) {
      const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
      if (match && match[1]) token = decodeURIComponent(match[1]);
    }
    return token || '';
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const res = await fetch('/api/vendor/profile', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      });
      const result = await res.json();
      if (result.success && result.data) {
        const v = result.data;
        let loc = v.location || '';
        try {
          const parsed = JSON.parse(loc);
          if (parsed && typeof parsed === 'object') {
            loc = [parsed.address, parsed.city, parsed.emirate, parsed.country].filter(Boolean).join(', ') || loc;
          }
        } catch {
          // not json
        }

        setSettings({
          shopName: v.name || '',
          contactEmail: v.user?.email || '',
          businessHours: '5:00 PM - 2:00 AM',
          notificationEmail: v.user?.email || '',
          ownerName: v.user?.name || '',
          phone: v.phone || v.user?.phone || '',
          address: loc,
          description: v.description || '',
          website: 'www.sheeshatonight.com',
        });
      }
    } catch (err) {
      console.error('Failed to load vendor profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (field: string, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const token = getAuthToken();
      const res = await fetch('/api/vendor/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          name: settings.shopName.trim(),
          phone: settings.phone.trim(),
          location: settings.address.trim(),
          description: settings.description.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const updatedName = settings.shopName.trim();
        localStorage.setItem('vendor_name', updatedName);
        window.dispatchEvent(new CustomEvent('vendor_profile_updated', { detail: { name: updatedName } }));
        setStatusMessage({ type: 'success', text: 'Store settings updated and synchronized across your account!' });
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to update store settings' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Network error updating settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchProfile();
    setStatusMessage(null);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[#8a277d] font-semibold">Settings</p>
          <h1 className="text-3xl font-black text-slate-900 mt-2">Vendor Preferences</h1>
          <p className="text-slate-600 mt-1">Configure shop identity, contact information, and live marketplace preferences.</p>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span className="text-sm font-semibold">{statusMessage.text}</span>
          </div>
        )}

        {/* Main Settings Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          {/* Business Information Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-50 rounded-xl">
                <Store className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Business Information</h2>
                <p className="text-xs text-slate-500">Live store identity visible to customers across SheeshaTonight</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Store className="w-4 h-4 text-slate-400" />
                  Shop Name
                </label>
                <input
                  type="text"
                  value={settings.shopName}
                  onChange={(e) => handleChange('shopName', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8a277d] focus:border-transparent transition-all"
                  placeholder="Enter your store / lounge name"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <User className="w-4 h-4 text-slate-400" />
                  Owner / Manager Name
                </label>
                <input
                  type="text"
                  value={settings.ownerName}
                  onChange={(e) => handleChange('ownerName', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8a277d] focus:border-transparent transition-all"
                  placeholder="Enter owner name"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8a277d] focus:border-transparent transition-all"
                  placeholder="+971 50 123 4567"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Business Hours
                </label>
                <input
                  type="text"
                  value={settings.businessHours}
                  onChange={(e) => handleChange('businessHours', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8a277d] focus:border-transparent transition-all"
                  placeholder="5:00 PM - 2:00 AM"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  Business Address / Location
                </label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8a277d] focus:border-transparent transition-all"
                  placeholder="e.g. Downtown Dubai, Boulevard Crescent"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Globe className="w-4 h-4 text-slate-400" />
                  Store Description
                </label>
                <textarea
                  rows={3}
                  value={settings.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8a277d] focus:border-transparent transition-all"
                  placeholder="Brief description of your lounge, hookah rental services, and special offerings"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Contact & Notifications Section */}
          <div className="border-t border-slate-200 pt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Contact & Notifications</h2>
                <p className="text-xs text-slate-500">How clients and the marketplace admin connect with your store</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400" />
                  Contact Email
                </label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8a277d] focus:border-transparent transition-all"
                  placeholder="contact@email.com"
                  disabled={loading}
                />
                <p className="text-xs text-slate-500">Primary email for customer inquiries</p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Bell className="w-4 h-4 text-slate-400" />
                  Notification Email
                </label>
                <input
                  type="email"
                  value={settings.notificationEmail}
                  onChange={(e) => handleChange('notificationEmail', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8a277d] focus:border-transparent transition-all"
                  placeholder="alerts@email.com"
                  disabled={loading}
                />
                <p className="text-xs text-slate-500">Email for new order and payout notifications</p>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-sm font-bold text-slate-800 mb-3">Email Notification Preferences</p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-[#8a277d] rounded focus:ring-[#8a277d]" />
                  <span className="text-sm font-medium text-slate-700">Instant notification for new customer orders</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-[#8a277d] rounded focus:ring-[#8a277d]" />
                  <span className="text-sm font-medium text-slate-700">Settlement & payout transfer receipts</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-[#8a277d] rounded focus:ring-[#8a277d]" />
                  <span className="text-sm font-medium text-slate-700">Customer reviews & star ratings</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-[#8a277d] rounded focus:ring-[#8a277d]" />
                  <span className="text-sm font-medium text-slate-700">Low stock & inventory alerts</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#8a277d] to-[#601957] hover:from-[#78226d] hover:to-[#501448] text-white font-bold rounded-xl shadow-lg shadow-purple-900/15 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Store Settings
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              disabled={saving || loading}
              className="flex items-center justify-center gap-2 px-6 py-3.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all disabled:opacity-50"
            >
              <RefreshCw className="w-5 h-5" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
