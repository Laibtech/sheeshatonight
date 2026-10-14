'use client';

import React, { useMemo, useState, useEffect } from "react";
import './browse.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  MapPin, 
  Search, 
  Star,
  Heart,
  ChevronDown,
  Filter,
  Map as MapIcon,
  Loader2,
  Store,
  CheckCircle2
} from 'lucide-react';

const emirates = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
];

const categories = [
  "All",
  "Sheesha Lounges",
  "Flavors",
  "Rentals",
  "Buy Sheesha",
  "Accessories",
];

interface VendorRecord {
  id: string;
  name: string;
  emirate?: string;
  location: string;
  rating: number;
  reviews: number;
  distance: string | number;
  price?: number;
  image?: string;
  tags: string[];
  available: boolean;
  verified: boolean;
}

function BrowseHero({
  selectedEmirate,
  setSelectedEmirate,
  search,
  setSearch,
}: any) {
  return (
    <section className="browse-hero">
      <div className="browse-hero-content">
        <span className="hero-eyebrow">EXPLORE SHEESHATONIGHT</span>
        <h1>
          Find Your Perfect
          <span> Sheesha Experience</span>
        </h1>
        <p>
          Discover trusted sheesha lounges, vendors, flavors, rentals and
          accessories across the UAE.
        </p>
      </div>

      {/* SEARCH BOX */}
      <div className="main-search">
        <div className="search-location">
          <MapPin className="w-5 h-5" />
          <div className="search-location-content">
            <label>EMIRATE</label>
            <select
              value={selectedEmirate}
              onChange={(e) => setSelectedEmirate(e.target.value)}
            >
              <option value="">All Emirates</option>
              {emirates.map((emirate) => (
                <option key={emirate} value={emirate}>
                  {emirate}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="search-divider" />

        <div className="search-field">
          <Search className="w-5 h-5" />
          <input
            type="text"
            placeholder="Search vendors, flavors, products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="search-button">Search</button>
      </div>

      {/* QUICK CATEGORIES */}
      <div className="quick-search">
        <span>Popular:</span>
        <button onClick={() => setSearch("Lounge")}>Sheesha Lounges</button>
        <button onClick={() => setSearch("Flavors")}>Flavors</button>
        <button onClick={() => setSearch("Rentals")}>Rentals</button>
        <button onClick={() => setSearch("Pipe")}>Buy Sheesha</button>
      </div>
    </section>
  );
}

function CategoryNavigation({ activeCategory, setActiveCategory }: any) {
  return (
    <div className="category-navigation">
      {categories.map((category) => (
        <button
          key={category}
          className={activeCategory === category ? "category-active" : ""}
          onClick={() => setActiveCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

function FilterBar({
  ratingFilter,
  setRatingFilter,
  priceFilter,
  setPriceFilter,
  distanceFilter,
  setDistanceFilter,
}: any) {
  return (
    <div className="filter-bar">
      <div className="filter-left">
        <div className="filter-dropdown">
          <MapPin className="w-4 h-4" />
          <select>
            <option>Location</option>
            <option>Near me</option>
            <option>City center</option>
          </select>
        </div>

        <div className="filter-dropdown">
          <Star className="w-4 h-4 fill-current text-amber-500" />
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
          >
            <option value="">Rating</option>
            <option value="4">4+ Stars</option>
            <option value="4.5">4.5+ Stars</option>
            <option value="4.8">4.8+ Stars</option>
          </select>
        </div>

        <div className="filter-dropdown">
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
          >
            <option value="">Price</option>
            <option value="50">Under AED 50</option>
            <option value="100">Under AED 100</option>
            <option value="150">Under AED 150</option>
          </select>
        </div>
      </div>

      <button className="more-filter-button">
        <Filter className="w-4 h-4 inline" /> More Filters
      </button>
    </div>
  );
}

function VendorCard({ vendor }: { vendor: VendorRecord }) {
  const [saved, setSaved] = useState(false);

  return (
    <article className="vendor-card">
      <div className="vendor-image">
        <img
          src={vendor.image || "/placeholder-vendor.webp"}
          alt={vendor.name}
          onError={(e) => {
            e.currentTarget.src = "/placeholder-vendor.webp";
          }}
        />

        <div className="vendor-rating">
          <Star className="w-3 h-3 inline fill-current" />
          {vendor.rating || 4.8}
        </div>

        <button
          className={`favorite-button ${saved ? "saved" : ""}`}
          onClick={() => setSaved(!saved)}
        >
          <Heart className={`w-5 h-5 ${saved ? "fill-current" : ""}`} />
        </button>

        <div className="distance-badge">{vendor.distance || '1.5'} km</div>
      </div>

      <div className="vendor-content">
        <div className="vendor-title-row">
          <div>
            <h3>
              {vendor.name}
              {vendor.verified && (
                <span className="verified inline-flex items-center ml-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </span>
              )}
            </h3>
            <p className="vendor-location">
              <MapPin className="w-3 h-3 inline" /> {vendor.location || 'Dubai'}
            </p>
          </div>
          <div className="vendor-price">
            <small>From</small>
            <strong>AED {vendor.price || 80}</strong>
          </div>
        </div>

        <div className="vendor-review">
          <span>
            <Star className="w-3 h-3 inline fill-current" /> {vendor.rating || 4.8}
          </span>
          <span>({vendor.reviews || 0} reviews)</span>
        </div>

        <div className="vendor-tags">
          {(vendor.tags || ['Lounge', 'Sheesha']).map((tag: string) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>

        <div className="vendor-footer">
          {vendor.available !== false ? (
            <span className="available">
              <span className="status-dot"></span> Available today
            </span>
          ) : (
            <span className="not-available">
              <span className="status-dot"></span> Currently unavailable
            </span>
          )}
          <a href={`/stores/${vendor.id}`}>View Store →</a>
        </div>
      </div>
    </article>
  );
}

function MapSection({ selectedEmirate }: any) {
  return (
    <aside className="map-section">
      <div className="map-header">
        <div>
          <span>DISCOVER</span>
          <h3>{selectedEmirate || "UAE"} Vendors</h3>
        </div>
        <button>
          <MapIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="map-area">
        <div className="map-road road-1" />
        <div className="map-road road-2" />
        <div className="map-road road-3" />
        <div className="map-road road-4" />
        <div className="map-water" />

        <span className="map-label dubai">Dubai</span>
        <span className="map-label jbr">JBR</span>
        <span className="map-label downtown">Downtown</span>

        <div className="map-marker marker-1">
          <span>
            <Star className="w-3 h-3 inline fill-current" /> 4.8
          </span>
        </div>
        <div className="map-marker marker-2">
          <span>
            <Star className="w-3 h-3 inline fill-current" /> 4.9
          </span>
        </div>

        <button className="current-location">
          <MapPin className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}

export default function Browse() {
  const [vendorsList, setVendorsList] = useState<VendorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmirate, setSelectedEmirate] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [distanceFilter, setDistanceFilter] = useState("");

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vendors?limit=50');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setVendorsList(json.data);
      } else {
        setVendorsList([]);
      }
    } catch (err) {
      console.error('Error fetching vendors from API:', err);
      setVendorsList([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = useMemo(() => {
    return vendorsList.filter((vendor) => {
      if (selectedEmirate && vendor.emirate && vendor.emirate !== selectedEmirate) {
        return false;
      }
      if (search) {
        const query = search.toLowerCase();
        const matchesSearch =
          vendor.name.toLowerCase().includes(query) ||
          vendor.location.toLowerCase().includes(query) ||
          (vendor.tags && vendor.tags.some((tag) => tag.toLowerCase().includes(query)));
        if (!matchesSearch) {
          return false;
        }
      }
      if (ratingFilter && vendor.rating < Number(ratingFilter)) {
        return false;
      }
      return true;
    });
  }, [
    vendorsList,
    selectedEmirate,
    search,
    activeCategory,
    ratingFilter,
    priceFilter,
    distanceFilter,
  ]);

  return (
    <>
      <Header />
      <div className="browse-page">
        <BrowseHero
          selectedEmirate={selectedEmirate}
          setSelectedEmirate={setSelectedEmirate}
          search={search}
          setSearch={setSearch}
        />

        <CategoryNavigation
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />

        <main className="browse-main">
          <div className="results-heading">
            <div>
              <span>
                {selectedEmirate ? selectedEmirate.toUpperCase() : "UAE"}
              </span>
              <h2>
                {selectedEmirate
                  ? `Sheesha Spots in ${selectedEmirate}`
                  : "Explore Sheesha Across the UAE"}
              </h2>
              <p>
                {loading ? 'Loading real database...' : `${filteredVendors.length} places found in database`}
              </p>
            </div>
            <button className="map-toggle">
              <MapIcon className="w-4 h-4 inline" /> Show Map
            </button>
          </div>

          <FilterBar
            ratingFilter={ratingFilter}
            setRatingFilter={setRatingFilter}
            priceFilter={priceFilter}
            setPriceFilter={setPriceFilter}
            distanceFilter={distanceFilter}
            setDistanceFilter={setDistanceFilter}
          />

          <div className="browse-grid">
            <section className="vendor-results">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#8a277d]" />
                  <p className="text-sm font-medium">Fetching real database vendors...</p>
                </div>
              ) : filteredVendors.length > 0 ? (
                filteredVendors.map((vendor) => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))
              ) : (
                <div className="no-results">
                  <div>
                    <Store className="w-6 h-6 text-slate-400" />
                  </div>
                  <h3>No vendors in database</h3>
                  <p>There are currently no active vendors in database matching your selection.</p>
                  <button
                    onClick={() => {
                      setSelectedEmirate("");
                      setSearch("");
                      setActiveCategory("All");
                      setRatingFilter("");
                      setPriceFilter("");
                      setDistanceFilter("");
                    }}
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </section>

            <MapSection selectedEmirate={selectedEmirate} />
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
