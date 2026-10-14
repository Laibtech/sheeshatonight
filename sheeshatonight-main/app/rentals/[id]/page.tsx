"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { defaultRentals, Rental } from "../page";
import {
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  Check,
  ArrowLeft,
  MessageCircle,
  Sparkles,
  Truck,
  Heart,
  Calendar,
  CheckCircle2,
} from "lucide-react";

export default function RentalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const rental: Rental =
    defaultRentals.find((r) => r.id === id) ||
    defaultRentals.find((r) => r.id.toLowerCase() === id?.toLowerCase()) ||
    defaultRentals[0]!;

  const otherRentals = defaultRentals
    .filter((r) => r.id !== rental.id)
    .slice(0, 3);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guestCount, setGuestCount] = useState(rental.guests || "6–10");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([
    "Double Apple (Al Fakher)",
    "Fresh Mint & Citrus",
  ]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const availableFlavors = [
    "Double Apple (Al Fakher)",
    "Fresh Mint & Citrus",
    "Love 66 (Adalya)",
    "Blue Mist (Starbuzz)",
    "Grape & Mint Special",
    "Lady Killer (Adalya)",
    "Lemon Mint Frost",
    "Peach Chill Breeze",
  ];

  const toggleFlavor = (f: string) => {
    setSelectedFlavors((prev) =>
      prev.includes(f) ? prev.filter((item) => item !== f) : [...prev, f]
    );
  };

  const handleWhatsAppBooking = () => {
    const text = `*Luxury Sheesha Rental Booking*%0A%0A*Package:* ${rental.name}%0A*Vendor:* ${rental.vendor}%0A*Price:* AED ${rental.price}%0A*Duration:* ${rental.duration}%0A*Date:* ${date || "Immediate / Flexible"}%0A*Time:* ${time || "Evening"}%0A*Guests:* ${guestCount}%0A*Selected Flavors:* ${selectedFlavors.join(", ")}%0A*Customer:* ${customerName || "Customer"}%0A*Phone:* ${customerPhone || "Not specified"}%0A*Address / Venue:* ${deliveryAddress || rental.location}`;
    window.open(`https://wa.me/971509121111?text=${text}`, "_blank");
  };

  return (
    <>
      <Header />

      <main className="rental-detail-page">
        <div className="container">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/rentals">Rentals</Link>
            <span>/</span>
            <span className="current">{rental.name}</span>
          </div>

          <div className="detail-layout">
            {/* Left: Images & Description */}
            <div className="detail-left">
              <div className="main-image-wrap">
                <img
                  src={rental.image}
                  alt={rental.name}
                  className="main-image"
                />
                {rental.verified && (
                  <span className="detail-badge inline-flex items-center gap-1">
                    <CheckCircle2 size={13} /> Verified Vendor
                  </span>
                )}
                <button
                  className={`detail-wishlist-btn ${isWishlisted ? "active" : ""}`}
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  aria-label="Wishlist"
                >
                  <Heart
                    size={20}
                    fill={isWishlisted ? "#e11d48" : "none"}
                    color={isWishlisted ? "#e11d48" : "currentColor"}
                  />
                </button>
              </div>

              <div className="detail-info-card">
                <span className="detail-vendor">{rental.vendor}</span>
                <h1>{rental.name}</h1>

                <div className="detail-tags">
                  <span className="tag location">
                    <MapPin size={14} className="inline mr-1" />
                    {rental.location}
                  </span>
                  <span className="tag duration">
                    <Clock size={14} className="inline mr-1" />
                    {rental.duration || "4 Hours"}
                  </span>
                  <span className="tag event">
                    <Sparkles size={14} className="inline mr-1" />
                    {rental.eventType} Setup
                  </span>
                </div>

                <div className="section-divider" />

                <h3>Experience Overview</h3>
                <p className="description">
                  {rental.description ||
                    "Elevate your event with our complete luxury turnkey sheesha lounge service. Professionally set up, maintained with fresh organic coals throughout your booking, and handled by experienced sommeliers."}
                </p>

                {rental.features && (
                  <>
                    <h3>Package Inclusions</h3>
                    <ul className="features-list">
                      {rental.features.map((feat, idx) => (
                        <li key={idx}>
                          <div className="check-bullet">
                            <Check size={14} />
                          </div>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <div className="guarantees-grid">
                  <div className="guarantee-item">
                    <Truck size={20} className="text-[#74189b]" />
                    <div>
                      <strong>Free On-Time Delivery</strong>
                      <p>Full setup 30 mins before start</p>
                    </div>
                  </div>
                  <div className="guarantee-item">
                    <ShieldCheck size={20} className="text-[#74189b]" />
                    <div>
                      <strong>100% Sanitized & Tested</strong>
                      <p>Single-use hygienic mouth tips</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Booking Form Card */}
            <div className="detail-right">
              <div className="booking-card">
                <div className="booking-price-row">
                  <div>
                    <span className="price-label">Starting From</span>
                    <div className="price-val">
                      <strong>AED {rental.price}</strong>
                      <span> / {rental.duration || "4 Hours"}</span>
                    </div>
                  </div>
                  <span className="badge-available">● Available Today</span>
                </div>

                <div className="section-divider" />

                <div className="booking-fields">
                  <div className="form-row">
                    <div>
                      <label>Event Date</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Preferred Time</label>
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label>Guest Count</label>
                    <select
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                    >
                      <option>1–5 Guests</option>
                      <option>6–10 Guests</option>
                      <option>11–20 Guests</option>
                      <option>20+ Guests</option>
                    </select>
                  </div>

                  <div>
                    <label>Choose Preferred Flavors</label>
                    <div className="flavor-chips">
                      {availableFlavors.map((fl) => {
                        const selected = selectedFlavors.includes(fl);
                        return (
                          <button
                            key={fl}
                            type="button"
                            className={`flavor-chip ${selected ? "selected" : ""}`}
                            onClick={() => toggleFlavor(fl)}
                          >
                            {selected && <Check size={12} className="inline mr-1" />}
                            {fl}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label>Your Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rashid Al Maktoum"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label>Phone / WhatsApp Number</label>
                    <input
                      type="tel"
                      placeholder="+971 50 123 4567"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>

                  <div>
                    <label>Delivery Address / Yacht Marina & Berth</label>
                    <input
                      type="text"
                      placeholder="e.g. Villa 12, Palm Jumeirah or Pier 7 Berth 14"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                    />
                  </div>
                </div>

                <div className="booking-cta-group">
                  <button
                    className="btn-whatsapp"
                    onClick={handleWhatsAppBooking}
                  >
                    <MessageCircle size={20} />
                    <span>Instant Reserve via WhatsApp</span>
                  </button>

                  <Link href="/cart" className="btn-secondary-book">
                    Proceed to Online Checkout
                  </Link>
                </div>

                <p className="booking-footnote">
                  No payment required upfront. Confirm details directly with
                  our VIP concierge team.
                </p>
              </div>
            </div>
          </div>

          {/* Related rentals */}
          <div className="related-section">
            <h2>You May Also Like</h2>
            <div className="related-grid">
              {otherRentals.map((item) => (
                <Link
                  key={item.id}
                  href={`/rentals/${item.id}`}
                  className="related-card"
                >
                  <img src={item.image} alt={item.name} />
                  <div className="related-body">
                    <span className="related-vendor">{item.vendor}</span>
                    <h4>{item.name}</h4>
                    <div className="related-meta">
                      <span>{item.location}</span>
                    </div>
                    <strong className="related-price">
                      AED {item.price}
                    </strong>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <style jsx global>{`
          .rental-detail-page {
            min-height: 100vh;
            background: #faf7fb;
            padding: 30px 0 90px;
            color: #27212b;
            font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI",
              sans-serif;
          }

          .container {
            max-width: 1440px;
            width: 100%;
            margin: 0 auto;
            padding: 0 32px;
            box-sizing: border-box;
          }

          @media (max-width: 1024px) {
            .container {
              padding: 0 24px;
            }
          }

          @media (max-width: 640px) {
            .container {
              padding: 0 16px;
            }
          }

          .breadcrumb {
            display: flex;
            align-items: center;
            gap: 9px;
            font-size: 13px;
            color: #7d7281;
            margin-bottom: 25px;
          }

          .breadcrumb a {
            text-decoration: none;
            color: #7d7281;
          }

          .breadcrumb a:hover {
            color: #74189b;
          }

          .breadcrumb .current {
            color: #2e2432;
            font-weight: 600;
          }

          .detail-layout {
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            gap: 35px;
          }

          .detail-left {
            display: flex;
            flex-direction: column;
            gap: 25px;
          }

          .main-image-wrap {
            position: relative;
            height: 440px;
            border-radius: 20px;
            overflow: hidden;
            background: #f0e6f2;
            border: 1px solid #ebdfee;
          }

          .main-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .detail-badge {
            position: absolute;
            top: 18px;
            left: 18px;
            background: white;
            color: #74189b;
            font-weight: 750;
            font-size: 12px;
            padding: 7px 14px;
            border-radius: 20px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
          }

          .detail-wishlist-btn {
            position: absolute;
            top: 18px;
            right: 18px;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: white;
            border: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
          }

          .detail-info-card {
            background: white;
            border: 1px solid #ebdfee;
            border-radius: 20px;
            padding: 35px;
          }

          .detail-vendor {
            color: #74189b;
            font-size: 13px;
            font-weight: 750;
            letter-spacing: 1px;
            text-transform: uppercase;
          }

          .detail-info-card h1 {
            margin: 8px 0 15px;
            font-size: 32px;
            color: #27212b;
            font-weight: 800;
          }

          .detail-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }

          .tag {
            background: #f6eff8;
            padding: 6px 13px;
            border-radius: 9px;
            font-size: 12px;
            font-weight: 600;
            color: #554859;
          }

          .tag.rating {
            background: #fff8e8;
            color: #925f00;
          }

          .section-divider {
            height: 1px;
            background: #ebdfee;
            margin: 25px 0;
          }

          .detail-info-card h3 {
            font-size: 18px;
            margin: 0 0 12px;
            color: #27212b;
          }

          .description {
            font-size: 15px;
            line-height: 1.7;
            color: #5f5564;
            margin: 0 0 25px;
          }

          .features-list {
            list-style: none;
            padding: 0;
            margin: 0 0 30px;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .features-list li {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
            color: #433947;
          }

          .check-bullet {
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: #f3e9f6;
            color: #74189b;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .guarantees-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 18px;
            background: #faf4fb;
            border: 1px solid #ebdfee;
            padding: 20px;
            border-radius: 14px;
          }

          .guarantee-item {
            display: flex;
            gap: 14px;
            align-items: flex-start;
          }

          .guarantee-item strong {
            display: block;
            font-size: 13px;
            color: #27212b;
          }

          .guarantee-item p {
            margin: 3px 0 0;
            font-size: 12px;
            color: #7a6e7e;
          }

          /* BOOKING CARD */

          .booking-card {
            background: white;
            border: 1px solid #ebdfee;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 15px 40px rgba(62, 22, 74, 0.08);
            position: sticky;
            top: 95px;
          }

          .booking-price-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }

          .price-label {
            display: block;
            font-size: 11px;
            color: #7b6f7f;
            font-weight: 600;
            margin-bottom: 3px;
          }

          .price-val strong {
            font-size: 28px;
            color: #571275;
            font-weight: 800;
          }

          .price-val span {
            font-size: 13px;
            color: #7a6e7e;
          }

          .badge-available {
            font-size: 12px;
            color: #15803d;
            font-weight: 700;
            background: #f0fdf4;
            padding: 5px 11px;
            border-radius: 20px;
          }

          .booking-fields {
            display: grid;
            gap: 15px;
            margin-bottom: 25px;
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .booking-fields label {
            display: block;
            font-size: 12px;
            font-weight: 700;
            color: #5d5261;
            margin-bottom: 6px;
          }

          .booking-fields input,
          .booking-fields select {
            width: 100%;
            height: 44px;
            border: 1px solid #e1d6e4;
            border-radius: 9px;
            padding: 0 12px;
            font-size: 13px;
            outline: none;
            box-sizing: border-box;
          }

          .booking-fields input:focus,
          .booking-fields select:focus {
            border-color: #74189b;
          }

          .flavor-chips {
            display: flex;
            flex-wrap: wrap;
            gap: 7px;
          }

          .flavor-chip {
            border: 1px solid #e1d6e4;
            background: #fff;
            padding: 6px 11px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            color: #5d5261;
            cursor: pointer;
            transition: all 0.15s;
          }

          .flavor-chip.selected {
            background: #74189b;
            color: white;
            border-color: #74189b;
          }

          .booking-cta-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .btn-whatsapp {
            height: 50px;
            background: #25d366;
            color: white;
            border: 0;
            border-radius: 11px;
            font-size: 14px;
            font-weight: 750;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: background 0.2s;
          }

          .btn-whatsapp:hover {
            background: #20bd5a;
          }

          .btn-secondary-book {
            text-align: center;
            padding: 13px;
            border: 1px solid #74189b;
            color: #74189b;
            border-radius: 11px;
            font-size: 13px;
            font-weight: 750;
            text-decoration: none;
            transition: background 0.2s;
          }

          .btn-secondary-book:hover {
            background: #fbf5fc;
          }

          .booking-footnote {
            margin: 15px 0 0;
            font-size: 11px;
            color: #8c808f;
            text-align: center;
            line-height: 1.5;
          }

          /* RELATED */

          .related-section {
            margin-top: 70px;
          }

          .related-section h2 {
            font-size: 24px;
            margin: 0 0 25px;
            color: #27212b;
          }

          .related-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 22px;
          }

          .related-card {
            background: white;
            border: 1px solid #ebdfee;
            border-radius: 16px;
            overflow: hidden;
            text-decoration: none;
            color: inherit;
            transition: transform 0.2s, box-shadow 0.2s;
          }

          .related-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 35px rgba(62, 22, 74, 0.08);
          }

          .related-card img {
            width: 100%;
            height: 190px;
            object-fit: cover;
          }

          .related-body {
            padding: 18px;
          }

          .related-vendor {
            font-size: 11px;
            color: #827685;
            font-weight: 600;
          }

          .related-body h4 {
            margin: 5px 0 10px;
            font-size: 16px;
            color: #27212b;
          }

          .related-meta {
            display: flex;
            gap: 12px;
            font-size: 12px;
            color: #706673;
            margin-bottom: 12px;
          }

          .related-price {
            display: block;
            color: #571275;
            font-size: 17px;
          }

          @media (max-width: 900px) {
            .detail-layout {
              grid-template-columns: 1fr;
            }

            .main-image-wrap {
              height: 350px;
            }

            .related-grid {
              grid-template-columns: 1fr;
            }

            .features-list {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </main>

      <Footer />
    </>
  );
}
