'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Compass,
  Plus,
  Save,
  RefreshCw,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ExternalLink,
  Layers,
  Globe,
  Mail,
  Phone,
  MapPin,
  Share2,
  CheckCircle2,
  Loader2,
  Sparkles,
  Link2,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/components/admin/Toast';

interface NavItem {
  id: string;
  label: string;
  url: string;
  order: number;
  enabled: boolean;
  isNewTab?: boolean;
}

interface FooterColumn {
  title: string;
  links: Array<{ label: string; url: string }>;
}

const DEFAULT_NAV: NavItem[] = [
  { id: '1', label: 'Home', url: '/', order: 1, enabled: true },
  { id: '2', label: 'Shop Sheesha', url: '/shop', order: 2, enabled: true },
  { id: '3', label: 'Rentals', url: '/rentals', order: 3, enabled: true },
  { id: '4', label: 'Experiences', url: '/experiences', order: 4, enabled: true },
  { id: '5', label: 'Lounges & Vendors', url: '/vendors', order: 5, enabled: true },
  { id: '6', label: 'About Us', url: '/about', order: 6, enabled: true },
  { id: '7', label: 'Contact', url: '/contact', order: 7, enabled: true },
];

const DEFAULT_FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Explore Marketplace',
    links: [
      { label: 'Shop Sheesha Pipes', url: '/shop' },
      { label: 'Rent a Sheesha', url: '/rentals' },
      { label: 'Tobacco Flavors', url: '/categories/flavors' },
      { label: 'Accessories & Coals', url: '/categories/accessories' },
      { label: 'Top Lounges', url: '/vendors' },
    ],
  },
  {
    title: 'Experiences',
    links: [
      { label: 'Villa Gatherings', url: '/rentals?event=villa' },
      { label: 'Luxury Yacht Night', url: '/rentals?event=yacht' },
      { label: 'Weddings & Celebrations', url: '/rentals?event=weddings' },
      { label: 'Corporate Events', url: '/rentals?event=corporate' },
      { label: 'Private Sommelier Master', url: '/rentals' },
    ],
  },
  {
    title: 'Help & Information',
    links: [
      { label: 'About SheeshaTonight', url: '/about' },
      { label: 'How It Works', url: '/how-it-works' },
      { label: 'Become a Partner Vendor', url: '/vendor/apply' },
      { label: 'Frequently Asked Questions', url: '/faqs' },
      { label: 'Contact Concierge', url: '/contact' },
    ],
  },
  {
    title: 'Legal & Compliance',
    links: [
      { label: 'Terms & Conditions', url: '/terms' },
      { label: 'Privacy Policy', url: '/privacy' },
      { label: 'Refund & Cancellation Policy', url: '/refund-policy' },
      { label: 'Shipping & Delivery Policy', url: '/shipping-policy' },
      { label: 'Vendor Agreement', url: '/vendor-terms' },
    ],
  },
];

