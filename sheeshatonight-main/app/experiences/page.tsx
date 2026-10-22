"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const categories = [
  {
    title: "Villa Experiences",
    slug: "villa",
    image: "/villa.png",
    description: "Private sheesha setups for relaxed villa evenings.",
    link: "/rentals?event=villa",
  },
  {
    title: "Yacht Experiences",
    slug: "yacht",
    image: "/yacht.png",
    description: "Elevate your time on the water with premium sheesha.",
    link: "/rentals?event=yacht",
  },
  {
    title: "Corporate Events",
    slug: "corporate",
    image: "/corporate.jpg",
    description: "Premium experiences designed for corporate occasions.",
    link: "/rentals?event=corporate",
  },
  {
    title: "Weddings",
    slug: "wedding",
    image: "/wedding.webp",
    description: "Elegant sheesha experiences for unforgettable celebrations.",
    link: "/rentals?event=weddings",
  },
  {
    title: "Birthdays",
    slug: "birthday",
    image: "/bdy.webp",
    description: "Make your celebration more memorable.",
    link: "/rentals?event=birthday",
  },
  {
    title: "Private Gatherings",
    slug: "private-events",
    image: "/private-gathering.png",
    description: "Curated setups for intimate gatherings and special nights.",
    link: "/rentals?event=private",
  },
];

