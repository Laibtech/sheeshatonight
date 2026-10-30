'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Image as ImageIcon, 
  Sliders, 
  Sparkles, 
  Save, 
  CheckCircle2, 
  ArrowUpRight, 
  Megaphone,
  Globe,
  Loader2,
  RefreshCw,
  Layers,
  Compass,
  FolderOpen,
  HelpCircle,
  BookOpen,
  Eye,
  Settings
} from 'lucide-react';
import { useToast } from '@/components/admin/Toast';

export default function AdminCmsPage() {
  const { showToast } = useToast();
  
  // Hero section state
  const [heroHeading, setHeroHeading] = useState('');
  const [heroSubheading, setHeroSubheading] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  
  // Top announcement bar state
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementLink, setAnnouncementLink] = useState('');
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);

  // Statistics
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [bannerCount, setBannerCount] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [savingHero, setSavingHero] = useState(false);
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);

  useEffect(() => {
    fetchCmsOverview();
  }, []);

  const fetchCmsOverview = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [heroRes, announceRes, pagesRes, bannersRes] = await Promise.all([
        fetch('/api/admin/cms/content/homepage_hero', { headers }).catch(() => null),
        fetch('/api/admin/cms/content/announcement_bar', { headers }).catch(() => null),
        fetch('/api/admin/cms/pages', { headers }).catch(() => null),
        fetch('/api/admin/cms/banners', { headers }).catch(() => null),
      ]);

      if (heroRes && heroRes.ok) {
        const data = await heroRes.json();
        if (data.success && data.data) {
          setHeroHeading(data.data.heading || '');
          setHeroSubheading(data.data.subheading || data.data.description || '');
          setCtaText(data.data.ctaText || data.data.cta1Text || '');
          setCtaUrl(data.data.ctaUrl || data.data.cta1Url || '');
        }
      }

      if (announceRes && announceRes.ok) {
        const data = await announceRes.json();
        if (data.success && data.data) {
          setAnnouncementText(data.data.text || '');
          setAnnouncementLink(data.data.link || '');
          setAnnouncementEnabled(data.data.enabled ?? true);
        }
      }

      if (pagesRes && pagesRes.ok) {
        const data = await pagesRes.json();
        if (data.success && Array.isArray(data.data)) {
          setPageCount(data.data.length);
        }
      }

      if (bannersRes && bannersRes.ok) {
        const data = await bannersRes.json();
        if (data.success && Array.isArray(data.data)) {
          setBannerCount(data.data.length);
        }
      }
    } catch (err) {
      console.error('Error fetching CMS overview:', err);
      showToast('Failed to load some CMS resources', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingHero(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/cms/content/homepage_hero', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          heading: heroHeading,
          subheading: heroSubheading,
          description: heroSubheading,
          ctaText,
          ctaUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Homepage Hero content saved in MySQL database!', 'success');
      } else {
        showToast(data.message || 'Failed to update hero content', 'error');
      }
    } catch (err) {
      showToast('Failed to save hero content', 'error');
    } finally {
      setSavingHero(false);
    }
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingAnnouncement(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/cms/content/announcement_bar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          text: announcementText,
          link: announcementLink,
          enabled: announcementEnabled,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Top Announcement bar updated successfully!', 'success');
      } else {
        showToast(data.message || 'Failed to update announcement bar', 'error');
      }
    } catch (err) {
      showToast('Failed to save announcement bar', 'error');
    } finally {
      setSavingAnnouncement(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Website Content Management System (CMS)</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#74189B]/10 text-[#74189B]">
              Real-time MySQL Control
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete administrative control over SheeshaTonight.com — homepage, banners, pages, navigation, media, and blogs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCmsOverview}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
            title="Refresh CMS data"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link
            href="/?preview=true"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <Eye size={15} className="text-[#74189B]" />
            Preview Website
          </Link>
          <Link
            href="/admin/cms/homepage"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#74189B] to-[#571275] text-white hover:brightness-110 transition shadow-md shadow-purple-900/10"
          >
            <Layers size={15} className="text-[#F1A51D]" />
            Homepage Builder
          </Link>
        </div>
      </div>

      {/* Central CMS Control Grid (8 Modules) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/cms/homepage"
          className="group block p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#74189B]/40 transition-all relative"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#74189B] flex items-center justify-center font-bold">
              <Layers size={20} />
            </div>
            <ArrowUpRight size={17} className="text-slate-400 group-hover:text-[#74189B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Builder</p>
            <p className="text-base font-black text-slate-900 mt-0.5">Homepage Builder</p>
            <p className="text-xs text-slate-500 mt-1">Hero, section order, visibility, and statistics</p>
          </div>
        </Link>

        <Link
          href="/admin/cms/banners"
          className="group block p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#74189B]/40 transition-all relative"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#F1A51D] flex items-center justify-center font-bold">
              <ImageIcon size={20} />
            </div>
            <ArrowUpRight size={17} className="text-slate-400 group-hover:text-[#74189B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Campaigns</p>
            <p className="text-base font-black text-slate-900 mt-0.5">Banner Management</p>
            <p className="text-xs text-slate-500 mt-1">{bannerCount !== null ? `${bannerCount} Active Banners` : 'Hero & promo ribbons'}</p>
          </div>
        </Link>

        <Link
          href="/admin/cms/pages"
          className="group block p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#74189B]/40 transition-all relative"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileText size={20} />
            </div>
            <ArrowUpRight size={17} className="text-slate-400 group-hover:text-[#74189B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Content</p>
            <p className="text-base font-black text-slate-900 mt-0.5">Page Builder</p>
            <p className="text-xs text-slate-500 mt-1">{pageCount !== null ? `${pageCount} Published Pages` : 'About, Terms, Privacy'}</p>
          </div>
        </Link>

        <Link
          href="/admin/cms/navigation"
          className="group block p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#74189B]/40 transition-all relative"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Compass size={20} />
            </div>
            <ArrowUpRight size={17} className="text-slate-400 group-hover:text-[#74189B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Structure</p>
            <p className="text-base font-black text-slate-900 mt-0.5">Navigation & Footer</p>
            <p className="text-xs text-slate-500 mt-1">Header menus, footer columns, social links</p>
          </div>
        </Link>

        <Link
          href="/admin/media"
          className="group block p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#74189B]/40 transition-all relative"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <FolderOpen size={20} />
            </div>
            <ArrowUpRight size={17} className="text-slate-400 group-hover:text-[#74189B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assets</p>
            <p className="text-base font-black text-slate-900 mt-0.5">Media Library</p>
            <p className="text-xs text-slate-500 mt-1">Upload, search & safe reference deletion</p>
          </div>
        </Link>

        <Link
          href="/admin/cms/faqs"
          className="group block p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#74189B]/40 transition-all relative"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <HelpCircle size={20} />
            </div>
            <ArrowUpRight size={17} className="text-slate-400 group-hover:text-[#74189B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Support</p>
            <p className="text-base font-black text-slate-900 mt-0.5">FAQs Management</p>
            <p className="text-xs text-slate-500 mt-1">Questions, answers, and category ordering</p>
          </div>
        </Link>

        <Link
          href="/admin/cms/blogs"
          className="group block p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#74189B]/40 transition-all relative"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <BookOpen size={20} />
            </div>
            <ArrowUpRight size={17} className="text-slate-400 group-hover:text-[#74189B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Editorial</p>
            <p className="text-base font-black text-slate-900 mt-0.5">Blog & Articles</p>
            <p className="text-xs text-slate-500 mt-1">Publish news, lounge guides & shisha culture</p>
          </div>
        </Link>

        <Link
          href="/admin/seo"
          className="group block p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#74189B]/40 transition-all relative"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
              <Globe size={20} />
            </div>
            <ArrowUpRight size={17} className="text-slate-400 group-hover:text-[#74189B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Marketing</p>
            <p className="text-base font-black text-slate-900 mt-0.5">SEO & Meta Management</p>
            <p className="text-xs text-slate-500 mt-1">Open Graph, Schema JSON-LD & sitemaps</p>
          </div>
        </Link>
      </div>

      {/* Quick Action Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Hero Customizer */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#74189B] flex items-center justify-center">
                <Sliders size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Quick Homepage Hero Editor</h2>
                <p className="text-[11px] text-slate-500">Instant update for headline and primary call to action</p>
              </div>
            </div>
            <Link href="/admin/cms/homepage" className="text-xs font-bold text-[#74189B] hover:underline flex items-center gap-1">
              Full Builder →
            </Link>
          </div>

          <form onSubmit={handleSaveHero} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Hero Title</label>
              <input
                type="text"
                placeholder="e.g. Premium Sheesha Delivered to Your Doorstep"
                value={heroHeading}
                onChange={(e) => setHeroHeading(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-900 font-bold focus:border-[#74189B] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Hero Description</label>
              <textarea
                placeholder="Subheading description..."
                value={heroSubheading}
                onChange={(e) => setHeroSubheading(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:border-[#74189B] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">CTA Text</label>
                <input
                  type="text"
                  placeholder="e.g. Explore Rentals"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:border-[#74189B] outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">CTA URL</label>
                <input
                  type="text"
                  placeholder="e.g. /rentals"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:border-[#74189B] outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingHero}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-[#74189B] text-white hover:bg-[#571275] transition shadow-md shadow-purple-900/10 disabled:opacity-50"
              >
                {savingHero ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                Save Hero Content
              </button>
            </div>
          </form>
        </div>

        {/* Global Announcement Bar Form */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#F1A51D] flex items-center justify-center">
              <Megaphone size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Storefront Announcement Bar</h2>
              <p className="text-[11px] text-slate-500">Visible above the header across all customer pages</p>
            </div>
          </div>

          <form onSubmit={handleSaveAnnouncement} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Announcement Message</label>
              <input
                type="text"
                placeholder="e.g. Free UAE Delivery for orders above AED 250!"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-900 font-medium focus:border-[#74189B] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Destination URL (Optional)</label>
              <input
                type="text"
                placeholder="e.g. /shop"
                value={announcementLink}
                onChange={(e) => setAnnouncementLink(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:border-[#74189B] outline-none"
              />
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={announcementEnabled}
                  onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-[#74189B] focus:ring-[#74189B] border-slate-300"
                />
                <span className="font-bold text-slate-700">Display this announcement bar on customer site</span>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingAnnouncement}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-[#74189B] text-white hover:bg-[#571275] transition shadow-md shadow-purple-900/10 disabled:opacity-50"
              >
                {savingAnnouncement ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                Save Announcement
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