export default function AdminCmsNavigationPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'main' | 'footer' | 'contact' | 'newsletter'>('main');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Main Nav State
  const [navItems, setNavItems] = useState<NavItem[]>(DEFAULT_NAV);

  // Footer State
  const [footerColumns, setFooterColumns] = useState<FooterColumn[]>(DEFAULT_FOOTER_COLUMNS);
  const [brandDescription, setBrandDescription] = useState(
    'Your premium destination for sheesha rentals, products, flavors, accessories and unforgettable sommelier experiences across the UAE.'
  );
  const [copyrightText, setCopyrightText] = useState('© 2026 SheeshaTonight Portal L.L.C. All rights reserved. 18+ Only.');

  // Contact Info
  const [contactEmail, setContactEmail] = useState('concierge@sheeshatonight.com');
  const [contactPhone, setContactPhone] = useState('+971 4 555 1234');
  const [contactAddress, setContactAddress] = useState('Downtown Boulevard, Burj Plaza, Dubai, United Arab Emirates');
  const [whatsappNumber, setWhatsappNumber] = useState('+971501234567');

  // Social Links
  const [instagramUrl, setInstagramUrl] = useState('https://instagram.com/sheeshatonight');
  const [facebookUrl, setFacebookUrl] = useState('https://facebook.com/sheeshatonight');
  const [tiktokUrl, setTiktokUrl] = useState('https://tiktok.com/@sheeshatonight');
  const [linkedinUrl, setLinkedinUrl] = useState('https://linkedin.com/company/sheeshatonight');

  // Newsletter Section
  const [newsletterTitle, setNewsletterTitle] = useState('Premium experiences, straight to your inbox.');
  const [newsletterSubtitle, setNewsletterSubtitle] = useState('Get exclusive offers, new arrivals and the latest sheesha experiences across the UAE.');

  useEffect(() => {
    fetchNavigationData();
  }, []);

  const fetchNavigationData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/cms/navigation', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data;

        if (data && Array.isArray(data.navigation) && data.navigation.length > 0) {
          const mapped = data.navigation.map((item: any, idx: number) => ({
            id: item.id || String(idx + 1),
            label: item.label || '',
            url: item.url || item.href || '/',
            order: item.order || idx + 1,
            enabled: item.enabled !== false,
            isNewTab: !!item.isNewTab || !!item.isExternal,
          }));
          setNavItems(mapped);
        }

        if (data?.footer) {
          const f = data.footer;
          if (Array.isArray(f.columns)) {
            const mappedCols = f.columns.map((c: any) => ({
              title: c.title || 'Column',
              links: Array.isArray(c.links)
                ? c.links.map((l: any) => ({
                    label: l.label || '',
                    url: l.url || l.href || '/',
                  }))
                : [],
            }));
            setFooterColumns(mappedCols);
          }
          if (f.brandDescription) setBrandDescription(f.brandDescription);
          if (f.copyrightText || f.copyright) setCopyrightText(f.copyrightText || f.copyright);
          if (f.contactEmail || f.contact?.email) setContactEmail(f.contactEmail || f.contact?.email);
          if (f.contactPhone || f.contact?.phone) setContactPhone(f.contactPhone || f.contact?.phone);
          if (f.contactAddress || f.contact?.address) setContactAddress(f.contactAddress || f.contact?.address);
          if (f.whatsappNumber) setWhatsappNumber(f.whatsappNumber);
          if (f.instagramUrl || f.social?.instagram) setInstagramUrl(f.instagramUrl || f.social?.instagram);
          if (f.facebookUrl || f.social?.facebook) setFacebookUrl(f.facebookUrl || f.social?.facebook);
          if (f.tiktokUrl || f.social?.tiktok) setTiktokUrl(f.tiktokUrl || f.social?.tiktok);
          if (f.linkedinUrl || f.social?.linkedin) setLinkedinUrl(f.linkedinUrl || f.social?.linkedin);
          if (f.newsletterTitle || f.newsletter?.title) setNewsletterTitle(f.newsletterTitle || f.newsletter?.title);
          if (f.newsletterSubtitle || f.newsletter?.subtitle) setNewsletterSubtitle(f.newsletterSubtitle || f.newsletter?.subtitle);
        }
      }
    } catch (err) {
      console.error('Failed to load navigation data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Nav Item Handlers
  const handleAddNavItem = () => {
    const newItem: NavItem = {
      id: Date.now().toString(),
      label: 'New Link',
      url: '/',
      order: navItems.length + 1,
      enabled: true,
    };
    setNavItems([...navItems, newItem]);
  };

  const handleUpdateNavItem = (index: number, field: keyof NavItem, value: any) => {
    const updated = [...navItems];
    const item = updated[index];
    if (item) {
      updated[index] = { ...item, [field]: value };
      setNavItems(updated);
    }
  };

  const handleMoveNavItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= navItems.length) return;

    const updated = [...navItems];
    const temp = updated[index];
    const target = updated[targetIndex];
    if (!temp || !target) return;
    updated[index] = target;
    updated[targetIndex] = temp;

    const reordered = updated.map((item, idx) => ({ ...item, order: idx + 1 }));
    setNavItems(reordered);
  };

  const handleRemoveNavItem = (index: number) => {
    const updated = navItems.filter((_, idx) => idx !== index);
    setNavItems(updated.map((item, idx) => ({ ...item, order: idx + 1 })));
  };

  // Footer Column Handlers
  const handleAddFooterLink = (colIndex: number) => {
    const updated = [...footerColumns];
    if (updated[colIndex]) {
      updated[colIndex].links.push({ label: 'New Link', url: '/' });
      setFooterColumns(updated);
    }
  };

  const handleRemoveFooterLink = (colIndex: number, linkIndex: number) => {
    const updated = [...footerColumns];
    if (updated[colIndex]) {
      updated[colIndex].links.splice(linkIndex, 1);
      setFooterColumns(updated);
    }
  };

  const handleUpdateFooterLink = (colIndex: number, linkIndex: number, field: 'label' | 'url', value: string) => {
    const updated = [...footerColumns];
    if (updated[colIndex]?.links[linkIndex]) {
      updated[colIndex].links[linkIndex][field] = value;
      setFooterColumns(updated);
    }
  };

  const handleUpdateFooterColTitle = (colIndex: number, title: string) => {
    const updated = [...footerColumns];
    if (updated[colIndex]) {
      updated[colIndex].title = title;
      setFooterColumns(updated);
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('auth_token');

      const payload = {
        navigation: navItems.map((item) => ({
          ...item,
          href: item.url || '/',
          isExternal: !!item.isNewTab,
        })),
        footer: {
          columns: footerColumns.map((col) => ({
            title: col.title,
            links: col.links.map((l) => ({
              label: l.label,
              url: l.url || '/',
              href: l.url || '/',
            })),
          })),
          brandDescription,
          copyrightText,
          copyright: copyrightText,
          contactEmail,
          contactPhone,
          contactAddress,
          contact: {
            address: contactAddress,
            phone: contactPhone,
            email: contactEmail,
          },
          whatsappNumber,
          instagramUrl,
          facebookUrl,
          tiktokUrl,
          linkedinUrl,
          social: {
            instagram: instagramUrl,
            facebook: facebookUrl,
            tiktok: tiktokUrl,
            linkedin: linkedinUrl,
          },
          newsletterTitle,
          newsletterSubtitle,
          newsletter: {
            enabled: true,
            title: newsletterTitle,
            subtitle: newsletterSubtitle,
          },
        },
      };

      const res = await fetch('/api/admin/cms/navigation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        addToast({
          type: 'success',
          title: 'Saved Successfully',
          message: 'Navigation and footer links are updated in database and live on the website!',
        });
      } else {
        addToast({
          type: 'error',
          title: 'Save Failed',
          message: 'Could not update navigation records.',
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Network error saving navigation settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-[#74189B] animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading Navigation & Footer CMS...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <Link
            href="/admin/cms"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#74189B] hover:text-[#571275] mb-1.5 transition"
          >
            <ArrowLeft size={14} /> Back to CMS Overview
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Navigation & Footer Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage top navigation menus, footer columns, contact details, social links, and copyright text.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#74189B] to-[#571275] hover:brightness-110 text-white font-bold text-xs shadow-md shadow-[#74189B]/20 transition disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save & Publish Navigation
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'main', label: 'Main Navigation Header', icon: Compass },
          { key: 'footer', label: 'Footer Columns & Links', icon: Layers },
          { key: 'contact', label: 'Contact Info & Social Links', icon: Phone },
          { key: 'newsletter', label: 'Newsletter & Copyright', icon: Mail },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                isActive
                  ? 'bg-[#74189B] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: MAIN NAVIGATION */}
      {activeTab === 'main' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Compass size={18} className="text-[#74189B]" /> Top Header Navigation Links
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Customize labels, URLs, display order, and visibility of main navbar links.
              </p>
            </div>
            <button
              onClick={handleAddNavItem}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 text-[#74189B] hover:bg-purple-100 font-bold text-xs transition"
            >
              <Plus size={15} /> Add Menu Item
            </button>
          </div>

          <div className="space-y-3">
            {navItems.map((item, index) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#74189B]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 min-w-0">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => handleUpdateNavItem(index, 'label', e.target.value)}
                      placeholder="Menu Label"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 font-bold text-slate-800"
                    />
                    <input
                      type="text"
                      value={item.url}
                      onChange={(e) => handleUpdateNavItem(index, 'url', e.target.value)}
                      placeholder="/destination-url"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => handleMoveNavItem(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 text-slate-600"
                    title="Move Up"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    onClick={() => handleMoveNavItem(index, 'down')}
                    disabled={index === navItems.length - 1}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 text-slate-600"
                    title="Move Down"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    onClick={() => handleUpdateNavItem(index, 'enabled', !item.enabled)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                      item.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {item.enabled ? 'Visible' : 'Hidden'}
                  </button>
                  <button
                    onClick={() => handleRemoveNavItem(index)}
                    className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600"
                    title="Delete item"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: FOOTER COLUMNS */}
      {activeTab === 'footer' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers size={18} className="text-[#74189B]" /> Footer Columns & Link Groups
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure the 4 link columns rendered in the website footer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {footerColumns.map((col, colIdx) => (
              <div key={colIdx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Column #{colIdx + 1}</span>
                  <input
                    type="text"
                    value={col.title}
                    onChange={(e) => handleUpdateFooterColTitle(colIdx, e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-[#74189B] bg-white"
                  />
                </div>

                <div className="space-y-2">
                  {col.links.map((link, linkIdx) => (
                    <div key={linkIdx} className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => handleUpdateFooterLink(colIdx, linkIdx, 'label', e.target.value)}
                          placeholder="Link Label"
                          className="w-full font-bold text-slate-800 outline-none"
                        />
                        <button
                          onClick={() => handleRemoveFooterLink(colIdx, linkIdx)}
                          className="text-slate-400 hover:text-rose-500 ml-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => handleUpdateFooterLink(colIdx, linkIdx, 'url', e.target.value)}
                        placeholder="/url"
                        className="w-full text-[11px] font-mono text-slate-500 outline-none border-t border-slate-100 pt-1"
                      />
                    </div>
                  ))}

                  <button
                    onClick={() => handleAddFooterLink(colIdx)}
                    className="w-full py-1.5 rounded-lg border border-dashed border-slate-300 text-slate-500 hover:text-[#74189B] hover:border-[#74189B] text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <Plus size={13} /> Add Link
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CONTACT DETAILS & SOCIAL MEDIA */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Phone size={18} className="text-[#74189B]" /> Official Contact Information
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Concierge Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Phone Number</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">WhatsApp Hotline (With country code)</label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+971501234567"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Physical Business Address</label>
                <textarea
                  rows={2}
                  value={contactAddress}
                  onChange={(e) => setContactAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Share2 size={18} className="text-[#74189B]" /> Social Media Channels
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Instagram URL</label>
                <input
                  type="text"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Facebook URL</label>
                <input
                  type="text"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">TikTok URL</label>
                <input
                  type="text"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NEWSLETTER & COPYRIGHT */}
      {activeTab === 'newsletter' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5 max-w-3xl">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Mail size={18} className="text-[#74189B]" /> Newsletter Banner & Legal Copyright
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Newsletter Box Title</label>
              <input
                type="text"
                value={newsletterTitle}
                onChange={(e) => setNewsletterTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Newsletter Box Description</label>
              <textarea
                rows={2}
                value={newsletterSubtitle}
                onChange={(e) => setNewsletterSubtitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Footer Brand Tagline</label>
              <textarea
                rows={3}
                value={brandDescription}
                onChange={(e) => setBrandDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Copyright Disclaimer Text</label>
              <input
                type="text"
                value={copyrightText}
                onChange={(e) => setCopyrightText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
