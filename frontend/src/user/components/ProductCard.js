import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Lock } from "lucide-react";
import { useCartStore } from "../../lib/cart";
import { useAuthStore } from "../../lib/auth";
import { toast } from "sonner";
import "./ProductCard.css";

const API_BASE = '/api';

export default function ProductCard({ laptop }) {
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [discount, setDiscount] = useState(null);
  const [finalPrice, setFinalPrice] = useState(laptop.price);

  // Fetch active discounts and calculate final price
  useEffect(() => {
    const fetchDiscount = async () => {
      try {
        // Fetch active discounts from public endpoint
        const response = await fetch(`${API_BASE}/discounts/active`);
        const data = await response.json();
        
        if (data.success && data.data) {
          const laptopId = laptop._id || laptop.id;
          
          // Find applicable discounts for this laptop
          const applicableDiscounts = data.data.filter(d => {
            if (d.applicableTo === 'all') {
              return true;
            } else if (d.applicableTo === 'specific') {
              const productIds = d.productIds?.map(p => p._id || p.id || p) || [];
              return productIds.includes(laptopId);
            }
            return false;
          });
          
          // Get the latest discount (most recently created/updated)
          let latestDiscount = null;
          if (applicableDiscounts.length > 0) {
            // Sort by createdAt or updatedAt date, fallback to id if no dates available
            latestDiscount = applicableDiscounts.sort((a, b) => {
              const dateA = new Date(a.updatedAt || a.createdAt || 0);
              const dateB = new Date(b.updatedAt || b.createdAt || 0);
              return dateB - dateA; // Sort descending (newest first)
            })[0];
          }
          
          if (latestDiscount) {
            setDiscount(latestDiscount);
            
            // Calculate final price after discount
            let discountedPrice = laptop.price;
            if (latestDiscount.type === 'percentage') {
              discountedPrice = laptop.price * (1 - latestDiscount.value / 100);
              if (latestDiscount.maxDiscount > 0) {
                const maxDiscountAmount = laptop.price * (latestDiscount.maxDiscount / 100);
                const discountAmount = laptop.price - discountedPrice;
                if (discountAmount > maxDiscountAmount) {
                  discountedPrice = laptop.price - maxDiscountAmount;
                }
              }
            } else if (latestDiscount.type === 'fixed') {
              discountedPrice = Math.max(0, laptop.price - latestDiscount.value);
            }
            
            setFinalPrice(Math.round(discountedPrice * 100) / 100);
          }
        }
      } catch (error) {
        // Silently fail - discounts are optional
        console.error('Error fetching discounts:', error);
      }
    };
    
    fetchDiscount();
  }, [laptop]);

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
        {!laptop.inStock && (
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
