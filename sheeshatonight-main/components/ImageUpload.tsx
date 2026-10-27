'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value: string[]; // Array of image URLs
  onChange: (urls: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function ImageUpload({ value = [], onChange, maxImages = 5, disabled = false }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      
      // Add selected files
      Array.from(files).forEach((file) => {
        if (file) {
          formData.append('files', file);
        }
      });

      // Upload to API
      const token = localStorage.getItem('auth_token') || '';
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      // Add new URLs to existing ones
      const newUrls = [...value, ...data.urls];
      onChange(newUrls.slice(0, maxImages)); // Respect max limit

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload images');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async (urlToRemove: string) => {
    try {
      // Remove from state immediately for better UX
      const newUrls = value.filter(url => url !== urlToRemove);
      onChange(newUrls);

      // Delete from server
      const token = localStorage.getItem('auth_token') || '';
      await fetch('/api/upload/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ urls: [urlToRemove] }),
      });

    } catch (err) {
      console.error('Delete error:', err);
      // Don't show error to user, just log it
    }
  };

  const canAddMore = value.length < maxImages;

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      {canAddMore && (
        <div>
          <input
            key="multi-image-file-input"
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
              disabled || uploading
                ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                : 'border-purple-300 bg-purple-50 hover:bg-purple-100 hover:border-purple-400'
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                <span className="text-sm font-medium text-purple-700">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">
                  Upload Images ({value.length}/{maxImages})
                </span>
              </>
            )}
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Max {maxImages} images. Supported: JPEG, PNG, WebP (max 5MB each)
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Image Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div
              key={url}
              className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-all"
            >
              {/* Image */}
              <img
                src={url}
                alt={`Product ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
                }}
              />

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemove(url)}
                disabled={disabled}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Index Badge */}
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs font-semibold rounded">
                {index === 0 ? 'Primary' : `#${index + 1}`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {value.length === 0 && !uploading && (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
          <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 font-medium">No images uploaded yet</p>
          <p className="text-xs text-gray-500 mt-1">Click the upload button above to add images</p>
        </div>
      )}
    </div>
  );
}
