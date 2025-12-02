import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductGrid from "../components/ProductGrid";
import CartSidebar from "../components/CartSidebar";
import "../styles/Products.css";

export default function Products() {
  const navigate = useNavigate();

  return (
    <div className="products-container">
      <Header />
      <CartSidebar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Our{" "}
            <span className="gradient-text">Products</span>
          </h1>
          <p className="hero-subtitle">
            Discover our carefully curated selection of premium laptops from the world's leading brands.
          </p>
          <button 
            className="compare-button"
            onClick={() => navigate("/compare")}
          >
            Compare Products
          </button>
        </div>
      </section>

      <ProductGrid />
      <Footer />
    </div>
  );
}
