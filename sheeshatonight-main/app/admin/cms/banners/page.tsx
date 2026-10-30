'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  X,
  Layers,
  ArrowRight,
  Upload,
  Calendar,
  Eye,
  ArrowUp,
  ArrowDown,
  Monitor,
  Smartphone,
  Info,
  Clock,
  Sparkles
} from 'lucide-react';
import { EmptyState } from '@/components/admin/EmptyState';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { TableSkeleton } from '@/components/admin/LoadingSkeleton';
import { useToast } from '@/components/admin/Toast';

interface BannerItem {
  id: string;
  heading: string;
  subtitle?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  desktopImg?: string | null;
  mobileImg?: string | null;
  position: string;
  sortOrder: number;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const PLACEMENTS = [
  { value: 'HOMEPAGE_HERO', label: 'Homepage Hero Carousel', dimensions: '1920 × 680 px (Desktop) / 750 × 900 px (Mobile)' },
  { value: 'PROMO_SECTION', label: 'Homepage Promotional Callout', dimensions: '1440 × 400 px (Desktop) / 600 × 400 px (Mobile)' },
  { value: 'PRODUCT_LISTING', label: 'Product Listing Top Banner', dimensions: '1400 × 300 px' },
  { value: 'RENTAL_LISTING', label: 'Rental Listing Top Banner', dimensions: '1400 × 300 px' },
  { value: 'CATEGORY_PAGE', label: 'Category Page Banner', dimensions: '1200 × 350 px' },
  { value: 'VENDOR_PAGE', label: 'Vendor Directory Banner', dimensions: '1400 × 350 px' },
  { value: 'CAMPAIGN', label: 'Campaign / Sale Ribbon', dimensions: '1920 × 450 px' },
];

export default function AdminBannersCmsPage() {
  const { showToast } = useToast();
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPosition, setFilterPosition] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [heading, setHeading] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [desktopImg, setDesktopImg] = useState('');
  const [mobileImg, setMobileImg] = useState('');
  const [position, setPosition] = useState('HOMEPAGE_HERO');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);

  // Preview Modal
  const [previewBanner, setPreviewBanner] = useState<BannerItem | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/cms/banners', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBanners(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch banners:', err);
      showToast('Failed to load banners from MySQL', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setHeading('');
    setSubtitle('');
    setCtaText('Explore Now');
    setCtaUrl('/shop');
    setDesktopImg('');
    setMobileImg('');
    setPosition('HOMEPAGE_HERO');
    setSortOrder((banners.length + 1).toString());
    setIsActive(true);
    setStartDate('');
    setEndDate('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: BannerItem) => {
    setEditingBanner(b);
    setHeading(b.heading);
    setSubtitle(b.subtitle || '');
    setCtaText(b.ctaText || '');
    setCtaUrl(b.ctaUrl || '');
    setDesktopImg(b.desktopImg || '');
    setMobileImg(b.mobileImg || '');
    setPosition(b.position || 'HOMEPAGE_HERO');
    setSortOrder(b.sortOrder?.toString() || '0');
    setIsActive(b.isActive);
    setStartDate(b.startDate ? b.startDate.substring(0, 10) : '');
    setEndDate(b.endDate ? b.endDate.substring(0, 10) : '');
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'desktop' | 'mobile') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (target === 'desktop') setUploadingDesktop(true);
      else setUploadingMobile(true);

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
          if (target === 'desktop') setDesktopImg(json.urls[0]);
          else setMobileImg(json.urls[0]);
          showToast(`${target === 'desktop' ? 'Desktop' : 'Mobile'} image uploaded!`, 'success');
        }
      } else {
        const err = await res.json();
        showToast(err.error || 'Upload failed', 'error');
      }
    } catch {
      showToast('Error uploading image', 'error');
    } finally {
      if (target === 'desktop') setUploadingDesktop(false);
      else setUploadingMobile(false);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heading.trim()) {
      showToast('Banner heading is required', 'error');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const payload = {
        heading,
        subtitle: subtitle || null,
        ctaText: ctaText || null,
        ctaUrl: ctaUrl || null,
        desktopImg: desktopImg || null,
        mobileImg: mobileImg || null,
        position,
        sortOrder: parseInt(sortOrder, 10) || 0,
        isActive,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
      };

      if (editingBanner) {
        const res = await fetch(`/api/admin/cms/banners/${editingBanner.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showToast('Banner updated in database!', 'success');
          setIsModalOpen(false);
          fetchBanners();
        } else {
          showToast(data.message || 'Failed to update banner', 'error');
        }
      } else {
        const res = await fetch('/api/admin/cms/banners', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showToast('Banner created successfully in MySQL!', 'success');
          setIsModalOpen(false);
          fetchBanners();
        } else {
          showToast(data.message || 'Failed to create banner', 'error');
        }
      }
    } catch (err) {
      showToast('Failed to save banner', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (banner: BannerItem) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/admin/cms/banners/${banner.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });
      if (res.ok) {
        showToast(`Banner ${!banner.isActive ? 'activated' : 'disabled'}!`, 'success');
        fetchBanners();
      }
    } catch {
      showToast('Failed to toggle status', 'error');
    }
  };

  const handleMoveOrder = async (banner: BannerItem, direction: 'up' | 'down') => {
    const sorted = [...banners].sort((a, b) => a.sortOrder - b.sortOrder);
    const currentIndex = sorted.findIndex((b) => b.id === banner.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const targetBanner = sorted[targetIndex];
    if (!targetBanner) return;
    const newCurrentOrder = targetBanner.sortOrder;
    const newTargetOrder = banner.sortOrder;

    try {
      const token = localStorage.getItem('auth_token');
      await Promise.all([
        fetch(`/api/admin/cms/banners/${banner.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ sortOrder: newCurrentOrder }),
        }),
        fetch(`/api/admin/cms/banners/${targetBanner.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ sortOrder: newTargetOrder }),
        }),
      ]);
      fetchBanners();
    } catch {
      showToast('Failed to reorder banners', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/admin/cms/banners/${deletingId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        showToast('Banner deleted from MySQL successfully', 'success');
        setDeleteConfirmOpen(false);
        setDeletingId(null);
        fetchBanners();
      } else {
        showToast(data.message || 'Failed to delete banner', 'error');
      }
    } catch (err) {
      showToast('Failed to delete banner', 'error');
    }
  };

  const filteredBanners = filterPosition === 'ALL'
    ? banners
    : banners.filter((b) => b.position === filterPosition);

  const selectedPlacementInfo = PLACEMENTS.find((p) => p.value === position);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <Link
            href="/admin/cms"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#74189B] hover:text-[#571275] mb-1.5 transition"
          >
            <ArrowLeft size={14} /> Back to CMS Overview
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Banner Management System</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#74189B]/10 text-[#74189B]">
              {banners.length} Live Banners
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure desktop and mobile banner visuals, placements, scheduling, and destination links across the website.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchBanners}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#74189B] to-[#571275] text-white hover:brightness-110 transition shadow-md shadow-purple-900/10"
          >
            <Plus size={16} />
            Add New Banner
          </button>
        </div>
      </div>

      {/* Dimension Guidance Card */}
      <div className="bg-gradient-to-r from-purple-50 via-amber-50/40 to-white p-4 rounded-2xl border border-purple-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-slate-700">
        <div className="flex items-center gap-2.5">
          <Info size={18} className="text-[#74189B] shrink-0" />
          <div>
            <span className="font-bold text-slate-900">Recommended Image Dimensions:</span>
            <span className="text-slate-600 ml-2">Hero (1920×680px), Promo (1440×400px), Listing (1400×300px), Mobile (750×900px).</span>
          </div>
        </div>
        <span className="text-[11px] font-bold text-[#74189B] bg-white/80 px-2.5 py-1 rounded-full border border-purple-200 shrink-0">
          Auto WebP Optimization
        </span>
      </div>

      {/* Filter Tabs by Placement */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-3">
        <button
          onClick={() => setFilterPosition('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filterPosition === 'ALL'
              ? 'bg-[#74189B] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
        >
          All Placements ({banners.length})
        </button>
        {PLACEMENTS.map((p) => {
          const count = banners.filter((b) => b.position === p.value).length;
          return (
            <button
              key={p.value}
              onClick={() => setFilterPosition(p.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filterPosition === p.value
                  ? 'bg-[#74189B] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
            >
              {p.label.split(' ')[0]} ({count})
            </button>
          );
        })}
      </div>

      {/* Banners List / Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
          <TableSkeleton rows={4} cols={5} />
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
          <EmptyState
            title="No promotional banners found in this placement"
            description="Create your first banner or select another placement category above."
            actionLabel="Create Banner"
            onAction={handleOpenCreate}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBanners.map((banner, index) => (
            <div
              key={banner.id}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md ${banner.isActive ? 'border-slate-200 hover:border-[#74189B]/40' : 'border-slate-200/60 opacity-65'
                }`}
            >
              <div>
                {/* Visual Image Preview */}
                <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden">
                  {banner.desktopImg ? (
                    <img
                      src={banner.desktopImg}
                      alt={banner.heading}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 p-4">
                      <ImageIcon size={32} />
                      <span className="text-[11px] font-bold mt-1 text-slate-400">No Image Uploaded</span>
                    </div>
                  )}

                  {/* Gradient Overlay & Badges */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/20">
                        {banner.position.replace('_', ' ')}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${banner.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                          }`}
                      >
                        {banner.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white line-clamp-1">{banner.heading}</h3>
                      {banner.subtitle && (
                        <p className="text-[11px] text-white/80 line-clamp-1 mt-0.5">{banner.subtitle}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Banner Metadata & Destination */}
                <div className="p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span className="font-bold flex items-center gap-1">
                      Priority Order: <span className="text-[#74189B] font-extrabold">#{banner.sortOrder}</span>
                    </span>
                    {banner.ctaText && (
                      <span className="font-semibold text-slate-600 truncate max-w-[130px]">
                        CTA: {banner.ctaText} → {banner.ctaUrl || '/'}
                      </span>
                    )}
                  </div>

                  {(banner.startDate || banner.endDate) && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                      <Clock size={12} className="text-amber-500" />
                      <span>
                        {banner.startDate ? new Date(banner.startDate).toLocaleDateString() : 'Immediate'} –{' '}
                        {banner.endDate ? new Date(banner.endDate).toLocaleDateString() : 'Forever'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveOrder(banner, 'up')}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition"
                    title="Move Up"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    onClick={() => handleMoveOrder(banner, 'down')}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition"
                    title="Move Down"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    onClick={() => setPreviewBanner(banner)}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-[#74189B] transition"
                    title="Preview Banner"
                  >
                    <Eye size={13} />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleStatus(banner)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${banner.isActive
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      }`}
                  >
                    {banner.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(banner)}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition"
                    title="Edit Banner"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => {
                      setDeletingId(banner.id);
                      setDeleteConfirmOpen(true);
                    }}
                    className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                    title="Delete Banner"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingBanner ? 'Edit Promotional Banner' : 'Create New Banner'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Updates are directly committed to MySQL and reflect on the public website.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Banner Placement Target</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold focus:border-[#74189B] outline-none"
                  >
                    {PLACEMENTS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  {selectedPlacementInfo && (
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Recommended: {selectedPlacementInfo.dimensions}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Priority Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold focus:border-[#74189B] outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Lower numbers appear first</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Banner Heading *</label>
                <input
                  type="text"
                  required
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  placeholder="e.g. VIP Beachfront Shisha Packages"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold text-sm focus:border-[#74189B] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subtitle / Description (Optional)</label>
                <textarea
                  rows={2}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Exclusive JBR & Palm Jumeirah Sunset Specials with sommelier service"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-[#74189B] outline-none"
                />
              </div>

              {/* Desktop & Mobile Images with Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-2">
                  <label className="block font-bold text-slate-700">Desktop Banner Image</label>
                  <input
                    type="text"
                    value={desktopImg}
                    onChange={(e) => setDesktopImg(e.target.value)}
                    placeholder="https://... or /hero-banner.png"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800"
                  />
                  <label className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 hover:border-[#74189B] bg-slate-50 cursor-pointer transition text-slate-600 font-bold text-xs">
                    {uploadingDesktop ? <Loader2 size={14} className="animate-spin text-[#74189B]" /> : <Upload size={14} />}
                    <span>{uploadingDesktop ? 'Uploading...' : 'Upload Desktop'}</span>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'desktop')} className="hidden" />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="block font-bold text-slate-700">Mobile Banner Image (Optional)</label>
                  <input
                    type="text"
                    value={mobileImg}
                    onChange={(e) => setMobileImg(e.target.value)}
                    placeholder="Separate portrait image for phones"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800"
                  />
                  <label className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 hover:border-[#74189B] bg-slate-50 cursor-pointer transition text-slate-600 font-bold text-xs">
                    {uploadingMobile ? <Loader2 size={14} className="animate-spin text-[#74189B]" /> : <Upload size={14} />}
                    <span>{uploadingMobile ? 'Uploading...' : 'Upload Mobile'}</span>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'mobile')} className="hidden" />
                  </label>
                </div>
              </div>

              {/* CTA Button Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="e.g. Book VIP Package"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-[#74189B] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Destination URL</label>
                  <input
                    type="text"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    placeholder="e.g. /rentals or https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-[#74189B] outline-none"
                  />
                </div>
              </div>

              {/* Scheduling Start/End Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date (Scheduling)</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date (Auto-expire)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800"
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#74189B] focus:ring-[#74189B]"
                  />
                  <span>Active & Visible on Public Website</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#74189B] to-[#571275] text-white font-bold shadow-md shadow-purple-900/10 hover:brightness-110 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  {editingBanner ? 'Save Changes' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banner Preview Modal */}
      {previewBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-slate-900">Banner Live Preview</h3>
                <div className="flex items-center rounded-xl bg-slate-100 p-0.5 text-xs font-bold">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg transition ${previewDevice === 'desktop' ? 'bg-white text-[#74189B] shadow-xs' : 'text-slate-500'
                      }`}
                  >
                    <Monitor size={14} /> Desktop
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg transition ${previewDevice === 'mobile' ? 'bg-white text-[#74189B] shadow-xs' : 'text-slate-500'
                      }`}
                  >
                    <Smartphone size={14} /> Mobile
                  </button>
                </div>
              </div>
              <button
                onClick={() => setPreviewBanner(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex justify-center p-4 bg-slate-100 rounded-2xl overflow-hidden">
              <div
                className={`relative overflow-hidden rounded-2xl shadow-xl transition-all ${previewDevice === 'desktop' ? 'w-full aspect-[2.8/1] max-w-3xl' : 'w-[320px] aspect-[4/5]'
                  }`}
              >
                <img
                  src={
                    previewDevice === 'mobile' && previewBanner.mobileImg
                      ? previewBanner.mobileImg
                      : previewBanner.desktopImg || '/hero-banner.png'
                  }
                  alt={previewBanner.heading}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#38064F]/90 via-[#571275]/60 to-transparent flex items-center p-6 sm:p-10">
                  <div className="max-w-[420px] text-white space-y-2">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E4AD36] text-[#2B043D] uppercase">
                      {previewBanner.position.replace('_', ' ')}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black leading-tight">{previewBanner.heading}</h2>
                    {previewBanner.subtitle && (
                      <p className="text-xs text-white/80 line-clamp-2">{previewBanner.subtitle}</p>
                    )}
                    {previewBanner.ctaText && (
                      <div className="pt-2">
                        <span className="inline-flex items-center gap-1 bg-[#E4AD36] text-[#2B043D] px-4 py-2 rounded-xl font-bold text-xs shadow-md">
                          {previewBanner.ctaText}
                          <ArrowRight size={13} />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeletingId(null);
        }}
        onConfirm={handleDelete}
        title="Delete Banner Permanently"
        message="Are you sure you want to delete this promotional banner? It will be immediately removed from the public website."
        confirmText="Yes, Delete Banner"
        isDanger={true}
      />
    </div>
  );
}
