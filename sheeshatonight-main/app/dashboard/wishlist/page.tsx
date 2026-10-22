'use client';

import { useState } from 'react';
import {
  Heart,
  Loader2,
  RefreshCw,
  Trash2,
  ShoppingBag,
  Store,
  ArrowUpRight,
  Sparkles,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';

function formatAmount(value: unknown, currency = 'AED') {
  const amount = Number(value);
  return Number.isFinite(amount) ? `${currency} ${amount.toFixed(2)}` : 'AED 0.00';
}

function getProductImage(product: any) {
  if (!product) return '/logo.png';
  const images = product.images || product.image;
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
    } catch {
      if (images.startsWith('http') || images.startsWith('/')) return images;
    }
  } else if (Array.isArray(images) && images.length > 0) {
    return images[0];
  }
  return '/logo.png';
}

export default function WishlistPage() {
  const { wishlistItems, loading, removeFromWishlist, refreshWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedSuccessId, setAddedSuccessId] = useState<string | null>(null);

  const handleRemove = async (productId: string) => {
    try {
      setRemovingId(productId);
      await removeFromWishlist(productId);
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (product: any, productId: string) => {
    try {
      setAddingId(productId);
      const img = getProductImage(product);
      await addToCart(productId, 1, {
        name: product?.title || product?.name || 'Sheesha Product',
        price: Number(product?.price || 0),
        image: img,
      });
      setAddedSuccessId(productId);
      setTimeout(() => setAddedSuccessId(null), 2500);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="p-6 md:p-10 min-h-full space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#251541] flex items-center gap-2.5 tracking-tight">
            <Heart className="w-7 h-7 text-[#7b2377] fill-[#7b2377]" />
            My Wishlist
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Your saved sheeshas, premium accessories, and favourite packages
          </p>
        </div>

        <button
          onClick={() => refreshWishlist()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-medium text-xs transition shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-semibold">Loading your wishlist...</p>
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
          <Heart className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">Your wishlist is empty</h3>
          <p className="text-slate-500 text-xs mb-6 max-w-sm mx-auto">
            Save your favorite sheeshas, custom fruit bowls, and coals so you can quickly reorder anytime.
          </p>
          <Link
            href="/shop"
            className="inline-flex px-5 py-2.5 bg-[#D4AF37] text-slate-950 font-bold rounded-xl text-xs hover:bg-[#b8902a] transition shadow-md"
          >
            Browse Sheesha & Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => {
            const product = (item.product || {}) as any;
            const productId = item.productId || product.id || item.id;
            const imgSrc = getProductImage(product);
            const isRemoving = removingId === productId;
            const isAdding = addingId === productId;
            const isAdded = addedSuccessId === productId;

            return (
              <div
                key={item.id || productId}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="relative w-full h-44 bg-slate-50 rounded-xl overflow-hidden mb-4 flex items-center justify-center border border-slate-100">
                    <img
                      src={imgSrc}
                      alt={product.title || product.name || 'Sheesha Product'}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={() => handleRemove(productId)}
                      disabled={isRemoving}
                      className="absolute top-2 right-2 p-2 bg-white/95 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-full shadow-md transition cursor-pointer"
                      title="Remove from wishlist"
                    >
                      {isRemoving ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base line-clamp-1 mb-1">
                    {product.title || product.name || 'Exclusive Sheesha Item'}
                  </h3>

                  {product.vendor?.name ? (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                      <Store className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {product.vendor.name}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                      <Store className="w-3.5 h-3.5 text-[#D4AF37]" />
                      Certified UAE Partner
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-3 gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Price</span>
                    <p className="text-base font-black text-slate-900 font-mono">
                      {formatAmount(product.price || 0, product.currency || 'AED')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product, productId)}
                      disabled={isAdding}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-[#74189B] text-slate-700 hover:text-white rounded-xl font-bold text-xs transition cursor-pointer"
                      title="Add to shopping cart"
                    >
                      {isAdding ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Bag</span>
                        </>
                      )}
                    </button>

                    <Link
                      href={`/products/${productId}`}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-[#D4AF37] text-slate-950 rounded-xl font-bold text-xs hover:bg-[#b8902a] transition shadow-2xs"
                    >
                      <span>View</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
