"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Mail, Phone, Check, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        throw new Error("Failed");
      }

      setSubmitted(true);
      form.reset();
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />

      <main className="contact-page">
        {/* HERO */}
        <section className="contact-hero">
          <div className="hero-overlay" />

          <div className="container hero-content">
            <span className="eyebrow">GET IN TOUCH</span>

            <h1>
              We’re Here
              <br />
              <span>To Help.</span>
            </h1>

            <p>
              Have a question about a rental, order or experience?
              Our team is ready to help you.
            </p>

            <div className="hero-links">
              <a href="#contact-form">Send a Message</a>
              <a href="#contact-info" className="outline-link">
                Contact Information
              </a>
            </div>
          </div>
        </section>

        {/* CONTACT CONTENT */}
        <section className="contact-section" id="contact-info">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow purple">CONTACT SHEESHATONIGHT</span>

              <h2>
                Let’s start a
                <br />
                <span>conversation.</span>
              </h2>

              <p>
                Whether you need assistance with an order, want to book a
                premium sheesha experience, or simply have a question, get in
                touch with our team.
              </p>
            </div>

            <div className="contact-grid">
              {/* LEFT INFO */}
              <div className="contact-info">
                <div className="info-card featured">
                  <div className="info-icon">
                    <Mail className="w-5 h-5" />
                  </div>

                  <div>
                    <span>Email</span>
                    <a href="mailto:hello@sheeshatonight.com">
                      hello@sheeshatonight.com
                    </a>
                    <p>For general enquiries and support.</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <Phone className="w-5 h-5" />
                  </div>

                  <div>
                    <span>Phone</span>
                    <a href="tel:+971509121111">
                      +971 50 912 1111
                    </a>
                    <p>Speak directly with our support team.</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">⌖</div>

                  <div>
                    <span>Service Area</span>
                    <strong>United Arab Emirates</strong>
                    <p>
                      Serving Dubai and locations across the UAE.
                    </p>
                  </div>
                </div>

                <div className="support-box">
                  <div>
                    <small>NEED QUICK HELP?</small>
                    <h3>Looking for your next experience?</h3>
                    <p>
                      Explore premium rentals and experiences from verified
                      vendors.
                    </p>
                  </div>

                  <Link href="/rentals" className="support-button">
                    Explore Rentals
                    <span>→</span>
                  </Link>
                </div>
              </div>

              {/* FORM */}
              <div className="form-card" id="contact-form">
                {!submitted ? (
                  <>
                    <div className="form-header">
                      <span className="eyebrow purple">SEND US A MESSAGE</span>

                      <h2>How can we help?</h2>

                      <p>
                        Fill in the form below and our team will get back to you.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                      <div className="form-row">
                        <div className="field">
                          <label htmlFor="firstName">First Name</label>
                          <input
                            id="firstName"
                            name="firstName"
                            type="text"
                            placeholder="Your first name"
                            required
                          />
                        </div>

                        <div className="field">
                          <label htmlFor="lastName">Last Name</label>
                          <input
                            id="lastName"
                            name="lastName"
                            type="text"
                            placeholder="Your last name"
                            required
                          />
                        </div>
                      </div>

                      <div className="field">
                        <label htmlFor="email">Email Address</label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          required
                        />
                      </div>

                      <div className="field">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+971 50 000 0000"
                        />
                      </div>

                      <div className="field">
                        <label htmlFor="subject">Subject</label>

                        <select
                          id="subject"
                          name="subject"
                          defaultValue=""
                          required
                        >
                          <option value="" disabled>
                            Select a subject
                          </option>
                          <option value="order">Order Support</option>
                          <option value="rental">Rental Enquiry</option>
                          <option value="experience">
                            Experience Enquiry
                          </option>
                          <option value="vendor">Vendor Enquiry</option>
                          <option value="general">General Enquiry</option>
                        </select>
                      </div>

                      <div className="field">
                        <label htmlFor="message">Message</label>

                        <textarea
                          id="message"
                          name="message"
                          rows={6}
                          placeholder="Tell us how we can help..."
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="submit-button"
                        disabled={loading}
                      >
                        {loading ? "Sending..." : "Send Message"}
                        {!loading && <span>→</span>}
                      </button>

                      <p className="form-note">
                        We respect your privacy and only use your information to
                        respond to your enquiry.
                      </p>
                    </form>
                  </>
                ) : (
                  <div className="success-state">
                    <div className="success-icon">
                      <Check className="w-8 h-8 text-emerald-600" />
                    </div>

                    <span className="eyebrow purple">MESSAGE SENT</span>

                    <h2>Thank you for reaching out.</h2>

                    <p>
                      Your message has been received. Our team will get back to
                      you as soon as possible.
                    </p>

                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                    >
                      Send Another Message
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ CTA */}
        <section className="faq-cta">
          <div className="container faq-inner">
            <div>
              <span className="eyebrow">NEED ANSWERS?</span>

              <h2>
                Find answers to
                <br />
                <span>common questions.</span>
              </h2>
            </div>

            <Link href="/faq" className="dark-button">
              Visit FAQ
              <span>→</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        .container {
          max-width: 1440px;
          width: 100%;
          margin: 0 auto;
          padding: 0 44px;
          box-sizing: border-box;
        }

        @media (max-width: 768px) {
          .container {
            padding: 0 20px;
          }
        }

        /* HERO */

        .contact-hero {
          position: relative;
          min-height: 540px;
          display: flex;
          align-items: center;
          overflow: hidden;

          background:
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.98) 0%,
              rgba(255, 255, 255, 0.94) 42%,
              rgba(255, 255, 255, 0.2) 78%,
              rgba(255, 255, 255, 0) 100%
            ),
            url("/images/contact-hero.jpg") center / cover no-repeat;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          padding: 56px 0;
        }

        .eyebrow {
          display: inline-block;
          margin-bottom: 16px;
          color: #571275;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.18em;
        }

        .contact-hero .eyebrow {
          color: #74189b;
        }

        .contact-hero h1 {
          max-width: 650px;
          margin: 0;
          color: #251f27;
          font-size: clamp(48px, 6vw, 78px);
          line-height: 0.98;
          letter-spacing: -0.055em;
        }

        .contact-hero h1 span {
          color: #74189b;
        }

        .contact-hero p {
          max-width: 560px;
          margin: 26px 0 32px;
          color: #665f68;
          font-size: 18px;
          line-height: 1.7;
        }

        .hero-links {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .hero-links a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          padding: 0 25px;
          border-radius: 10px;
          background: #74189b;
          color: white;
          font-size: 14px;
          font-weight: 700;
          transition: 0.2s ease;
        }

        .hero-links a:hover {
          background: #571275;
          transform: translateY(-1px);
        }

        .hero-links .outline-link {
          background: white;
          color: #74189b;
          border: 1px solid #dfd4e4;
        }

        /* CONTACT */

        .contact-section {
          padding: 56px 0;
          background: #fff;
        }

        .section-heading {
          max-width: 650px;
          margin-bottom: 55px;
        }

        .section-heading h2 {
          margin: 0;
          color: #28222a;
          font-size: clamp(38px, 4vw, 54px);
          line-height: 1.05;
          letter-spacing: -0.04em;
        }

        .section-heading h2 span {
          color: #74189b;
        }

        .section-heading p {
          max-width: 590px;
          margin: 20px 0 0;
          color: #706972;
          font-size: 16px;
          line-height: 1.8;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          gap: 70px;
          align-items: start;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .info-card {
          display: flex;
          gap: 18px;
          padding: 23px;
          border: 1px solid #ece7ee;
          border-radius: 15px;
          background: #fff;
          transition: 0.2s ease;
        }

        .info-card:hover {
          border-color: #d8c6df;
          box-shadow: 0 12px 30px rgba(87, 18, 117, 0.06);
        }

        .info-card.featured {
          background: #faf6fc;
          border-color: #eadcf0;
        }

        .info-icon {
          width: 46px;
          height: 46px;
          flex: 0 0 46px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #f0e4f5;
          color: #74189b;
          font-size: 20px;
        }

        .info-card span {
          display: block;
          margin-bottom: 6px;
          color: #8b838e;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .info-card a,
        .info-card strong {
          display: block;
          color: #2c252e;
          font-size: 16px;
          font-weight: 750;
        }

        .info-card a:hover {
          color: #74189b;
        }

        .info-card p {
          margin: 7px 0 0;
          color: #817983;
          font-size: 13px;
          line-height: 1.5;
        }

        .support-box {
          margin-top: 12px;
          padding: 28px;
          border-radius: 16px;
          background: #74189b;
          color: white;
        }

        .support-box small {
          color: #f4c965;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.16em;
        }

        .support-box h3 {
          margin: 12px 0 8px;
          font-size: 22px;
          line-height: 1.2;
        }

        .support-box p {
          margin: 0 0 22px;
          color: rgba(255, 255, 255, 0.78);
          font-size: 13px;
          line-height: 1.6;
        }

        .support-button {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          padding: 12px 17px;
          border-radius: 9px;
          background: white;
          color: #74189b;
          font-size: 13px;
          font-weight: 800;
        }

        /* FORM */

        .form-card {
          padding: 42px;
          border: 1px solid #e9e3eb;
          border-radius: 20px;
          background: #fff;
          box-shadow: 0 20px 55px rgba(40, 25, 45, 0.06);
        }

        .form-header {
          margin-bottom: 32px;
        }

        .form-header h2 {
          margin: 0;
          color: #28222a;
          font-size: 30px;
          letter-spacing: -0.03em;
        }

        .form-header p {
          margin: 9px 0 0;
          color: #817983;
          font-size: 14px;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 19px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field label {
          color: #3a333c;
          font-size: 12px;
          font-weight: 750;
        }

        .field input,
        .field select,
        .field textarea {
          width: 100%;
          border: 1px solid #ddd6e0;
          outline: none;
          border-radius: 9px;
          background: #fff;
          color: #302a32;
          padding: 14px 15px;
          font-size: 14px;
          transition: 0.2s ease;
        }

        .field textarea {
          min-height: 145px;
          resize: vertical;
        }

        .field input::placeholder,
        .field textarea::placeholder {
          color: #aaa3ac;
        }

        .field input:focus,
        .field select:focus,
        .field textarea:focus {
          border-color: #74189b;
          box-shadow: 0 0 0 3px rgba(116, 24, 155, 0.08);
        }

        .submit-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          width: 100%;
          min-height: 55px;
          margin-top: 5px;
          border: 0;
          border-radius: 10px;
          background: #74189b;
          color: white;
          cursor: pointer;
          font-size: 14px;
          font-weight: 800;
          transition: 0.2s ease;
        }

        .submit-button:hover:not(:disabled) {
          background: #571275;
          transform: translateY(-1px);
        }

        .submit-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .form-note {
          margin: 0;
          color: #98919a;
          text-align: center;
          font-size: 11px;
          line-height: 1.6;
        }

        /* SUCCESS */

        .success-state {
          min-height: 540px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .success-icon {
          width: 64px;
          height: 64px;
          display: grid;
          place-items: center;
          margin-bottom: 25px;
          border-radius: 50%;
          background: #f1e6f5;
          color: #74189b;
          font-size: 28px;
          font-weight: 800;
        }

        .success-state h2 {
          max-width: 450px;
          margin: 0;
          color: #29232b;
          font-size: 34px;
          line-height: 1.1;
        }

        .success-state p {
          max-width: 480px;
          margin: 15px 0 25px;
          color: #7c747e;
          font-size: 14px;
          line-height: 1.7;
        }

        .success-state button {
          min-height: 48px;
          padding: 0 20px;
          border: 1px solid #d9c9df;
          border-radius: 9px;
          background: white;
          color: #74189b;
          cursor: pointer;
          font-size: 13px;
          font-weight: 750;
        }

        /* FAQ CTA */

        .faq-cta {
          padding: 44px 0;
          background: #faf7fb;
          border-top: 1px solid #eee7f0;
        }

        .faq-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
        }

        .faq-inner .eyebrow {
          color: #74189b;
        }

        .faq-inner h2 {
          margin: 0;
          color: #29232b;
          font-size: clamp(32px, 4vw, 48px);
          line-height: 1.05;
          letter-spacing: -0.04em;
        }

        .faq-inner h2 span {
          color: #74189b;
        }

        .dark-button {
          display: inline-flex;
          align-items: center;
          gap: 18px;
          min-height: 53px;
          padding: 0 24px;
          border-radius: 9px;
          background: #571275;
          color: white;
          font-size: 13px;
          font-weight: 800;
          white-space: nowrap;
        }

        .dark-button:hover {
          background: #74189b;
        }

        /* RESPONSIVE */

        @media (max-width: 1050px) {
          .container {
            padding: 0 24px;
          }

          .contact-grid {
            grid-template-columns: 1fr;
            gap: 45px;
          }

          .contact-hero {
            min-height: 500px;
            background:
              linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.97),
                rgba(255, 255, 255, 0.78)
              ),
              url("/images/contact-hero.jpg") center / cover no-repeat;
          }

          .form-card {
            padding: 32px;
          }
        }

        @media (max-width: 640px) {
          .container {
            padding: 0 16px;
          }

          .contact-hero {
            min-height: 380px;
          }

          .hero-content {
            padding: 44px 0;
          }

          .contact-hero h1 {
            font-size: 49px;
          }

          .contact-hero p {
            font-size: 15px;
          }

          .hero-links {
            flex-direction: column;
            align-items: stretch;
          }

          .hero-links a {
            width: 100%;
          }

          .contact-section {
            padding: 44px 0;
          }

          .section-heading {
            margin-bottom: 38px;
          }

          .section-heading h2 {
            font-size: 38px;
          }

          .form-card {
            padding: 24px 18px;
            border-radius: 15px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .faq-cta {
            padding: 60px 0;
          }

          .faq-inner {
            flex-direction: column;
            align-items: flex-start;
          }

          .dark-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}
