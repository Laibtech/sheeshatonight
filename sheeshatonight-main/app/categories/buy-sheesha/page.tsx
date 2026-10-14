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
import '../shared-category.css';

interface ProductItem {
  id: string | number;
  name: string;
  brand: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  location: string;
  image: string;
}

const categories = [
  "All Hookahs",
  "Traditional",
  "Modern",
  "Premium",
  "Portable",
  "Glass",
];

export default function BuySheeshaPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("All Hookahs");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Recommended");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setProducts(
            res.data.map((p: any) => ({
              id: p.id,
              name: p.title || p.name,
              brand: p.brand || p.vendor || 'SheeshaTonight',
              category: p.category || 'Modern',
              price: Number(p.price) || 0,
              rating: p.rating || 4.8,
              reviews: p.reviews || 0,
              location: p.location || 'Dubai',
              image: p.image || '/buy/khalil-mamoon.webp',
            }))
          );
        }
      })
      .catch((err) => console.error('Failed to fetch buy-sheesha products:', err));
  }, []);

  const filteredProducts = products
    .filter((product) => {
      const matchesCategory =
        activeCategory === "All Hookahs" ||
        product.category === activeCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.brand.toLowerCase().includes(search.toLowerCase());
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
        <section className="category-hero hero-buy-sheesha">
          <div className="category-hero-content">
            <Link href="/" className="category-back-link">
              ← Back to Home
            </Link>
            <span className="category-eyebrow">
              PREMIUM HOOKAH SHOP
            </span>
            <h1>
              Buy Premium <em>Sheesha</em>
            </h1>
            <p>
              Own the best. Browse our collection of authentic premium hookahs from top brands worldwide.
            </p>
            {/* SEARCH */}
            <div className="category-search-box">
              <Search size={19} />
              <input
                type="text"
                placeholder="Search hookahs, brands..."
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
                {filteredProducts.length} hookahs available
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
                  <option>Under AED 500</option>
                  <option>AED 500 - AED 1000</option>
                  <option>Above AED 1000</option>
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
          {filteredProducts.length > 0 ? (
            <div className="category-grid">
              {filteredProducts.map((product) => (
                <Link
                  href={`/products/${product.id}`}
                  className="category-card"
                  key={product.id}
                >
                  {/* IMAGE */}
                  <div className="category-card-image">
                    <Image
                      src={product.image}
                      alt={product.name}
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
                      {product.brand}
                    </div>
                    <h3 className="category-card-title">{product.name}</h3>
                    <div className="category-rating">
                      <div className="category-stars">
                        <Star size={14} fill="currentColor" />
                      </div>
                      <span className="category-rating-value">{product.rating}</span>
                      <span className="category-rating-count">
                        ({product.reviews})
                      </span>
                    </div>
                    <div className="category-location">
                      <MapPin size={13} />
                      {product.location}
                    </div>
                    <div className="category-price">
                      AED {product.price}
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
              <h3>No hookahs found</h3>
              <p>Try searching for another hookah or category.</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
