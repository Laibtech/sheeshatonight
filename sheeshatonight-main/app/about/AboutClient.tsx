"use client";

import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AboutClient({
  cmsContent,
}: {
  cmsContent: string | null;
}) {
  return (
    <>
      <Header />

      <main className="about-page">
        {/* HERO */}
        <section className="about-hero">
          <div className="about-hero-bg" />

          <div className="about-hero-content">
            <div className="breadcrumb">
              <Link href="/">Home</Link>
              <span>/</span>
              <span>About</span>
            </div>

            <span className="eyebrow">ABOUT SHEESHATONIGHT</span>

            <h1>
              Elevating the
              <br />
              Sheesha Experience
            </h1>

            <p>
              A premium destination for sheesha, curated experiences and
              trusted vendors across the UAE.
            </p>
          </div>
        </section>

        {/* INTRO */}
        <section className="intro-section">
          <div className="container intro-grid">
            <div className="intro-image">
              <Image
                src="/images/about-story.jpg"
                alt="Premium sheesha experience"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
              />
            </div>

            <div className="intro-content">
              <span className="eyebrow purple">OUR STORY</span>

              {cmsContent ? (
                <div className="text-slate-700 whitespace-pre-wrap leading-relaxed text-[15px] space-y-4">
                  {cmsContent}
                </div>
              ) : (
                <>
                  <h2>
                    More than sheesha.
                    <br />
                    It&apos;s an experience.
                  </h2>

                  <p>
                    SheeshaTonight was created to make premium sheesha
                    experiences easier to discover, book and enjoy.
                  </p>

                  <p>
                    From intimate villa gatherings to yacht celebrations,
                    corporate events and relaxed evenings at home, we bring
                    together quality products, curated rentals and trusted
                    vendors in one premium marketplace.
                  </p>

                  <p>
                    Our goal is simple: make every sheesha experience feel
                    effortless, elevated and memorable.
                  </p>
                </>
              )}

              <Link href="/experiences" className="primary-btn">
                Explore Experiences
                <Arrow />
              </Link>
            </div>
          </div>
        </section>

        {/* WHAT WE DO */}
        <section className="what-section">
          <div className="container">
            <div className="section-heading centered">
              <span className="eyebrow purple">WHAT WE DO</span>

              <h2>Everything for your next experience</h2>

              <p>
                One destination for premium sheesha products, rentals,
                experiences and trusted UAE vendors.
              </p>
            </div>

            <div className="service-grid">
              <ServiceCard
                number="01"
                title="Premium Sheesha"
                text="Discover quality sheesha products, flavours, setups and accessories from trusted sellers."
                href="/shop"
              />

              <ServiceCard
                number="02"
                title="Sheesha Rentals"
                text="Curated rental packages designed for villas, yachts, celebrations and private gatherings."
                href="/rentals"
              />

              <ServiceCard
                number="03"
                title="Luxury Experiences"
                text="Create memorable moments with premium sheesha experiences across the UAE."
                href="/experiences"
              />

              <ServiceCard
                number="04"
                title="Verified Vendors"
                text="Connect with trusted sheesha specialists and experienced event vendors."
                href="/vendors"
              />
            </div>
          </div>
        </section>

        {/* EXPERIENCE BANNER */}
        <section className="experience-section">
          <div className="experience-image" />

          <div className="experience-overlay" />

          <div className="container experience-content">
            <span className="eyebrow">THE SHEESHATONIGHT STANDARD</span>

            <h2>
              Premium quality.
              <br />
              Trusted service.
              <br />
              Memorable moments.
            </h2>

            <p>
              We believe the details matter. From the products you choose
              to the service that delivers them, every part of the
              experience should feel premium.
            </p>

            <Link href="/vendors" className="light-btn">
              Discover Our Vendors
              <Arrow />
            </Link>
          </div>
        </section>

        {/* VALUES */}
        <section className="values-section">
          <div className="container">
            <div className="values-grid">
              <div className="values-title">
                <span className="eyebrow purple">OUR VALUES</span>

                <h2>
                  Built around
                  <br />
                  better experiences.
                </h2>

                <p>
                  Every decision we make is focused on creating a more
                  reliable, enjoyable and premium experience for our
                  customers and partners.
                </p>
              </div>

              <div className="values-list">
                <Value
                  title="Quality First"
                  text="We focus on premium products, professional setups and experiences worth remembering."
                />

                <Value
                  title="Trust & Transparency"
                  text="Customers should know who they are booking with and what they can expect."
                />

                <Value
                  title="Customer Experience"
                  text="From discovery to delivery and booking, we keep the experience simple and seamless."
                />

                <Value
                  title="Local Expertise"
                  text="We connect customers with experienced vendors and services across the UAE."
                />
              </div>
            </div>
          </div>
        </section>

        {/* UAE */}
        <section className="uae-section">
          <div className="container uae-grid">
            <div className="uae-content">
              <span className="eyebrow purple">MADE FOR THE UAE</span>

              <h2>
                From Dubai
                <br />
                to every celebration.
              </h2>

              <p>
                SheeshaTonight is designed around the way people in the
                UAE celebrate, relax and spend time together.
              </p>

              <p>
                Whether it&apos;s a private villa evening, a yacht gathering,
                a birthday, wedding or corporate occasion, we make it easy
                to bring premium sheesha into the experience.
              </p>

              <div className="location-row">
                <span>Dubai</span>
                <span>Abu Dhabi</span>
                <span>Sharjah</span>
                <span>Ajman</span>
                <span>RAK</span>
              </div>
            </div>

            <div className="uae-image">
              <Image
                src="/images/about-uae.jpg"
                alt="Luxury UAE sheesha experience"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="about-cta">
          <div className="container">
            <span className="eyebrow">YOUR NEXT EXPERIENCE</span>

            <h2>
              Let&apos;s make tonight
              <br />
              worth remembering.
            </h2>

            <p>
              Explore premium sheesha rentals, products and experiences
              available across the UAE.
            </p>

            <div className="cta-actions">
              <Link href="/rentals" className="cta-primary">
                Explore Rentals
                <Arrow />
              </Link>

              <Link href="/shop" className="cta-secondary">
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
          background: #fff;
          color: #211c23;
          font-family:
            Inter, ui-sans-serif, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .about-page {
          background: #fff;
          overflow: hidden;
        }

        .container {
          max-width: 1440px;
          width: 100%;
          margin: 0 auto;
          padding: 0 32px;
          box-sizing: border-box;
        }

        /* HERO */

        .about-hero {
          min-height: 520px;
          position: relative;
          display: flex;
          align-items: center;
          overflow: hidden;
          background: #32173a;
        }

        .about-hero-bg {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              90deg,
              rgba(48, 18, 57, 0.88) 0%,
              rgba(48, 18, 57, 0.68) 45%,
              rgba(48, 18, 57, 0.15) 100%
            ),
            url("/images/about-hero.jpg") center / cover no-repeat;
        }

        .about-hero-content {
          position: relative;
          z-index: 2;
          max-width: 1440px;
          width: 100%;
          margin: 0 auto;
          color: #fff;
          padding: 35px 32px 0;
          box-sizing: border-box;
        }

        .breadcrumb {
          display: flex;
          gap: 10px;
          margin-bottom: 55px;
          color: rgba(255, 255, 255, 0.65);
          font-size: 13px;
        }

        .breadcrumb a {
          color: #fff;
          text-decoration: none;
        }

        .eyebrow {
          display: inline-block;
          margin-bottom: 15px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.18em;
        }

        .eyebrow.purple {
          color: #74189b;
        }

        .about-hero h1 {
          margin: 0;
          font-size: clamp(45px, 6vw, 72px);
          line-height: 1.02;
          letter-spacing: -0.045em;
          font-weight: 760;
        }

        .about-hero p {
          max-width: 590px;
          margin: 23px 0 0;
          font-size: 17px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.84);
        }

        /* INTRO */

        .intro-section {
          padding: 56px 0;
        }

        .intro-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 90px;
        }

        .intro-image {
          position: relative;
          min-height: 600px;
          overflow: hidden;
          border-radius: 22px;
          background: #f3eef5;
        }

        .intro-image img,
        .uae-image img {
          object-fit: cover;
        }

        .intro-content h2,
        .values-title h2,
        .uae-content h2 {
          margin: 0;
          font-size: clamp(36px, 4vw, 52px);
          line-height: 1.08;
          letter-spacing: -0.04em;
        }

        .intro-content p,
        .uae-content p {
          color: #706a73;
          font-size: 15px;
          line-height: 1.8;
        }

        .intro-content p:first-of-type {
          margin-top: 25px;
        }

        .intro-content p:not(:first-of-type) {
          margin-top: 15px;
        }

        .primary-btn,
        .light-btn,
        .cta-primary,
        .cta-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 50px;
          padding: 0 21px;
          border-radius: 11px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 750;
        }

        .primary-btn {
          margin-top: 17px;
          background: #74189b;
          color: #fff;
        }

        /* SERVICES */

        .what-section {
          padding: 56px 0;
          background: #faf8fb;
        }

        .section-heading {
          max-width: 680px;
          margin-bottom: 55px;
        }

        .section-heading.centered {
          margin-left: auto;
          margin-right: auto;
          text-align: center;
        }

        .section-heading h2 {
          margin: 0;
          font-size: clamp(34px, 4vw, 48px);
          letter-spacing: -0.04em;
          line-height: 1.08;
        }

        .section-heading p {
          margin: 16px auto 0;
          max-width: 570px;
          color: #746d77;
          line-height: 1.7;
          font-size: 15px;
        }

        .service-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }

        .service-card {
          min-height: 315px;
          padding: 30px;
          display: flex;
          flex-direction: column;
          border: 1px solid #e9e3eb;
          border-radius: 18px;
          background: #fff;
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
          text-decoration: none;
          color: inherit;
        }

        .service-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 45px rgba(46, 17, 54, 0.08);
        }

        .service-number {
          color: #74189b;
          font-size: 12px;
          font-weight: 800;
        }

        .service-card h3 {
          margin: auto 0 12px;
          font-size: 22px;
          letter-spacing: -0.025em;
          color: #211c23;
        }

        .service-card p {
          margin: 0;
          color: #77717a;
          font-size: 13px;
          line-height: 1.7;
        }

        .service-arrow {
          margin-top: 24px;
          color: #74189b;
          display: inline-flex;
          align-items: center;
        }

        /* EXPERIENCE */

        .experience-section {
          position: relative;
          min-height: 650px;
          display: flex;
          align-items: center;
          overflow: hidden;
          color: #fff;
        }

        .experience-image {
          position: absolute;
          inset: 0;
          background: url("/images/about-experience.jpg") center / cover
            no-repeat;
        }

        .experience-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              90deg,
              rgba(41, 14, 50, 0.9),
              rgba(41, 14, 50, 0.62) 50%,
              rgba(41, 14, 50, 0.18)
            );
        }

        .experience-content {
          position: relative;
          z-index: 2;
        }

        .experience-content h2 {
          margin: 0;
          max-width: 700px;
          font-size: clamp(40px, 5vw, 62px);
          line-height: 1.05;
          letter-spacing: -0.045em;
        }

        .experience-content p {
          max-width: 530px;
          margin: 23px 0 27px;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.75;
          font-size: 15px;
        }

        .light-btn {
          background: #fff;
          color: #74189b;
        }

        /* VALUES */

        .values-section {
          padding: 56px 0;
        }

        .values-grid {
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          gap: 110px;
        }

        .values-title p {
          max-width: 440px;
          margin-top: 24px;
          color: #746d77;
          line-height: 1.75;
          font-size: 15px;
        }

        .values-list {
          border-top: 1px solid #e5dfe7;
        }

        .value-item {
          display: grid;
          grid-template-columns: 42px 1fr;
          gap: 18px;
          padding: 27px 0;
          border-bottom: 1px solid #e5dfe7;
        }

        .value-icon {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #f1e8f4;
          color: #74189b;
          font-size: 13px;
          font-weight: 800;
        }

        .value-item h3 {
          margin: 0 0 7px;
          font-size: 18px;
          color: #211c23;
        }

        .value-item p {
          margin: 0;
          color: #77717a;
          font-size: 13px;
          line-height: 1.7;
        }

        /* UAE */

        .uae-section {
          padding: 56px 0;
          background: #faf8fb;
        }

        .uae-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 85px;
        }

        .uae-image {
          position: relative;
          min-height: 520px;
          overflow: hidden;
          border-radius: 22px;
        }

        .location-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 27px;
        }

        .location-row span {
          padding: 8px 12px;
          border: 1px solid #e3dce5;
          border-radius: 8px;
          background: #fff;
          color: #5d5660;
          font-size: 11px;
          font-weight: 650;
        }

        /* CTA */

        .about-cta {
          padding: 60px 0;
          text-align: center;
          background: #74189b;
          color: #fff;
        }

        .about-cta .eyebrow {
          color: #f1a51d;
        }

        .about-cta h2 {
          margin: 0;
          font-size: clamp(40px, 5vw, 62px);
          line-height: 1.05;
          letter-spacing: -0.045em;
        }

        .about-cta p {
          max-width: 570px;
          margin: 20px auto 28px;
          color: rgba(255, 255, 255, 0.78);
          line-height: 1.7;
          font-size: 15px;
        }

        .cta-actions {
          display: flex;
          justify-content: center;
          gap: 10px;
        }

        .cta-primary {
          background: #fff;
          color: #74189b;
        }

        .cta-secondary {
          border: 1px solid rgba(255, 255, 255, 0.5);
          color: #fff;
        }

        @media (max-width: 1050px) {
          .container {
            padding: 0 24px;
          }

          .about-hero-content {
            padding: 35px 24px 0;
          }

          .service-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .intro-grid,
          .values-grid,
          .uae-grid {
            gap: 55px;
          }
        }

        @media (max-width: 720px) {
          .container {
            padding: 0 16px;
          }

          .about-hero-content {
            padding: 25px 16px 0;
          }

          .about-hero {
            min-height: 450px;
          }

          .about-hero h1 {
            font-size: 44px;
          }

          .about-hero p {
            font-size: 15px;
          }

          .breadcrumb {
            margin-bottom: 35px;
          }

          .intro-section,
          .what-section,
          .values-section,
          .uae-section {
            padding: 70px 0;
          }

          .intro-grid,
          .values-grid,
          .uae-grid {
            grid-template-columns: 1fr;
            gap: 42px;
          }

          .intro-image {
            min-height: 430px;
          }

          .uae-image {
            min-height: 390px;
          }

          .service-grid {
            grid-template-columns: 1fr;
          }

          .service-card {
            min-height: 270px;
          }

          .experience-section {
            min-height: 620px;
          }

          .experience-content h2 {
            font-size: 43px;
          }

          .cta-actions {
            flex-direction: column;
            width: min(100%, 320px);
            margin: auto;
          }

          .cta-primary,
          .cta-secondary {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}

/* SERVICE CARD */

function ServiceCard({
  number,
  title,
  text,
  href,
}: {
  number: string;
  title: string;
  text: string;
  href: string;
}) {
  return (
    <Link href={href} className="service-card">
      <span className="service-number">{number}</span>

      <h3>{title}</h3>

      <p>{text}</p>

      <span className="service-arrow">
        <Arrow />
      </span>
    </Link>
  );
}

/* VALUE */

function Value({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="value-item">
      <div className="value-icon">
        <Check className="w-5 h-5 text-[#74189b]" />
      </div>

      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}

/* ARROW */

function Arrow() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
