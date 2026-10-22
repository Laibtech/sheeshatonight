'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Package, Trash2 } from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

export default function AdminEditProductPage({
  params,
}: {
  params?: Promise<{ id: string }> | { id: string };
}) {
  const router = useRouter();
  const routeParams = useParams();
  const unwrapped = params ? ('then' in params ? React.use(params) : params) : null;
  const productId = (routeParams?.id as string) || unwrapped?.id || '';

  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vendors, setVendors] = useState<Array<{ id: string; name: string }>>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'SHEESHA_PIPE',
    price: '',
    currency: 'AED',
    stock: '0',
    sku: '',
    vendorId: '',
    imageUrl: '',
    isActive: true,
    isFeatured: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

        const [productRes, vendorsRes] = await Promise.all([
          fetch(`/api/admin/products/${productId}`, { headers }),
          fetch('/api/admin/vendors?pageSize=50', { headers }),
        ]);

        if (vendorsRes.ok) {
          const vJson = await vendorsRes.json();
          setVendors(vJson.data || []);
        }

        if (productRes.ok) {
          const pJson = await productRes.json();
          const p = pJson.data?.product || pJson.product;
          if (p) {
            setFormData({
              title: p.title || '',
              description: p.description || '',
              type: p.type || 'SHEESHA_PIPE',
              price: p.price?.toString() || '0',
              currency: p.currency || 'AED',
              stock: p.stock?.toString() || '0',
              sku: p.sku || '',
              vendorId: p.vendorId || '',
              imageUrl: Array.isArray(p.images) && p.images[0] ? p.images[0] : '',
              isActive: p.isActive ?? true,
              isFeatured: p.isFeatured ?? false,
            });
          }
        } else {
          addToast({
            type: 'error',
            title: 'Not Found',
            message: 'Product could not be loaded.',
          });
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('auth_token');

      const payload = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        price: parseFloat(formData.price),
        currency: formData.currency,
        stock: parseInt(formData.stock) || 0,
        sku: formData.sku || undefined,
        vendorId: formData.vendorId,
        images: formData.imageUrl ? [formData.imageUrl] : [],
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
      };

      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        addToast({
          type: 'success',
          title: 'Product Updated',
          message: 'Changes were saved successfully.',
        });
        router.push('/admin/products');
      } else {
        const err = await res.json();
        addToast({
          type: 'error',
          title: 'Update Failed',
          message: err.error || 'Failed to update product.',
        });
      }
    } catch (err) {
      console.error('Error updating product:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!productId) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        addToast({
          type: 'success',
          title: 'Product Deleted',
          message: 'Product was removed from the catalogue.',
        });
        router.push('/admin/products');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="w-8 h-8 text-[#74189B] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl bg-white border border-[#E9E3EB] hover:bg-slate-50 text-slate-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-[#29252B] tracking-tight">
              Edit Product
            </h1>
            <p className="text-xs text-[#716975] mt-0.5">
              Editing: {formData.title || 'Product'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDeleteModalOpen(true)}
          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
          title="Delete Product"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-[#E9E3EB] p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#29252B] border-b border-[#E9E3EB] pb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#74189B]" />
            <span>Product Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#29252B] mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8FB] border border-[#E9E3EB] rounded-xl text-xs text-[#29252B] focus:outline-none focus:border-[#74189B] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#29252B] mb-1">
                Product Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8FB] border border-[#E9E3EB] rounded-xl text-xs font-semibold text-[#29252B] focus:outline-none focus:border-[#74189B]"
              >
                <option value="SHEESHA_PIPE">Sheesha Pipe</option>
                <option value="TOBACCO_BLEND">Tobacco Blend</option>
                <option value="ACCESSORY">Accessory</option>
                <option value="RENTAL_PACKAGE">Rental Package</option>
                <option value="EQUIPMENT">Equipment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#29252B] mb-1">
                Vendor
              </label>
              <select
                value={formData.vendorId}
                onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8FB] border border-[#E9E3EB] rounded-xl text-xs font-semibold text-[#29252B] focus:outline-none focus:border-[#74189B]"
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#29252B] mb-1">
                Price (AED) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8FB] border border-[#E9E3EB] rounded-xl text-xs text-[#29252B] focus:outline-none focus:border-[#74189B] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#29252B] mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8FB] border border-[#E9E3EB] rounded-xl text-xs text-[#29252B] focus:outline-none focus:border-[#74189B] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#29252B] mb-1">
                SKU
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8FB] border border-[#E9E3EB] rounded-xl text-xs text-[#29252B] focus:outline-none focus:border-[#74189B] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#29252B] mb-1">
                Image URL
              </label>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8FB] border border-[#E9E3EB] rounded-xl text-xs text-[#29252B] focus:outline-none focus:border-[#74189B] focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#29252B] mb-1">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8FB] border border-[#E9E3EB] rounded-xl text-xs text-[#29252B] focus:outline-none focus:border-[#74189B] focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-6 sm:col-span-2 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-[#29252B] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-[#74189B] focus:ring-[#74189B] w-4 h-4"
                />
                <span>Active in Marketplace</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-[#29252B] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded text-[#74189B] focus:ring-[#74189B] w-4 h-4"
                />
                <span>Featured on Homepage</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2.5 text-xs font-bold text-[#716975] hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#74189B] hover:bg-[#571275] text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Changes</span>
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${formData.title}"?`}
        confirmText="Delete Product"
        isDangerous={true}
      />
    </div>
  );
}
