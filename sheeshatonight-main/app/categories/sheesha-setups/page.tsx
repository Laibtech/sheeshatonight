"use client";

import { useState } from "react";
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
import '../shared-category.css';

const setups = [
  {
    id: 1,
    name: "Premium Glass Hookah",
    brand: "Khalil Mamoon",
    category: "Traditional",
    price: 450,
    rating: 4.9,
    reviews: 89,
    location: "Dubai",
    image: "/setups/premium-glass.webp",
  },
  {
    id: 2,
    name: "Modern LED Hookah",
    brand: "Starbuzz",
    category: "Modern",
    price: 650,
    rating: 4.8,
    reviews: 67,
    location: "Dubai",
    image: "/setups/led-hookah.webp",
  },
  {
    id: 3,
    name: "Classic Brass Hookah",
    brand: "Khalil Mamoon",
    category: "Traditional",
    price: 380,
    rating: 4.7,
    reviews: 112,
    location: "Abu Dhabi",
    image: "/setups/brass-hookah.webp",
  },
  {
    id: 4,
    name: "Crystal Elite Setup",
    brand: "Amy Deluxe",
    category: "Premium",
    price: 850,
    rating: 4.9,
    reviews: 45,
    location: "Dubai",
    image: "/setups/crystal-elite.webp",
  },
  {
    id: 5,
    name: "Compact Travel Hookah",
    brand: "MYA",
    category: "Portable",
    price: 220,
    rating: 4.6,
    reviews: 78,
    location: "Sharjah",
    image: "/setups/travel-hookah.webp",
  },
  {
    id: 6,
    name: "Luxury Gold Hookah",
    brand: "Khalil Mamoon",
    category: "Premium",
    price: 950,
    rating: 4.9,
    reviews: 52,
    location: "Dubai",
    image: "/setups/luxury-gold.webp",
  },
  {
    id: 7,
    name: "Bambino Mini Hookah",
    brand: "MYA",
    category: "Portable",
    price: 180,
    rating: 4.5,
    reviews: 91,
    location: "Ajman",
    image: "/setups/bambino-mini.webp",
  },
  {
    id: 8,
    name: "RGB Gaming Hookah",
    brand: "Starbuzz",
    category: "Modern",
    price: 720,
    rating: 4.8,
    reviews: 63,
    location: "Dubai",
    image: "/setups/rgb-gaming.webp",
  },
];

const categories = [
  "All Setups",
  "Traditional",
  "Modern",
  "Premium",
  "Portable",
  "LED/RGB",
];

export default function SheeshaSetupsPage() {
  const [activeCategory, setActiveCategory] = useState("All Setups");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Recommended");
  const [showFilters, setShowFilters] = useState(false);

  const filteredSetups = setups
    .filter((setup) => {
      const matchesCategory =
        activeCategory === "All Setups" ||
        setup.category === activeCategory;
      const matchesSearch =
        setup.name.toLowerCase().includes(search.toLowerCase()) ||
        setup.brand.toLowerCase().includes(search.toLowerCase());
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
        <section className="category-hero hero-sheesha-setups">
          <div className="category-hero-content">
            <Link href="/" className="category-back-link">
              ← Back to Home
            </Link>
            <span className="category-eyebrow">
              PREMIUM HOOKAH COLLECTION
            </span>
            <h1>
              Discover Premium <em>Sheesha Setups</em>
            </h1>
            <p>
              Browse our curated collection of premium hookahs from top brands across the UAE.
            </p>
            {/* SEARCH */}
            <div className="category-search-box">
              <Search size={19} />
              <input
                type="text"
                placeholder="Search setups, brands..."
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
                {filteredSetups.length} setups available
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
                  <option>Under AED 300</option>
                  <option>AED 300 - AED 600</option>
                  <option>Above AED 600</option>
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
          {filteredSetups.length > 0 ? (
            <div className="category-grid">
              {filteredSetups.map((setup) => (
                <Link
                  href={`/products/${setup.id}`}
                  className="category-card"
                  key={setup.id}
                >
                  {/* IMAGE */}
                  <div className="category-card-image">
                    <Image
                      src={setup.image}
                      alt={setup.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      unoptimized
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
                      {setup.brand}
                    </div>
                    <h3 className="category-card-title">{setup.name}</h3>
                    <div className="category-rating">
                      <div className="category-stars">
                        <Star size={14} fill="currentColor" />
                      </div>
                      <span className="category-rating-value">{setup.rating}</span>
                      <span className="category-rating-count">
                        ({setup.reviews})
                      </span>
                    </div>
                    <div className="category-location">
                      <MapPin size={13} />
                      {setup.location}
                    </div>
                    <div className="category-price">
                      AED {setup.price}
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
              <h3>No setups found</h3>
              <p>Try searching for another setup or category.</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
