'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layout,
  Save,
  Eye,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  HelpCircle,
  Sliders,
  Megaphone,
  BarChart,
  ShieldCheck,
  Truck,
  Check,
  ChevronRight,
  ExternalLink,
  Loader2,
  Trash2,
  Plus
} from 'lucide-react';
import { useToast } from '@/components/admin/Toast';

interface SectionConfig {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  enabled: boolean;
  order: number;
}

const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: 'hero', name: 'Hero Section', title: 'Premium Sheesha, Delivered to Your Experience.', subtitle: 'Discover premium sheesha rentals, curated setups, artisan flavors, and professional masters from verified licensed vendors across the UAE.', enabled: true, order: 1 },
  { id: 'categories', name: 'Popular Categories Grid', title: 'Everything for your experience', subtitle: 'Explore Collection', enabled: true, order: 2 },
  { id: 'rentals', name: 'Featured Rentals', title: 'Featured Rentals', subtitle: 'Book Your Experience - Premium sheesha setups delivered to your door.', enabled: true, order: 3 },
  { id: 'products', name: 'Trending Products & Tobacco', title: 'Trending Marketplace Products', subtitle: 'Authentic Russian & German hookahs, bowls, and exotic blends', enabled: true, order: 4 },
  { id: 'experiences', name: 'Occasions & Experiences', title: 'Your experience. Your way.', subtitle: 'From intimate gatherings to luxury yacht nights, find a sheesha experience designed around your occasion.', enabled: true, order: 5 },
  { id: 'how_it_works', name: 'How It Works (3 Steps)', title: 'How It Works', subtitle: 'Simple & Easy 3-step rental and purchase process across the UAE', enabled: true, order: 6 },
  { id: 'promo_banner', name: 'Promotional Callout Banner', title: 'Make tonight unforgettable.', subtitle: 'Explore premium sheesha rentals and products from trusted vendors across the UAE.', enabled: true, order: 7 },
  { id: 'trust_features', name: 'Why Choose Us / Trust Badges', title: 'Why SheeshaTonight', subtitle: 'Verified Licensed Lounges, 45-Min UAE Delivery & Dedicated Concierge', enabled: true, order: 8 },
];

