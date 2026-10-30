'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  ShieldAlert,
  Loader2,
  Image as ImageIcon,
  DollarSign,
  Package,
  Store,
  Calendar,
  Layers,
  ArrowRight,
  Upload,
  RefreshCw,
  X
} from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

interface VendorOption {
  id: string;
  name: string;
  slug: string;
}

interface RentalPackage {
  id: string;
  title: string;
  description?: string;
  price: number;
  rentalHourlyPrice?: number | null;
  rentalDurationHours?: number | null;
  securityDeposit?: number | null;
  deliveryCharge?: number | null;
  equipmentDetails?: string | null;
  accessoriesIncluded?: string | null;
  rentalTerms?: string | null;
  stock: number;
  images?: any;
  sku?: string;
  isActive: boolean;
  isFeatured: boolean;
  vendorId: string;
  vendor?: {
    id: string;
    name: string;
    slug: string;
    tier?: string;
  };
  _count?: {
    orderItems: number;
  };
}

export default function AdminRentalsPage() {
  const { addToast } = useToast();
  const [rentals, setRentals] = useState<RentalPackage[]>([]);
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [vendorFilter, setVendorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeBookingsCount, setActiveBookingsCount] = useState(0);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRental, setEditingRental] = useState<RentalPackage | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [price, setPrice] = useState('250');
  const [rentalHourlyPrice, setRentalHourlyPrice] = useState('');
  const [rentalDurationHours, setRentalDurationHours] = useState('24');
  const [securityDeposit, setSecurityDeposit] = useState('100');
  const [deliveryCharge, setDeliveryCharge] = useState('0');
  const [equipmentDetails, setEquipmentDetails] = useState('German Stainless Steel Shisha, Heavy Crystal Base, Heat Management Device');
  const [accessoriesIncluded, setAccessoriesIncluded] = useState('Disposable Hygienic Tips, Silicone Hose, Coconut Coals, Electric Burner, Tongs');
  const [rentalTerms, setRentalTerms] = useState('Equipment must be returned undamaged. 18+ ID required at delivery.');
  const [stock, setStock] = useState('5');
  const [images, setImages] = useState<string[]>(['/Categories/Rentals.webp']);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<RentalPackage | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRentals = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (vendorFilter !== 'ALL') params.set('vendorId', vendorFilter);
      if (statusFilter !== 'ALL') params.set('isActive', statusFilter);

      const [resRentals, resVendors] = await Promise.all([
        fetch(`/api/admin/rentals?${params.toString()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
        fetch('/api/admin/vendors', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
      ]);

      if (resRentals.ok) {
        const json = await resRentals.json();
        setRentals(json.data || []);
        if (json.activeBookingsCount !== undefined) {
          setActiveBookingsCount(json.activeBookingsCount);
        }
      }

      if (resVendors.ok) {
        const jsonV = await resVendors.json();
        setVendors(jsonV.data?.vendors || jsonV.vendors || []);
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to load rentals.' });
    } finally {
      setLoading(false);
    }
  }, [search, vendorFilter, statusFilter, addToast]);

  useEffect(() => {
    fetchRentals();
  }, [fetchRentals]);

  const handleOpenAdd = () => {
    setEditingRental(null);
    setTitle('');
    setDescription('');
    setVendorId(vendors[0]?.id || '');
    setPrice('250');
    setRentalHourlyPrice('');
    setRentalDurationHours('24');
    setSecurityDeposit('100');
    setDeliveryCharge('0');
    setEquipmentDetails('German Stainless Steel Shisha, Heavy Crystal Base, Heat Management Device');
    setAccessoriesIncluded('Disposable Tips, Silicone Hose, Coconut Coals, Portable Burner, Tongs');
    setRentalTerms('Equipment must be returned in good condition. 18+ ID verified at delivery.');
    setStock('5');
    setImages(['/Categories/Rentals.webp']);
    setIsActive(true);
    setIsFeatured(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (rental: RentalPackage) => {
    setEditingRental(rental);
    setTitle(rental.title);
    setDescription(rental.description || '');
    setVendorId(rental.vendorId);
    setPrice(rental.price.toString());
    setRentalHourlyPrice(rental.rentalHourlyPrice?.toString() || '');
    setRentalDurationHours(rental.rentalDurationHours?.toString() || '24');
    setSecurityDeposit(rental.securityDeposit?.toString() || '0');
    setDeliveryCharge(rental.deliveryCharge?.toString() || '0');
    setEquipmentDetails(rental.equipmentDetails || '');
    setAccessoriesIncluded(rental.accessoriesIncluded || '');
    setRentalTerms(rental.rentalTerms || '');
    setStock(rental.stock.toString());

    let imgArray: string[] = ['/Categories/Rentals.webp'];
    if (rental.images) {
      try {
        const parsed = typeof rental.images === 'string' ? JSON.parse(rental.images) : rental.images;
        if (Array.isArray(parsed) && parsed.length > 0) imgArray = parsed;
      } catch {}
    }
    setImages(imgArray);
    setIsActive(rental.isActive);
    setIsFeatured(rental.isFeatured);
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
          setImages([...images, json.urls[0]]);
          addToast({ type: 'success', title: 'Image Uploaded', message: 'Added to package gallery.' });
        }
      }
    } catch {
      addToast({ type: 'error', title: 'Upload Failed', message: 'Error uploading image.' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveRental = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !vendorId || !price) {
      addToast({ type: 'error', title: 'Validation', message: 'Please complete all required fields.' });
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('auth_token');
      const payload = {
        title: title.trim(),
        description: description.trim(),
        vendorId,
        price: parseFloat(price),
        rentalHourlyPrice: rentalHourlyPrice ? parseFloat(rentalHourlyPrice) : null,
        rentalDurationHours: rentalDurationHours ? parseInt(rentalDurationHours, 10) : null,
        securityDeposit: securityDeposit ? parseFloat(securityDeposit) : 0,
        deliveryCharge: deliveryCharge ? parseFloat(deliveryCharge) : 0,
        equipmentDetails,
        accessoriesIncluded,
        rentalTerms,
        stock: parseInt(stock, 10) || 1,
        images,
        isActive,
        isFeatured,
      };

      const url = editingRental ? `/api/admin/rentals/${editingRental.id}` : '/api/admin/rentals';
      const method = editingRental ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        addToast({
          type: 'success',
          title: editingRental ? 'Rental Updated' : 'Rental Package Created',
          message: 'Saved successfully in MySQL and updated on public storefront!',
        });
        setModalOpen(false);
        fetchRentals();
      } else {
        const err = await res.json();
        addToast({ type: 'error', title: 'Failed', message: err.message || 'Could not save rental.' });
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Network error saving rental listing.' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (rental: RentalPackage) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/admin/rentals/${rental.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ isActive: !rental.isActive }),
      });

      if (res.ok) {
        addToast({
          type: 'success',
          title: 'Status Updated',
          message: `Package ${!rental.isActive ? 'activated' : 'deactivated'}.`,
        });
        fetchRentals();
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update status.' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/admin/rentals/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        addToast({
          type: 'success',
          title: 'Package Removed',
          message: 'Rental listing was safely deactivated from active catalog.',
        });
        setDeleteTarget(null);
        fetchRentals();
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete rental package.' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#74189B] uppercase tracking-wider mb-1">
            <Sparkles size={14} className="text-[#F1A51D]" /> Sheesha Rental System
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Rental Packages & Equipment Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure luxury sheesha rental tiers, daily & hourly rates, security deposits, gear specs, and vendor assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders?status=ACTIVE_RENTAL"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-purple-200 bg-purple-50 text-[#74189B] hover:bg-purple-100 font-bold text-xs transition shadow-xs"
          >
            <Clock size={15} />
            <span>Active Rentals: <strong>{activeBookingsCount}</strong></span>
          </Link>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#74189B] to-[#571275] hover:brightness-110 text-white font-bold text-xs shadow-md shadow-[#74189B]/20 transition"
          >
            <Plus size={16} /> Add Rental Package
          </button>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-xs">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search package name, gear, vendor..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 outline-none focus:border-[#74189B]"
          />
        </div>

        <div>
          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold"
          >
            <option value="ALL">All Partner Vendors</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold"
          >
            <option value="ALL">All Visibility Statuses</option>
            <option value="true">Active & Visible</option>
            <option value="false">Hidden / Inactive</option>
          </select>
        </div>
      </div>

      {/* Rentals Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
          <Loader2 className="w-8 h-8 text-[#74189B] animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading Rental Catalog...</p>
        </div>
      ) : rentals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <Package size={40} className="mx-auto text-slate-400" />
          <h3 className="font-bold text-slate-800 text-base">No rental packages found</h3>
          <p className="text-xs text-slate-500">Add rental setups for private parties, yachts, or villa catering.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rentals.map((rental) => {
            let mainImg = '/Categories/Rentals.webp';
            if (rental.images) {
              try {
                const parsed = typeof rental.images === 'string' ? JSON.parse(rental.images) : rental.images;
                if (Array.isArray(parsed) && parsed[0]) mainImg = parsed[0];
              } catch {}
            }

            return (
              <div
                key={rental.id}
                className={`bg-white rounded-2xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  rental.isActive ? 'border-slate-200 hover:border-[#74189B]/40' : 'border-slate-200/60 opacity-65'
                }`}
              >
                <div>
                  <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                    <img src={mainImg} alt={rental.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/70 text-white backdrop-blur-md">
                        {rental.vendor?.name || 'Verified Vendor'}
                      </span>
                      {rental.isFeatured && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F1A51D] text-[#2B043D]">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-[#74189B] text-white shadow-md">
                        AED {rental.price} / Day
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 text-xs">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">{rental.title}</h3>
                      {rental.description && (
                        <p className="text-slate-500 text-xs line-clamp-2 mt-1">{rental.description}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Deposit Required:</span>
                        <span className="font-bold text-slate-800">AED {rental.securityDeposit || 0}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Delivery Fee:</span>
                        <span className="font-bold text-slate-800">
                          {rental.deliveryCharge ? `AED ${rental.deliveryCharge}` : 'Free Delivery'}
                        </span>
                      </div>
                    </div>

                    {rental.equipmentDetails && (
                      <div className="text-[11px] text-slate-600 line-clamp-1">
                        <strong>Gear:</strong> {rental.equipmentDetails}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-[11px] text-slate-500">
                    Available Units: <strong className="text-slate-900">{rental.stock}</strong>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleStatus(rental)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                        rental.isActive
                          ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      }`}
                    >
                      {rental.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(rental)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
                      title="Edit Rental"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(rental)}
                      className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600"
                      title="Delete Rental"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Rental Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingRental ? 'Edit Rental Package' : 'Create New Rental Package'}
                </h2>
                <p className="text-xs text-slate-500">Connected directly to the live SheeshaTonight rental marketplace.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRental} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Package Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Luxury VIP Russian Setup with Sommelier"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-900 outline-none focus:border-[#74189B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Vendor Lounge *</label>
                  <select
                    required
                    value={vendorId}
                    onChange={(e) => setVendorId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                  >
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Package Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the experience, flavors included, and sommelier services..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800"
                />
              </div>

              {/* Pricing & Deposit */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Daily Rental Price (AED) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="250"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-black text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hourly Price (AED)</label>
                  <input
                    type="number"
                    value={rentalHourlyPrice}
                    onChange={(e) => setRentalHourlyPrice(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Security Deposit (AED)</label>
                  <input
                    type="number"
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(e.target.value)}
                    placeholder="100"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Delivery Charge (AED)</label>
                  <input
                    type="number"
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              {/* Equipment & Accessories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Equipment Details</label>
                  <input
                    type="text"
                    value={equipmentDetails}
                    onChange={(e) => setEquipmentDetails(e.target.value)}
                    placeholder="Pipes, bowl type, heat management, crystal vase"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Accessories Included</label>
                  <input
                    type="text"
                    value={accessoriesIncluded}
                    onChange={(e) => setAccessoriesIncluded(e.target.value)}
                    placeholder="Disposable tips, coals, burner, hoses, tongs"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Rental Terms & Return Policy</label>
                <input
                  type="text"
                  value={rentalTerms}
                  onChange={(e) => setRentalTerms(e.target.value)}
                  placeholder="Damage fees, return instructions, Emirates ID requirement"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              {/* Stock and Images */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Available Rental Units (Stock)</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Upload Package Image</label>
                  <label className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 hover:border-[#74189B] bg-slate-50 cursor-pointer font-bold text-slate-600">
                    {uploadingImage ? <Loader2 size={14} className="animate-spin text-[#74189B]" /> : <Upload size={14} />}
                    <span>{uploadingImage ? 'Uploading...' : 'Choose File'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 accent-[#74189B]"
                  />
                  <span>Active for Online Booking</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 accent-[#F1A51D]"
                  />
                  <span>Feature on Homepage Rentals Carousel</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#74189B] text-white hover:bg-[#571275] font-bold shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 size={15} className="animate-spin" />}
                  <span>{editingRental ? 'Update Package' : 'Publish Package'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove Rental Package"
        message={`Are you sure you want to deactivate "${deleteTarget?.title}"? Existing booking records will be safely preserved.`}
        confirmText="Yes, Deactivate"
        isDanger={true}
      />
    </div>
  );
}

