"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Search,
  Check,
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  Heart,
  X,
  Calendar,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  MessageCircle,
  Truck,
  CheckCircle2,
} from "lucide-react";

export type Rental = {
  id: string;
  name: string;
  vendor: string;
  location: string;
  eventType: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  verified?: boolean;
  duration?: string;
  guests?: string;
  description?: string;
  features?: string[];
};

export const defaultRentals: Rental[] = [
  {
    id: "silver-villa",
    name: "Silver VIP Villa Sheesha Setup",
    vendor: "Cloud Lounge Dubai",
    location: "Dubai - Palm Jumeirah",
    eventType: "Villa",
    price: 750,
    rating: 4.9,
    reviews: 88,
    image: "/silver.webp",
    verified: true,
    duration: "4 Hours",
    guests: "1–5",
    description:
      "Perfect for villa gatherings & private pool chillouts. Includes 4 luxury shishas, 1 dedicated shisha master, 4 tobacco flavors, unlimited coconut coals, and free delivery.",
    features: [
      "4 Premium Sheesha units",
      "1 Professional Shisha Master",
      "4 Premium Tobacco Flavors",
      "Unlimited Coconut Coals & Head Changes",
      "Portable Safety Gas Burner",
      "Free UAE White-Glove Delivery",
    ],
  },
  {
    id: "gold-yacht",
    name: "Gold Luxury Yacht Edition",
    vendor: "Marina Sky Lounge",
    location: "Dubai - Dubai Marina",
    eventType: "Yacht",
    price: 1299,
    rating: 5.0,
    reviews: 142,
    image: "/gold.webp",
    verified: true,
    duration: "4 Hours",
    guests: "6–10",
    description:
      "Wind-resistant luxury setups custom-engineered for yachts. Experienced on-board shisha sommelier, 6 hookah pipes, fresh fruit heads, and unlimited refills.",
    features: [
      "6x Wind-Resistant Hookahs",
      "1x Certified Maritime Shisha Master",
      "6x Premium Tobacco Flavors",
      "Carved Pineapple / Fruit Heads Included",
      "Unlimited Charcoal & Bowl Swaps",
      "Marina Pier & Boarding Delivery",
    ],
  },
  {
    id: "platinum-corporate",
    name: "Platinum Royal Corporate Setup",
    vendor: "Emirates Sheesha Masters",
    location: "Dubai - Downtown & DIFC",
    eventType: "Corporate",
    price: 1999,
    rating: 4.95,
    reviews: 67,
    image: "/platinum.webp",
    verified: true,
    duration: "6 Hours",
    guests: "11–20",
    description:
      "Executive lounge setup tailored for high-profile business meetings, product launches, and gala dinners. 9 crystal designer hookahs, 2 uniformed masters, and bespoke flavor cards.",
    features: [
      "9x Crystal Luxury Hookahs",
      "2x Uniformed Shisha Masters",
      "9x Premium Global Blends",
      "Custom Branded Menu Cards",
      "Silent Whisper-Purge Technology",
      "Full 6 Hours Continuous Support",
    ],
  },
  {
    id: "imperial-wedding",
    name: "Imperial Royal Wedding Sheesha Bar",
    vendor: "Al Diwan Royal Services",
    location: "Abu Dhabi - Saadiyat Island",
    eventType: "Wedding",
    price: 2800,
    rating: 5.0,
    reviews: 95,
    image: "/SHEESHA-SET.webp",
    verified: true,
    duration: "8 Hours",
    guests: "20+",
    description:
      "Spectacular full-scale wedding sheesha bar station. 12+ illuminated gold-accented glass hookahs, team of 3 masters, luxury hoses, and white-glove guest service throughout the night.",
    features: [
      "12+ Illuminated Glass Hookahs",
      "3x Master Shisha Sommeliers",
      "Unlimited Curated Flavors",
      "Custom Gold-Trimmed Hoses",
      "Fresh Fruit Head Carvings",
      "Full 8 Hours of Evening Service",
    ],
  },
  {
    id: "sunset-villa",
    name: "Sunset Villa Private Celebration",
    vendor: "Arabian Mist Lounge",
    location: "Sharjah - Al Majaz",
    eventType: "Villa",
    price: 950,
    rating: 4.85,
    reviews: 54,
    image: "/made for dubai.webp",
    verified: true,
    duration: "4 Hours",
    guests: "6–10",
    description:
      "Contemporary outdoor lounge setup. 5 stainless steel hookahs with diffuser technology, exotic herbal & traditional blends, and professional setup & teardown.",
    features: [
      "5x Precision Steel Hookahs",
      "1x Professional Shisha Master",
      "5x Signature Tobacco Flavors",
      "Quick 30-min Setup & Teardown",
      "Free Delivery across Sharjah & Dubai",
      "Hygienic Disposable Mouthpieces",
    ],
  },
  {
    id: "birthday-neon",
    name: "VIP Birthday Bash Hookah Station",
    vendor: "Neon Clouds UAE",
    location: "Dubai - JBR",
    eventType: "Birthday",
    price: 1150,
    rating: 4.9,
    reviews: 76,
    image: "/Premium Sheesha.webp",
    verified: true,
    duration: "4 Hours",
    guests: "11–20",
    description:
      "LED lighted neon sheeshas, glowing ice hoses, custom birthday-themed flavor blends, fruit head carvings, and personal shisha master for 4 full hours.",
    features: [
      "6x LED Glow Shisha Units",
      "Chilled Ice Tip Hoses",
      "Birthday Themed Flavor Blends",
      "Carved Fresh Fruit Bowls",
      "1x Dedicated Shisha Master",
      "Party Photos Friendly Setup",
    ],
  },
  {
    id: "desert-safari",
    name: "Desert Safari Starlight Setup",
    vendor: "Nomad Shisha Masters",
    location: "Ras Al Khaimah - Al Wadi",
    eventType: "Private Event",
    price: 1450,
    rating: 4.95,
    reviews: 43,
    image: "/slider-2.webp",
    verified: true,
    duration: "6 Hours",
    guests: "6–10",
    description:
      "Off-grid specialized hookah service designed for private desert camps and stargazing retreats. Portable windproof burners and fire-safe certified masters.",
    features: [
      "6x Heavy Base Windproof Hookahs",
      "Desert-Grade Wind Shielding",
      "Portable Off-Grid Burners",
      "6 Hours Continuous Fire Control",
      "Fire-Safety Certified Masters",
      "Zero-Trace Leave No Footprint Cleanup",
    ],
  },
  {
    id: "ajman-coastal",
    name: "Ajman Seaside Gathering Setup",
    vendor: "Coastal Smoke Co.",
    location: "Ajman - Corniche",
    eventType: "Private Event",
    price: 850,
    rating: 4.8,
    reviews: 39,
    image: "/hos-hookah.webp",
    verified: true,
    duration: "4 Hours",
    guests: "1–5",
    description:
      "Cozy seaside sheesha experience. 3 German artisan hookahs, chilled silicone hoses, 6 fresh head preparations, and on-time doorstep delivery in Ajman.",
    features: [
      "3x Artisan German Hookahs",
      "Ice Chill Hose Attachments",
      "Choice of 4 Premium Flavors",
      "Unlimited Charcoal Top-ups",
      "Fast 45-Min Ajman Delivery",
      "1x Shisha Sommelier",
    ],
  },
  {
    id: "executive-gathering",
    name: "Executive Penthouse Gathering",
    vendor: "Apex VIP Lounges",
    location: "Abu Dhabi - Corniche",
    eventType: "Corporate",
    price: 1650,
    rating: 4.92,
    reviews: 58,
    image: "/lounge-1.webp",
    verified: true,
    duration: "4 Hours",
    guests: "6–10",
    description:
      "Sleek matte-black & brass hookahs for high-end residential penthouses and private executive suites. Odorless charcoal handling and silent purge systems.",
    features: [
      "6x Matte Black Stealth Hookahs",
      "Whisper Silent Purge Valves",
      "Odorless Organic Coals",
      "Premium European Tobacco",
      "1x Uniformed Private Master",
      "Abu Dhabi Island Delivery Included",
    ],
  },
];

