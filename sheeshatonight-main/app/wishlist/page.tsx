'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sparkles,
  Star,
  CheckCircle2,
  Store,
  Share2,
  Package,
  ShieldCheck,
  Search,
  SlidersHorizontal,
} from 'lucide-react';

interface WishlistProduct {
  id: string;
  name: string;
  title?: string;
  price: number;
  currency?: string;
  image: string;
  type?: string;
  category?: string;
  vendorId?: string;
  vendorName?: string;
  vendorSlug?: string;
  rating?: number;
  inStock?: boolean;
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('auth_token');
  if (token) return token;
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  return match && match[1] ? decodeURIComponent(match[1]) : null;
}

export default function WishlistPage() {
  const { addToCart } = useCart();
  const {
    wishlistItems,
    removeFromWishlist,
    clearWishlist,
    loading: wishlistLoading,
    refreshWishlist,
  } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [addedToast, setAddedToast] = useState<string | null>(null);
  const [recommended, setRecommended] = useState<WishlistProduct[]>([]);

  // Fetch recommended products from catalog
  useEffect(() => {
    async function loadRecommended() {
      try {
        const res = await fetch('/api/products?limit=8');
        const json = await res.json();
        const allProducts: any[] = Array.isArray(json.data) ? json.data : (json.data?.products || []);
        if (allProducts.length > 0) {
          setRecommended(
            allProducts.slice(0, 4).map((p: any) => {
              let img = p.image || '/Categories/Buy Sheesha.webp';
              if (p.images) {
                try {
                  const parsed = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
                  if (Array.isArray(parsed) && parsed[0]) img = parsed[0];
                  else if (typeof parsed === 'string') img = parsed;
                } catch {
                  if (typeof p.images === 'string') img = p.images;
                }
              }
              return {
                id: String(p.id),
                name: p.title || p.name || 'Luxury Sheesha Item',
                price: Number(p.price) || 0,
                currency: 'AED',
                image: img,
                type: p.type || 'SHEESHA',
                vendorName: p.vendor || p.brand || 'SheeshaTonight Lounge',
              };
            })
          );
        }
      } catch {}
    }
    loadRecommended();
  }, []);

  // Format wishlist items
  const items: WishlistProduct[] = React.useMemo(() => {
    return wishlistItems.map((it) => {
      const p = (it.product || {}) as any;
      let img = '/Categories/Buy Sheesha.webp';
      if (p.images) {
        try {
          const parsed = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
          if (Array.isArray(parsed) && parsed[0]) img = parsed[0];
          else if (typeof parsed === 'string') img = parsed;
        } catch {
          if (typeof p.images === 'string') img = p.images;
        }
      } else if (p.image) {
        img = p.image;
      }
      return {
        id: String(p.id || it.productId),
        name: p.title || p.name || 'Luxury Sheesha Item',
        price: Number(p.price) || 0,
        currency: p.currency || 'AED',
        image: img,
        type: p.type || 'SHEESHA',
        category: p.category || p.type || 'Accessories',
        vendorId: p.vendor?.id,
        vendorName: p.vendor?.name || 'Verified Lounge Partner',
        vendorSlug: p.vendor?.slug || p.vendor?.id,
        rating: 4.9,
        inStock: p.stock === undefined || p.stock > 0,
      };
    });
  }, [wishlistItems]);

  const loading = wishlistLoading;

  // Remove single item
  const handleRemove = async (id: string) => {
    await removeFromWishlist(id);
  };

  // Clear all
  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to remove all saved items from your wishlist?')) return;
    await clearWishlist();
  };

  // Move single item to Cart
  const handleAddToCart = (product: WishlistProduct) => {
    addToCart(product.id, 1, {
      name: product.name,
      price: product.price,
      image: product.image,
    });
    setAddedToast(`Added "${product.name}" to your cart!`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  // Move all to Cart
  const handleAddAllToCart = () => {
    items.forEach((product) => {
      addToCart(product.id, 1, {
        name: product.name,
        price: product.price,
        image: product.image,
      });
    });
    setAddedToast(`All ${items.length} items added to your cart!`);
    setTimeout(() => setAddedToast(null), 3500);
  };

  // Share Wishlist
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.vendorName && item.vendorName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <Header />

      {/* Toast Notification */}
      {addedToast && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: '#822576',
          color: '#ffffff',
          padding: '14px 24px',
          borderRadius: '12px',
          fontWeight: 600,
          boxShadow: '0 10px 30px rgba(130, 37, 118, 0.35)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'slideUp 0.3s ease-out',
        }}>
          <CheckCircle2 size={18} color="#EFB63B" />
          <span>{addedToast}</span>
        </div>
      )}

      <main style={{ minHeight: '80vh', background: '#FCFBFA', paddingBottom: '5rem' }}>
        {/* HERO BANNER */}
        <section style={{
          background: 'linear-gradient(135deg, #FAF0F8 0%, #FFFFFF 50%, #FAF8FB 100%)',
          borderBottom: '1px solid #EBE5EB',
          padding: '3rem 0 2.5rem 0',
        }}>
          <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FAF0F8', border: '1px solid #EDD5E8', color: '#822576', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
                  <Heart size={13} fill="#822576" /> YOUR CURATED FAVORITES
                </div>
                <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#211D24', margin: 0, letterSpacing: '-0.8px' }}>
                  Saved Wishlist
                </h1>
                <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                  Keep track of premium hookahs, curated setups, and artisan flavors you love.
                </p>
              </div>

              {/* ACTION BUTTONS */}
              {items.length > 0 && (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleShare}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#ffffff',
                      border: '1px solid #E2E8F0',
                      color: '#4A454E',
                      padding: '10px 18px',
                      borderRadius: '10px',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Share2 size={16} /> {copiedLink ? 'Link Copied!' : 'Share Wishlist'}
                  </button>

                  <button
                    onClick={handleAddAllToCart}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'linear-gradient(135deg, #EFB63B 0%, #D4AF37 100%)',
                      color: '#211D24',
                      padding: '10px 22px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(239, 182, 59, 0.35)',
                    }}
                  >
                    <ShoppingBag size={16} /> Move All to Cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* MAIN CONTENT AREA */}
        <section style={{ padding: '2.5rem 0' }}>
          <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.5rem' }}>
            
            {/* SEARCH & STATS BAR */}
            {items.length > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '2rem',
                background: '#ffffff',
                padding: '1rem 1.5rem',
                borderRadius: '16px',
                border: '1px solid #EBE5EB',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#211D24', fontWeight: 700, fontSize: '0.95rem' }}>
                  <span>{filteredItems.length} {filteredItems.length === 1 ? 'Item' : 'Items'} Saved</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '6px 14px',
                    width: '260px',
                  }}>
                    <Search size={16} color="#94A3B8" />
                    <input
                      type="text"
                      placeholder="Search saved items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        fontSize: '0.85rem',
                        color: '#211D24',
                        width: '100%',
                      }}
                    />
                  </div>

                  <button
                    onClick={handleClearAll}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#EF4444',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Trash2 size={14} /> Clear List
                  </button>
                </div>
              </div>
            )}

            {/* LOADING STATE */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  border: '3.5px solid rgba(130, 37, 118, 0.15)',
                  borderTopColor: '#822576',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto',
                }} />
                <p style={{ marginTop: '1rem', color: '#64748B', fontSize: '0.95rem', fontWeight: 500 }}>
                  Loading your wishlist...
                </p>
              </div>
            ) : filteredItems.length === 0 && items.length > 0 ? (
              /* NO SEARCH MATCHES */
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: '#ffffff',
                borderRadius: '20px',
                border: '1px dashed #E2E8F0',
              }}>
                <Search size={40} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#211D24' }}>No items found</h3>
                <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  No saved products match &quot;{searchQuery}&quot;.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    marginTop: '1rem',
                    background: '#822576',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Clear Search Filter
                </button>
              </div>
            ) : items.length === 0 ? (
              /* EMPTY WISHLIST STATE */
              <div style={{
                textAlign: 'center',
                padding: '5rem 1.5rem',
                background: '#ffffff',
                borderRadius: '24px',
                border: '1px solid #EBE5EB',
                boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                maxWidth: '650px',
                margin: '0 auto',
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: '#FAF0F8',
                  border: '1.5px solid #EDD5E8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                }}>
                  <Heart size={38} color="#822576" />
                </div>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#211D24', margin: '0 0 0.5rem 0', letterSpacing: '-0.5px' }}>
                  Your Wishlist is Empty
                </h2>
                <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '440px', margin: '0 auto 2rem auto' }}>
                  You haven&apos;t saved any sheesha setups or flavors yet. Click the heart icon on any product in the store to save it here!
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <Link
                    href="/shop"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#822576',
                      color: '#ffffff',
                      fontWeight: 700,
                      padding: '12px 26px',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      fontSize: '0.92rem',
                      boxShadow: '0 6px 18px rgba(130, 37, 118, 0.25)',
                    }}
                  >
                    <ShoppingBag size={17} /> Explore Shop Catalog
                  </Link>

                  <Link
                    href="/rentals"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#ffffff',
                      border: '1px solid #E2E8F0',
                      color: '#211D24',
                      fontWeight: 700,
                      padding: '12px 24px',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      fontSize: '0.92rem',
                    }}
                  >
                    View Sheesha Rentals
                  </Link>
                </div>
              </div>
            ) : (
              /* PRODUCT GRID */
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.75rem',
              }}>
                {filteredItems.map((product) => (
                  <div
                    key={product.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '20px',
                      border: '1px solid #EBE5EB',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                  >
                    {/* IMAGE AREA */}
                    <div style={{ position: 'relative', width: '100%', height: '230px', background: '#F8FAFC' }}>
                      <Link href={`/products/${product.id}`} style={{ display: 'block', width: '100%', height: '100%', position: 'relative' }}>
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="350px"
                          style={{ objectFit: 'cover' }}
                        />
                      </Link>

                      {/* REMOVE BUTTON */}
                      <button
                        onClick={() => handleRemove(product.id)}
                        title="Remove from wishlist"
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.92)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(0,0,0,0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#EF4444',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          transition: 'all 0.2s',
                        }}
                      >
                        <Heart size={17} fill="#EF4444" color="#EF4444" />
                      </button>

                      {/* CATEGORY TAG */}
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: '#FAF0F8',
                        border: '1px solid #EDD5E8',
                        color: '#822576',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px',
                      }}>
                        {product.type?.replace(/_/g, ' ') || 'SHEESHA'}
                      </span>
                    </div>

                    {/* CONTENT AREA */}
                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        {/* VENDOR */}
                        {product.vendorName && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '0.82rem', marginBottom: '6px' }}>
                            <Store size={13} color="#822576" />
                            {product.vendorSlug ? (
                              <Link href={`/vendors/${product.vendorSlug}`} style={{ color: '#64748B', textDecoration: 'none' }}>
                                {product.vendorName}
                              </Link>
                            ) : (
                              <span>{product.vendorName}</span>
                            )}
                          </div>
                        )}

                        {/* TITLE */}
                        <Link href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
                          <h3 style={{
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            color: '#211D24',
                            margin: '0 0 10px 0',
                            lineHeight: 1.35,
                          }}>
                            {product.name}
                          </h3>
                        </Link>
                      </div>

                      {/* PRICE & BUTTONS */}
                      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1rem' }}>
                          <div>
                            <span style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', textTransform: 'uppercase' }}>Price</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#822576' }}>
                              AED {product.price}
                            </span>
                          </div>

                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#059669',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                          }}>
                            <CheckCircle2 size={13} /> In Stock
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px' }}>
                          <button
                            onClick={() => handleAddToCart(product)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              background: '#822576',
                              color: '#ffffff',
                              border: 'none',
                              padding: '11px 16px',
                              borderRadius: '10px',
                              fontWeight: 700,
                              fontSize: '0.88rem',
                              cursor: 'pointer',
                              boxShadow: '0 4px 12px rgba(130, 37, 118, 0.2)',
                              transition: 'all 0.2s',
                            }}
                          >
                            <ShoppingBag size={15} /> Add to Cart
                          </button>

                          <Link
                            href={`/products/${product.id}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '42px',
                              height: '42px',
                              borderRadius: '10px',
                              background: '#FAF0F8',
                              border: '1px solid #EDD5E8',
                              color: '#822576',
                              textDecoration: 'none',
                            }}
                            title="View product details"
                          >
                            <ArrowRight size={16} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* RECOMMENDED FOR YOU SECTION */}
            {recommended.length > 0 && items.length > 0 && (
              <div style={{ marginTop: '5rem', paddingTop: '3rem', borderTop: '1px solid #EBE5EB' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#822576', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Recommended For You
                    </span>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#211D24', margin: '4px 0 0 0' }}>
                      Complete Your Experience
                    </h2>
                  </div>
                  <Link href="/shop" style={{ color: '#822576', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    View Full Catalog <ArrowRight size={14} />
                  </Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  {recommended.map((rec) => (
                    <Link href={`/products/${rec.id}`} key={rec.id} style={{ textDecoration: 'none' }}>
                      <div style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        border: '1px solid #EBE5EB',
                        overflow: 'hidden',
                        padding: '1rem',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                      }}>
                        <div style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '12px', overflow: 'hidden', background: '#F8FAFC', flexShrink: 0 }}>
                          <Image src={rec.image} alt={rec.name} fill sizes="70px" style={{ objectFit: 'cover' }} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#211D24', margin: '0 0 4px 0', lineHeight: 1.3 }}>
                            {rec.name}
                          </h4>
                          <span style={{ color: '#822576', fontWeight: 800, fontSize: '0.95rem' }}>
                            AED {rec.price}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
