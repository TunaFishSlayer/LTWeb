import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Lock } from "lucide-react";
import { useCartStore } from "../../lib/cart";
import { useAuthStore } from "../../lib/auth";
import { useDiscountStore } from "../../lib/discount";
import { toast } from "sonner";
import "./ProductCard.css";

export default function ProductCard({ laptop }) {
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { fetchDiscounts, getDiscountForLaptop } = useDiscountStore();
  const navigate = useNavigate();
  const [discount, setDiscount] = useState(null);
  const [finalPrice, setFinalPrice] = useState(laptop.price);

  // Get discount for this laptop and calculate final price
  useEffect(() => {
    const setupDiscount = async () => {
      // Fetch discounts if needed (cached)
      await fetchDiscounts();
      
      // Get applicable discount for this laptop
      const applicableDiscount = getDiscountForLaptop(laptop._id || laptop.id);
      
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
        setDiscount(null);
        setFinalPrice(laptop.price);
      }
    };
    
    setupDiscount();
  }, [laptop, fetchDiscounts, getDiscountForLaptop]);

  const handleAddToCart = () => {
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
    addItem(laptopWithId);
    toast.success(`${laptop.name} added to cart!`);
  };

  return (
    <div className="product-card">
      {/* Ảnh sản phẩm */}
      <div className="product-image-container">
        <img
          src={laptop.image}
          alt={laptop.name}
          className="product-image"
          onClick={() => navigate(`/user/product/${laptop._id || laptop.id}`)}
        />
        {discount && (
          <div className="product-badge discount">
            {discount.type === 'percentage' ? (
              <>-{discount.value}%</>
            ) : (
              <>-${discount.value}</>
            )}
          </div>
        )}
        {laptop.stock === 0 && (
          <div className="product-badge out">Out of Stock</div>
        )}
      </div>

      {/* Nội dung */}
      <div className="product-content">
        <div className="product-header">
          <span className="product-brand">{laptop.brand}</span>
        </div>

        <h3
          className="product-title"
          onClick={() => navigate(`/user/product/${laptop._id || laptop.id}`)}
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
          <strong>${finalPrice.toLocaleString()}</strong>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={laptop.stock === 0}
          className={
            !isAuthenticated
              ? "product-btn outline"
              : laptop.stock > 0
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
              {laptop.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
