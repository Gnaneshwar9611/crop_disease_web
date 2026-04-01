"use client";

import { useEffect, useState } from "react";
import DiseasePredictor from "@/components/DiseasePredictor";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* HEADER */}
      <header className={`site-header ${scrolled ? "scrolled" : ""}`} id="site-header">
        <div className="header-inner">
          <a href="#" className="logo" aria-label="AgriScan home">
            <span className="logo-icon" aria-hidden="true">🌿</span>
            <div className="logo-text">
              <span className="logo-title">Crop Saver</span>
              <span className="logo-sub">Crop Disease Prediction</span>
            </div>
          </a>
          <nav className="header-nav" aria-label="Main navigation">
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#predictor" className="nav-link">Predict</a>
            <a href="#crops" className="nav-link">Crops</a>
          </nav>
          <button
            className="nav-cta-btn"
            onClick={() => document.getElementById("predictor")?.scrollIntoView({ behavior: "smooth" })}
          >
            Start Predicting
          </button>
          <button
            className={`hamburger ${menuOpen ? "open" : ""}`}
            id="hamburger"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
        {/* Mobile Menu */}
        <div className={`mobile-menu ${menuOpen ? "open" : ""}`} id="mobileMenu" aria-hidden={!menuOpen}>
          <a href="#how-it-works" className="mobile-link" onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href="#predictor" className="mobile-link" onClick={() => setMenuOpen(false)}>Predict</a>
          <a href="#crops" className="mobile-link" onClick={() => setMenuOpen(false)}>Crops</a>
        </div>
      </header>

      {/* HERO */}
      <section className="hero" aria-label="Hero section">
        <div className="hero-content">
          <span className="hero-badge" aria-label="AI Powered">🌾 AI-Powered Diagnosis</span>
          <h1 className="hero-title">
            Detect Crop Diseases<br />
            <span className="accent">Instantly & Accurately</span>
          </h1>
          <p className="hero-desc">
            Upload a leaf photo, select your crop, and receive a precise disease diagnosis powered by deep learning — in seconds. Protect your harvest before it&apos;s too late.
          </p>
          <div className="hero-actions">
            <a href="#predictor" className="btn-primary hero-cta">
              <span>Start Predicting</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </a>
            <a href="#how-it-works" className="btn-ghost">Learn How It Works</a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-num">4</span>
              <span className="stat-label">Crops Supported</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="stat-num">AI</span>
              <span className="stat-label">Deep Learning</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="stat-num">Fast</span>
              <span className="stat-label">Instant Results</span>
            </div>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-orb"></div>
          <div className="hero-card-stack">
            <div className="floating-card fc1">
              <span className="fc-icon">🌾</span>
              <span className="fc-label">Paddy</span>
            </div>
            <div className="floating-card fc2">
              <span className="fc-icon">🌶️</span>
              <span className="fc-label">Chilli</span>
            </div>
            <div className="floating-card fc3">
              <span className="fc-icon">🌿</span>
              <span className="fc-label">Finger Millet</span>
            </div>
            <div className="floating-card fc4">
              <span className="fc-icon">🎋</span>
              <span className="fc-label">Sugarcane</span>
            </div>
            <div className="hero-badge-center">
              <span className="badge-num">4</span>
              <span className="badge-txt">Crops<br />Supported</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works" id="how-it-works" aria-labelledby="hiw-heading">
        <div className="section-header">
          <div className="section-tag">Process</div>
          <h2 id="hiw-heading">How It Works</h2>
          <p>Three simple steps to get your crop diagnosis</p>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num" aria-hidden="true">01</div>
            <div className="step-icon" aria-hidden="true">🌱</div>
            <h3>Select Your Crop</h3>
            <p>Choose the affected crop from our list of supported varieties — Paddy, Chilli, Finger Millet, or Sugarcane.</p>
          </div>
          <div className="step-card">
            <div className="step-num" aria-hidden="true">02</div>
            <div className="step-icon" aria-hidden="true">📷</div>
            <h3>Upload a Leaf Image</h3>
            <p>Take a clear, close-up photo of the affected leaf or plant part. Upload JPG, PNG, or WebP — up to 10 MB.</p>
          </div>
          <div className="step-card">
            <div className="step-num" aria-hidden="true">03</div>
            <div className="step-icon" aria-hidden="true">🔬</div>
            <h3>Get Your Diagnosis</h3>
            <p>Our deep learning model instantly identifies the disease and returns a result with a confidence score.</p>
          </div>
        </div>
      </section>

      {/* PREDICTOR COMPONENT */}
      <DiseasePredictor />

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span aria-hidden="true">🌿</span>
            <span className="footer-brand-name">Crop Saver</span>
          </div>
          <p className="footer-copy">
            &copy; 2026 Crop Saver &mdash; Built for smarter, healthier farming.
          </p>
          <div className="footer-links">
            <a href="#how-it-works" className="footer-link">How It Works</a>
            <a href="#predictor" className="footer-link">Predict</a>
            <a href="#crops" className="footer-link">Crops</a>
          </div>
        </div>
      </footer>
    </>
  );
}
