"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  MapPin,
  Phone,
  Star,
  CheckCircle2,
  Package,
  ShoppingBag,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Building2,
  Clock,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  title: string;
  description: string;
  price: number;
  image: string;
  type: string;
  category: string;
  stock: number;
  rating?: number;
  reviews?: number;
  vendorId?: string;
  vendorName?: string;
  vendorLocation?: string;
}

interface VendorStore {
  id: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  phone: string;
  tier: string;
  rating: number;
  reviews: number;
  verified: boolean;
  image: string;
  bannerImage: string;
  services: string[];
  products: Product[];
  createdAt?: string;
}

export default function VendorStorePage() {
  const params = useParams();
  const vendorId = params.id as string;

  const [vendor, setVendor] = useState<VendorStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const fetchVendorStore = useCallback(async () => {
    if (!vendorId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/vendors/${vendorId}`);
      const result = await res.json();

      if (result.success && result.data) {
        setVendor(result.data);
      }
    } catch (error) {
      console.error("Error fetching vendor store:", error);
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    fetchVendorStore();
  }, [fetchVendorStore]);

  if (loading) {
    return (
      <>
        <Header />
        <div style={{ minHeight: "65vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#FCFBFA" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "50%", border: "3.5px solid rgba(130,37,118,0.15)", borderTopColor: "#822576", animation: "spin 0.8s linear infinite" }}></div>
          <p style={{ marginTop: "1rem", color: "#64748B", fontWeight: 500, fontSize: "0.95rem" }}>Loading vendor storefront...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!vendor) {
    return (
      <>
        <Header />
        <div style={{ minHeight: "60vh", textAlign: "center", padding: "6rem 1.5rem", background: "#FCFBFA" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "#FAF0F8", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
            <Building2 size={32} color="#822576" />
          </div>
          <h2 style={{ color: "#211D24", fontSize: "1.85rem", fontWeight: 800, marginBottom: "0.5rem", letterSpacing: "-0.5px" }}>Vendor Store Not Found</h2>
          <p style={{ color: "#64748B", marginBottom: "2rem", maxWidth: "420px", margin: "0 auto 2rem", fontSize: "0.95rem" }}>
            The vendor lounge or store you are trying to visit is unavailable or inactive.
          </p>
          <Link href="/vendors" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "#822576",
            color: "#ffffff",
            padding: "10px 22px",
            borderRadius: "10px",
            fontWeight: 600,
            textDecoration: "none",
            fontSize: "0.9rem"
          }}>
            ← Explore All Vendors
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const defaultBanner = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200";
  const defaultLogo = "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600";
  const fallbackProductImg = "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=800";

  const categories = ["ALL", ...Array.from(new Set((vendor.products || []).map((p) => p.type || p.category).filter(Boolean)))];

  const filteredProducts = activeCategory === "ALL"
    ? vendor.products || []
    : (vendor.products || []).filter((p) => (p.type || p.category) === activeCategory);

  return (
    <>
      <Header />
      <main style={{ minHeight: "100vh", background: "#FCFBFA", color: "#211D24", paddingBottom: "5rem" }}>
        {/* BANNER HEADER */}
        <section style={{ position: "relative", width: "100%", height: "280px", background: "#f3eff4", overflow: "hidden" }}>
          <Image
            src={vendor.bannerImage || defaultBanner}
            alt={vendor.name}
            fill
            sizes="100vw"
            priority
            style={{ objectFit: "cover" }}
          />
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(252,251,250,0.85) 100%)"
          }} />

          <div style={{ position: "absolute", top: "1.5rem", left: "1.5rem", zIndex: 10 }}>
            <Link href="/vendors" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.92)",
              padding: "8px 18px",
              borderRadius: "30px",
              color: "#211D24",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 600,
              boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.06)",
              backdropFilter: "blur(8px)",
              transition: "transform 0.2s ease"
            }}>
              <ArrowLeft size={15} color="#822576" /> Back to Vendors
            </Link>
          </div>
        </section>

        {/* STORE INFO FLOATING BAR */}
        <section style={{ marginTop: "-70px", position: "relative", zIndex: 20 }}>
          <div className="container" style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 1.5rem" }}>
            <div style={{
              background: "#ffffff",
              boxShadow: "0 14px 40px rgba(130, 37, 118, 0.08), 0 2px 10px rgba(0,0,0,0.03)",
              border: "1px solid #ebe5eb",
              borderRadius: "20px",
              padding: "2rem",
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              gap: "1.75rem",
              alignItems: "center"
            }}>
              {/* LOGO */}
              <div style={{
                position: "relative",
                width: "96px",
                height: "96px",
                borderRadius: "18px",
                overflow: "hidden",
                border: "2.5px solid #EFB63B",
                background: "#ffffff",
                boxShadow: "0 8px 20px rgba(239, 182, 59, 0.22)"
              }}>
                <Image
                  src={vendor.image || defaultLogo}
                  alt={vendor.name}
                  fill
                  sizes="96px"
                  style={{ objectFit: "cover" }}
                />
              </div>

              {/* DETAILS */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#211D24", margin: 0, letterSpacing: "-0.5px" }}>{vendor.name}</h1>
                  {vendor.verified !== false && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "#ECFDF5", color: "#059669", padding: "4px 11px", borderRadius: "14px", fontSize: "0.78rem", fontWeight: 600, border: "1px solid #A7F3D0" }}>
                      <ShieldCheck size={14} /> Verified Partner
                    </span>
                  )}
                  {vendor.tier && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "#FFFBEB", color: "#B45309", padding: "4px 11px", borderRadius: "14px", fontSize: "0.78rem", fontWeight: 600, border: "1px solid #FDE68A" }}>
                      <Sparkles size={14} /> {vendor.tier} Tier
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.65rem", color: "#64748B", fontSize: "0.88rem", flexWrap: "wrap", fontWeight: 500 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <MapPin size={15} color="#822576" /> {vendor.location || "Dubai, UAE"}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Phone size={15} color="#822576" /> {vendor.phone || "+971 4 333 9988"}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Star size={15} fill="#EFB63B" color="#EFB63B" /> <strong style={{ color: "#211D24" }}>{vendor.rating || 4.9}</strong> ({vendor.reviews || 48} reviews)
                  </span>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div>
                <a
                  href={`tel:${vendor.phone || '+97143339988'}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "linear-gradient(135deg, #EFB63B 0%, #D4AF37 100%)",
                    color: "#211D24",
                    fontWeight: 700,
                    padding: "12px 24px",
                    borderRadius: "12px",
                    textDecoration: "none",
                    fontSize: "0.92rem",
                    boxShadow: "0 6px 20px rgba(239, 182, 59, 0.35)",
                    transition: "all 0.2s ease"
                  }}
                >
                  <Phone size={16} /> Contact Store
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* STORE OVERVIEW & SERVICES */}
        <section style={{ padding: "2.5rem 0 1.5rem 0" }}>
          <div className="container" style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 1.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "1.75rem" }}>
              
              {/* ABOUT VENDOR */}
              <div style={{
                background: "#ffffff",
                border: "1px solid #ebe5eb",
                borderRadius: "18px",
                padding: "1.75rem",
                boxShadow: "0 4px 18px rgba(0,0,0,0.02)"
              }}>
                <h3 style={{ color: "#822576", fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.75rem", letterSpacing: "-0.3px" }}>About The Store</h3>
                <p style={{ color: "#4A454E", lineHeight: 1.65, fontSize: "0.95rem" }}>
                  {vendor.description || "Welcome to our premium Sheesha Lounge and store. We curate top-tier hookahs, hand-crafted tobacco blends, and exclusive VIP lounge experiences across Dubai."}
                </p>

                {/* SERVICES BADGES */}
                {vendor.services && vendor.services.length > 0 && (
                  <div style={{ marginTop: "1.5rem" }}>
                    <h4 style={{ color: "#211D24", fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.75rem" }}>Available Store Services</h4>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {vendor.services.map((service, idx) => (
                        <span key={idx} style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          background: "#FAF0F8",
                          border: "1px solid #EDD5E8",
                          color: "#822576",
                          padding: "6px 14px",
                          borderRadius: "20px",
                          fontSize: "0.82rem",
                          fontWeight: 600
                        }}>
                          <CheckCircle2 size={13} color="#822576" /> {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* STORE STATS / TIMINGS */}
              <div style={{
                background: "#ffffff",
                border: "1px solid #ebe5eb",
                borderRadius: "18px",
                padding: "1.75rem",
                boxShadow: "0 4px 18px rgba(0,0,0,0.02)"
              }}>
                <h3 style={{ color: "#822576", fontSize: "1.15rem", fontWeight: 700, marginBottom: "1.25rem", letterSpacing: "-0.3px" }}>Store Information</h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "14px", color: "#4A454E", fontSize: "0.88rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "#FFFBEB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Clock size={16} color="#D4AF37" />
                    </div>
                    <span><strong>Hours:</strong> Open 12:00 PM – 03:00 AM</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "#FAF0F8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Package size={16} color="#822576" />
                    </div>
                    <span><strong>Catalog:</strong> {(vendor.products || []).length} items listed</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ShieldCheck size={16} color="#059669" />
                    </div>
                    <span><strong>Fulfillment:</strong> SheeshaTonight Direct Dispatch</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* PRODUCTS CATALOG SECTION */}
        <section style={{ padding: "1.5rem 0 3rem 0" }}>
          <div className="container" style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 1.5rem" }}>
            
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h2 style={{ fontSize: "1.65rem", fontWeight: 800, color: "#211D24", margin: 0, letterSpacing: "-0.5px" }}>Products & Rental Menu</h2>
                <p style={{ color: "#64748B", fontSize: "0.88rem", margin: "4px 0 0 0" }}>Browse all active items supplied by {vendor.name}</p>
              </div>

              {/* CATEGORY TABS */}
              {categories.length > 1 && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      style={{
                        padding: "7px 16px",
                        borderRadius: "20px",
                        border: activeCategory === cat ? "1px solid #822576" : "1px solid #E2E8F0",
                        background: activeCategory === cat ? "#822576" : "#ffffff",
                        color: activeCategory === cat ? "#ffffff" : "#4A454E",
                        fontWeight: activeCategory === cat ? 700 : 500,
                        fontSize: "0.82rem",
                        cursor: "pointer",
                        boxShadow: activeCategory === cat ? "0 4px 12px rgba(130, 37, 118, 0.2)" : "none",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {cat.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PRODUCT GRID */}
            {filteredProducts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem 1rem", background: "#ffffff", borderRadius: "18px", border: "1px dashed #E2E8F0" }}>
                <ShoppingBag size={38} color="#94A3B8" style={{ marginBottom: "0.75rem" }} />
                <h3 style={{ color: "#211D24", fontSize: "1.15rem", fontWeight: 700 }}>No products in this category</h3>
                <p style={{ color: "#64748B", fontSize: "0.88rem" }}>Check back soon for new arrivals from {vendor.name}.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.75rem" }}>
                {filteredProducts.map((product) => (
                  <Link href={`/products/${product.id}`} key={product.id} style={{ textDecoration: "none" }}>
                    <div style={{
                      background: "#ffffff",
                      border: "1px solid #ebe5eb",
                      borderRadius: "18px",
                      overflow: "hidden",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.03)"
                    }}>
                      <div style={{ position: "relative", width: "100%", height: "210px", background: "#F8FAFC" }}>
                        <Image
                          src={product.image || fallbackProductImg}
                          alt={product.name || product.title}
                          fill
                          sizes="320px"
                          style={{ objectFit: "cover" }}
                        />
                        {(product.type === "SHEESHA_PIPE" || product.type === "RENTAL_PACKAGE") && (
                          <span style={{
                            position: "absolute",
                            top: "12px",
                            left: "12px",
                            background: "linear-gradient(135deg, #EFB63B 0%, #D4AF37 100%)",
                            color: "#211D24",
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
                          }}>
                            Rent / Buy
                          </span>
                        )}
                      </div>

                      <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontSize: "0.75rem", color: "#822576", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "6px" }}>
                            {product.type?.replace(/_/g, " ") || "SHEESHA"}
                          </div>
                          <h3 style={{ color: "#211D24", fontSize: "1.05rem", fontWeight: 700, margin: "0 0 8px 0", lineHeight: 1.35 }}>
                            {product.name || product.title}
                          </h3>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1.25rem", paddingTop: "0.85rem", borderTop: "1px solid #F1F5F9" }}>
                          <div>
                            <span style={{ fontSize: "0.7rem", color: "#94A3B8", display: "block", textTransform: "uppercase" }}>Price</span>
                            <div style={{ color: "#822576", fontWeight: 800, fontSize: "1.15rem" }}>
                              AED {product.price}
                            </div>
                          </div>
                          <span style={{
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            color: "#822576",
                            background: "#FAF0F8",
                            border: "1px solid #EDD5E8",
                            padding: "6px 14px",
                            borderRadius: "8px"
                          }}>
                            View Item
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
