'use client';

import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, RefreshCw, X } from 'lucide-react';
import { ImageUploader } from '@/components/ImageUploader';
import { Toast } from '@/components/Toast';

interface ProductItem {
  id: string;
  title: string;
  description?: string;
  price: number | string;
  stock: number;
  type: string;
  sku?: string;
  images?: any;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export default function VendorProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [type, setType] = useState('TOBACCO_BLEND');
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Toast
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (message: string, variant: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(variant);
    setToastOpen(true);
  };

  const getAuthToken = () => {
    if (typeof window === 'undefined') return '';
    let token = localStorage.getItem('auth_token');
    if (!token) {
      const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
      if (match && match[1]) token = decodeURIComponent(match[1]);
    }
    return token || '';
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const res = await fetch('/api/vendor/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data?.data)) {
        setProducts(data.data.data);
      } else if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      } else {
        throw new Error(data.error || 'Failed to load vendor products');
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      showToast('Failed to load your products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setStock('10');
    setType('TOBACCO_BLEND');
    setSku(`SKU-${Date.now().toString().slice(-6)}`);
    setImageUrl('https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600');
    setShowAddModal(true);
  };

  useEffect(() => {
    fetchProducts();
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('add') === 'true') {
        handleOpenAddModal();
      }
    }
  }, []);

  const handleOpenEditModal = (p: ProductItem) => {
    setEditingProduct(p);
    setTitle(p.title || '');
    setDescription(p.description || '');
    setPrice(p.price !== undefined && p.price !== null ? p.price.toString() : '');
    setStock(p.stock !== undefined && p.stock !== null ? p.stock.toString() : '10');
    setType(p.type || 'TOBACCO_BLEND');
    setSku(p.sku || '');
    let img = '';
    if (p.images) {
      if (Array.isArray(p.images)) img = p.images[0] || '';
      else if (typeof p.images === 'string') {
        try {
          const parsed = JSON.parse(p.images);
          img = Array.isArray(parsed) ? parsed[0] : p.images;
        } catch {
          img = p.images;
        }
      }
    }
    setImageUrl(img || 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600');
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Product title is required', 'error');
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      showToast('Please enter a valid positive price in AED', 'error');
      return;
    }

    try {
      const token = getAuthToken();
      const res = await fetch('/api/vendor/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description?.trim() || undefined,
          price: Number(numPrice.toFixed(2)),
          stock: parseInt(stock) || 0,
          type,
          sku: sku?.trim() || `SKU-${Date.now().toString().slice(-6)}`,
          images: [imageUrl || 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600'],
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Product saved successfully to database!', 'success');
        setShowAddModal(false);
        fetchProducts();
      } else {
        const msg = data.message || data.error || (data.details ? Object.values(data.details).join(', ') : 'Failed to save product');
        showToast(msg, 'error');
      }
    } catch (err: any) {
      showToast('Error saving product: ' + (err.message || 'Server error'), 'error');
    }
  };

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/vendor/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          price: Number(price),
          stock: Number(stock),
          type,
          sku,
          images: [imageUrl || 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600'],
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Product updated successfully!', 'success');
        setEditingProduct(null);
        fetchProducts();
      } else {
        showToast(data.message || 'Failed to update product', 'error');
      }
    } catch (err: any) {
      showToast('Error updating product: ' + (err.message || 'Server error'), 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/vendor/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showToast('Product deleted successfully!', 'success');
        setProducts((currentProducts) => currentProducts.filter((product) => product.id !== id));
      } else {
        showToast(data.error || data.message || 'Failed to delete product', 'error');
      }
    } catch (err: any) {
      showToast('Error deleting product', 'error');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-500 font-bold">Vendor Inventory</p>
            <h1 className="text-3xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <Package className="w-8 h-8 text-[#D4AF37]" />
              Marketplace Products Management
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Add new sheesha blends, pipes, accessories and variations directly to your store inventory.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchProducts}
              className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition"
              title="Refresh Products"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 bg-[#D4AF37] hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition"
            >
              <Plus size={18} /> Add New Product
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search product title or SKU..."
              value={search || ''}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D4AF37]"
            />
          </div>
          <div className="text-xs font-bold text-slate-600">
            Active Catalog Items: <span className="text-slate-900 font-black">{filteredProducts.length}</span>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Product Name</th>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Stock</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Loading products...
                    </td>
                  </tr>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 font-bold text-slate-900">{product.title}</td>
                      <td className="py-3 px-3 font-mono text-slate-500">{product.sku || 'N/A'}</td>
                      <td className="py-3 px-3 text-slate-600 font-semibold">{product.type}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">AED {product.price}</td>
                      <td className="py-3 px-3 text-slate-700">{product.stock} units</td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          product.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {product.isActive !== false ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {product.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No products found. Click &quot;Add New Product&quot; to create your first product.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#D4AF37]" />
                  Add New Product to Inventory
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    value={title || ''}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Double Apple Special Blend"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D4AF37]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description / Variations</label>
                  <textarea
                    rows={3}
                    value={description || ''}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Flavor description, ingredients, origin..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Price (AED) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={price || ''}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="120.00"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D4AF37]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Stock Units *</label>
                    <input
                      type="number"
                      value={stock || ''}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="10"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D4AF37]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category / Type</label>
                    <select
                      value={type || 'TOBACCO_BLEND'}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D4AF37]"
                    >
                      <option value="TOBACCO_BLEND">Tobacco Blend</option>
                      <option value="SHEESHA_PIPE">Sheesha Pipe</option>
                      <option value="ACCESSORY">Accessory</option>
                      <option value="RENTAL_PACKAGE">Rental Package</option>
                      <option value="EQUIPMENT">Equipment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">SKU</label>
                    <input
                      type="text"
                      value={sku || ''}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D4AF37]"
                    />
                  </div>
                </div>

                <ImageUploader value={imageUrl || ''} onChange={setImageUrl} label="Product Image (Upload File or URL)" />

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#D4AF37] text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-500 shadow-md"
                  >
                    Save & Publish Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingProduct && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-[#D4AF37]" />
                  Edit Product: {editingProduct.title}
                </h3>
                <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEditProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={title || ''}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D4AF37]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={description || ''}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Price (AED)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={price || ''}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D4AF37]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Stock Units</label>
                    <input
                      type="number"
                      value={stock || ''}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D4AF37]"
                      required
                    />
                  </div>
                </div>

                <ImageUploader value={imageUrl || ''} onChange={setImageUrl} label="Product Image (Upload File or URL)" />

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#D4AF37] text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-500 shadow-md"
                  >
                    Update Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <Toast open={toastOpen} message={toastMessage} variant={toastType} onClose={() => setToastOpen(false)} />
      </div>
    );
  }