type Props = {
  rentals?: Rental[];
};

function RentalsContent({ rentals = defaultRentals }: Props) {
  const searchParams = useSearchParams();
  const eventParam = searchParams.get("event");

  const [liveRentals, setLiveRentals] = useState<Rental[]>([]);
  const [location, setLocation] = useState("All UAE");
  const [eventType, setEventType] = useState("All Events");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("Any Duration");
  const [guests, setGuests] = useState("Any Guests");
  const [maxPrice, setMaxPrice] = useState("Any Price");
  const [sort, setSort] = useState("Recommended");
  const [mobileFilters, setMobileFilters] = useState(false);

  // Fetch live rental setups from MySQL database
  useEffect(() => {
    async function fetchLiveRentalPackages() {
      try {
        const res = await fetch('/api/products');
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const rentalProds = json.data.filter(
            (p: any) => p.type === 'RENTAL_PACKAGE' || p.type === 'SHEESHA_PIPE' || Number(p.price) >= 100
          );
          if (rentalProds.length > 0) {
            const mapped: Rental[] = rentalProds.map((p: any) => {
              const lower = p.title.toLowerCase();
              const eventGuess = lower.includes('wedding')
                ? 'Wedding'
                : lower.includes('yacht')
                ? 'Yacht'
                : lower.includes('villa')
                ? 'Villa'
                : lower.includes('birthday')
                ? 'Birthday'
                : lower.includes('corporate')
                ? 'Corporate'
                : 'Private';

              const img = p.image || '/SHEESHA-SET.webp';
              return {
                id: String(p.id),
                name: p.title,
                vendor: p.vendor || 'Verified Lounge Partner',
                location: p.location || p.vendorLocation || 'Dubai - Downtown',
                eventType: eventGuess,
                price: Number(p.price) || 299,
                rating: 4.9,
                reviews: 42,
                image: img,
                verified: true,
                duration: '4 Hours',
                guests: '2–8 Guests',
                description: p.description || 'Full luxury setup with artisan coals and dedicated master.',
                features: [
                  '1x Luxury Precision Hookah',
                  'Professional Sheesha Master Service',
                  'Unlimited Coconut Charcoal',
                  'Artisan Tobacco & Fruit Heads',
                  'Free Delivery & Pickup across Dubai',
                ],
              };
            });
            setLiveRentals(mapped);
          }
        }
      } catch {
        // Fallback gracefully without console error
      }
    }
    fetchLiveRentalPackages();
  }, []);

  const activeRentals = liveRentals.length > 0 ? liveRentals : rentals;

  // Selected rental for quick booking modal
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([
    "Double Apple",
    "Mint",
  ]);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });

  // Wishlist state
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Sync event query param on mount
  useEffect(() => {
    if (!eventParam) return;
    const lower = eventParam.toLowerCase();
    if (lower.includes("villa")) setEventType("Villa");
    else if (lower.includes("yacht")) setEventType("Yacht");
    else if (lower.includes("corp")) setEventType("Corporate");
    else if (lower.includes("wed")) setEventType("Wedding");
    else if (lower.includes("birth")) setEventType("Birthday");
    else if (lower.includes("priv")) setEventType("Private Event");
  }, [eventParam]);

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSearchClick = () => {
    const el = document.getElementById("rentals-results");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const filteredRentals = useMemo(() => {
    let result = [...rentals];

    if (location !== "All UAE") {
      result = result.filter((item) =>
        item.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (eventType !== "All Events") {
      result = result.filter((item) => item.eventType === eventType);
    }

    if (duration !== "Any Duration") {
      result = result.filter((item) => item.duration === duration);
    }

    if (guests !== "Any Guests") {
      result = result.filter((item) => {
        if (!item.guests) return true;
        return item.guests === guests;
      });
    }

    if (maxPrice !== "Any Price") {
      const price = Number(maxPrice);
      result = result.filter((item) => item.price <= price);
    }

    if (sort === "Price: Low to High") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sort === "Price: High to Low") {
      result.sort((a, b) => b.price - a.price);
    }

    if (sort === "Top Rated") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [rentals, location, eventType, duration, guests, maxPrice, sort]);

  const handleWhatsAppBooking = (rental: Rental) => {
    const text = `*New Sheesha Rental Inquiry*%0A%0A*Package:* ${rental.name}%0A*Vendor:* ${rental.vendor}%0A*Price:* AED ${rental.price}%0A*Location:* ${location}%0A*Event Type:* ${rental.eventType}%0A*Date:* ${date || "Flexible"}%0A*Time:* ${time || "Evening"}%0A*Duration:* ${rental.duration || duration}%0A*Guests:* ${guests}%0A*Flavors:* ${selectedFlavors.join(", ")}%0A*Customer Name:* ${bookingForm.name || "Customer"}%0A*Phone:* ${bookingForm.phone || "Not specified"}%0A*Address:* ${bookingForm.address || location}`;
    window.open(`https://wa.me/971509121111?text=${text}`, "_blank");
  };

  return (
    <>
      <Header />

      <main className="rentals-page">
        {/* HERO */}
        <section className="rentals-hero">
          <div className="hero-overlay" />

          <div className="hero-content">
            <span className="eyebrow">PREMIUM UAE SHEESHA RENTALS</span>

            <h1>
              Premium Sheesha Rentals
              <span> Across the UAE</span>
            </h1>

            <p>
              Curated sheesha setups for villas, yachts, weddings, corporate
              events and private gatherings.
            </p>

            <div className="hero-trust">
              <span className="trust-badge" style={{ color: '#ffffff' }}>
                <CheckCircle2 size={16} color="#F1A51D" className="flex-shrink-0" />
                <span style={{ color: '#ffffff', fontWeight: 600 }}>Verified Vendors</span>
              </span>
              <span className="trust-badge" style={{ color: '#ffffff' }}>
                <Sparkles size={16} color="#F1A51D" className="flex-shrink-0" />
                <span style={{ color: '#ffffff', fontWeight: 600 }}>Premium Quality</span>
              </span>
              <span className="trust-badge" style={{ color: '#ffffff' }}>
                <Truck size={16} color="#F1A51D" className="flex-shrink-0" />
                <span style={{ color: '#ffffff', fontWeight: 600 }}>UAE-Wide Service</span>
              </span>
            </div>
          </div>
        </section>

        {/* SEARCH BOX */}
        <section className="search-wrapper">
          <div className="search-card">
            <div className="search-heading">
              <div>
                <span>FIND YOUR EXPERIENCE</span>
                <h2>Plan your perfect sheesha setup</h2>
              </div>

              <button
                className="mobile-filter-btn"
                onClick={() => setMobileFilters(true)}
              >
                Filters
              </button>
            </div>

            <div className="filter-grid">
              <Filter
                label="Location"
                value={location}
                onChange={setLocation}
                options={[
                  "All UAE",
                  "Dubai",
                  "Abu Dhabi",
                  "Sharjah",
                  "Ajman",
                  "Ras Al Khaimah",
                ]}
              />

              <Filter
                label="Event Type"
                value={eventType}
                onChange={setEventType}
                options={[
                  "All Events",
                  "Villa",
                  "Yacht",
                  "Corporate",
                  "Wedding",
                  "Birthday",
                  "Private Event",
                ]}
              />

              <Filter
                label="Date"
                value={date}
                onChange={setDate}
                options={[]}
                date
              />

              <Filter
                label="Time"
                value={time}
                onChange={setTime}
                options={[]}
                time
              />

              <Filter
                label="Duration"
                value={duration}
                onChange={setDuration}
                options={[
                  "Any Duration",
                  "2 Hours",
                  "4 Hours",
                  "6 Hours",
                  "8 Hours",
                ]}
              />

              <Filter
                label="Guests"
                value={guests}
                onChange={setGuests}
                options={["Any Guests", "1–5", "6–10", "11–20", "20+"]}
              />

              <Filter
                label="Price"
                value={maxPrice}
                onChange={setMaxPrice}
                options={[
                  "Any Price",
                  "500",
                  "1000",
                  "1500",
                  "2500",
                  "5000",
                ]}
              />

              <button className="search-btn" onClick={handleSearchClick}>
                <SearchIcon />
                Search Rentals
              </button>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="rentals-content" id="rentals-results">
          <div className="content-top">
            <div>
              <span className="section-label">CURATED FOR YOU</span>

              <h2>Explore Premium Rentals</h2>

              <p>
                Discover trusted vendors and professionally prepared sheesha
                experiences across the UAE.
              </p>
            </div>

            <div className="sort-box">
              <label>Sort by</label>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option>Recommended</option>
                <option>Top Rated</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* RESULTS */}
          {filteredRentals.length > 0 ? (
            <div className="rental-grid">
              {filteredRentals.map((rental) => (
                <RentalCard
                  key={rental.id}
                  rental={rental}
                  isWishlisted={wishlist.includes(rental.id)}
                  onToggleWishlist={(e) => toggleWishlist(rental.id, e)}
                  onSelectRental={() => setSelectedRental(rental)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              onReset={() => {
                setLocation("All UAE");
                setEventType("All Events");
                setMaxPrice("Any Price");
                setDuration("Any Duration");
                setGuests("Any Guests");
              }}
            />
          )}

          {/* CROSS-PROMO TO SHOP */}
          <div className="shop-cross-promo">
            <div className="promo-text">
              <span className="promo-badge">
                <Sparkles size={14} className="inline mr-1" />
                SHEESHATONIGHT MARKETPLACE
              </span>
              <h3>Looking to Buy Sheeshas, Flavors or Accessories?</h3>
              <p>
                Browse our premium online shop for luxury pipes, world-class
                tobacco brands, coconut coals, and next-day delivery in the UAE.
              </p>
            </div>
            <Link href="/shop" className="promo-cta">
              <span>Explore Shop</span>
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        {/* QUICK BOOKING MODAL */}
        {selectedRental && (
          <div
            className="filter-backdrop"
            onClick={() => setSelectedRental(null)}
          >
            <div
              className="booking-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <span className="modal-subtitle">RESERVATION INQUIRY</span>
                  <h3>{selectedRental.name}</h3>
                </div>
                <button
                  className="close-modal-btn"
                  onClick={() => setSelectedRental(null)}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {bookingSuccess ? (
                <div className="booking-success-box">
                  <div className="success-icon">
                    <Check size={28} className="text-emerald-600" />
                  </div>
                  <h4>Inquiry Sent Successfully!</h4>
                  <p>
                    Our VIP concierge team will reach out to you within 15
                    minutes to confirm master allocation and timing.
                  </p>
                  <button
                    className="apply-filter"
                    onClick={() => {
                      setBookingSuccess(false);
                      setSelectedRental(null);
                    }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="modal-body-scroll">
                  <div className="modal-rental-summary">
                    <img
                      src={selectedRental.image}
                      alt={selectedRental.name}
                      className="modal-thumb"
                    />
                    <div className="modal-rental-info">
                      <span className="modal-vendor">
                        By {selectedRental.vendor}
                      </span>
                      <div className="modal-price">
                        <strong>AED {selectedRental.price}</strong>
                        <span> / {selectedRental.duration || "4 Hours"}</span>
                      </div>
                      <div className="modal-meta-tags">
                        <span>
                          <MapPin size={12} className="inline mr-1" />
                          {selectedRental.location}
                        </span>
                        <span>
                          <Clock size={12} className="inline mr-1" />
                          {selectedRental.duration}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedRental.features && (
                    <div className="modal-inclusions">
                      <h5>What&apos;s Included:</h5>
                      <ul>
                        {selectedRental.features.map((feat, i) => (
                          <li key={i}>
                            <Check
                              size={14}
                              className="text-[#74189b] inline mr-1.5 shrink-0"
                            />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="booking-form-grid">
                    <div className="form-group">
                      <label>Your Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Ahmed Al Mansoori"
                        value={bookingForm.name}
                        onChange={(e) =>
                          setBookingForm({
                            ...bookingForm,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>WhatsApp / Phone Number</label>
                      <input
                        type="tel"
                        placeholder="+971 50 123 4567"
                        value={bookingForm.phone}
                        onChange={(e) =>
                          setBookingForm({
                            ...bookingForm,
                            name: bookingForm.name,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Delivery Address / Yacht Berth / Villa</label>
                      <input
                        type="text"
                        placeholder="e.g. Villa 24, Frond M, Palm Jumeirah"
                        value={bookingForm.address}
                        onChange={(e) =>
                          setBookingForm({
                            ...bookingForm,
                            address: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button
                      className="whatsapp-book-btn"
                      onClick={() => handleWhatsAppBooking(selectedRental)}
                    >
                      <MessageCircle size={18} />
                      Book Instantly on WhatsApp
                    </button>

                    <Link
                      href={`/rentals/${selectedRental.id}`}
                      className="view-full-btn"
                    >
                      View Full Details & Options →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MOBILE FILTER DRAWER */}
        {mobileFilters && (
          <div
            className="filter-backdrop"
            onClick={() => setMobileFilters(false)}
          >
            <aside
              className="mobile-drawer"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="drawer-header">
                <h3>Filters</h3>

                <button
                  onClick={() => setMobileFilters(false)}
                  aria-label="Close filters"
                >
                  ×
                </button>
              </div>

              <div className="drawer-fields">
                <Filter
                  label="Location"
                  value={location}
                  onChange={setLocation}
                  options={[
                    "All UAE",
                    "Dubai",
                    "Abu Dhabi",
                    "Sharjah",
                    "Ajman",
                    "Ras Al Khaimah",
                  ]}
                />

                <Filter
                  label="Event Type"
                  value={eventType}
                  onChange={setEventType}
                  options={[
                    "All Events",
                    "Villa",
                    "Yacht",
                    "Corporate",
                    "Wedding",
                    "Birthday",
                    "Private Event",
                  ]}
                />

                <Filter
                  label="Date"
                  value={date}
                  onChange={setDate}
                  options={[]}
                  date
                />

                <Filter
                  label="Time"
                  value={time}
                  onChange={setTime}
                  options={[]}
                  time
                />

                <Filter
                  label="Duration"
                  value={duration}
                  onChange={setDuration}
                  options={[
                    "Any Duration",
                    "2 Hours",
                    "4 Hours",
                    "6 Hours",
                    "8 Hours",
                  ]}
                />

                <Filter
                  label="Guests"
                  value={guests}
                  onChange={setGuests}
                  options={["Any Guests", "1–5", "6–10", "11–20", "20+"]}
                />

                <Filter
                  label="Price"
                  value={maxPrice}
                  onChange={setMaxPrice}
                  options={[
                    "Any Price",
                    "500",
                    "1000",
                    "1500",
                    "2500",
                    "5000",
                  ]}
                />

                <button
                  className="apply-filter"
                  onClick={() => {
                    setMobileFilters(false);
                    handleSearchClick();
                  }}
                >
                  Apply Filters
                </button>
              </div>
            </aside>
          </div>
        )}

        <style jsx global>{`
          .rentals-page {
            min-height: 100vh;
            background: #fcfafc;
            color: #29252b;
            font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI",
              Roboto, sans-serif;
            width: 100%;
            max-width: 100vw;
            overflow-x: hidden;
            box-sizing: border-box;
          }

          /* HERO */

          .rentals-hero {
            min-height: 510px;
            position: relative;
            display: flex;
            align-items: center;
            overflow: hidden;
            background: linear-gradient(
                90deg,
                rgba(87, 18, 117, 0.92) 0%,
                rgba(116, 24, 155, 0.72) 48%,
                rgba(116, 24, 155, 0.28) 100%
              ),
              url("/images/rental-hero.jpg") center/cover no-repeat;
          }

          .hero-overlay {
            position: absolute;
            inset: 0;
            background: radial-gradient(
              circle at 80% 40%,
              rgba(241, 165, 29, 0.22),
              transparent 45%
            );
          }

          .hero-content {
            position: relative;
            z-index: 2;
            max-width: 1440px;
            width: 100%;
            margin: auto;
            padding: 64px 32px 120px;
            color: white;
            box-sizing: border-box;
          }

          @media (max-width: 1024px) {
            .hero-content {
              padding: 50px 24px 95px;
            }
          }

          @media (max-width: 640px) {
            .hero-content {
              padding: 40px 16px 40px;
            }
          }

          .eyebrow,
          .section-label {
            display: block;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 2px;
            color: #f1a51d;
            margin-bottom: 15px;
          }

          .hero-content h1 {
            max-width: 760px;
            margin: 0;
            font-size: clamp(38px, 5vw, 68px);
            line-height: 1.05;
            letter-spacing: -2px;
            font-weight: 750;
          }

          .hero-content h1 span {
            display: block;
            color: #f6d487;
          }

          .hero-content p {
            max-width: 650px;
            margin: 25px 0 28px;
            font-size: 18px;
            line-height: 1.7;
            color: rgba(255, 255, 255, 0.9);
          }

          .hero-trust {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            font-size: 13px;
            font-weight: 600;
          }

          .hero-trust .trust-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.14);
            border: 1px solid rgba(255, 255, 255, 0.22);
            padding: 7px 16px;
            border-radius: 24px;
            backdrop-filter: blur(8px);
            color: #ffffff !important;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
          }

          .hero-trust .trust-badge span {
            color: #ffffff !important;
          }

          /* SEARCH */

          .search-wrapper {
            position: relative;
            z-index: 5;
            margin-top: -70px;
            max-width: 1440px;
            width: 100%;
            margin-left: auto;
            margin-right: auto;
            padding: 0 32px;
            box-sizing: border-box;
          }

          @media (max-width: 1024px) {
            .search-wrapper {
              padding: 0 24px;
            }
          }

          @media (max-width: 640px) {
            .search-wrapper {
              padding: 0 16px;
            }
          }

          .search-card {
            width: 100%;
            margin: auto;
            padding: 30px;
            background: white;
            border: 1px solid #eee6f0;
            border-radius: 22px;
            box-shadow: 0 18px 55px rgba(72, 30, 82, 0.12);
            box-sizing: border-box;
          }

          .search-heading {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: 25px;
          }

          .search-heading span {
            color: #74189b;
            font-size: 11px;
            letter-spacing: 1.7px;
            font-weight: 800;
          }

          .search-heading h2 {
            margin: 7px 0 0;
            font-size: 24px;
            color: #2b2330;
          }

          .filter-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 14px;
          }

          .filter {
            position: relative;
          }

          .filter label {
            display: block;
            font-size: 12px;
            color: #726975;
            margin-bottom: 7px;
            font-weight: 650;
          }

          .filter select,
          .filter input {
            width: 100%;
            height: 48px;
            padding: 0 13px;
            border: 1px solid #e5dfe7;
            border-radius: 10px;
            background: #fff;
            color: #342d37;
            outline: none;
            font-size: 13px;
            box-sizing: border-box;
            transition: border-color 0.2s, box-shadow 0.2s;
          }

          .filter select:focus,
          .filter input:focus {
            border-color: #74189b;
            box-shadow: 0 0 0 3px rgba(116, 24, 155, 0.08);
          }

          .search-btn {
            height: 48px;
            margin-top: auto;
            border: 0;
            border-radius: 10px;
            background: #74189b;
            color: white;
            font-size: 14px;
            font-weight: 750;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 9px;
            transition: 0.2s ease;
          }

          .search-btn:hover {
            background: #571275;
            transform: translateY(-1px);
          }

          /* CONTENT */

          .rentals-content {
            max-width: 1440px;
            width: 100%;
            margin: 0 auto;
            padding: 48px 32px;
            box-sizing: border-box;
          }

          @media (max-width: 1024px) {
            .rentals-content {
              padding: 40px 24px;
            }
          }

          @media (max-width: 640px) {
            .rentals-content {
              padding: 32px 16px;
            }
          }

          .content-top {
            display: flex;
            justify-content: space-between;
            align-items: end;
            gap: 30px;
            margin-bottom: 35px;
          }

          .content-top h2 {
            margin: 0;
            font-size: 38px;
            letter-spacing: -1px;
            color: #291f2c;
          }

          .content-top p {
            margin: 12px 0 0;
            max-width: 600px;
            color: #746c76;
            line-height: 1.6;
          }

          .sort-box {
            min-width: 190px;
          }

          .sort-box label {
            display: block;
            font-size: 11px;
            font-weight: 700;
            color: #756c78;
            margin-bottom: 7px;
          }

          .sort-box select {
            width: 100%;
            height: 44px;
            border: 1px solid #e5dfe7;
            border-radius: 9px;
            padding: 0 12px;
            background: white;
            color: #332c36;
            outline: none;
          }

          /* RENTAL GRID */

          .rental-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }

          .rental-card {
            background: white;
            border: 1px solid #eee7f0;
            border-radius: 18px;
            overflow: hidden;
            transition: 0.25s ease;
            display: flex;
            flex-direction: column;
          }

          .rental-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 18px 45px rgba(63, 25, 72, 0.11);
          }

          .rental-image {
            height: 255px;
            position: relative;
            overflow: hidden;
            background: #f4eef6;
          }

          .rental-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.35s ease;
          }

          .rental-card:hover .rental-image img {
            transform: scale(1.04);
          }

          .verified {
            position: absolute;
            top: 14px;
            left: 14px;
            padding: 7px 11px;
            border-radius: 20px;
            background: white;
            color: #74189b;
            font-size: 11px;
            font-weight: 750;
            box-shadow: 0 5px 18px rgba(0, 0, 0, 0.12);
            z-index: 2;
          }

          .wishlist {
            position: absolute;
            top: 12px;
            right: 12px;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            border: 0;
            background: white;
            cursor: pointer;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
            transition: transform 0.15s ease, background-color 0.15s;
            z-index: 2;
          }

          .wishlist:hover {
            transform: scale(1.1);
          }

          .wishlist.active {
            color: #e11d48;
          }

          .rental-body {
            padding: 21px;
            display: flex;
            flex-direction: column;
            flex: 1;
          }

          .vendor {
            font-size: 12px;
            color: #7c7180;
            margin-bottom: 7px;
            font-weight: 600;
          }

          .rental-title {
            margin: 0;
            font-size: 19px;
            color: #2d2630;
            font-weight: 700;
            line-height: 1.3;
          }

          .meta {
            display: flex;
            flex-wrap: wrap;
            gap: 8px 15px;
            margin: 13px 0 16px;
            color: #716773;
            font-size: 12px;
          }

          .rating {
            color: #a16a00;
            font-weight: 700;
          }

          .rental-footer {
            margin-top: auto;
            padding-top: 17px;
            border-top: 1px solid #eee8ef;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 15px;
          }

          .price small {
            display: block;
            color: #817682;
            font-size: 11px;
            margin-bottom: 3px;
          }

          .price strong {
            font-size: 21px;
            color: #571275;
          }

          .book-btn {
            text-decoration: none;
            padding: 11px 18px;
            border-radius: 9px;
            background: #74189b;
            color: white;
            font-size: 13px;
            font-weight: 750;
            border: 0;
            cursor: pointer;
            transition: background 0.2s, transform 0.15s;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          .book-btn:hover {
            background: #571275;
            transform: translateY(-1px);
          }

          /* CROSS-PROMO BANNER */

          .shop-cross-promo {
            margin-top: 65px;
            background: linear-gradient(135deg, #2b1138 0%, #46155c 100%);
            border-radius: 20px;
            padding: 40px 45px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 30px;
            color: white;
            box-shadow: 0 15px 40px rgba(67, 19, 87, 0.18);
          }

          .promo-badge {
            display: inline-block;
            font-size: 11px;
            letter-spacing: 2px;
            color: #f1a51d;
            font-weight: 800;
            margin-bottom: 8px;
          }

          .promo-text h3 {
            margin: 0 0 8px;
            font-size: 24px;
            font-weight: 750;
          }

          .promo-text p {
            margin: 0;
            color: rgba(255, 255, 255, 0.82);
            font-size: 14px;
            line-height: 1.6;
            max-width: 650px;
          }

          .promo-cta {
            flex-shrink: 0;
            padding: 14px 26px;
            border-radius: 12px;
            background: #f1a51d;
            color: #2b1138;
            font-size: 14px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 9px;
            transition: transform 0.2s, background 0.2s;
            text-decoration: none;
          }

          .promo-cta:hover {
            background: #e29712;
            transform: translateX(3px);
          }

          /* EMPTY */

          .empty {
            padding: 80px 20px;
            text-align: center;
            border: 1px dashed #dcd2df;
            border-radius: 18px;
            background: white;
          }

          .empty h3 {
            margin: 0 0 8px;
            font-size: 22px;
          }

          .empty p {
            color: #786f79;
            margin: 0 0 20px;
          }

          .reset-btn {
            border: 0;
            background: #74189b;
            color: white;
            padding: 10px 20px;
            border-radius: 9px;
            font-weight: 700;
            cursor: pointer;
          }

          /* BOOKING MODAL */

          .booking-modal-card {
            background: white;
            width: min(580px, 92%);
            max-height: 90vh;
            border-radius: 20px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.28);
            margin: auto;
          }

          .modal-header {
            padding: 22px 26px;
            border-bottom: 1px solid #eee7f0;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }

          .modal-subtitle {
            font-size: 11px;
            color: #74189b;
            letter-spacing: 1.5px;
            font-weight: 800;
          }

          .modal-header h3 {
            margin: 4px 0 0;
            font-size: 20px;
            color: #2b2330;
          }

          .close-modal-btn {
            border: 0;
            background: #f6f0f8;
            width: 34px;
            height: 34px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #554a5a;
          }

          .modal-body-scroll {
            padding: 24px 26px;
            overflow-y: auto;
          }

          .modal-rental-summary {
            display: flex;
            gap: 16px;
            align-items: center;
            background: #fbf8fc;
            border: 1px solid #eee5f0;
            border-radius: 12px;
            padding: 14px;
            margin-bottom: 20px;
          }

          .modal-thumb {
            width: 75px;
            height: 75px;
            border-radius: 10px;
            object-fit: cover;
          }

          .modal-rental-info {
            flex: 1;
          }

          .modal-vendor {
            font-size: 11px;
            color: #837887;
            font-weight: 600;
          }

          .modal-price strong {
            font-size: 19px;
            color: #571275;
          }

          .modal-price span {
            font-size: 12px;
            color: #736a77;
          }

          .modal-meta-tags {
            display: flex;
            gap: 12px;
            font-size: 11px;
            color: #706774;
            margin-top: 4px;
          }

          .modal-inclusions {
            margin-bottom: 22px;
          }

          .modal-inclusions h5 {
            margin: 0 0 10px;
            font-size: 13px;
            color: #2b2330;
          }

          .modal-inclusions ul {
            list-style: none;
            padding: 0;
            margin: 0;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            font-size: 12px;
            color: #524756;
          }

          .booking-form-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
            margin-bottom: 22px;
          }

          .form-group {
            display: flex;
            flex-direction: column;
          }

          .form-group.full-width {
            grid-column: 1 / -1;
          }

          .form-group label {
            font-size: 11px;
            font-weight: 700;
            color: #726875;
            margin-bottom: 6px;
          }

          .form-group input {
            height: 44px;
            border: 1px solid #e5dfe7;
            border-radius: 9px;
            padding: 0 12px;
            font-size: 13px;
            outline: none;
          }

          .form-group input:focus {
            border-color: #74189b;
          }

          .modal-actions {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .whatsapp-book-btn {
            height: 48px;
            border: 0;
            border-radius: 10px;
            background: #25d366;
            color: white;
            font-weight: 750;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            cursor: pointer;
            transition: background 0.2s;
          }

          .whatsapp-book-btn:hover {
            background: #20bd5a;
          }

          .view-full-btn {
            text-align: center;
            font-size: 12px;
            color: #74189b;
            font-weight: 700;
            text-decoration: none;
            padding: 8px 0;
          }

          .booking-success-box {
            padding: 40px 30px;
            text-align: center;
          }

          .success-icon {
            width: 60px;
            height: 60px;
            background: #25d366;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            font-weight: bold;
            margin: 0 auto 16px;
          }

          .booking-success-box h4 {
            margin: 0 0 8px;
            font-size: 20px;
          }

          .booking-success-box p {
            color: #6d6470;
            font-size: 14px;
            margin-bottom: 24px;
          }

          /* MOBILE */

          .mobile-filter-btn {
            display: none;
            border: 1px solid #74189b;
            background: white;
            color: #74189b;
            padding: 9px 14px;
            border-radius: 8px;
            font-weight: 700;
          }

          .filter-backdrop {
            position: fixed;
            inset: 0;
            z-index: 100;
            background: rgba(40, 25, 45, 0.45);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .mobile-drawer {
            position: absolute;
            right: 0;
            top: 0;
            height: 100%;
            width: min(390px, 90%);
            background: white;
            padding: 24px;
            box-sizing: border-box;
            overflow-y: auto;
          }

          .drawer-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
          }

          .drawer-header h3 {
            margin: 0;
            font-size: 24px;
          }

          .drawer-header button {
            border: 0;
            background: #f6f1f7;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            font-size: 24px;
            cursor: pointer;
          }

          .drawer-fields {
            display: grid;
            gap: 18px;
          }

          .apply-filter {
            height: 50px;
            border: 0;
            border-radius: 10px;
            background: #74189b;
            color: white;
            font-weight: 750;
            cursor: pointer;
            margin-top: 10px;
          }

          @media (max-width: 1000px) {
            .filter-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .rental-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .shop-cross-promo {
              flex-direction: column;
              text-align: center;
              padding: 35px 25px;
            }

            .promo-text p {
              margin: 0 auto;
            }
          }

          @media (max-width: 768px) {
            .rentals-hero {
              min-height: auto;
              padding: 20px 0 36px;
            }

            .hero-content {
              padding: 32px 18px 24px;
              width: 100%;
              box-sizing: border-box;
            }

            .hero-content h1 {
              font-size: clamp(26px, 7vw, 36px);
              letter-spacing: -0.8px;
              line-height: 1.15;
              word-break: break-word;
            }

            .hero-content p {
              font-size: 15px;
              line-height: 1.55;
              margin: 14px 0 20px;
            }

            .hero-trust {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              margin-bottom: 8px;
            }

            .hero-trust .trust-badge {
              font-size: 12px;
              padding: 6px 12px;
            }

            .search-wrapper {
              margin-top: -24px;
              padding: 0 16px;
              width: 100%;
              box-sizing: border-box;
            }

            .search-card {
              padding: 20px 16px;
              border-radius: 16px;
              box-sizing: border-box;
              width: 100%;
            }

            .search-heading {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 12px;
              margin-bottom: 16px;
            }

            .search-heading h2 {
              font-size: clamp(17px, 4.5vw, 21px);
              line-height: 1.25;
              margin: 4px 0 0;
            }

            .mobile-filter-btn {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              white-space: nowrap;
              flex-shrink: 0;
              padding: 8px 14px;
              font-size: 13px;
            }

            .filter-grid {
              grid-template-columns: 1fr;
              gap: 10px;
            }

            .filter-grid .filter {
              display: none;
            }

            .filter-grid .search-btn {
              margin-top: 4px;
              width: 100%;
              height: 48px;
              border-radius: 10px;
              font-size: 14px;
            }

            .content-top {
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              gap: 14px;
              margin-bottom: 24px;
            }

            .content-top h2 {
              font-size: clamp(22px, 5.5vw, 28px);
              line-height: 1.2;
              letter-spacing: -0.5px;
              margin: 4px 0 0;
            }

            .content-top p {
              margin: 6px 0 0;
              font-size: 14px;
              line-height: 1.5;
            }

            .sort-box {
              margin-top: 4px;
              width: 100%;
              max-width: 100%;
            }

            .sort-box select {
              width: 100%;
            }

            .rental-grid {
              grid-template-columns: 1fr;
              gap: 18px;
              width: 100%;
            }

            .rentals-content {
              padding: 36px 16px 50px;
              width: 100%;
              max-width: 100%;
              box-sizing: border-box;
            }

            .shop-cross-promo {
              padding: 26px 18px;
              border-radius: 16px;
              margin-top: 36px;
            }

            .promo-text h3 {
              font-size: clamp(18px, 4.8vw, 22px);
            }

            .promo-text p {
              font-size: 13px;
              line-height: 1.5;
            }

            .promo-cta {
              width: 100%;
              justify-content: center;
              box-sizing: border-box;
            }

            .modal-inclusions ul {
              grid-template-columns: 1fr;
            }

            .booking-form-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 450px) {
            .hero-content {
              padding: 24px 14px 20px;
              width: 100%;
              box-sizing: border-box;
            }

            .hero-content h1 {
              font-size: clamp(24px, 7vw, 28px);
              letter-spacing: -0.5px;
            }

            .hero-trust {
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              gap: 7px;
            }

            .search-wrapper {
              padding: 0 12px;
              margin-top: -16px;
              width: 100%;
              box-sizing: border-box;
            }

            .search-card {
              padding: 18px 14px;
            }

            .rentals-content {
              padding: 28px 12px 60px;
            }

            .rental-image {
              height: 220px;
            }
          }
        `}</style>
      </main>

      <Footer />
    </>
  );
}

export default function RentalsPage(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fcfafc]">
          <div className="animate-spin w-8 h-8 border-4 border-[#74189b] border-t-transparent rounded-full" />
        </div>
      }
    >
      <RentalsContent {...props} />
    </Suspense>
  );
}

/* FILTER COMPONENT */

function Filter({
  label,
  value,
  onChange,
  options,
  date,
  time,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  date?: boolean;
  time?: boolean;
}) {
  if (date) {
    return (
      <div className="filter">
        <label>{label}</label>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  if (time) {
    return (
      <div className="filter">
        <label>{label}</label>
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  return (
    <div className="filter">
      <label>{label}</label>

      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {label === "Price" && option !== "Any Price"
              ? `Up to AED ${option}`
              : option}
          </option>
        ))}
      </select>
    </div>
  );
}

/* RENTAL CARD */

function RentalCard({
  rental,
  isWishlisted,
  onToggleWishlist,
  onSelectRental,
}: {
  rental: Rental;
  isWishlisted: boolean;
  onToggleWishlist: (e: React.MouseEvent) => void;
  onSelectRental: () => void;
}) {
  return (
    <article className="rental-card">
      <div className="rental-image">
        <img src={rental.image} alt={rental.name} loading="lazy" />

        {rental.verified && (
          <span className="verified inline-flex items-center gap-1">
            <CheckCircle2 size={12} /> Verified
          </span>
        )}

        <button
          className={`wishlist ${isWishlisted ? "active" : ""}`}
          onClick={onToggleWishlist}
          aria-label={`Add ${rental.name} to wishlist`}
        >
          <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="rental-body">
        <div className="vendor">{rental.vendor}</div>

        <h3 className="rental-title">{rental.name}</h3>

        <div className="meta">
          <span>{rental.location}</span>
          {rental.duration && <span>{rental.duration}</span>}
        </div>

        <div className="rental-footer">
          <div className="price">
            <small>Starting from</small>
            <strong>AED {rental.price}</strong>
          </div>

          <button className="book-btn" onClick={onSelectRental}>
            View & Book
          </button>
        </div>
      </div>
    </article>
  );
}

/* EMPTY STATE */

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="empty">
      <h3>No rentals found</h3>
      <p>Try changing your location, event type or price filters.</p>
      <button className="reset-btn" onClick={onReset}>
        Reset All Filters
      </button>
    </div>
  );
}

/* SEARCH ICON */

function SearchIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}
