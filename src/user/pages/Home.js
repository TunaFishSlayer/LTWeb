import React from "react";
import { FaArrowRight, FaShieldAlt, FaTruck, FaHeadphones, FaStar } from "react-icons/fa";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import CartSidebar from "../components/CartSidebar";
import { laptops } from "../lib/laptop";
import "../styles/Home.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const featuredLaptops = laptops.filter((laptop) => laptop.featured);

  return (
    <div className="home-page">
      <Header />
      <CartSidebar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-text">
            <div className="badge">New Arrivals Available</div>
            <h1>
              Find Your Perfect{" "}
              <span className="gradient-text">Laptop</span>
            </h1>
            <p>
              Discover premium laptops from top brands. Whether for work,
              gaming, or creativity, we have the perfect device for your
              needs.
            </p>
            <div className="hero-buttons">
              <button
                className="btn-view"
                onClick={() => navigate("/products")}
              >
                Shop Now <FaArrowRight size={16} />
              </button>
              <button className="btn-outline">Learn More</button>
            </div>
            <div className="hero-stats">
              <div>
                <FaStar className="star" /> 4.8/5 Customer Rating
              </div>
              <div>
                <strong>10,000+</strong> Happy Customers
              </div>
            </div>
          </div>

          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop"
              alt="Premium Laptop"
            />
            <div className="price-box">
              <div>Starting from</div>
              <strong>$999</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="feature">
          <FaShieldAlt className="icon blue" />
          <h3>2-Year Warranty</h3>
          <p>
            Comprehensive warranty coverage on all laptops with free repairs
            and replacements.
          </p>
        </div>
        <div className="feature">
          <FaTruck className="icon green" />
          <h3>Free Shipping</h3>
          <p>
            Fast and secure delivery to your doorstep with tracking and
            insurance included.
          </p>
        </div>
        <div className="feature">
          <FaHeadphones className="icon purple" />
          <h3>24/7 Support</h3>
          <p>
            Expert technical support available round the clock to help with
            any questions.
          </p>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured">
        <h2>Featured Laptops</h2>
        <p>
          Handpicked selection of our most popular and highest-rated
          laptops, perfect for any use case.
        </p>

        <div className="product-grid">
          {featuredLaptops.map((laptop) => (
            <ProductCard key={laptop.id} laptop={laptop} />
          ))}
        </div>

        <div className="center">
          <button
            className="btn-view"
            onClick={() => navigate("/products")}
          >
            View All Products <FaArrowRight size={16} />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
