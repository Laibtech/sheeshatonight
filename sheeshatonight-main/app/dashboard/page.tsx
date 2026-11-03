"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import {
  ShoppingBag,
  Heart,
  MapPin,
  CreditCard,
  Flame,
  Package,
  Star,
  Edit3,
  ChevronRight,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Settings,
  LogOut,
  Loader2,
} from "lucide-react";
import { clearAllClientAuth } from "@/lib/session";
import { useWishlist } from "@/contexts/WishlistContext";
import "./CustomerDashboard.css";

export default function CustomerDashboard() {
  const { userName, userEmail, userRole, logout } = useAuthStore();
  const { wishlistCount, isInWishlist, toggleWishlist } = useWishlist();

  const handleSignOut = () => {
    if (logout) logout();
    clearAllClientAuth();
    window.location.href = "/auth/login";
  };

  const [customerName, setCustomerName] = useState("Customer");
  const [customerEmail, setCustomerEmail] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [addressCount, setAddressCount] = useState<number>(0);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [products, setProducts] = useState<any[]>([]);

  // Sync customer profile
  useEffect(() => {
    if (userName && userName.trim()) {
      setCustomerName(userName);
    } else {
      const match = document.cookie.match(/(?:^|; )user_name=([^;]*)/);
      if (match && match[1]) {
        setCustomerName(decodeURIComponent(match[1]));
      }
    }

    if (userEmail && userEmail.trim()) {
      setCustomerEmail(userEmail);
    } else {
      const match = document.cookie.match(/(?:^|; )user_email=([^;]*)/);
      if (match && match[1]) {
        setCustomerEmail(decodeURIComponent(match[1]));
      }
    }
  }, [userName, userEmail]);

  // Load live vendor products from /api/products
  useEffect(() => {
    fetch("/api/products?limit=8", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || data?.products;
        if (Array.isArray(list) && list.length > 0) {
          const mapped = list.map((item: any) => ({
            id: item.id,
            name: item.title || item.name,
            price: `AED ${Number(item.price || 0).toFixed(0)}`,
            image: item.image || (Array.isArray(item.images) && item.images[0]) || "/SHEESHA-SET.webp",
            reviews: item.reviewsCount ? `${item.reviewsCount} reviews` : "Verified",
          }));
          setProducts(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Load real customer addresses and orders
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    // Real address count
    fetch("/api/users/me/addresses", { headers, cache: "no-store", credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const payload = data?.data || data;
        const list = Array.isArray(payload) ? payload : payload?.addresses || [];
        setAddressCount(list.length);
      })
      .catch(() => setAddressCount(0));

    // Real orders
    fetch("/api/orders", { headers, cache: "no-store", credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const orderList = Array.isArray(data) ? data : data?.data || data?.orders;
        if (Array.isArray(orderList) && orderList.length > 0) {
          const mapped = orderList.slice(0, 5).map((ord: any) => ({
            id: ord.orderNumber ? `#${ord.orderNumber}` : `#ST-${(ord.id || "").slice(-4).toUpperCase()}`,
            date: new Date(ord.createdAt || Date.now()).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            total: `AED ${Number(ord.totalAmount || 0).toFixed(0)}`,
            status: String(ord.status || "Pending").replace(/_/g, " "),
            statusType: String(ord.status || "").toLowerCase().includes("deliv")
              ? "delivered"
              : String(ord.status || "").toLowerCase().includes("comp")
              ? "completed"
              : "processing",
          }));
          setOrders(mapped);
        } else {
          setOrders([]);
        }
      })
      .catch(() => {
        setOrders([]);
      })
      .finally(() => {
        setLoadingOrders(false);
      });
  }, []);

  return (
    <main className="dashboard-main">
      <div className="dashboard-content">
        {/* WELCOME */}
        <section className="welcome-section">
          <h1>
            Welcome back, {customerName.split(" ")[0] || "Customer"} <Sparkles size={20} style={{ display: "inline", color: "#F1A51D", verticalAlign: "middle" }} />
          </h1>
          <p>Here&apos;s what&apos;s happening with your account today.</p>
        </section>

        {/* STATS */}
        <section className="stats-grid">
          <StatCard
            icon={<ShoppingBag size={18} />}
            title="Total Orders"
            value={String(orders.length)}
            link="View Orders"
            href="/dashboard/orders"
          />

          <StatCard
            icon={<Heart size={18} />}
            title="Wishlist Items"
            value={String(wishlistCount)}
            link="View Wishlist"
            href="/dashboard/wishlist"
          />

          <StatCard
            icon={<MapPin size={18} />}
            title="Saved Addresses"
            value={String(addressCount)}
            link="Manage Addresses"
            href="/dashboard/settings"
          />

          <StatCard
            icon={<CreditCard size={18} />}
            title="Payment Methods"
            value="Cash & Card"
            link="Manage Payments"
            href="/dashboard/settings"
            gold
          />
        </section>

        {/* HERO */}
        <section className="dashboard-hero">
          <div className="hero-content">
            <span className="eyebrow">PREMIUM COLLECTION</span>

            <h2>
              Elevate Your
              <br />
              Sheesha Experience
            </h2>

            <p>
              Explore the finest sheesha products, flavors
              <br />
              and accessories — all in one place.
            </p>

            <Link href="/shop" className="primary-btn">
              Shop Now
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="hero-image">
            <img
              src="/dashboard/sheesha-banner.png"
              alt="Premium Sheesha"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/SHEESHA-SET.webp";
              }}
            />
          </div>
        </section>

        {/* RECENT ORDERS */}
        <section className="orders-section">
          <div className="section-header">
            <h2>Recent Orders</h2>

            <Link href="/dashboard/orders" className="view-link">
              View All Orders <ArrowRight size={14} style={{ display: "inline", verticalAlign: "middle" }} />
            </Link>
          </div>

          {loadingOrders ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 my-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#74189B] mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 my-2 shadow-xs">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
              <h3 className="text-sm font-bold text-slate-800">No orders placed yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Explore our curated catalog of luxury hookahs, fruit bowls, and premium charcoal packages.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 mt-3.5 px-4 py-2 bg-[#74189B] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#5b127a] transition"
              >
                <span>Browse Sheesha & Flavors</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="orders-table">
              <div className="order-row order-head">
                <span>Order #</span>
                <span>Date</span>
                <span>Items</span>
                <span>Total</span>
                <span>Status</span>
                <span></span>
              </div>

              {orders.map((order, index) => (
                <div className="order-row" key={order.id + index}>
                  <strong>{order.id}</strong>

                  <span>{order.date}</span>

                  <div className="order-items">
                    <div className="mini-product"><Flame size={12} className="text-purple-600" /></div>
                    <div className="mini-product"><Package size={12} className="text-amber-600" /></div>
                    <div className="mini-product"><ShoppingBag size={12} className="text-emerald-600" /></div>

                    <span className="more-items">+{index + 1}</span>
                  </div>

                  <strong>{order.total}</strong>

                  <span>
                    <em className={`status ${order.statusType}`}>
                      {order.status}
                    </em>
                  </span>

                  <Link href="/dashboard/orders" className="order-arrow">
                    <ChevronRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* RECOMMENDED */}
        <section className="recommended-section">
          <div className="section-header">
            <h2>Recommended For You</h2>

            <Link href="/shop" className="view-link">
              View All <ArrowRight size={14} style={{ display: "inline", verticalAlign: "middle" }} />
            </Link>
          </div>

          <div className="products-grid">
            {products.map((product) => {
              const isWishlisted = isInWishlist(product.id);
              return (
                <div className="product-card" key={product.name}>
                  <button
                    type="button"
                    onClick={() =>
                      toggleWishlist(product.id, {
                        name: product.name,
                        title: product.name,
                        price: product.price,
                        image: product.image,
                      })
                    }
                    className="favorite cursor-pointer"
                    title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
                  >
                    <Heart
                      size={15}
                      className={isWishlisted ? "fill-[#74189B] text-[#74189B]" : "text-slate-400"}
                    />
                  </button>

                  <Link href={`/products/${product.id}`} className="product-image">
                    <img
                      src={product.image}
                      alt={product.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/Premium Sheesha.webp";
                      }}
                    />
                  </Link>

                  <h3>{product.name}</h3>

                  <strong className="product-price">{product.price}</strong>

                  <div className="rating">
                    <div style={{ display: "inline-flex", gap: "2px", alignItems: "center" }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={11} fill="#EFB63B" color="#EFB63B" />
                      ))}
                    </div>
                    <small style={{ marginLeft: "4px" }}>({product.reviews})</small>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <aside className="right-panel">
        {/* PROFILE */}
        <section className="profile-card">
          <div className="profile-top">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#74189B] to-[#EFB63B] text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-md">
              {(customerName || "C").charAt(0).toUpperCase()}
            </div>

            <div>
              <h3>{customerName}</h3>
              <p>{customerEmail || "Customer Account"}</p>
            </div>
          </div>

          <Link href="/dashboard/settings" className="edit-profile">
            <Edit3 size={13} style={{ display: "inline", marginRight: "6px" }} />
            Edit Profile
          </Link>

          <div className="profile-links">
            <Link href="/dashboard/orders">
              <span><ShoppingBag size={14} /></span>
              Order History
              <b><ChevronRight size={13} /></b>
            </Link>

            <Link href="/dashboard/wishlist">
              <span><Heart size={14} /></span>
              My Wishlist
              <b><ChevronRight size={13} /></b>
            </Link>

            <Link href="/dashboard/settings">
              <span><MapPin size={14} /></span>
              Saved Addresses
              <b><ChevronRight size={13} /></b>
            </Link>

            <Link href="/dashboard/settings">
              <span><CreditCard size={14} /></span>
              Payment Methods
              <b><ChevronRight size={13} /></b>
            </Link>

            <Link href="/dashboard/settings">
              <span><Settings size={14} /></span>
              Settings
              <b><ChevronRight size={13} /></b>
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              className="profile-logout-btn"
              title="Logout"
            >
              <span><LogOut size={14} /></span>
              Logout
              <b><ChevronRight size={13} /></b>
            </button>
          </div>
        </section>

        {/* SUPPORT */}
        <section className="support-card">
          <div className="support-icon">
            <HelpCircle size={20} color="#822576" />
          </div>

          <div>
            <h3>Need Help?</h3>

            <p>
              Our support team is here
              <br />
              for you 24/7.
            </p>

            <Link href="/contact">
              Contact Support <ArrowRight size={14} style={{ display: "inline", verticalAlign: "middle" }} />
            </Link>
          </div>
        </section>

        {/* VENDOR */}
        <section className="vendor-card">
          <div>
            <h2>Become a Vendor</h2>

            <p>
              Partner with us and grow
              <br />
              your business.
            </p>

            <Link href="/vendors">
              Learn More <ArrowRight size={14} style={{ display: "inline", verticalAlign: "middle" }} />
            </Link>
          </div>

          <img
            src="/dashboard/vendor-hookah.png"
            alt="Become a Vendor"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/SHEESHA-SET.webp";
            }}
          />
        </section>
      </aside>
    </main>
  );
}

/* ================= STAT CARD ================= */

function StatCard({
  icon,
  title,
  value,
  link,
  href = "/dashboard",
  gold = false,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  link: string;
  href?: string;
  gold?: boolean;
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${gold ? "gold" : ""}`}>{icon}</div>

      <div className="stat-info">
        <span>{title}</span>
        <strong>{value}</strong>
      </div>

      <Link href={href}>
        {link} <ArrowRight size={14} style={{ display: "inline", verticalAlign: "middle" }} />
      </Link>
    </div>
  );
}
