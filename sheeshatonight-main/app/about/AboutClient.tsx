"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Check,
  ShoppingBag,
  Flame,
  Sparkles,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const servicesData = [
  {
    number: "01",
    title: "Premium Sheesha",
    text: "Discover quality sheesha products, flavours, setups and accessories from trusted sellers.",
    image: "/Categories/Buy%20Sheesha.webp",
    cta: "Shop Now",
    href: "/shop",
    icon: <ShoppingBag size={18} strokeWidth={2.2} />,
  },
  {
    number: "02",
    title: "Sheesha Rentals",
    text: "Curated rental packages designed for villas, yachts, celebrations and private gatherings.",
    image: "/Categories/Rentals.webp",
    cta: "View Rentals",
    href: "/rentals",
    icon: <Flame size={18} strokeWidth={2.2} />,
  },
  {
    number: "03",
    title: "Luxury Experiences",
    text: "Create memorable moments with premium sheesha experiences across the UAE.",
    image: "/images/about-experience.jpg",
    cta: "Explore Experiences",
    href: "/experiences",
    icon: <Sparkles size={18} strokeWidth={2.2} />,
  },
  {
    number: "04",
    title: "Verified Vendors",
    text: "Connect with trusted sheesha specialists and experienced event vendors.",
    image: "/Categories/Top%20Vendors.webp",
    cta: "Find Vendors",
    href: "/vendors",
    icon: <ShieldCheck size={18} strokeWidth={2.2} />,
  },
];

interface StoryContent {
  title: string;
  intro: string;
  sections: { heading: string; text: string }[];
}

function parseStoryContent(raw: string | null): StoryContent {
  const defaultStory: StoryContent = {
    title: "Elevating the Sheesha Experience",
    intro:
      "SheeshaTonight is the United Arab Emirates' premier luxury sheesha rental, catalog, and event concierge service. Founded with a passion for traditional hospitality merged with contemporary excellence, we curate the finest European and Russian sheesha apparatus, artisanal tobacco blends, and white-glove setup services for discerning clients.",
    sections: [
      {
        heading: "Our Mission",
        text: "To deliver unforgettable, bespoke lounge experiences directly to private villas, luxury yachts, corporate retreats, and celebratory gatherings across Dubai, Abu Dhabi, and the wider UAE.",
      },
      {
        heading: "Quality & Authenticity Guaranteed",
        text: "Every setup includes medical-grade silicone hoses, precision-crafted stainless steel or Bohemian crystal stems, natural coconut charcoal, and masterfully prepared flavors by certified shisha sommeliers.",
      },
    ],
  };

  if (!raw || !raw.trim()) {
    return defaultStory;
  }

  const clean = raw.trim();
  const lines = clean.split("\n").map((l) => l.trim()).filter(Boolean);

  let title = "";
  let intro = "";
  const sections: { heading: string; text: string }[] = [];
  let currentSection: { heading: string; text: string } | null = null;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      title = line.replace(/^##\s*/, "").trim();
    } else if (line.startsWith("### ")) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        heading: line.replace(/^###\s*/, "").trim(),
        text: "",
      };
    } else {
      const cleanLine = line.replace(/^\*\*|\*\*$/g, "").trim();
      if (currentSection) {
        currentSection.text = currentSection.text
          ? `${currentSection.text} ${cleanLine}`
          : cleanLine;
      } else {
        intro = intro ? `${intro} ${cleanLine}` : cleanLine;
      }
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return {
    title: title || defaultStory.title,
    intro: intro || defaultStory.intro,
    sections: sections.length > 0 ? sections : defaultStory.sections,
  };
}

