"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { useCart } from "@/contexts/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Star,
  MapPin,
  ShoppingBag,
  Heart,
  Share2,
  Minus,
  Plus,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Package,
  ArrowLeft,
  Store,
  Sparkles,
  Zap,
} from "lucide-react";
import "./product.css";

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  vendor: string;
}

interface ProductDetail {
  id: string;
  name: string;
  title: string;
  description: string;
  brand: string;
  vendor: string;
  vendorId: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  location: string;
  image: string;
  images?: string[];
  type: string;
  quantity: number;
  stock: number;
  slug?: string;
  sku?: string;
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthContext();
  const { addToCart } = useCart();
  const productId = params.id as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${productId}`);
      const result = await response.json();

      if (result.success && result.data) {
        setProduct(result.data);
        setSelectedImage(0);

        if (result.data.category) {
          fetchRelatedProducts(result.data.category, result.data.id);
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (category: string, currentId: string) => {
    try {
      const res = await fetch(`/api/products?category=${category}&limit=5`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const filtered = data.data.filter((p: any) => p.id !== currentId).slice(0, 4);
        setRelatedProducts(filtered);
      }
    } catch (err) {
      console.error("Error fetching related products:", err);
    }
  };

  const handleQuantityChange = (action: "increase" | "decrease") => {
    const maxQty = product?.stock ?? product?.quantity ?? 10;
    if (action === "increase" && quantity < maxQty) {
      setQuantity(quantity + 1);
    } else if (action === "decrease" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    const success = await addToCart(productId, quantity, {
      name: product?.title || product?.name,
      price: product?.price,
      image: product?.image,
      vendor: product?.vendor,
      category: product?.category,
      stock: product?.stock,
    });
    setAddingToCart(false);

    if (success) {
      alert(`Added ${quantity} item(s) to cart!`);
    }
  };

  const handleBuyNow = async () => {
    setAddingToCart(true);
    const success = await addToCart(productId, quantity, {
      name: product?.title || product?.name,
      price: product?.price,
      image: product?.image,
      vendor: product?.vendor,
      category: product?.category,
      stock: product?.stock,
    });
    setAddingToCart(false);

    if (success) {
      router.push("/checkout");
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="product-page" style={{ minHeight: "65vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div className="loader"></div>
          <p style={{ marginTop: "1rem", color: "#64748b", fontWeight: 600 }}>Loading product details...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className="product-page" style={{ minHeight: "65vh", textAlign: "center", padding: "5rem 1rem" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a" }}>Product Not Found</h2>
          <p style={{ color: "#64748b", marginBottom: "2rem" }}>The requested item could not be found or has been removed.</p>
          <Link href="/shop" style={{ color: "#8a277d", fontWeight: 700, textDecoration: "underline" }}>
            ← Back to Products Catalog
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const fallbackImage = "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=800";
  const productImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image || fallbackImage];

  const currentStock = product.stock ?? product.quantity ?? 10;
  const isRentable = product.type === "RENTAL_PACKAGE" || product.type === "SHEESHA_PIPE";

  return (
    <>
      <Header />
      <main className="product-page" suppressHydrationWarning>
        {/* BREADCRUMB */}
        <section className="breadcrumb-section">
          <div className="product-container">
            <div className="breadcrumb-list">
              <Link href="/" className="breadcrumb-link">Home</Link>
              <span className="breadcrumb-separator">/</span>
              <Link href="/shop" className="breadcrumb-link">Shop</Link>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">{product.name || product.title}</span>
            </div>
          </div>
        </section>

        {/* MAIN CONTAINER */}
        <section className="product-detail-section">
          <div className="product-container">
            {/* BACK TO CATALOG */}
            <div className="back-navigation">
              <Link href="/shop" className="back-link">
                <ArrowLeft size={16} />
                Back to Catalog
              </Link>
            </div>

            <div className="product-grid">
              {/* LEFT: IMAGE GALLERY */}
              <div className="product-gallery">
                <div className="main-image-wrapper">
                  <Image
                    src={productImages[selectedImage] || fallbackImage}
                    alt={product.name || product.title}
                    fill
                    sizes="(max-width: 992px) 100vw, 52vw"
                    priority
                    unoptimized
                  />
                  <div className="image-actions">
                    <button
                      className="icon-circle-btn"
                      onClick={() => setIsFavorite(!isFavorite)}
                      aria-label="Wishlist product"
                    >
                      <Heart size={18} fill={isFavorite ? "#e63946" : "none"} color={isFavorite ? "#e63946" : "#334155"} />
                    </button>
                    <button className="icon-circle-btn" aria-label="Share product">
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>

                {productImages.length > 1 && (
                  <div className="image-thumbnails">
                    {productImages.map((img: string, idx: number) => (
                      <button
                        key={idx}
                        className={`thumbnail-btn ${selectedImage === idx ? "active" : ""}`}
                        onClick={() => setSelectedImage(idx)}
                      >
                        <Image
                          src={img || fallbackImage}
                          alt={`${product.name} thumbnail ${idx + 1}`}
                          fill
                          sizes="72px"
                          unoptimized
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT: PRODUCT INFO */}
              <div className="product-info">
                {/* VENDOR BRAND TAG */}
                <div>
                  <span className="vendor-tag">
                    {product.brand || product.vendor || "Verified UAE Vendor"}
                  </span>
                </div>

                {/* PRODUCT TITLE */}
                <h1 className="product-title">{product.name || product.title}</h1>

                {/* RATING ROW */}
                <div className="rating-row">
                  <div className="stars-list">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < Math.floor(product.rating || 4.8) ? "#f59e0b" : "none"}
                        color="#f59e0b"
                      />
                    ))}
                  </div>
                  <span className="rating-num">{product.rating || 4.8}</span>
                  <span className="review-count">({product.reviews || 24} reviews)</span>
                </div>

                {/* PRICING & STOCK ROW */}
                <div className="price-stock-row">
                  <div className="price-container">
                    <span className="currency-label">AED</span>
                    <span className="price-value">{product.price}</span>
                  </div>

                  {currentStock > 0 ? (
                    <span className="stock-badge">
                      <CheckCircle2 size={15} />
                      In Stock ({currentStock} available)
                    </span>
                  ) : (
                    <span className="out-stock-badge">Out of Stock</span>
                  )}
                </div>

                {/* DESCRIPTION BLOCK */}
                <div className="description-block">
                  <h3 className="description-title">About this product</h3>
                  <p>{product.description || "Premium watermelon mint hookah flavor crafted for smooth lounge sessions. Sourced directly from verified UAE vendors."}</p>
                </div>

                {/* VENDOR SELLER CARD */}
                <div className="vendor-seller-card">
                  <div className="vendor-card-left">
                    <div className="vendor-icon-box">
                      <Store size={22} />
                    </div>
                    <div>
                      <div className="vendor-meta-title">Provided by Verified Vendor</div>
                      {product.vendorId ? (
                        <Link href={`/vendors/${product.vendorId}`} className="vendor-meta-name">
                          {product.vendor || "Official Marketplace Partner"}
                        </Link>
                      ) : (
                        <span className="vendor-meta-name" style={{ color: "#0f172a" }}>
                          {product.vendor || "Official Marketplace Partner"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="vendor-location-tag">
                    <MapPin size={14} color="#d4af37" />
                    <span>{product.location || "Downtown Dubai, Boulevard Crescent"}</span>
                  </div>
                </div>

                {/* QUANTITY SELECTOR */}
                {currentStock > 0 && (
                  <div className="quantity-wrapper">
                    <label className="quantity-label">Quantity</label>
                    <div className="quantity-box">
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange("decrease")}
                        disabled={quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        className="quantity-value"
                        value={quantity}
                        readOnly
                      />
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange("increase")}
                        disabled={quantity >= currentStock}
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* CTA BUTTONS */}
                <div className="cta-group">
                  <button
                    className="btn-add-cart"
                    onClick={handleAddToCart}
                    disabled={currentStock === 0 || addingToCart}
                  >
                    <ShoppingBag size={18} />
                    {addingToCart ? "Adding..." : "Add to Cart"}
                  </button>
                  <button
                    className="btn-buy-now"
                    onClick={handleBuyNow}
                    disabled={currentStock === 0 || addingToCart}
                  >
                    <Zap size={18} />
                    {isRentable ? "Rent / Buy Now" : "Buy Now"}
                  </button>
                </div>

                {/* TRUST BADGES */}
                <div className="trust-row">
                  <div className="trust-item">
                    <CheckCircle2 size={16} />
                    <span>Secure checkout</span>
                  </div>
                  <div className="trust-item">
                    <ShieldCheck size={16} />
                    <span>Verified vendor</span>
                  </div>
                  <div className="trust-item">
                    <Truck size={16} />
                    <span>Fast delivery</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <section style={{ padding: "48px 0 64px", backgroundColor: "#f8fafc", borderTop: "1px solid #f1f5f9" }}>
            <div className="product-container">
              <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>You May Also Like</h2>
              <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "24px" }}>Similar products from top rated vendors</p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
                {relatedProducts.map((rel) => (
                  <Link href={`/products/${rel.id}`} key={rel.id} style={{ textDecoration: "none" }}>
                    <div style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "14px",
                      overflow: "hidden",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    }}>
                      <div style={{ position: "relative", width: "100%", height: "180px", backgroundColor: "#f1f5f9" }}>
                        <Image
                          src={rel.image || fallbackImage}
                          alt={rel.name}
                          fill
                          sizes="280px"
                          style={{ objectFit: "cover" }}
                          unoptimized
                        />
                      </div>
                      <div style={{ padding: "14px" }}>
                        <div style={{ fontSize: "11px", color: "#d4af37", fontWeight: 800, textTransform: "uppercase" }}>{rel.vendor || rel.category}</div>
                        <h4 style={{ color: "#0f172a", fontSize: "15px", fontWeight: 700, margin: "4px 0 8px 0" }}>{rel.name}</h4>
                        <div style={{ color: "#0f172a", fontWeight: 800 }}>AED {rel.price}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
