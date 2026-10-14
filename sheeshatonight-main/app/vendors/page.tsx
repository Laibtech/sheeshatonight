"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Vendor = {
  id: string;
  slug: string;
  name: string;
  logo?: string | null;
  coverImage?: string | null;
  location?: string | null;
  emirate?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  services?: string[];
  startingPrice?: number | null;
  verified?: boolean;
  available?: boolean;
};

const emirates = [
  "All Emirates",
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
];

const services = [
  "All Services",
  "Sheesha Delivery",
  "Sheesha Rentals",
  "Villa Events",
  "Yacht Events",
  "Corporate Events",
  "Weddings",
  "Private Events",
];

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [emirate, setEmirate] = useState("All Emirates");
  const [service, setService] = useState("All Services");
  const [rating, setRating] = useState("Any Rating");
  const [price, setPrice] = useState("Any Price");
  const [availability, setAvailability] = useState("All Vendors");

  useEffect(() => {
    let cancelled = false;

    async function loadVendors() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/vendors", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load vendors");
        }

        const data = await response.json();

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.vendors)
            ? data.vendors
            : Array.isArray(data?.data)
              ? data.data
              : [];

        if (!cancelled) {
          setVendors(list);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading vendors."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadVendors();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        vendor.name?.toLowerCase().includes(query) ||
        vendor.location?.toLowerCase().includes(query) ||
        vendor.emirate?.toLowerCase().includes(query);

      const matchesEmirate =
        emirate === "All Emirates" ||
        vendor.emirate?.toLowerCase() === emirate.toLowerCase();

      const matchesService =
        service === "All Services" ||
        vendor.services?.some(
          (item) => item.toLowerCase() === service.toLowerCase()
        );

      const matchesRating =
        rating === "Any Rating" ||
        (vendor.rating ?? 0) >= Number(rating.replace("+", ""));

      const matchesPrice =
        price === "Any Price" ||
        (price === "Under AED 200" && (vendor.startingPrice ?? 999999) < 200) ||
        (price === "AED 200–500" &&
          (vendor.startingPrice ?? 0) >= 200 &&
          (vendor.startingPrice ?? 999999) <= 500) ||
        (price === "AED 500+" && (vendor.startingPrice ?? 0) > 500);

      const matchesAvailability =
        availability === "All Vendors" ||
        (availability === "Available Now" && vendor.available === true) ||
        (availability === "Verified Only" && vendor.verified === true);

      return (
        matchesSearch &&
        matchesEmirate &&
        matchesService &&
        matchesRating &&
        matchesPrice &&
        matchesAvailability
      );
    });
  }, [
    vendors,
    search,
    emirate,
    service,
    rating,
    price,
    availability,
  ]);

  const clearFilters = () => {
    setSearch("");
    setEmirate("All Emirates");
    setService("All Services");
    setRating("Any Rating");
    setPrice("Any Price");
    setAvailability("All Vendors");
  };

  return (
    <>
      <Header />

      <main className="vendors-page">
        {/* HERO */}
        <section className="vendors-hero">
          <div className="hero-overlay" />

          <div className="hero-content">
            <div className="breadcrumb">
              <Link href="/">Home</Link>
              <span>/</span>
              <span>Vendors</span>
            </div>

            <span className="eyebrow">VERIFIED PARTNERS</span>

            <h1>
              Discover Premium
              <br />
              Sheesha Vendors
            </h1>

            <p>
              Explore trusted sheesha specialists across the UAE and find the
              right vendor for your next gathering.
            </p>
          </div>
        </section>

        {/* SEARCH + FILTERS */}
        <section className="directory-section">
          <div className="container">
            <div className="directory-heading">
              <div>
                <span className="eyebrow purple">OUR VENDORS</span>
                <h2>Find the right vendor for you</h2>
                <p>
                  Compare verified vendors, services, locations and pricing.
                </p>
              </div>

              {!loading && (
                <div className="result-count">
                  <strong>{filteredVendors.length}</strong>
                  <span>vendors</span>
                </div>
              )}
            </div>

            <div className="filter-box">
              <div className="search-field">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>

                <input
                  type="text"
                  placeholder="Search vendors, locations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                value={emirate}
                onChange={(e) => setEmirate(e.target.value)}
              >
                {emirates.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>

              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
              >
                {services.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>

              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              >
                <option>Any Rating</option>
                <option value="4+">4.0+</option>
                <option value="4.5+">4.5+</option>
                <option value="4.8+">4.8+</option>
              </select>

              <select
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              >
                <option>Any Price</option>
                <option>Under AED 200</option>
                <option>AED 200–500</option>
                <option>AED 500+</option>
              </select>

              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              >
                <option>All Vendors</option>
                <option>Available Now</option>
                <option>Verified Only</option>
              </select>

              <button className="clear-btn" onClick={clearFilters}>
                Clear
              </button>
            </div>

            {/* LOADING */}
            {loading && (
              <div className="vendor-grid">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div className="vendor-card skeleton-card" key={index}>
                    <div className="skeleton skeleton-cover" />
                    <div className="vendor-body">
                      <div className="skeleton skeleton-logo" />
                      <div className="skeleton skeleton-line large" />
                      <div className="skeleton skeleton-line" />
                      <div className="skeleton skeleton-line small" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ERROR */}
            {!loading && error && (
              <div className="state-card error-state">
                <div className="state-icon">!</div>
                <h3>Unable to load vendors</h3>
                <p>{error}</p>

                <button
                  onClick={() => window.location.reload()}
                  className="primary-btn"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* EMPTY */}
            {!loading && !error && filteredVendors.length === 0 && (
              <div className="state-card">
                <div className="empty-icon">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M3 10.5 12 4l9 6.5M5 9.5V20h14V9.5M9 20v-5h6v5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <h3>No vendors found</h3>

                <p>
                  We couldn&apos;t find vendors matching your current filters.
                </p>

                <button onClick={clearFilters} className="primary-btn">
                  Clear Filters
                </button>
              </div>
            )}

            {/* VENDORS */}
            {!loading && !error && filteredVendors.length > 0 && (
              <div className="vendor-grid">
                {filteredVendors.map((vendor) => (
                  <article className="vendor-card" key={vendor.id}>
                    <Link
                      href={`/vendors/${vendor.slug || vendor.id}`}
                      className="vendor-image"
                    >
                      {vendor.coverImage ? (
                        <Image
                          src={vendor.coverImage}
                          alt={vendor.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          unoptimized
                        />
                      ) : (
                        <div className="image-placeholder">
                          <span>SheeshaTonight</span>
                        </div>
                      )}

                      <div className="image-gradient" />

                      {vendor.verified && (
                        <span className="verified-badge">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="m5 12 4 4L19 6"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Verified
                        </span>
                      )}

                      {vendor.available && (
                        <span className="availability-badge">
                          Available
                        </span>
                      )}
                    </Link>

                    <div className="vendor-body">
                      <div className="vendor-top">
                        <div className="vendor-logo">
                          {vendor.logo ? (
                            <Image
                              src={vendor.logo}
                              alt={`${vendor.name} logo`}
                              width={58}
                              height={58}
                              unoptimized
                            />
                          ) : (
                            <span>
                              {vendor.name?.charAt(0)?.toUpperCase() || "V"}
                            </span>
                          )}
                        </div>

                        <div className="vendor-rating">
                          <Star size={14} className="fill-[#e4ad36] text-[#e4ad36]" />
                          <strong>
                            {vendor.rating
                              ? vendor.rating.toFixed(1)
                              : "—"}
                          </strong>
                          {vendor.reviewCount ? (
                            <span>
                              ({vendor.reviewCount})
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <Link
                        href={`/vendors/${vendor.slug || vendor.id}`}
                        className="vendor-name"
                      >
                        {vendor.name}
                      </Link>

                      <div className="vendor-location">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          />
                          <circle
                            cx="12"
                            cy="10"
                            r="2.5"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          />
                        </svg>

                        <span>
                          {vendor.location ||
                            vendor.emirate ||
                            "UAE"}
                        </span>
                      </div>

                      {vendor.services &&
                        vendor.services.length > 0 && (
                          <div className="service-list">
                            {vendor.services
                              .slice(0, 3)
                              .map((item) => (
                                <span key={item}>{item}</span>
                              ))}
                          </div>
                        )}

                      <div className="vendor-footer">
                        <div className="starting-price">
                          {vendor.startingPrice ? (
                            <>
                              <small>Starting from</small>
                              <strong>
                                AED{" "}
                                {vendor.startingPrice.toLocaleString()}
                              </strong>
                            </>
                          ) : (
                            <small>Pricing available on request</small>
                          )}
                        </div>

                        <Link
                          href={`/vendors/${vendor.slug || vendor.id}`}
                          className="view-btn"
                        >
                          View Vendor
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M5 12h14m-6-6 6 6-6 6"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="vendor-cta">
          <div className="cta-inner">
            <span className="eyebrow">JOIN THE MARKETPLACE</span>

            <h2>
              Ready to grow your
              <br />
              sheesha business?
            </h2>

            <p>
              Join SheeshaTonight and connect your business with customers
              across the UAE.
            </p>

            <Link href="/vendor/register" className="cta-button">
              Become a Vendor
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M5 12h14m-6-6 6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </section>

        <style jsx global>{`
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            background: #ffffff;
            color: #17151a;
          }

          .vendors-page {
            min-height: 100vh;
            background: #ffffff;
            font-family:
              Inter, ui-sans-serif, system-ui, -apple-system,
              BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          .container {
            max-width: 1440px;
            width: 100%;
            margin: 0 auto;
            padding: 0 32px;
            box-sizing: border-box;
          }

          .vendors-hero {
            position: relative;
            min-height: 470px;
            display: flex;
            align-items: center;
            overflow: hidden;
            background:
              linear-gradient(
                90deg,
                rgba(31, 11, 37, 0.88) 0%,
                rgba(31, 11, 37, 0.62) 42%,
                rgba(31, 11, 37, 0.2) 100%
              ),
              url("/images/vendors-hero.jpg") center / cover no-repeat;
          }

          .hero-overlay {
            position: absolute;
            inset: 0;
            background:
              radial-gradient(
                circle at 80% 30%,
                rgba(241, 165, 29, 0.14),
                transparent 30%
              );
            pointer-events: none;
          }

          .hero-content {
            position: relative;
            z-index: 2;
            max-width: 1440px;
            width: 100%;
            margin: 0 auto;
            color: #fff;
            padding: 30px 32px 0;
            box-sizing: border-box;
          }

          .breadcrumb {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 44px;
            color: rgba(255, 255, 255, 0.7);
            font-size: 13px;
          }

          .breadcrumb a {
            color: #fff;
            text-decoration: none;
          }

          .eyebrow {
            display: inline-block;
            margin-bottom: 13px;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.18em;
          }

          .eyebrow.purple {
            color: #74189b;
          }

          .hero-content h1 {
            margin: 0;
            max-width: 720px;
            font-size: clamp(42px, 5vw, 68px);
            line-height: 1.03;
            letter-spacing: -0.04em;
            font-weight: 750;
          }

          .hero-content p {
            max-width: 580px;
            margin: 22px 0 0;
            font-size: 17px;
            line-height: 1.7;
            color: rgba(255, 255, 255, 0.84);
          }

          .directory-section {
            padding: 44px 0 56px;
          }

          .directory-heading {
            display: flex;
            align-items: end;
            justify-content: space-between;
            gap: 30px;
            margin-bottom: 34px;
          }

          .directory-heading h2 {
            margin: 0;
            font-size: clamp(28px, 3vw, 40px);
            letter-spacing: -0.03em;
            line-height: 1.1;
          }

          .directory-heading p {
            margin: 12px 0 0;
            color: #77717a;
            font-size: 15px;
          }

          .result-count {
            display: flex;
            align-items: baseline;
            gap: 7px;
            color: #77717a;
            white-space: nowrap;
          }

          .result-count strong {
            color: #74189b;
            font-size: 28px;
          }

          .filter-box {
            display: grid;
            grid-template-columns: 1.8fr repeat(5, 1fr) auto;
            gap: 10px;
            padding: 14px;
            margin-bottom: 38px;
            background: #faf8fb;
            border: 1px solid #eee7f0;
            border-radius: 18px;
          }

          .search-field {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 0;
            padding: 0 14px;
            height: 50px;
            background: #fff;
            border: 1px solid #e7e1e9;
            border-radius: 11px;
            color: #77717a;
          }

          .search-field input {
            width: 100%;
            min-width: 0;
            border: 0;
            outline: 0;
            background: transparent;
            font-size: 14px;
            color: #1c1820;
          }

          .filter-box select {
            height: 50px;
            min-width: 0;
            padding: 0 12px;
            border: 1px solid #e7e1e9;
            border-radius: 11px;
            background: #fff;
            color: #454047;
            font-size: 13px;
            outline: none;
          }

          .filter-box select:focus,
          .search-field:focus-within {
            border-color: #74189b;
            box-shadow: 0 0 0 3px rgba(116, 24, 155, 0.08);
          }

          .clear-btn {
            height: 50px;
            padding: 0 15px;
            border: 0;
            border-radius: 11px;
            background: #74189b;
            color: #fff;
            font-weight: 700;
            cursor: pointer;
          }

          .vendor-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 26px;
          }

          .vendor-card {
            overflow: hidden;
            background: #fff;
            border: 1px solid #ece8ed;
            border-radius: 20px;
            transition:
              transform 0.25s ease,
              box-shadow 0.25s ease;
          }

          .vendor-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 18px 45px rgba(35, 17, 42, 0.09);
          }

          .vendor-image {
            position: relative;
            display: block;
            height: 235px;
            overflow: hidden;
            background: #eee8ef;
            text-decoration: none;
          }

          .vendor-image img {
            object-fit: cover;
            transition: transform 0.45s ease;
          }

          .vendor-card:hover .vendor-image img {
            transform: scale(1.04);
          }

          .image-gradient {
            position: absolute;
            inset: auto 0 0;
            height: 45%;
            background: linear-gradient(
              to top,
              rgba(0, 0, 0, 0.45),
              transparent
            );
          }

          .image-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f2edf4;
            color: #74189b;
            font-weight: 700;
          }

          .verified-badge,
          .availability-badge {
            position: absolute;
            top: 14px;
            z-index: 2;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 7px 10px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 750;
          }

          .verified-badge {
            left: 14px;
            color: #fff;
            background: #74189b;
          }

          .availability-badge {
            right: 14px;
            color: #245d39;
            background: #eef8f1;
          }

          .vendor-body {
            padding: 20px;
          }

          .vendor-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 15px;
          }

          .vendor-logo {
            width: 58px;
            height: 58px;
            flex: 0 0 58px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 4px solid #fff;
            border-radius: 50%;
            background: #f1eaf4;
            color: #74189b;
            box-shadow: 0 3px 15px rgba(0, 0, 0, 0.1);
            margin-top: -43px;
            position: relative;
            z-index: 3;
          }

          .vendor-logo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .vendor-logo span {
            font-size: 21px;
            font-weight: 800;
          }

          .vendor-rating {
            display: flex;
            align-items: center;
            gap: 4px;
            color: #77717a;
            font-size: 12px;
          }

          .vendor-rating strong {
            color: #272229;
            font-size: 13px;
          }

          .star {
            color: #f1a51d;
            font-size: 16px;
          }

          .vendor-name {
            display: block;
            color: #201c22;
            font-size: 20px;
            font-weight: 750;
            letter-spacing: -0.02em;
            text-decoration: none;
          }

          .vendor-name:hover {
            color: #74189b;
          }

          .vendor-location {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-top: 9px;
            color: #77717a;
            font-size: 13px;
          }

          .service-list {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 16px;
          }

          .service-list span {
            padding: 6px 9px;
            border-radius: 7px;
            background: #f7f4f8;
            color: #655e68;
            font-size: 11px;
            font-weight: 600;
          }

          .vendor-footer {
            display: flex;
            align-items: end;
            justify-content: space-between;
            gap: 16px;
            margin-top: 22px;
            padding-top: 17px;
            border-top: 1px solid #eee9ee;
          }

          .starting-price {
            display: flex;
            flex-direction: column;
            gap: 3px;
          }

          .starting-price small {
            color: #8a838d;
            font-size: 10px;
          }

          .starting-price strong {
            color: #241e27;
            font-size: 16px;
          }

          .view-btn {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 11px 14px;
            border: 1px solid #74189b;
            border-radius: 10px;
            color: #74189b;
            font-size: 12px;
            font-weight: 750;
            text-decoration: none;
            transition: all 0.2s ease;
          }

          .view-btn:hover {
            background: #74189b;
            color: #fff;
          }

          .state-card {
            min-height: 310px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            text-align: center;
            padding: 40px;
            border: 1px dashed #ddd5df;
            border-radius: 20px;
            background: #fcfbfc;
          }

          .state-card h3 {
            margin: 14px 0 7px;
            font-size: 20px;
          }

          .state-card p {
            max-width: 460px;
            margin: 0 0 20px;
            color: #77717a;
            font-size: 14px;
            line-height: 1.6;
          }

          .empty-icon,
          .state-icon {
            width: 58px;
            height: 58px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: #f1e9f4;
            color: #74189b;
          }

          .state-icon {
            background: #fff0f0;
            color: #b23b3b;
            font-size: 23px;
            font-weight: 800;
          }

          .primary-btn {
            height: 46px;
            padding: 0 19px;
            border: 0;
            border-radius: 10px;
            background: #74189b;
            color: #fff;
            font-weight: 700;
            cursor: pointer;
          }

          .skeleton {
            position: relative;
            overflow: hidden;
            background: #eee9ef;
          }

          .skeleton::after {
            content: "";
            position: absolute;
            inset: 0;
            transform: translateX(-100%);
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.7),
              transparent
            );
            animation: skeleton 1.5s infinite;
          }

          @keyframes skeleton {
            100% {
              transform: translateX(100%);
            }
          }

          .skeleton-cover {
            height: 235px;
          }

          .skeleton-card {
            border: 0;
          }

          .skeleton-logo {
            width: 58px;
            height: 58px;
            margin-top: -43px;
            border-radius: 50%;
          }

          .skeleton-line {
            height: 14px;
            width: 75%;
            margin-top: 15px;
            border-radius: 6px;
          }

          .skeleton-line.large {
            width: 55%;
            height: 21px;
            margin-top: 20px;
          }

          .skeleton-line.small {
            width: 45%;
          }

          .vendor-cta {
            padding: 56px 20px;
            background: #f7f1f9;
          }

          .cta-inner {
            max-width: 850px;
            margin: 0 auto;
            text-align: center;
          }

          .cta-inner .eyebrow {
            color: #74189b;
          }

          .cta-inner h2 {
            margin: 0;
            color: #2a172e;
            font-size: clamp(34px, 5vw, 54px);
            line-height: 1.06;
            letter-spacing: -0.04em;
          }

          .cta-inner p {
            max-width: 570px;
            margin: 18px auto 28px;
            color: #716875;
            line-height: 1.7;
          }

          .cta-button {
            display: inline-flex;
            align-items: center;
            gap: 9px;
            min-height: 52px;
            padding: 0 23px;
            border-radius: 11px;
            background: #74189b;
            color: #fff;
            text-decoration: none;
            font-size: 14px;
            font-weight: 750;
            transition: transform 0.2s ease;
          }

          .cta-button:hover {
            transform: translateY(-2px);
          }

          @media (max-width: 1100px) {
            .filter-box {
              grid-template-columns: repeat(3, 1fr);
            }

            .search-field {
              grid-column: span 3;
            }

            .clear-btn {
              grid-column: span 1;
            }

            .vendor-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 1024px) {
            .container {
              padding: 0 24px;
            }

            .hero-content {
              padding: 30px 24px 0;
            }
          }

          @media (max-width: 700px) {
            .container {
              padding: 0 16px;
            }

            .hero-content {
              padding: 20px 16px 0;
            }

            .vendors-hero {
              min-height: 440px;
            }

            .hero-content h1 {
              font-size: 43px;
            }

            .hero-content p {
              font-size: 15px;
            }

            .breadcrumb {
              margin-bottom: 32px;
            }

            .directory-section {
              padding: 55px 0 70px;
            }

            .directory-heading {
              display: block;
            }

            .result-count {
              margin-top: 20px;
            }

            .filter-box {
              display: flex;
              flex-direction: column;
              padding: 11px;
            }

            .search-field {
              width: 100%;
            }

            .filter-box select,
            .clear-btn {
              width: 100%;
            }

            .vendor-grid {
              grid-template-columns: 1fr;
              gap: 18px;
            }

            .vendor-image {
              height: 225px;
            }

            .vendor-footer {
              align-items: center;
            }

            .vendor-cta {
              padding: 75px 20px;
            }
          }
        `}</style>
      </main>

      <Footer />
    </>
  );
}
