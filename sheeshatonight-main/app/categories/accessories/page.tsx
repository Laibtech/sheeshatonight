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

const accessories = [
  {
    id: 1,
    name: "Kaloud Lotus Heat Manager",
    brand: "Kaloud",
    category: "Heat Management",
    price: 180,
    rating: 4.9,
    reviews: 234,
    location: "Dubai",
    image: "/accessories/kaloud-lotus.webp",
  },
  {
    id: 2,
    name: "Premium Silicone Hose",
    brand: "Al Fakher",
    category: "Hoses",
    price: 45,
    rating: 4.7,
    reviews: 156,
    location: "Dubai",
    image: "/accessories/silicone-hose.webp",
  },
  {
    id: 3,
    name: "Coconut Charcoal 1kg",
    brand: "CocoNara",
    category: "Charcoal",
    price: 35,
    rating: 4.8,
    reviews: 289,
    location: "Abu Dhabi",
    image: "/accessories/coconut-charcoal.webp",
  },
  {
    id: 4,
    name: "Glass Sheesha Bowl",
    brand: "Khalil Mamoon",
    category: "Bowls",
    price: 65,
    rating: 4.6,
    reviews: 98,
    location: "Sharjah",
    image: "/accessories/glass-bowl.webp",
  },
  {
    id: 5,
    name: "LED Hookah Lights",
    brand: "Starbuzz",
    category: "LED/Lighting",
    price: 120,
    rating: 4.8,
    reviews: 87,
    location: "Dubai",
    image: "/accessories/led-lights.webp",
  },
  {
    id: 6,
    name: "Mouth Tips Pack (50pcs)",
    brand: "Generic",
    category: "Tips",
    price: 15,
    rating: 4.5,
    reviews: 412,
    location: "Dubai",
    image: "/accessories/mouth-tips.webp",
  },
  {
    id: 7,
    name: "Premium Wind Cover",
    brand: "Amy Deluxe",
    category: "Wind Covers",
    price: 55,
    rating: 4.7,
    reviews: 76,
    location: "Ajman",
    image: "/accessories/wind-cover.webp",
  },
  {
    id: 8,
    name: "Charcoal Tongs",
    brand: "Khalil Mamoon",
    category: "Tools",
    price: 25,
    rating: 4.6,
    reviews: 134,
    location: "Abu Dhabi",
    image: "/accessories/charcoal-tongs.webp",
  },
];

const categories = [
  "All Accessories",
  "Heat Management",
  "Hoses",
  "Bowls",
  "Charcoal",
  "LED/Lighting",
  "Tools",
];

export default function AccessoriesPage() {
  const [activeCategory, setActiveCategory] = useState("All Accessories");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Recommended");
  const [showFilters, setShowFilters] = useState(false);

  const filteredAccessories = accessories
    .filter((accessory) => {
      const matchesCategory =
        activeCategory === "All Accessories" ||
        accessory.category === activeCategory;
      const matchesSearch =
        accessory.name.toLowerCase().includes(search.toLowerCase()) ||
        accessory.brand.toLowerCase().includes(search.toLowerCase());
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
        <section className="category-hero hero-accessories">
          <div className="category-hero-content">
            <Link href="/" className="category-back-link">
              ← Back to Home
            </Link>
            <span className="category-eyebrow">
              ENHANCE YOUR EXPERIENCE
            </span>
            <h1>
              Premium Sheesha <em>Accessories</em>
            </h1>
            <p>
              Upgrade your setup with our curated collection of premium accessories and essentials.
            </p>
            {/* SEARCH */}
            <div className="category-search-box">
              <Search size={19} />
              <input
                type="text"
                placeholder="Search accessories, brands..."
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
                {filteredAccessories.length} accessories available
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
                  <option>Under AED 50</option>
                  <option>AED 50 - AED 150</option>
                  <option>Above AED 150</option>
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
          {filteredAccessories.length > 0 ? (
            <div className="category-grid">
              {filteredAccessories.map((accessory) => (
                <Link
                  href={`/products/${accessory.id}`}
                  className="category-card"
                  key={accessory.id}
                >
                  {/* IMAGE */}
                  <div className="category-card-image">
                    <Image
                      src={accessory.image}
                      alt={accessory.name}
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
                      {accessory.brand}
                    </div>
                    <h3 className="category-card-title">{accessory.name}</h3>
                    <div className="category-rating">
                      <div className="category-stars">
                        <Star size={14} fill="currentColor" />
                      </div>
                      <span className="category-rating-value">{accessory.rating}</span>
                      <span className="category-rating-count">
                        ({accessory.reviews})
                      </span>
                    </div>
                    <div className="category-location">
                      <MapPin size={13} />
                      {accessory.location}
                    </div>
                    <div className="category-price">
                      AED {accessory.price}
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
              <h3>No accessories found</h3>
              <p>Try searching for another accessory or category.</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
