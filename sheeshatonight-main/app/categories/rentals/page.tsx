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
  ShoppingBag,
  Heart,
  Clock,
} from "lucide-react";
import '../shared-category.css';

interface RentalItem {
  id: string | number;
  name: string;
  vendor: string;
  category: string;
  price: number;
  duration: string;
  rating: number;
  reviews: number;
  location: string;
  image: string;
}

const categories = [
  "All Rentals",
  "Standard",
  "Premium",
  "Luxury",
  "Party Package",
  "Corporate",
];

export default function RentalsPage() {
  const [rentals, setRentals] = useState<RentalItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("All Rentals");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Recommended");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch('/api/products?type=RENTAL')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setRentals(
            res.data.map((p: any) => ({
              id: p.id,
              name: p.title || p.name,
              vendor: p.vendor || 'Cloud Lounge',
              category: p.category || 'Premium',
              price: Number(p.price) || 0,
              duration: '24 Hours',
              rating: p.rating || 4.8,
              reviews: p.reviews || 0,
              location: p.location || 'Dubai',
              image: p.image || '/rentals/premium-rental.webp',
            }))
          );
        }
      })
      .catch((err) => console.error('Failed to fetch rental products:', err));
  }, []);

  const filteredRentals = rentals
    .filter((rental) => {
      const matchesCategory =
        activeCategory === "All Rentals" ||
        rental.category === activeCategory;
      const matchesSearch =
        rental.name.toLowerCase().includes(search.toLowerCase()) ||
        rental.vendor.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sort === "Price: Low to High") return a.price - b.price;
      if (sort === "Price: High to Low") return b.price - a.price;
      if (sort === "Top Rated") return b.rating - a.rating;
      return 0;
    });

  return (
    <>
      <Header />
      <main className="category-page">
        {/* HERO */}
        <section className="category-hero hero-rentals">
          <div className="category-hero-content">
            <Link href="/" className="category-back-link">
              ← Back to Home
            </Link>
            <span className="category-eyebrow">
              PREMIUM SHEESHA RENTALS
            </span>
            <h1>
              Rent Premium <em>Sheesha Setups</em>
            </h1>
            <p>
              Get premium hookah setups delivered to your doorstep. Perfect for parties, events, and relaxation.
            </p>
            {/* SEARCH */}
            <div className="category-search-box">
              <Search size={19} />
              <input
                type="text"
                placeholder="Search rentals, vendors..."
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
                {filteredRentals.length} rentals available
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
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
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
                <label>Price Range</label>
                <select>
                  <option>Any Price</option>
                  <option>Under AED 150</option>
                  <option>AED 150 - AED 300</option>
                  <option>Above AED 300</option>
                </select>
              </div>
              <div>
                <label>Duration</label>
                <select>
                  <option>Any Duration</option>
                  <option>4-6 Hours</option>
                  <option>24 Hours</option>
                  <option>48+ Hours</option>
                </select>
              </div>
            </div>
          )}

          {/* PRODUCTS */}
          {filteredRentals.length > 0 ? (
            <div className="category-grid">
              {filteredRentals.map((rental) => (
                <Link
                  href={`/products/${rental.id}`}
                  className="category-card"
                  key={rental.id}
                >
                  {/* IMAGE */}
                  <div className="category-card-image">
                    <Image
                      src={rental.image}
                      alt={rental.name}
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
                    <div className="category-brand">
                      {rental.vendor}
                    </div>
                    <h3 className="category-card-title">{rental.name}</h3>
                    <div className="category-rating">
                      <div className="category-stars">
                        <Star size={14} fill="currentColor" />
                      </div>
                      <span className="category-rating-value">{rental.rating}</span>
                      <span className="category-rating-count">
                        ({rental.reviews})
                      </span>
                    </div>
                    <div className="category-duration">
                      <Clock size={13} />
                      {rental.duration}
                    </div>
                    <div className="category-location">
                      <MapPin size={13} />
                      {rental.location}
                    </div>
                    <div className="category-price">
                      AED {rental.price}
                      <span className="category-price-label">/{rental.duration}</span>
                    </div>
                    <button
                      className="category-add-btn"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <ShoppingBag size={16} />
                      Book Now
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="category-empty">
              <ShoppingBag size={64} />
              <h3>No rentals found</h3>
              <p>Try searching for another rental or category.</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
