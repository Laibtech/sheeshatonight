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
} from "lucide-react";
import { apiNext, ProductItem } from '@/lib/api';
import '../shared-category.css';

const categories = [
  "All Flavors",
  "Fruity",
  "Mint",
  "Classic",
  "Premium",
  "Tobacco-Free",
];

export default function FlavorsPage() {
  const [activeCategory, setActiveCategory] = useState("All Flavors");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Recommended");
  const [showFilters, setShowFilters] = useState(false);
  const [flavors, setFlavors] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlavors();
  }, []);

  const fetchFlavors = async () => {
    try {
      setLoading(true);
      const result = await apiNext.products.getProducts({
        category: 'Flavors',
        type: 'SALE',
        limit: 50,
      });
      if (result.success) {
        setFlavors(result.data);
      }
    } catch (error) {
      console.error('Error fetching flavors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFlavors = flavors
    .filter((flavor) => {
      const matchesCategory =
        activeCategory === "All Flavors" ||
        flavor.category === activeCategory;
      const matchesSearch =
        flavor.name.toLowerCase().includes(search.toLowerCase()) ||
        flavor.brand.toLowerCase().includes(search.toLowerCase());
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
        <section className="category-hero hero-flavors">
          <div className="category-hero-content">
            <Link href="/" className="category-back-link">
              ← Back to Home
            </Link>
            <span className="category-eyebrow">
              EXPLORE OUR COLLECTION
            </span>
            <h1>
              Find Your Perfect <em>Flavor</em>
            </h1>
            <p>
              Explore premium sheesha flavors from trusted vendors across the UAE.
            </p>
            {/* SEARCH */}
            <div className="category-search-box">
              <Search size={19} />
              <input
                type="text"
                placeholder="Search flavors, brands..."
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
                {loading ? 'Loading...' : `${filteredFlavors.length} flavors available`}
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
                  <option>Under AED 40</option>
                  <option>AED 40 - AED 60</option>
                  <option>Above AED 60</option>
                </select>
              </div>
              <div>
                <label>Rating</label>
                <select>
                  <option>Any Rating</option>
                  <option>4.5+</option>
                  <option>4.0+</option>
                  <option>3.5+</option>
                </select>
              </div>
            </div>
          )}

          {/* PRODUCTS */}
          {loading ? (
            <div className="category-loading">
              <div className="category-spinner"></div>
              <p>Loading flavors...</p>
            </div>
          ) : filteredFlavors.length > 0 ? (
            <div className="category-grid">
              {filteredFlavors.map((flavor) => (
                <Link
                  href={`/products/${flavor.id}`}
                  className="category-card"
                  key={flavor.id}
                >
                  {/* IMAGE */}
                  <div className="category-card-image">
                    <Image
                      src={flavor.image}
                      alt={flavor.name}
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
                      {flavor.brand}
                    </div>
                    <h3 className="category-card-title">{flavor.name}</h3>
                    <div className="category-rating">
                      <div className="category-stars">
                        <Star size={14} fill="currentColor" />
                      </div>
                      <span className="category-rating-value">{flavor.rating}</span>
                      <span className="category-rating-count">
                        ({flavor.reviews})
                      </span>
                    </div>
                    <div className="category-location">
                      <MapPin size={13} />
                      {flavor.location}
                    </div>
                    <div className="category-price">
                      AED {flavor.price}
                    </div>
                    <button
                      className="category-add-btn"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <ShoppingBag size={16} />
                      Add to Cart
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="category-empty">
              <ShoppingBag size={64} />
              <h3>No flavors found</h3>
              <p>
                {flavors.length === 0 
                  ? 'No flavors available in the database yet.'
                  : 'Try searching for another flavor or category.'
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