export default function ExperiencesPage() {
  return (
    <>
      <Header />

      <main className="experience-page">
        {/* HERO */}
        <section className="experience-hero">
          <div className="hero-overlay">
            <div className="container">
              <div className="hero-content">
                <span className="eyebrow">SHEESHATONIGHT EXPERIENCES</span>

                <h1>Find Your Next Sheesha Experience</h1>

                <p>
                  Curated sheesha experiences designed for unforgettable
                  moments across the UAE.
                </p>

                <Link href="#experiences" className="primary-btn">
                  Explore Experiences
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section id="experiences" className="categories-section">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">EXPLORE BY OCCASION</span>

              <h2>Make Every Occasion Better</h2>

              <p>
                Choose an experience that matches your occasion, setting
                and style.
              </p>
            </div>

            <div className="category-grid">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={category.link}
                  className="experience-card"
                >
                  <div className="card-image">
                    <img
                      src={category.image}
                      alt={category.title}
                    />
                  </div>

                  <div className="card-content">
                    <div>
                      <h3>{category.title}</h3>
                      <p>{category.description}</p>
                    </div>

                    <span className="arrow">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED */}
        <section className="featured-section">
          <div className="container">
            <div className="section-heading split-heading">
              <div>
                <span className="eyebrow">CURATED FOR YOU</span>
                <h2>Featured Experiences</h2>
              </div>

              <Link href="/rentals" className="text-link">
                View All Experiences →
              </Link>
            </div>

            <div className="featured-grid">
              <article className="featured-card">
                <img
                  src="/images/experiences/featured-1.jpg"
                  alt="Premium villa sheesha experience"
                />

                <div className="featured-info">
                  <span>Villa Experience</span>
                  <h3>Premium Evening Setup</h3>
                  <p>From AED 500</p>

                  <Link href="/rentals?event=villa">
                    Explore Experience →
                  </Link>
                </div>
              </article>

              <article className="featured-card">
                <img
                  src="/images/experiences/featured-2.jpg"
                  alt="Luxury yacht sheesha experience"
                />

                <div className="featured-info">
                  <span>Yacht Experience</span>
                  <h3>Luxury Yacht Evening</h3>
                  <p>From AED 750</p>

                  <Link href="/rentals?event=yacht">
                    Explore Experience →
                  </Link>
                </div>
              </article>

              <article className="featured-card">
                <img
                  src="/images/experiences/featured-3.jpg"
                  alt="Premium private sheesha experience"
                />

                <div className="featured-info">
                  <span>Private Event</span>
                  <h3>Signature Sheesha Lounge</h3>
                  <p>From AED 600</p>

                  <Link href="/rentals?event=private">
                    Explore Experience →
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* TRUST */}
        <section className="trust-section">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">THE SHEESHATONIGHT STANDARD</span>
              <h2>Experience It With Confidence</h2>
            </div>

            <div className="trust-grid">
              <div className="trust-item">
                <span>01</span>
                <h3>Verified Vendors</h3>
                <p>
                  Discover experiences delivered by trusted marketplace
                  vendors.
                </p>
              </div>

              <div className="trust-item">
                <span>02</span>
                <h3>Premium Quality</h3>
                <p>
                  Carefully curated setups designed for a premium experience.
                </p>
              </div>

              <div className="trust-item">
                <span>03</span>
                <h3>UAE-Wide Service</h3>
                <p>
                  Find experiences across Dubai and the wider UAE.
                </p>
              </div>

              <div className="trust-item">
                <span>04</span>
                <h3>Secure Booking</h3>
                <p>
                  Book your preferred experience through a seamless checkout.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="final-cta">
          <div className="container">
            <span className="eyebrow">YOUR NEXT MOMENT STARTS HERE</span>

            <h2>Ready for Your Next Sheesha Experience?</h2>

            <p>
              From relaxed evenings to unforgettable celebrations,
              discover a premium experience made for you.
            </p>

            <div className="cta-actions">
              <Link href="/rentals" className="primary-btn">
                Book a Rental
              </Link>

              <Link href="/shop" className="secondary-btn">
                Shop Sheesha
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          color: #29232d;
          background: #ffffff;
          font-family: 'Montserrat', sans-serif;
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

        .experience-hero {
          min-height: 680px;
          position: relative;
          background:
            linear-gradient(
              90deg,
              rgba(40, 15, 50, 0.78) 0%,
              rgba(40, 15, 50, 0.45) 48%,
              rgba(40, 15, 50, 0.15) 100%
            ),
            url("/images/experiences/experience-hero.jpg")
              center / cover no-repeat;
          display: flex;
          align-items: center;
        }

        .hero-overlay {
          width: 100%;
          padding: 60px 0;
          display: flex;
          align-items: center;
        }

        .hero-content {
          color: #fff;
          max-width: 720px;
        }

        .eyebrow {
          display: inline-block;
          color: #f1a51d;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.16em;
          margin-bottom: 18px;
        }

        .hero-content h1 {
          margin: 0;
          font-size: clamp(42px, 6vw, 72px);
          line-height: 1.03;
          letter-spacing: -0.04em;
        }

        .hero-content p {
          max-width: 570px;
          margin: 25px 0 32px;
          font-size: 18px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.9);
        }

        .primary-btn,
        .secondary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          padding: 0 25px;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 700;
          transition: 0.2s ease;
        }

        .primary-btn {
          background: #74189b;
          color: #fff;
        }

        .primary-btn:hover {
          background: #571275;
          transform: translateY(-1px);
        }

        .secondary-btn {
          border: 1px solid #74189b;
          color: #74189b;
          background: #fff;
        }

        .secondary-btn:hover {
          background: #fbf5fc;
        }

        .categories-section,
        .featured-section,
        .trust-section {
          padding: 48px 0;
        }

        .categories-section {
          background: #faf8fb;
        }

        .section-heading {
          max-width: 700px;
          margin-bottom: 48px;
        }

        .section-heading h2 {
          margin: 0 0 14px;
          color: #571275;
          font-size: clamp(32px, 4vw, 48px);
          line-height: 1.1;
          letter-spacing: -0.035em;
        }

        .section-heading p {
          margin: 0;
          color: #716975;
          font-size: 16px;
          line-height: 1.7;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .experience-card {
          overflow: hidden;
          border-radius: 20px;
          background: #fff;
          text-decoration: none;
          color: inherit;
          border: 1px solid #eee7f1;
          transition: 0.25s ease;
        }

        .experience-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 18px 45px rgba(87, 18, 117, 0.1);
        }

        .card-image {
          height: 360px;
          overflow: hidden;
        }

        .card-image img,
        .featured-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .experience-card:hover .card-image img {
          transform: scale(1.03);
        }

        .card-image img {
          transition: 0.4s ease;
        }

        .card-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 25px;
        }

        .card-content h3 {
          margin: 0 0 7px;
          color: #571275;
          font-size: 22px;
        }

        .card-content p {
          margin: 0;
          color: #77707b;
          line-height: 1.5;
        }

        .arrow {
          flex: 0 0 auto;
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #f5edf8;
          color: #74189b;
          font-size: 20px;
        }

        .split-heading {
          max-width: none;
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 30px;
        }

        .text-link {
          color: #74189b;
          text-decoration: none;
          font-weight: 700;
        }

        .featured-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .featured-card {
          position: relative;
          height: 500px;
          overflow: hidden;
          border-radius: 20px;
          background: #eee;
        }

        .featured-card::after {
          content: "";
          position: absolute;
          inset: 45% 0 0;
          background: linear-gradient(transparent, rgba(30, 10, 40, 0.85));
        }

        .featured-info {
          position: absolute;
          z-index: 2;
          left: 25px;
          right: 25px;
          bottom: 25px;
          color: #fff;
        }

        .featured-info span {
          color: #f1a51d;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .featured-info h3 {
          margin: 8px 0;
          font-size: 25px;
        }

        .featured-info p {
          margin: 0 0 15px;
        }

        .featured-info a {
          color: #fff;
          text-decoration: none;
          font-weight: 700;
        }

        .trust-section {
          background: #faf8fb;
        }

        .trust-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
        }

        .trust-item {
          padding: 30px 0;
          border-top: 1px solid #ded5e2;
        }

        .trust-item > span {
          color: #f1a51d;
          font-weight: 800;
          font-size: 13px;
        }

        .trust-item h3 {
          margin: 15px 0 10px;
          color: #571275;
        }

        .trust-item p {
          margin: 0;
          color: #756d78;
          line-height: 1.65;
        }

        .final-cta {
          padding: 56px 20px;
          text-align: center;
          background: #f4eafa;
        }

        .final-cta .container {
          max-width: 850px;
        }

        .final-cta h2 {
          margin: 0 0 18px;
          color: #571275;
          font-size: clamp(34px, 5vw, 54px);
          letter-spacing: -0.04em;
        }

        .final-cta p {
          max-width: 650px;
          margin: 0 auto 30px;
          color: #6e6572;
          line-height: 1.7;
        }

        .cta-actions {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        @media (max-width: 900px) {
          .featured-grid {
            grid-template-columns: 1fr 1fr;
          }

          .featured-card:last-child {
            grid-column: 1 / -1;
          }

          .trust-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 640px) {
          .experience-hero {
            min-height: 420px;
          }

          .hero-content {
            padding: 44px 0;
          }

          .hero-content h1 {
            font-size: 43px;
          }

          .categories-section,
          .featured-section,
          .trust-section,
          .final-cta {
            padding: 40px 0;
          }

          .category-grid,
          .featured-grid,
          .trust-grid {
            grid-template-columns: 1fr;
          }

          .featured-card:last-child {
            grid-column: auto;
          }

          .card-image {
            height: 300px;
          }

          .featured-card {
            height: 430px;
          }

          .split-heading {
            display: block;
          }

          .split-heading .text-link {
            display: inline-block;
            margin-top: 10px;
          }

          .cta-actions {
            flex-direction: column;
          }

          .cta-actions a {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
