import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, ShoppingCart, Lock, Plus, Minus } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartSidebar from "../components/CartSidebar";
import { useCartStore } from "../lib/cart";
import { useAuthStore } from "../lib/auth";
import { laptops } from "../lib/laptop";
import "../styles/ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [quantity, setQuantity] = React.useState(1);

  const laptop = laptops.find((l) => l.id === id);

  if (!laptop) {
    return (
      <div className="product-detail-container">
        <Header />
        <CartSidebar />
        <div className="not-found">
          <h2>Product Not Found</h2>
          <p>The product you're looking for doesn't exist.</p>
          <button onClick={() => navigate("/products")}>Back to Products</button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addItem(laptop);
    }
  };

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  return (
    <div className="product-detail-container">
      <Header />
      <CartSidebar />

      <div className="product-detail-content">
        <button className="back-button" onClick={() => navigate("/products")}>
          <ArrowLeft size={20} />
          Back to Products
        </button>

        <div className="product-detail-grid">
          {/* Product Image */}
          <div className="product-image-section">
            <div className="main-image">
              <img src={laptop.image} alt={laptop.name} />
              {!laptop.inStock && <div className="out-of-stock-overlay">Out of Stock</div>}
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info-section">
            <div className="product-header">
              <span className="product-brand">{laptop.brand}</span>
              <div className="product-rating">
                <Star size={20} fill="#facc15" color="#facc15" />
                <span>{laptop.rating} ({laptop.reviews} reviews)</span>
              </div>
            </div>

            <h1 className="product-title">{laptop.name}</h1>

            <div className="product-price">
              <span className="current-price">${laptop.price.toLocaleString()}</span>
              {laptop.originalPrice && (
                <span className="original-price">${laptop.originalPrice.toLocaleString()}</span>
              )}
              {laptop.originalPrice && (
                <span className="savings">
                  Save ${laptop.originalPrice - laptop.price}
                </span>
              )}
            </div>

            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button onClick={decreaseQuantity} disabled={quantity <= 1}>
                  <Minus size={16} />
                </button>
                <span>{quantity}</span>
                <button onClick={increaseQuantity}>
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!laptop.inStock}
              className={
                !isAuthenticated
                  ? "add-to-cart-btn outline"
                  : laptop.inStock
                  ? "add-to-cart-btn primary"
                  : "add-to-cart-btn disabled"
              }
            >
              {!isAuthenticated ? (
                <>
                  <Lock size={20} />
                  Sign In to Purchase
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  {laptop.inStock ? "Add to Cart" : "Out of Stock"}
                </>
              )}
            </button>
          </div>

          {/* Product Specifications */}
          <div className="product-specs-section">
            <h2>Specifications</h2>
            <div className="specs-grid">
              <div className="spec-item">
                <span className="spec-label">Processor</span>
                <span className="spec-value">{laptop.specs.processor}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Memory</span>
                <span className="spec-value">{laptop.specs.ram}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Storage</span>
                <span className="spec-value">{laptop.specs.storage}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Graphics</span>
                <span className="spec-value">{laptop.specs.graphics}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Display</span>
                <span className="spec-value">{laptop.specs.display}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Compare Section */}
        <div className="compare-section">
          <h2>Compare with other products</h2>
          <button 
            className="compare-btn"
            onClick={() => navigate(`/compare?product1=${laptop.id}`)}
          >
            Choose Product to Compare
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