export default function AdminHomepageBuilderPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'hero' | 'sections' | 'stats' | 'announcement'>('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Hero State
  const [heroHeading, setHeroHeading] = useState('Premium Sheesha, Delivered to Your Experience.');
  const [heroHighlight, setHeroHighlight] = useState('Delivered to Your Experience.');
  const [heroBadge, setHeroBadge] = useState('Premium UAE Sheesha Marketplace');
  const [heroDescription, setHeroDescription] = useState('Discover premium sheesha rentals, curated setups, artisan flavors, and professional masters from verified licensed vendors across the UAE.');
  const [heroBgImage, setHeroBgImage] = useState('/hero-banner.png');
  const [heroCta1Text, setHeroCta1Text] = useState('Explore Rentals');
  const [heroCta1Url, setHeroCta1Url] = useState('/rentals');
  const [heroCta2Text, setHeroCta2Text] = useState('Shop Sheesha');
  const [heroCta2Url, setHeroCta2Url] = useState('/shop');
  const [heroTrust1, setHeroTrust1] = useState('Verified Licensed Vendors');
  const [heroTrust2, setHeroTrust2] = useState('45-Min UAE Delivery');
  const [heroTrust3, setHeroTrust3] = useState('100% Authentic Quality');

  // Sections State
  const [sections, setSections] = useState<SectionConfig[]>(DEFAULT_SECTIONS);

  // Stats State
  const [stats, setStats] = useState([
    { label: 'Verified UAE Lounges', value: '50+' },
    { label: 'On-Demand Delivery', value: '45 Min' },
    { label: 'Satisfied VIP Clients', value: '10,000+' },
    { label: 'Average Client Rating', value: '4.9/5' },
  ]);

  // Announcement State
  const [announcementText, setAnnouncementText] = useState('Premium Sheesha Experiences Across the UAE — Free 45-Min Delivery in Dubai Marina & Downtown');
  const [announcementLink, setAnnouncementLink] = useState('/rentals');
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);

  useEffect(() => {
    fetchHomepageConfig();
  }, []);

  const fetchHomepageConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/cms/homepage', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data;

        if (data.hero) {
          if (data.hero.heading) setHeroHeading(data.hero.heading);
          if (data.hero.highlight) setHeroHighlight(data.hero.highlight);
          if (data.hero.badge) setHeroBadge(data.hero.badge);
          if (data.hero.description) setHeroDescription(data.hero.description);
          if (data.hero.bgImage) setHeroBgImage(data.hero.bgImage);
          if (data.hero.cta1Text) setHeroCta1Text(data.hero.cta1Text);
          if (data.hero.cta1Url) setHeroCta1Url(data.hero.cta1Url);
          if (data.hero.cta2Text) setHeroCta2Text(data.hero.cta2Text);
          if (data.hero.cta2Url) setHeroCta2Url(data.hero.cta2Url);
          if (data.hero.trust1) setHeroTrust1(data.hero.trust1);
          if (data.hero.trust2) setHeroTrust2(data.hero.trust2);
          if (data.hero.trust3) setHeroTrust3(data.hero.trust3);
        }

        if (Array.isArray(data.sections) && data.sections.length > 0) {
          setSections(data.sections);
        }

        if (Array.isArray(data.stats) && data.stats.length > 0) {
          setStats(data.stats);
        }

        if (data.announcement) {
          if (data.announcement.text !== undefined) setAnnouncementText(data.announcement.text);
          if (data.announcement.link !== undefined) setAnnouncementLink(data.announcement.link);
          if (data.announcement.enabled !== undefined) setAnnouncementEnabled(data.announcement.enabled);
        }
      }
    } catch (err) {
      console.error('Failed to load homepage config:', err);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Could not load existing homepage settings',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('files', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.urls && json.urls.length > 0) {
          setHeroBgImage(json.urls[0]);
          addToast({
            type: 'success',
            title: 'Image Uploaded',
            message: 'Hero background image replaced successfully.',
          });
        }
      } else {
        const err = await res.json();
        addToast({
          type: 'error',
          title: 'Upload Failed',
          message: err.error || 'Failed to upload image.',
        });
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Upload Error',
        message: 'Network error uploading file.',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const updated = [...sections];
    const temp = updated[index];
    const target = updated[targetIndex];
    if (!temp || !target) return;
    updated[index] = target;
    updated[targetIndex] = temp;

    // reassign order numbers
    const reordered = updated.map((sec, idx) => ({ ...sec, order: idx + 1 }));
    setSections(reordered);
  };

  const handleToggleSection = (index: number) => {
    const updated = [...sections];
    if (updated[index]) {
      updated[index].enabled = !updated[index].enabled;
      setSections(updated);
    }
  };

  const handleUpdateSectionTitle = (index: number, field: 'title' | 'subtitle', value: string) => {
    const updated = [...sections];
    if (updated[index]) {
      updated[index][field] = value;
      setSections(updated);
    }
  };

  const handleUpdateStat = (index: number, field: 'label' | 'value', value: string) => {
    const updated = [...stats];
    if (updated[index]) {
      updated[index][field] = value;
      setStats(updated);
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('auth_token');

      const payload = {
        hero: {
          heading: heroHeading,
          highlight: heroHighlight,
          badge: heroBadge,
          description: heroDescription,
          bgImage: heroBgImage,
          cta1Text: heroCta1Text,
          cta1Url: heroCta1Url,
          cta2Text: heroCta2Text,
          cta2Url: heroCta2Url,
          trust1: heroTrust1,
          trust2: heroTrust2,
          trust3: heroTrust3,
        },
        sections,
        stats,
        announcement: {
          text: announcementText,
          link: announcementLink,
          enabled: announcementEnabled,
        },
      };

      const res = await fetch('/api/admin/cms/homepage', {
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
          title: 'Published to Public Website',
          message: 'Homepage CMS content is now live in MySQL and updated on the storefront!',
        });
      } else {
        const err = await res.json();
        addToast({
          type: 'error',
          title: 'Save Failed',
          message: err.message || 'Error publishing homepage configuration',
        });
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Save Error',
        message: 'Could not connect to database server',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-[#74189B] animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading Homepage CMS Builder...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#74189B] uppercase tracking-wider mb-1">
            <Sparkles size={14} className="text-[#F1A51D]" /> Centralized Website CMS
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Homepage Builder & Section Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dynamically customize every hero element, banners, section order, visibility, and stats connected to MySQL.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/?preview=true"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold text-xs transition shadow-xs"
          >
            <Eye size={15} className="text-slate-500" />
            Preview Live
            <ExternalLink size={12} className="text-slate-400" />
          </Link>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#74189B] to-[#571275] hover:brightness-110 text-white font-bold text-xs shadow-md shadow-[#74189B]/20 transition disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Publish Changes
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'hero', label: 'Hero & CTA Banner', icon: ImageIcon },
          { key: 'sections', label: 'Section Manager & Ordering', icon: Layers },
          { key: 'stats', label: 'Homepage Numbers & Stats', icon: BarChart },
          { key: 'announcement', label: 'Top Announcement Bar', icon: Megaphone },
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

      {/* TAB 1: HERO BUILDER */}
      {activeTab === 'hero' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <ImageIcon size={18} className="text-[#74189B]" /> Hero Headlines & Text Content
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Badge Tagline (Above Heading)</label>
                  <input
                    type="text"
                    value={heroBadge}
                    onChange={(e) => setHeroBadge(e.target.value)}
                    placeholder="e.g. Premium UAE Sheesha Marketplace"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#74189B] focus:ring-1 focus:ring-[#74189B] outline-none text-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Main Hero Heading</label>
                  <input
                    type="text"
                    value={heroHeading}
                    onChange={(e) => setHeroHeading(e.target.value)}
                    placeholder="e.g. Premium Sheesha, Delivered to Your Experience."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#74189B] focus:ring-1 focus:ring-[#74189B] outline-none text-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Highlighted Heading Accent (Gold Color)</label>
                  <input
                    type="text"
                    value={heroHighlight}
                    onChange={(e) => setHeroHighlight(e.target.value)}
                    placeholder="e.g. Delivered to Your Experience."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#74189B] focus:ring-1 focus:ring-[#74189B] outline-none text-[#C99120] font-bold"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">This text snippet will be colored with the luxury gold theme accent.</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hero Description / Subheading</label>
                  <textarea
                    rows={3}
                    value={heroDescription}
                    onChange={(e) => setHeroDescription(e.target.value)}
                    placeholder="Tell your visitors what makes SheeshaTonight unforgettable..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#74189B] focus:ring-1 focus:ring-[#74189B] outline-none text-slate-800 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* CTA Buttons & Trust Badges */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <LinkIcon size={18} className="text-[#74189B]" /> Action Buttons & Trust Features
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Primary CTA Button Label</label>
                  <input
                    type="text"
                    value={heroCta1Text}
                    onChange={(e) => setHeroCta1Text(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#74189B] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Primary CTA URL Destination</label>
                  <input
                    type="text"
                    value={heroCta1Url}
                    onChange={(e) => setHeroCta1Url(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#74189B] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Secondary CTA Button Label</label>
                  <input
                    type="text"
                    value={heroCta2Text}
                    onChange={(e) => setHeroCta2Text(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#74189B] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Secondary CTA URL Destination</label>
                  <input
                    type="text"
                    value={heroCta2Url}
                    onChange={(e) => setHeroCta2Url(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#74189B] outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-3 text-xs">
                <span className="block font-bold text-slate-700">3 Trust Badges (Under CTA Buttons)</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium">Badge 1</span>
                    <input
                      type="text"
                      value={heroTrust1}
                      onChange={(e) => setHeroTrust1(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium">Badge 2</span>
                    <input
                      type="text"
                      value={heroTrust2}
                      onChange={(e) => setHeroTrust2(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium">Badge 3</span>
                    <input
                      type="text"
                      value={heroTrust3}
                      onChange={(e) => setHeroTrust3(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Background Image & Live Card Preview */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>Hero Background Media</span>
                <span className="text-[11px] font-bold text-slate-400">1920x680 Recommended</span>
              </h2>

              <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group">
                <img
                  src={heroBgImage || '/hero-banner.png'}
                  alt="Hero Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                  <span className="text-white text-xs font-bold truncate">{heroHeading}</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Image URL or Local Path</label>
                  <input
                    type="text"
                    value={heroBgImage}
                    onChange={(e) => setHeroBgImage(e.target.value)}
                    placeholder="/hero-banner.png"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Upload New Background</label>
                  <label className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 hover:border-[#74189B] bg-slate-50 hover:bg-purple-50/50 cursor-pointer transition text-slate-600 font-bold text-xs">
                    {uploadingImage ? (
                      <Loader2 size={16} className="animate-spin text-[#74189B]" />
                    ) : (
                      <Upload size={16} className="text-[#74189B]" />
                    )}
                    <span>{uploadingImage ? 'Uploading...' : 'Choose File to Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100 text-xs text-purple-900 space-y-2">
              <span className="font-bold flex items-center gap-1.5 text-[#74189B]">
                <Sparkles size={14} /> Instant Storefront Connection
              </span>
              <p className="text-[11px] leading-relaxed text-purple-800">
                All changes made here are saved directly into the MySQL database and applied to the public homepage immediately without code recompilation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SECTION MANAGER & REORDERING */}
      {activeTab === 'sections' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers size={18} className="text-[#74189B]" /> Homepage Sections Layout & Visibility
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Drag, reorder, show/hide, or modify titles for each section on the public homepage.
              </p>
            </div>
            <button
              onClick={() => setSections(DEFAULT_SECTIONS)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 self-start sm:self-auto"
            >
              <RefreshCw size={12} /> Reset to Defaults
            </button>
          </div>

          <div className="space-y-3">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={`p-4 rounded-xl border transition-all ${
                  section.enabled
                    ? 'border-slate-200 bg-white hover:border-[#74189B]/40'
                    : 'border-slate-200/60 bg-slate-50/70 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{section.name}</span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            section.enabled
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {section.enabled ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">ID: {section.id}</span>
                    </div>
                  </div>

                  {/* Actions: Reorder & Toggle */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleMoveSection(index, 'up')}
                      disabled={index === 0}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 text-slate-600 transition"
                      title="Move Up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => handleMoveSection(index, 'down')}
                      disabled={index === sections.length - 1}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 text-slate-600 transition"
                      title="Move Down"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      onClick={() => handleToggleSection(index)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        section.enabled
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {section.enabled ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {/* Section Editable Titles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Section Title</label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => handleUpdateSectionTitle(index, 'title', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Section Tagline / Subtitle</label>
                    <input
                      type="text"
                      value={section.subtitle}
                      onChange={(e) => handleUpdateSectionTitle(index, 'subtitle', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STATS & NUMBERS */}
      {activeTab === 'stats' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart size={18} className="text-[#74189B]" /> Homepage Statistics & Social Proof
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Customize the prominent achievement metrics displayed across the platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Metric #{idx + 1}</span>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Metric Number / Value</label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => handleUpdateStat(idx, 'value', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-extrabold text-[#74189B] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Description Label</label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => handleUpdateStat(idx, 'label', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TOP ANNOUNCEMENT BAR */}
      {activeTab === 'announcement' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6 max-w-3xl">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Megaphone size={18} className="text-[#74189B]" /> Top Announcement Banner
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Sticky notification bar displayed at the very top of all pages above navigation.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div>
                <span className="font-bold text-slate-900">Enable Announcement Bar</span>
                <p className="text-slate-500 text-[11px] mt-0.5">Show or hide the banner on the public storefront.</p>
              </div>
              <input
                type="checkbox"
                checked={announcementEnabled}
                onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                className="w-5 h-5 accent-[#74189B] rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Announcement Message</label>
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="e.g. VIP Sheesha Delivery across Dubai Marina & Palm Jumeirah"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#74189B] text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Destination Link (Optional)</label>
              <input
                type="text"
                value={announcementLink}
                onChange={(e) => setAnnouncementLink(e.target.value)}
                placeholder="/rentals or /shop"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#74189B] text-slate-800"
              />
            </div>

            {/* Live Visual Preview of Announcement Bar */}
            <div className="pt-4 border-t border-slate-100">
              <span className="block font-bold text-slate-700 mb-2">Live Bar Preview:</span>
              <div className="bg-[#74189B] text-white text-center text-xs py-2.5 px-4 rounded-xl font-medium shadow-sm flex items-center justify-center gap-2">
                <span>{announcementText || 'Your announcement message will appear here'}</span>
                {announcementLink && (
                  <span className="text-[#F1A51D] underline text-[11px] font-bold">Learn More →</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
