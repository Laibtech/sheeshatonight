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
} from "lucide-react";
import "./CustomerDashboard.css";


const fallbackOrders = [
  {
    id: "#ST-1024",
    date: "May 28, 2025",
    total: "AED 420",
    status: "Delivered",
    statusType: "delivered",
  },
  {
    id: "#ST-0987",
    date: "May 15, 2025",
    total: "AED 285",
    status: "Processing",
    statusType: "processing",
  },
];

export default function CustomerDashboard() {
  const { userName, userEmail, userRole } = useAuthStore();

  const [customerName, setCustomerName] = useState("Sara Ahmed");
  const [customerEmail, setCustomerEmail] = useState("sara.ahmed@email.com");
  const [orders, setOrders] = useState(fallbackOrders);
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
            reviews: String(Math.floor(Math.random() * 30) + 18),
          }));
          setProducts(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Load real orders from /api/orders
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    fetch("/api/orders", { headers, cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const orderList = Array.isArray(data) ? data : data?.orders || data?.data;
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
        }
      })
      .catch(() => {});
  }, []);

  return (
    <main className="dashboard-main">
      <div className="dashboard-content">
        {/* WELCOME */}
        <section className="welcome-section">
          <h1>
            Welcome back, {customerName.split(" ")[0]} <Sparkles size={20} style={{ display: "inline", color: "#F1A51D", verticalAlign: "middle" }} />
          </h1>
          <p>Here&apos;s what&apos;s happening with your account today.</p>
        </section>

        {/* STATS */}
        <section className="stats-grid">
          <StatCard
            icon={<ShoppingBag size={18} />}
            title="Total Orders"
            value={String(orders.length > 0 ? orders.length : 2)}
            link="View Orders"
            href="/dashboard/orders"
          />

          <StatCard
            icon={<Heart size={18} />}
            title="Wishlist Items"
            value="12"
            link="View Wishlist"
            href="/dashboard/wishlist"
          />

          <StatCard
            icon={<MapPin size={18} />}
            title="Saved Addresses"
            value="2"
            link="Manage Addresses"
            href="/dashboard/settings"
          />

          <StatCard
            icon={<CreditCard size={18} />}
            title="Payment Methods"
            value="1"
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
            {products.map((product) => (
              <div className="product-card" key={product.name}>
                <button type="button" className="favorite" title="Save to wishlist">
                  <Heart size={15} />
                </button>

                <Link href="/shop" className="product-image">
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
            ))}
          </div>
        </section>
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <aside className="right-panel">
        {/* PROFILE */}
        <section className="profile-card">
          <div className="profile-top">
            <img
              src="/users/sara.jpg"
              alt={customerName}
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />

            <div>
              <h3>{customerName}</h3>
              <p>{customerEmail}</p>
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