export default function AboutClient({
  cmsContent,
}: {
  cmsContent: string | null;
}) {
  const story = parseStoryContent(cmsContent);

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

        {/* OUR STORY */}
        <section className="intro-section">
          <div className="container intro-grid">
            <div className="intro-image">
              <Image
                src="/images/about-story.jpg"
                alt="Dubai skyline - Elevating the Sheesha Experience"
                fill
                sizes="(max-width: 960px) 100vw, 50vw"
                unoptimized
                priority
              />
            </div>

            <div className="intro-content">
              <span className="story-pill">OUR STORY</span>

              <h2 className="story-heading">
                {story.title}
              </h2>

              <p className="story-lead">
                {story.intro}
              </p>

              <div className="story-sections">
                {story.sections.map((section, idx) => (
                  <div key={idx} className="story-block">
                    <h3 className="story-subheading">{section.heading}</h3>
                    <p className="story-text">{section.text}</p>
                  </div>
                ))}
              </div>

              <Link href="/experiences" className="primary-btn story-btn">
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
              <span className="what-pill">WHAT WE DO</span>

              <h2 className="what-heading">Everything for your next experience</h2>

              <p className="what-subheading">
                One destination for premium sheesha products, rentals,
                experiences and trusted UAE vendors.
              </p>
            </div>

            <div className="service-grid">
              {servicesData.map((service, idx) => (
                <ServiceCard key={idx} {...service} />
              ))}
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
          font-family: 'Montserrat', sans-serif;
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

        /* INTRO / OUR STORY */

        .intro-section {
          padding: 80px 0;
          background: #ffffff;
        }

        .intro-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 72px;
        }

        .intro-image {
          position: relative;
          min-height: 560px;
          height: 100%;
          overflow: hidden;
          border-radius: 24px;
          background: #f4eef7;
          box-shadow: 0 24px 50px -15px rgba(116, 24, 155, 0.12);
          border: 1px solid rgba(116, 24, 155, 0.08);
        }

        .intro-image img {
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .intro-image:hover img {
          transform: scale(1.025);
        }

        .story-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 15px;
          border-radius: 9999px;
          border: 1px solid rgba(116, 24, 155, 0.28);
          background: rgba(116, 24, 155, 0.04);
          color: #74189b;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          margin-bottom: 18px;
          width: fit-content;
        }

        .story-heading {
          margin: 0 0 18px;
          font-size: clamp(30px, 3.2vw, 44px);
          line-height: 1.15;
          letter-spacing: -0.035em;
          font-weight: 800;
          color: #1f1427;
        }

        .story-lead {
          margin: 0 0 26px;
          color: #5c5562;
          font-size: 15.5px;
          line-height: 1.78;
          font-weight: 450;
        }

        .story-sections {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 30px;
        }

        .story-block {
          position: relative;
          padding-left: 18px;
          border-left: 2.5px solid rgba(116, 24, 155, 0.28);
          transition: border-color 0.2s ease;
        }

        .story-block:hover {
          border-left-color: #74189b;
        }

        .story-subheading {
          margin: 0 0 6px;
          font-size: 17.5px;
          font-weight: 750;
          line-height: 1.35;
          color: #261633;
          letter-spacing: -0.015em;
        }

        .story-text {
          margin: 0;
          color: #635b69;
          font-size: 14.5px;
          line-height: 1.7;
          font-weight: 400;
        }

        .story-btn {
          margin-top: 4px;
          background: #74189b;
          color: #ffffff;
          box-shadow: 0 8px 24px -6px rgba(116, 24, 155, 0.35);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .story-btn:hover {
          background: #621184;
          transform: translateY(-2px);
          box-shadow: 0 12px 28px -6px rgba(116, 24, 155, 0.45);
        }

        .values-title h2,
        .uae-content h2 {
          margin: 0;
          font-size: clamp(36px, 4vw, 52px);
          line-height: 1.08;
          letter-spacing: -0.04em;
        }

        .uae-image img {
          object-fit: cover;
        }

        .uae-content p {
          color: #706a73;
          font-size: 15px;
          line-height: 1.8;
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

        /* SERVICES - WHAT WE DO */

        .what-section {
          padding: 88px 0;
          background: #faf8fb;
          border-top: 1px solid rgba(116, 24, 155, 0.05);
          border-bottom: 1px solid rgba(116, 24, 155, 0.05);
        }

        .section-heading {
          max-width: 680px;
          margin-bottom: 56px;
        }

        .section-heading.centered {
          margin-left: auto;
          margin-right: auto;
          text-align: center;
        }

        .what-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 15px;
          border-radius: 9999px;
          border: 1px solid rgba(116, 24, 155, 0.28);
          background: rgba(116, 24, 155, 0.05);
          color: #74189b;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          margin-bottom: 18px;
        }

        .what-heading {
          margin: 0;
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(32px, 3.8vw, 44px);
          letter-spacing: -0.035em;
          line-height: 1.15;
          font-weight: 800;
          color: #1f1427;
        }

        .what-subheading {
          margin: 16px auto 0;
          max-width: 580px;
          color: #635b68;
          line-height: 1.7;
          font-size: 15.5px;
          font-weight: 400;
        }

        .service-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .service-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          border: 1px solid #ede7ef;
          border-radius: 20px;
          background: #ffffff;
          overflow: hidden;
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.28s ease;
          text-decoration: none;
          color: inherit;
          box-shadow: 0 4px 20px rgba(45, 15, 60, 0.03);
        }

        .service-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 18px 42px -10px rgba(45, 15, 60, 0.10);
          border-color: #d6c6dc;
        }

        .service-card-media {
          position: relative;
          width: 100%;
          height: 195px;
          overflow: hidden;
          background: #f4ecf7;
        }

        .service-card-img {
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .service-card:hover .service-card-img {
          transform: scale(1.05);
        }

        .service-number-badge {
          position: absolute;
          top: 13px;
          left: 13px;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(116, 24, 155, 0.16);
          color: #74189b;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .service-card-body {
          padding: 22px 22px 24px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .service-icon-box {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(116, 24, 155, 0.08) 0%, rgba(241, 165, 29, 0.14) 100%);
          border: 1px solid rgba(116, 24, 155, 0.16);
          color: #74189b;
          margin-bottom: 16px;
          transition: transform 0.25s ease, background 0.25s ease, color 0.25s ease;
        }

        .service-card:hover .service-icon-box {
          transform: scale(1.06);
          background: linear-gradient(135deg, #74189b 0%, #9024bd 100%);
          color: #F1A51D;
          border-color: #74189b;
        }

        .service-card-title {
          margin: 0 0 10px;
          font-family: 'Montserrat', sans-serif;
          font-size: 19px;
          font-weight: 750;
          color: #1f1427;
          line-height: 1.3;
          letter-spacing: -0.02em;
          transition: color 0.2s ease;
        }

        .service-card:hover .service-card-title {
          color: #74189b;
        }

        .service-card-text {
          margin: 0 0 22px;
          color: #6a626e;
          font-size: 13.5px;
          line-height: 1.68;
          font-weight: 400;
          flex: 1;
        }

        .service-card-cta {
          margin-top: auto;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #74189b;
          font-size: 13px;
          font-weight: 750;
          letter-spacing: 0.015em;
          transition: color 0.2s ease;
        }

        .service-cta-arrow {
          color: #74189b;
          transition: transform 0.25s ease, color 0.25s ease;
        }

        .service-card:hover .service-card-cta {
          color: #571275;
        }

        .service-card:hover .service-cta-arrow {
          transform: translateX(5px);
          color: #F1A51D;
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

          .intro-grid {
            gap: 48px;
          }

          .values-grid,
          .uae-grid {
            gap: 55px;
          }
        }

        @media (max-width: 900px) {
          .intro-section {
            padding: 56px 0;
          }

          .intro-grid {
            grid-template-columns: 1fr;
            gap: 36px;
          }

          .intro-image {
            min-height: 360px;
            max-height: 440px;
            border-radius: 20px;
          }

          .story-heading {
            font-size: 30px;
          }

          .story-lead {
            font-size: 15px;
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

          .values-grid,
          .uae-grid {
            grid-template-columns: 1fr;
            gap: 42px;
          }

          .intro-image {
            min-height: 320px;
          }

          .uae-image {
            min-height: 390px;
          }

          .what-section {
            padding: 56px 0;
          }

          .section-heading {
            margin-bottom: 36px;
          }

          .what-heading {
            font-size: 28px;
          }

          .what-subheading {
            font-size: 14.5px;
          }

          .service-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .service-card {
            min-height: auto;
          }

          .service-card-media {
            height: 180px;
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
  image,
  cta,
  icon,
}: {
  number: string;
  title: string;
  text: string;
  href: string;
  image: string;
  cta: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href} className="service-card group">
      <div className="service-card-media">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="service-card-img"
          unoptimized
        />
        <span className="service-number-badge">{number}</span>
      </div>

      <div className="service-card-body">
        <div className="service-icon-box">
          {icon}
        </div>

        <h3 className="service-card-title">{title}</h3>

        <p className="service-card-text">{text}</p>

        <div className="service-card-cta">
          <span>{cta}</span>
          <ArrowRight size={15} className="service-cta-arrow" />
        </div>
      </div>
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
