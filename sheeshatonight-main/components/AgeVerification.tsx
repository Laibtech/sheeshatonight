'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ArrowRight,
  X,
  Lock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function AgeVerification() {
  const [showModal, setShowModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [step, setStep] = useState<'prompt' | 'verified' | 'rejected'>('prompt');

  useEffect(() => {
    // Check url param to force preview: ?ageCheck=true
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('ageCheck') === 'true') {
        setShowModal(true);
        return;
      }
    }

    const verified = localStorage.getItem('ageVerified');
    if (verified === 'true') {
      setIsVerified(true);
    } else {
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleVerify = (isAdult: boolean) => {
    if (isAdult) {
      localStorage.setItem('ageVerified', 'true');
      setStep('verified');
      setTimeout(() => {
        setIsVerified(true);
        setShowModal(false);
      }, 700);
    } else {
      setStep('rejected');
      setTimeout(() => {
        window.location.href = 'https://www.google.com';
      }, 2000);
    }
  };

  if (isVerified && !showModal) return null;

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          className="age-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="age-card"
            key={step}
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 10 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
            }}
          >
            {/* ========================================================
                1. VERIFIED STATE (Subtle Professional Confirmation)
               ======================================================== */}
            {step === 'verified' && (
              <div className="state-container">
                <div className="icon-seal verified-seal">
                  <CheckCircle2 size={40} className="seal-icon-verified" />
                </div>
                <h3 className="state-title">Age Verified</h3>
                <p className="state-desc">
                  Welcome to SheeshaTonight. Entering store...
                </p>
              </div>
            )}

            {/* ========================================================
                2. REJECTED STATE (Under 18)
               ======================================================== */}
            {step === 'rejected' && (
              <div className="state-container">
                <div className="icon-seal rejected-seal">
                  <Lock size={38} className="seal-icon-rejected" />
                </div>
                <h3 className="state-title">Access Restricted</h3>
                <p className="state-desc">
                  You must be 18 years of age or older to enter this platform.
                  <br />
                  Redirecting...
                </p>
              </div>
            )}

            {/* ========================================================
                3. PROFESSIONAL PROMPT STATE
               ======================================================== */}
            {step === 'prompt' && (
              <>
                {/* Luxury Seal Emblem */}
                <div className="emblem-wrapper">
                  <div className="emblem-outer-ring" />
                  <div className="emblem-inner-box">
                    <span className="emblem-number">18+</span>
                  </div>
                </div>

                {/* Top Compliance Pill */}
                <div className="compliance-badge">
                  <ShieldCheck size={13} className="text-[#F1A51D]" />
                  <span>UAE LEGAL AGE VERIFICATION</span>
                </div>

                {/* Title & Description */}
                <h2 className="modal-title">Age Verification Required</h2>
                <p className="modal-subtitle">
                  You must be <strong>18 years of age or older</strong> to enter SheeshaTonight in accordance with UAE Tobacco Regulations.
                </p>

                {/* Formal Legal Notice Box */}
                <div className="legal-notice">
                  <AlertCircle size={15} className="legal-icon shrink-0" />
                  <span>
                    This website contains licensed tobacco blends and luxury sheesha apparatus.
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="button-group">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleVerify(true)}
                  >
                    <span>I Am 18 Or Older — Enter</span>
                    <ArrowRight size={16} />
                  </button>

                  <button
                    className="btn btn-secondary"
                    onClick={() => handleVerify(false)}
                  >
                    <X size={15} />
                    <span>I Am Under 18 — Exit</span>
                  </button>
                </div>

                {/* Footer Note */}
                <p className="footer-notice">
                  By entering, you confirm you are of legal smoking age. Please enjoy responsibly.
                </p>
              </>
            )}
          </motion.div>

          <style jsx global>{`
            .age-overlay {
              position: fixed;
              inset: 0;
              z-index: 99999;
              background: rgba(10, 6, 18, 0.78);
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }

            .age-card {
              position: relative;
              background: #ffffff;
              border-radius: 20px;
              padding: 36px 32px 28px;
              max-width: 440px;
              width: 100%;
              text-align: center;
              box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.4),
                0 0 0 1px rgba(116, 24, 155, 0.1);
              overflow: hidden;
            }

            /* Luxury Seal Emblem */
            .emblem-wrapper {
              position: relative;
              width: 72px;
              height: 72px;
              margin: 0 auto 16px;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .emblem-outer-ring {
              position: absolute;
              inset: 0;
              border-radius: 50%;
              border: 1.5px dashed #F1A51D;
              opacity: 0.65;
            }

            .emblem-inner-box {
              width: 58px;
              height: 58px;
              border-radius: 50%;
              background: linear-gradient(135deg, #571275 0%, #74189B 100%);
              border: 2px solid #F1A51D;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 8px 22px rgba(87, 18, 117, 0.35);
            }

            .emblem-number {
              color: #ffffff;
              font-size: 19px;
              font-weight: 800;
              letter-spacing: -0.5px;
              font-family: inherit;
            }

            /* Top Compliance Pill */
            .compliance-badge {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              background: #faf7fc;
              border: 1px solid #ebdfee;
              color: #571275;
              font-size: 10.5px;
              font-weight: 800;
              letter-spacing: 0.8px;
              padding: 4px 12px;
              border-radius: 20px;
              margin-bottom: 14px;
              text-transform: uppercase;
            }

            /* Modal Typography */
            .modal-title {
              font-size: 22px;
              font-weight: 800;
              color: #1e132b;
              margin: 0 0 8px;
              letter-spacing: -0.4px;
            }

            .modal-subtitle {
              font-size: 13.5px;
              color: #645b70;
              line-height: 1.55;
              margin: 0 0 18px;
            }

            .modal-subtitle strong {
              color: #1e132b;
              font-weight: 700;
            }

            /* Formal Notice Box */
            .legal-notice {
              background: #fdfaf6;
              border: 1px solid #fae8ce;
              border-radius: 10px;
              padding: 10px 14px;
              display: flex;
              align-items: flex-start;
              gap: 9px;
              text-align: left;
              margin-bottom: 22px;
              font-size: 12px;
              color: #78350f;
              line-height: 1.45;
            }

            .legal-icon {
              color: #d97706;
              margin-top: 1px;
            }

            /* Action Buttons */
            .button-group {
              display: flex;
              flex-direction: column;
              gap: 10px;
              margin-bottom: 16px;
            }

            .btn {
              width: 100%;
              height: 46px;
              border-radius: 12px;
              font-size: 13.5px;
              font-weight: 700;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              letter-spacing: 0.2px;
              transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
              border: none;
            }

            .btn-primary {
              background: linear-gradient(135deg, #571275 0%, #74189B 100%);
              color: #ffffff;
              box-shadow: 0 6px 18px rgba(116, 24, 155, 0.3);
            }

            .btn-primary:hover {
              background: linear-gradient(135deg, #440d5c 0%, #5e117f 100%);
              transform: translateY(-1px);
              box-shadow: 0 8px 22px rgba(116, 24, 155, 0.4);
            }

            .btn-secondary {
              background: #ffffff;
              color: #645b70;
              border: 1.5px solid #e7dfeb;
            }

            .btn-secondary:hover {
              background: #fbf9fc;
              color: #1e132b;
              border-color: #cbbed1;
            }

            /* Footer Notice */
            .footer-notice {
              font-size: 11px;
              color: #8f8599;
              margin: 0;
              line-height: 1.4;
            }

            /* State Container */
            .state-container {
              padding: 20px 10px;
            }

            .icon-seal {
              width: 68px;
              height: 68px;
              border-radius: 50%;
              margin: 0 auto 16px;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .verified-seal {
              background: #f0fdf4;
              border: 2px solid #bbf7d0;
            }

            .seal-icon-verified {
              color: #16a34a;
            }

            .rejected-seal {
              background: #fef2f2;
              border: 2px solid #fecaca;
            }

            .seal-icon-rejected {
              color: #dc2626;
            }

            .state-title {
              font-size: 20px;
              font-weight: 800;
              color: #1e132b;
              margin-bottom: 6px;
            }

            .state-desc {
              font-size: 13px;
              color: #645b70;
              line-height: 1.5;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
