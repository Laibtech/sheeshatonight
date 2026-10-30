'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderOpen,
  Upload,
  Search,
  Filter,
  Copy,
  Check,
  Trash2,
  Eye,
  FileText,
  Image as ImageIcon,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Loader2,
  X,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

interface MediaFile {
  name: string;
  url: string;
  size: number;
  sizeFormatted: string;
  updatedAt: string;
  type: string;
  extension: string;
}

interface UsageInfo {
  url: string;
  isUsed: boolean;
  usageCount: number;
  usages: Array<{ module: string; recordId: string; title: string }>;
}

export default function AdminMediaLibraryPage() {
  const { addToast } = useToast();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'IMAGE' | 'DOCUMENT'>('ALL');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Uploading
  const [uploading, setUploading] = useState(false);

  // Preview Modal
  const [previewMedia, setPreviewMedia] = useState<MediaFile | null>(null);

  // Usage Inspector Modal
  const [checkingUsage, setCheckingUsage] = useState(false);
  const [usageData, setUsageData] = useState<UsageInfo | null>(null);
  const [usageModalOpen, setUsageModalOpen] = useState(false);

  // Deletion State
  const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);
  const [forceDelete, setForceDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchMediaFiles();
  }, []);

  const fetchMediaFiles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/media', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        setMediaFiles(json.data || []);
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load media files.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file) formData.append('files', file);
      }

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        addToast({
          type: 'success',
          title: 'Media Uploaded',
          message: `Successfully uploaded ${json.data?.urls?.length || 1} file(s).`,
        });
        fetchMediaFiles();
      } else {
        const err = await res.json();
        addToast({
          type: 'error',
          title: 'Upload Failed',
          message: err.message || 'File upload rejected.',
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Upload Error',
        message: 'Network error uploading file.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    addToast({
      type: 'success',
      title: 'URL Copied',
      message: 'Media link copied to clipboard.',
    });
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleCheckUsage = async (file: MediaFile) => {
    try {
      setCheckingUsage(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          action: 'check_usage',
          url: file.url,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setUsageData(json.data);
        setUsageModalOpen(true);
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to verify media references in database.',
      });
    } finally {
      setCheckingUsage(false);
    }
  };

  const handleInitiateDelete = async (file: MediaFile) => {
    setDeleteTarget(file);
    setForceDelete(false);
    setDeleteWarning(null);

    // Check usage before deleting
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          action: 'check_usage',
          url: file.url,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data as UsageInfo;
        if (data && data.isUsed) {
          setDeleteWarning(
            `Warning: This file is currently referenced in ${data.usageCount} active database record(s) (${data.usages.map((u) => u.title).slice(0, 3).join(', ')}). Deleting it will cause broken visuals on the live storefront!`
          );
        }
      }
    } catch {
      // Proceed with normal confirmation
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const token = localStorage.getItem('auth_token');
      const url = `/api/admin/media?url=${encodeURIComponent(deleteTarget.url)}&force=${forceDelete}`;

      const res = await fetch(url, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        addToast({
          type: 'success',
          title: 'Media Deleted',
          message: 'File removed safely from the server.',
        });
        setDeleteTarget(null);
        fetchMediaFiles();
      } else {
        const err = await res.json();
        addToast({
          type: 'error',
          title: 'Cannot Delete',
          message: err.message || 'Deletion blocked due to active database references.',
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete file.',
      });
    } finally {
      setDeleting(false);
    }
  };

  const filteredFiles = mediaFiles.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(search.toLowerCase()) || file.url.toLowerCase().includes(search.toLowerCase());
    const matchesType =
      typeFilter === 'ALL' ||
      (typeFilter === 'IMAGE' && file.type === 'image') ||
      (typeFilter === 'DOCUMENT' && file.type === 'document');
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#74189B] uppercase tracking-wider mb-1">
            <Sparkles size={14} className="text-[#F1A51D]" /> Centralized Assets
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Media Library & Asset Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, upload, preview, and safely inspect media references before deletion across all marketplace records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMediaFiles}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-xs"
            title="Refresh assets"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#74189B] to-[#571275] hover:brightness-110 text-white font-bold text-xs shadow-md shadow-[#74189B]/20 transition cursor-pointer">
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            <span>{uploading ? 'Uploading...' : 'Upload Media'}</span>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by filename or path..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#74189B]"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {(['ALL', 'IMAGE', 'DOCUMENT'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                typeFilter === t
                  ? 'bg-[#74189B] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {t === 'ALL' ? 'All Files' : t === 'IMAGE' ? 'Images' : 'Documents'}
            </button>
          ))}
          <span className="text-xs font-bold text-slate-400 ml-2">
            {filteredFiles.length} item(s)
          </span>
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
          <Loader2 className="w-8 h-8 text-[#74189B] animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Scanning Media Files...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <FolderOpen size={40} className="mx-auto text-slate-400" />
          <h3 className="font-bold text-slate-800 text-base">No media files found</h3>
          <p className="text-xs text-slate-500">
            {search ? 'No files match your query.' : 'Upload photos, product shots, or banners to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.url}
              className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-[#74189B]/40 transition-all flex flex-col justify-between"
            >
              {/* Media Thumbnail */}
              <div
                onClick={() => setPreviewMedia(file)}
                className="relative aspect-square bg-slate-900 overflow-hidden cursor-pointer"
              >
                {file.type === 'image' ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-3">
                    <FileText size={36} className="text-purple-400" />
                    <span className="text-[10px] font-bold mt-1 text-slate-300 uppercase">{file.extension}</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="p-2 rounded-xl bg-white/90 text-slate-900 shadow-sm hover:scale-110 transition">
                    <Eye size={14} />
                  </span>
                </div>
              </div>

              {/* Details & Action strip */}
              <div className="p-3 space-y-1.5 text-xs">
                <span className="font-bold text-slate-900 truncate block text-[11px]" title={file.name}>
                  {file.name}
                </span>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                  <span>{file.sizeFormatted}</span>
                  <span className="uppercase">{file.extension.replace('.', '')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <button
                  onClick={() => handleCopyUrl(file.url)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-[#74189B] hover:bg-white transition"
                  title="Copy URL"
                >
                  {copiedUrl === file.url ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                </button>

                <button
                  onClick={() => handleCheckUsage(file)}
                  className="px-2 py-1 rounded-md text-[10px] font-bold text-[#74189B] bg-purple-50 hover:bg-purple-100 transition"
                  title="Identify usage in database"
                >
                  Usage
                </button>

                <button
                  onClick={() => handleInitiateDelete(file)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Delete file"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Usage Inspector Modal */}
      {usageModalOpen && usageData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-[#74189B]" />
                <h3 className="text-base font-bold text-slate-900">Database Reference Inspector</h3>
              </div>
              <button
                onClick={() => setUsageModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Target Asset</span>
                <span className="font-mono text-xs block text-slate-800 truncate mt-0.5">{usageData.url}</span>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">
                  Live Usages Detected: <span className="text-[#74189B] font-extrabold">{usageData.usageCount}</span>
                </span>
                {usageData.isUsed ? (
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {usageData.usages.map((u, i) => (
                      <div key={i} className="p-2.5 rounded-xl border border-purple-100 bg-purple-50/50 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-[#74189B] text-[11px] block">{u.module}</span>
                          <span className="text-slate-700 text-xs font-semibold">{u.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{u.recordId.substring(0, 10)}...</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium">
                    This file is not currently referenced by any active product, banner, category, or page in MySQL. It is safe to delete or replace.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setUsageModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 truncate max-w-md">{previewMedia.name}</h3>
                <span className="text-[11px] text-slate-400 font-mono">{previewMedia.url}</span>
              </div>
              <button
                onClick={() => setPreviewMedia(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex justify-center p-4 bg-slate-900 rounded-2xl overflow-hidden max-h-[400px]">
              {previewMedia.type === 'image' ? (
                <img
                  src={previewMedia.url}
                  alt={previewMedia.name}
                  className="max-h-[380px] w-auto object-contain rounded-xl"
                />
              ) : (
                <div className="p-8 text-center text-white space-y-2">
                  <FileText size={48} className="mx-auto text-purple-400" />
                  <p className="font-bold text-sm">PDF Document</p>
                  <a
                    href={previewMedia.url}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs text-[#F1A51D] underline font-bold"
                  >
                    Open Document in New Tab <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="space-x-3">
                <span>Size: <strong className="text-slate-900">{previewMedia.sizeFormatted}</strong></span>
                <span>Type: <strong className="text-slate-900 uppercase">{previewMedia.extension}</strong></span>
              </div>
              <button
                onClick={() => handleCopyUrl(previewMedia.url)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-[#74189B] font-bold hover:bg-purple-100 transition"
              >
                <Copy size={13} /> Copy URL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal with Reference Protection */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete File from Server</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-slate-900 font-mono">{deleteTarget.name}</strong> from disk?
            </p>

            {deleteWarning && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                <span className="font-bold flex items-center gap-1.5">
                  <ShieldAlert size={15} className="text-amber-600" /> Active Database References Found
                </span>
                <p className="text-[11px] leading-relaxed text-amber-800">{deleteWarning}</p>
                <label className="flex items-center gap-2 pt-1 cursor-pointer font-bold text-amber-900 text-[11px]">
                  <input
                    type="checkbox"
                    checked={forceDelete}
                    onChange={(e) => setForceDelete(e.target.checked)}
                    className="w-4 h-4 accent-rose-600"
                  />
                  <span>I understand the risk and wish to force-delete this file</span>
                </label>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting || (Boolean(deleteWarning) && !forceDelete)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition disabled:opacity-40"
              >
                {deleting && <Loader2 size={13} className="animate-spin" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

