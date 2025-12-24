import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartSidebar from "../components/CartSidebar";
import "../styles/AboutUs.css";

export default function AboutUs() {
  return (
    <div className="about-container">
      <Header />
      <CartSidebar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>
            About <span className="highlight">TopLap</span>
          </h1>
          <p>
            Your trusted partner in finding the perfect laptop for work, gaming, and everything in between.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="story-section">
        <div className="story-content">
          <div className="story-text">
            <h2>Our Story</h2>
            <p>
              Founded in 2020, TopLap began with a simple mission: to make premium laptops accessible to everyone.
              We recognized that choosing the right laptop could be overwhelming, with countless specifications and brands to consider.
            </p>
            <p>
              Our team of tech enthusiasts and industry experts curated a selection of the best laptops from leading manufacturers,
              ensuring that every device we sell meets our high standards for performance, reliability, and value.
            </p>
            <p>
              Today, we're proud to serve over 10,000 satisfied customers worldwide, offering not just products,
              but complete solutions backed by expert advice and exceptional customer service.
            </p>
          </div>
          <div className="story-image">
            <img
              src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop"
              alt="Our team"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="values-section">
        <h2>Our Values</h2>
        <div className="values-grid">
          <div className="value-card">
            <div className="icon blue">👥</div>
            <h3>Customer First</h3>
            <p>Every decision we make is centered around delivering the best experience for our customers.</p>
          </div>
          <div className="value-card">
            <div className="icon green">🏆</div>
            <h3>Quality Assurance</h3>
            <p>We rigorously test and verify every laptop to ensure it meets our premium quality standards.</p>
          </div>
          <div className="value-card">
            <div className="icon purple">🌍</div>
            <h3>Global Reach</h3>
            <p>Serving customers worldwide with fast shipping and localized support in multiple languages.</p>
          </div>
          <div className="value-card">
            <div className="icon red">❤️</div>
            <h3>Passion for Tech</h3>
            <p>Our team's genuine love for technology drives us to stay ahead of the latest innovations.</p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
