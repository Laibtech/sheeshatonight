"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  Star,
  MapPin,
  Heart,
  CheckCircle2,
  Phone,
} from "lucide-react";
import { apiNext, VendorItem } from '@/lib/api';
import '../shared-category.css';

const categories = [
  "All Vendors",
  "Lounge",
  "Shop",
  "Delivery",
  "Rental",
];

export default function TopVendorsPage() {
  const [activeCategory, setActiveCategory] = useState("All Vendors");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Recommended");
  const [showFilters, setShowFilters] = useState(false);
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const result = await apiNext.vendors.getVendors({
        limit: 50,
      });
      if (result.success) {
        setVendors(result.data);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors
    .filter((vendor) => {
      const matchesCategory =
        activeCategory === "All Vendors" ||
        vendor.category === activeCategory;
      const matchesSearch =
        vendor.name.toLowerCase().includes(search.toLowerCase()) ||
        vendor.location.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sort === "Distance") {
        const distA = parseFloat(a.distance);
        const distB = parseFloat(b.distance);
        if (isNaN(distA)) return 1;
        if (isNaN(distB)) return -1;
        return distA - distB;
      }
      if (sort === "Top Rated") return b.rating - a.rating;
      if (sort === "Most Reviews") return b.reviews - a.reviews;
      return 0;
    });

  return (
    <>
      <Header />
      <main className="category-page">
        {/* HERO */}
        <section className="category-hero hero-top-vendors">
          <div className="category-hero-content">
            <Link href="/" className="category-back-link">
              ← Back to Home
            </Link>
            <span className="category-eyebrow">
              DISCOVER THE BEST
            </span>
            <h1>
              Top Rated <em>Vendors</em>
            </h1>
            <p>
              Explore verified sheesha lounges, shops, and delivery services across the UAE.
            </p>
            {/* SEARCH */}
            <div className="category-search-box">
              <Search size={19} />
              <input
                type="text"
                placeholder="Search vendors, locations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="category-content">
          {/* CATEGORY FILTERS */}
          <div className="category-scroll">
            {categories.map((category) => (
              <button
                key={category}
                className={
                  activeCategory === category
                    ? "category-btn active"
                    : "category-btn"
                }
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* TOOLBAR */}
          <div className="category-toolbar">
            <div>
              <span className="category-result-count">
                {loading ? 'Loading...' : `${filteredVendors.length} vendors available`}
              </span>
            </div>
            <div className="category-toolbar-actions">
              <button
                className="category-filter-button"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={17} />
                Filters
              </button>
              <div className="category-sort-wrapper">
                <span>Sort:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option>Recommended</option>
                  <option>Top Rated</option>
                  <option>Most Reviews</option>
                  <option>Distance</option>
                </select>
                <ChevronDown size={15} />
              </div>
            </div>
          </div>

          {/* FILTER PANEL */}
          {showFilters && (
            <div className="category-filter-panel">
              <div>
                <label>Location</label>
                <select>
                  <option>All UAE</option>
                  <option>Dubai</option>
                  <option>Abu Dhabi</option>
                  <option>Sharjah</option>
                  <option>Ajman</option>
                </select>
              </div>
              <div>
                <label>Distance</label>
                <select>
                  <option>Any Distance</option>
                  <option>Within 5 km</option>
                  <option>Within 10 km</option>
                  <option>Within 20 km</option>
                </select>
              </div>
              <div>
                <label>Verified Only</label>
                <select>
                  <option>All Vendors</option>
                  <option>Verified Only</option>
                </select>
              </div>
            </div>
          )}

          {/* VENDORS */}
          {loading ? (
            <div className="category-loading">
              <div className="category-spinner"></div>
              <p>Loading vendors...</p>
            </div>
          ) : filteredVendors.length > 0 ? (
            <div className="category-grid">
              {filteredVendors.map((vendor) => (
                <Link
                  href={`/vendors/${vendor.id}`}
                  className="category-card"
                  key={vendor.id}
                >
                  {/* IMAGE */}
                  <div className="category-card-image">
                    <Image
                      src={vendor.image}
                      alt={vendor.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    <button
                      className="category-favorite"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <Heart size={17} />
                    </button>
                  </div>

                  {/* INFO */}
                  <div className="category-card-info">
                    <h3 className="category-card-title">
                      {vendor.name}
                      {vendor.verified && (
                        <CheckCircle2 size={16} style={{ color: '#74189b', marginLeft: '6px' }} />
                      )}
                    </h3>
                    <div className="category-rating">
                      <div className="category-stars">
                        <Star size={14} fill="currentColor" />
                      </div>
                      <span className="category-rating-value">{vendor.rating}</span>
                      <span className="category-rating-count">
                        ({vendor.reviews} reviews)
                      </span>
                    </div>
                    <div className="category-location">
                      <MapPin size={13} />
                      {vendor.location}
                    </div>
                    {vendor.distance !== "N/A" && (
                      <div className="category-brand">
                        {vendor.distance} away
                      </div>
                    )}
                    <button
                      className="category-add-btn"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <Phone size={16} />
                      Contact Vendor
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="category-empty">
              <Phone size={64} />
              <h3>No vendors found</h3>
              <p>
                {vendors.length === 0 
                  ? 'No verified vendors available yet.'
                  : 'Try searching for another vendor or location.'
                }
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
