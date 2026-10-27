'use client';

import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, Loader2, CheckCircle2 } from 'lucide-react';

interface ImageUploaderProps {
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

export function ImageUploader({ value = '', onChange, label = 'Product Image', className = '' }: ImageUploaderProps) {
  const [tab, setTab] = useState<'file' | 'url'>('file');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const safeValue = typeof value === 'string' ? value : '';

  const getAuthToken = () => {
    if (typeof window === 'undefined') return '';
    let token = localStorage.getItem('auth_token');
    if (!token) {
      const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
      if (match && match[1]) token = decodeURIComponent(match[1]);
    }
    return token || '';
  };

  const uploadFile = async (file: File) => {
    setError('');
    setUploading(true);

    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('files', file);

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success && data.urls && data.urls.length > 0) {
        onChange(data.urls[0]);
      } else {
        setError(data.error || data.message || 'Failed to upload image. Please try again.');
      }
    } catch (err: any) {
      console.error('File upload failed:', err);
      setError(err.message || 'Server error uploading file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Hidden file input placed outside conditional blocks to prevent React DOM reconciliation reusing input element */}
      <input
        key="image-uploader-hidden-file-input"
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">{label}</label>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
          <button
            type="button"
            onClick={() => setTab('file')}
            className={`px-2.5 py-1 rounded-md font-semibold transition flex items-center gap-1 ${
              tab === 'file' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Upload size={12} /> Upload File
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`px-2.5 py-1 rounded-md font-semibold transition flex items-center gap-1 ${
              tab === 'url' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LinkIcon size={12} /> Image URL
          </button>
        </div>
      </div>

      {tab === 'file' ? (
        <div
          key="tab-file-panel"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[110px] relative ${
            dragActive
              ? 'border-[#D4AF37] bg-amber-50/50'
              : safeValue
              ? 'border-emerald-300 bg-emerald-50/20 hover:bg-slate-50'
              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
              <span className="text-xs font-semibold text-slate-600">Uploading to server...</span>
            </div>
          ) : safeValue ? (
            <div className="flex items-center gap-3 w-full justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden shrink-0 relative">
                  <img src={safeValue} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Image Selected
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1 max-w-[200px]">{safeValue}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
                className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                title="Remove image"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-slate-500">
              <div className="w-9 h-9 rounded-full bg-amber-50 text-[#D4AF37] flex items-center justify-center">
                <Upload size={18} />
              </div>
              <div className="text-xs font-bold text-slate-800">
                Click to browse or drag & drop image file
              </div>
              <div className="text-[10px] text-slate-400">
                Supports JPG, PNG, WEBP (Max size 5MB)
              </div>
            </div>
          )}
        </div>
      ) : (
        <div key="tab-url-panel" className="space-y-2">
          <input
            key="tab-url-text-input"
            type="text"
            value={safeValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D4AF37]"
          />
          {safeValue && (
            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
              <img src={safeValue} alt="URL Preview text" className="w-10 h-10 object-cover rounded-lg shrink-0 border" />
              <span className="text-[11px] text-slate-600 line-clamp-1 flex-1">{safeValue}</span>
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-rose-500 p-1 hover:bg-rose-50 rounded-lg"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
          {error}
        </div>
      )}
    </div>
  );
}
