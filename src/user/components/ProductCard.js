import React from "react";
import { useNavigate } from "react-router-dom";
import { Star, ShoppingCart, Lock } from "lucide-react";
import { useCartStore } from "../lib/cart";
import { useAuthStore } from "../lib/auth";
import "./ProductCard.css"; // import CSS thuần

export default function ProductCard({ laptop }) {
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    addItem(laptop);
  };

  return (
    <div className="product-card">
      {/* Ảnh sản phẩm */}
      <div className="product-image-container">
        <img
          src={laptop.image}
          alt={laptop.name}
          className="product-image"
          onClick={() => navigate(`/products/${laptop.id}`)}
        />
        {laptop.originalPrice && (
          <div className="product-badge">
            Save ${laptop.originalPrice - laptop.price}
          </div>
        )}
        {!laptop.inStock && (
          <div className="product-badge out">Out of Stock</div>
        )}
      </div>

      {/* Nội dung */}
      <div className="product-content">
        <div className="product-header">
          <span className="product-brand">{laptop.brand}</span>
          <div className="product-rating">
            <Star size={16} fill="#facc15" color="#facc15" />
            <span>
              {laptop.rating} ({laptop.reviews})
            </span>
          </div>
        </div>

        <h3
          className="product-title"
          onClick={() => navigate(`/products/${laptop.id}`)}
        >
          {laptop.name}
        </h3>

        <div className="product-specs">
          <div>{laptop.specs.processor}</div>
          <div>
            {laptop.specs.ram} • {laptop.specs.storage}
          </div>
          <div>{laptop.specs.display}</div>
        </div>
      </div>

      {/* Footer */}
      <div className="product-footer">
        <div className="product-price">
          <strong>${laptop.price.toLocaleString()}</strong>
          {laptop.originalPrice && (
            <del>${laptop.originalPrice.toLocaleString()}</del>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!laptop.inStock}
          className={
            !isAuthenticated
              ? "product-btn outline"
              : laptop.inStock
              ? "product-btn default"
              : "product-btn disabled"
          }
        >
          {!isAuthenticated ? (
            <>
              <Lock size={16} className="icon-l" /> Sign In to Purchase
            </>
          ) : (
            <>
              <ShoppingCart size={16} className="icon-l" />{" "}
              {laptop.inStock ? "Add to Cart" : "Out of Stock"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
