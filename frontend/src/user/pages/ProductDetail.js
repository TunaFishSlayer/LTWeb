import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, ShoppingCart, Lock, Plus, Minus } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartSidebar from "../components/CartSidebar";
import { useCartStore } from '../../lib/cart';
import { useAuthStore } from '../../lib/auth';
import "../styles/ProductDetail.css";

const API_BASE = '/api';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [quantity, setQuantity] = useState(1);
  const [laptop, setLaptop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [discount, setDiscount] = useState(null);
  const [finalPrice, setFinalPrice] = useState(0);

  // Fetch single laptop and discount information
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch laptop details
        const [laptopRes, discountRes] = await Promise.all([
          fetch(`${API_BASE}/laptops/${id}`),
          fetch(`${API_BASE}/discounts/active`)
        ]);

        const laptopData = await laptopRes.json();
        const discountData = await discountRes.json();

        if (!laptopRes.ok || !laptopData.success) {
          throw new Error(laptopData.message || "Product not found");
        }

        const laptop = laptopData.data;
        setLaptop(laptop);

        // Find applicable discount
        if (discountData.success && discountData.data) {
          const applicableDiscount = discountData.data.find(d => {
            if (d.applicableTo === 'all') {
              return true;
            } else if (d.applicableTo === 'specific') {
              const productIds = d.productIds?.map(p => p._id || p.id || p) || [];
              return productIds.includes(laptop._id || laptop.id);
            }
            return false;
          });

          if (applicableDiscount) {
            setDiscount(applicableDiscount);
            
            // Calculate final price after discount
            let discountedPrice = laptop.price;
            if (applicableDiscount.type === 'percentage') {
              discountedPrice = laptop.price * (1 - applicableDiscount.value / 100);
              if (applicableDiscount.maxDiscount > 0) {
                const maxDiscountAmount = laptop.price * (applicableDiscount.maxDiscount / 100);
                const discountAmount = laptop.price - discountedPrice;
                if (discountAmount > maxDiscountAmount) {
                  discountedPrice = laptop.price - maxDiscountAmount;
                }
              }
            } else if (applicableDiscount.type === 'fixed') {
              discountedPrice = Math.max(0, laptop.price - applicableDiscount.value);
            }
            
            setFinalPrice(Math.round(discountedPrice * 100) / 100);
          } else {
            setFinalPrice(laptop.price);
          }
        } else {
          setFinalPrice(laptop.price);
        }
      } catch (err) {
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!laptop) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    // Ensure laptop has both _id and id for compatibility
    const laptopWithId = {
      ...laptop,
      id: laptop._id || laptop.id,
      _id: laptop._id || laptop.id
    };
    for (let i = 0; i < quantity; i++) {
      addItem(laptopWithId);
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

        {loading && (
          <div className="loading-state">
            <p>Loading product...</p>
          </div>
        )}

        {error && !loading && (
          <div className="not-found">
            <h2>Product Not Found</h2>
            <p>{error}</p>
            <button onClick={() => navigate("/products")}>Back to Products</button>
          </div>
        )}

        {!loading && !error && laptop && (
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
              {discount ? (
                <>
                  <span className="current-price">${finalPrice.toLocaleString()}</span>
                  <span className="original-price">${laptop.price.toLocaleString()}</span>
                  <span className="savings">
                    {discount.type === 'percentage' ? (
                      `-${discount.value}%`
                    ) : (
                      `-$${discount.value}`
                    )}
                  </span>
                </>
              ) : (
                <span className="current-price">${laptop.price.toLocaleString()}</span>
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
        )}

        {/* Compare Section */}
        <div className="compare-section">
          <h2>Compare with other products</h2>
          <button 
            className="compare-btn"
            onClick={() => laptop && navigate(`/compare?product1=${laptop._id || laptop.id}`)}
          >
            Choose Product to Compare
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
