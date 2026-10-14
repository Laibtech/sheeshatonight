'use client';

import React, { useEffect, useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Save,
  X,
  Loader2,
} from 'lucide-react';
import { DataTable, Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { useToast } from '@/components/admin/Toast';

interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
}

export default function AdminCategoriesPage() {
  const { addToast } = useToast();

  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRecord | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    isActive: true,
    isFeatured: false,
    sortOrder: 0,
  });

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<CategoryRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        const query = search ? `?search=${encodeURIComponent(search)}` : '';
        const res = await fetch(`/api/admin/categories${query}`, { headers });
        if (res.ok && !ignore) {
          const json = await res.json();
          setCategories(json.data?.categories || json.categories || []);
        }
      } catch (err) {
        if (!ignore) console.error('Error fetching categories:', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [search]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/admin/categories${query}`, { headers });
      if (res.ok) {
        const json = await res.json();
        setCategories(json.data?.categories || json.categories || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
      isActive: true,
      isFeatured: false,
      sortOrder: 0,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: CategoryRecord) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image: cat.image || '',
      isActive: cat.isActive,
      isFeatured: cat.isFeatured,
      sortOrder: cat.sortOrder || 0,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        addToast({
          type: 'success',
          title: editingCategory ? 'Category Updated' : 'Category Created',
          message: `Category "${formData.name}" was saved successfully.`,
        });
        setModalOpen(false);
        fetchCategories();
      } else {
        const err = await res.json();
        addToast({
          type: 'error',
          title: 'Save Failed',
          message: err.error || 'Failed to save category.',
        });
      }
    } catch (err) {
      console.error('Error saving category:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        addToast({
          type: 'success',
          title: 'Category Deleted',
          message: `Category "${deleteTarget.name}" was removed.`,
        });
        setDeleteTarget(null);
        fetchCategories();
      } else {
        addToast({
          type: 'error',
          title: 'Delete Failed',
          message: 'Could not delete category.',
        });
      }
    } catch (err) {
      console.error('Error deleting category:', err);
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<CategoryRecord>[] = [
    {
      header: 'Category',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF8FB] border border-[#E9E3EB] flex items-center justify-center flex-shrink-0 overflow-hidden text-[#74189B]">
            {row.image ? (
              <img src={row.image} alt={row.name} className="w-full h-full object-cover" />
            ) : (
              <Layers className="w-5 h-5 opacity-70" />
            )}
          </div>
          <div>
            <p className="font-bold text-[#29252B]">{row.name}</p>
            <p className="text-[11px] text-[#716975] font-mono">/{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Description',
      cell: (row) => (
        <span className="text-[#716975] text-xs line-clamp-1 max-w-xs">
          {row.description || 'No description provided.'}
        </span>
      ),
    },
    {
      header: 'Sort Order',
      cell: (row) => <span className="font-bold text-[#29252B]">{row.sortOrder}</span>,
    },
    {
      header: 'Featured',
      cell: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            row.isFeatured
              ? 'bg-[#F1A51D]/15 text-[#9E6500]'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          {row.isFeatured ? 'Featured' : 'Standard'}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.isActive ? 'ACTIVE' : 'INACTIVE'} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#74189B] hover:bg-[#FAF8FB] transition"
            title="Edit Category"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Delete Category"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#29252B] tracking-tight">
              Categories Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#74189B]/10 text-[#74189B] text-xs font-bold border border-[#74189B]/20">
              {categories.length} Categories
            </span>
          </div>
          <p className="text-xs text-[#716975] mt-1">
            Organize products and rentals into discoverable categories.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#74189B] hover:bg-[#571275] text-white text-xs font-bold transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={categories}
        loading={loading}
        emptyTitle="No categories found"
        emptyDescription="Add a category to structure your sheesha products."
        searchPlaceholder="Search categories..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#E9E3EB] shadow-2xl overflow-hidden p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E3EB]">
              <h3 className="text-base font-bold text-[#29252B]">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-[#29252B] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Russian Sheeshas"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#FAF8FB] border border-[#E9E3EB] rounded-xl text-xs text-[#29252B] focus:outline-none focus:border-[#74189B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#29252B] mb-1">
                  Slug (URL key)
                </label>
                <input
                  type="text"
                  placeholder="e.g. russian-sheeshas"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#FAF8FB] border border-[#E9E3EB] rounded-xl text-xs text-[#29252B] focus:outline-none focus:border-[#74189B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#29252B] mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. /Categories/Rentals.webp"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#FAF8FB] border border-[#E9E3EB] rounded-xl text-xs text-[#29252B] focus:outline-none focus:border-[#74189B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#29252B] mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3.5 py-2 bg-[#FAF8FB] border border-[#E9E3EB] rounded-xl text-xs text-[#29252B] focus:outline-none focus:border-[#74189B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#29252B] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Category description for customer discovery..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#FAF8FB] border border-[#E9E3EB] rounded-xl text-xs text-[#29252B] focus:outline-none focus:border-[#74189B]"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-[#29252B] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-[#74189B] focus:ring-[#74189B] w-4 h-4"
                  />
                  <span>Active</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-[#29252B] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData({ ...formData, isFeatured: e.target.checked })
                    }
                    className="rounded text-[#74189B] focus:ring-[#74189B] w-4 h-4"
                  />
                  <span>Featured</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E9E3EB]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#74189B] hover:bg-[#571275] text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deleteTarget?.name}"?`}
        confirmText="Delete Category"
        isDangerous={true}
        loading={deleting}
      />
    </div>
  );
}
