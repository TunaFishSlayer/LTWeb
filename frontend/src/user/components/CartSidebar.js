import React from 'react';
import { useCartStore } from '../../lib/cart';
import { useAuthStore } from '../../lib/auth';
import { useNavigate } from 'react-router-dom';
import './CartSidebar.css';

export default function CartSidebar() {
  const {
    items,
    isOpen,
    toggleCart,
    updateQuantity,
    removeItem,
    getTotalPrice,
    clearCart,
    initCart
  } = useCartStore();
  
  // Initialize cart only when sidebar is opened
  React.useEffect(() => {
    if (isOpen) {
      initCart();
    }
  }, [isOpen, initCart]);

  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const totalPrice = getTotalPrice();

  // Clear cart when user logs out
  React.useEffect(() => {
    if (!isAuthenticated && items.length > 0) {
      clearCart();
    }
  }, [isAuthenticated, items.length, clearCart]);

  // Check if any item in cart exceeds stock
  const hasStockIssue = items.some(item => {
    const stockQuantity = item.laptop.stock || 0;
    return item.quantity > stockQuantity;
  });

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check stock before checkout
    if (hasStockIssue) {
      alert('Some items in your cart exceed the available stock. Please reduce the quantity to proceed with the checkout.');
      return;
    }

    // Simply navigate to checkout - order will be created there
    toggleCart();
    navigate('/user/checkout');
  };

  if (!isOpen) return null; // nếu giỏ hàng chưa mở thì không hiển thị

  return (
    <div className="cart-overlay" onClick={toggleCart}>
      <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2> Shopping Cart ({items.length})</h2>
          <button className="close-btn" onClick={toggleCart}>
            ✕
          </button>
        </div>

        <div className="cart-body">
          {items.length === 0 ? (
            <div className="empty-cart">
              <p>Your cart is empty</p>
              <button onClick={toggleCart} className="outline-btn">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="cart-items-container">
              {items.map((item) => {
                const laptopId = item.laptop._id || item.laptop.id;
                return (
                  <div key={laptopId} className="cart-item">
                    <img
                      src={item.laptop.image}
                      alt={item.laptop.name}
                      className="item-img"
                    />
                    <div className="item-info">
                      <h4>{item.laptop.name}</h4>
                      <p>${item.laptop.price.toLocaleString()}</p>
                      <div className="item-controls">
                        <div className="quantity-controls">
                          <button
                            onClick={() =>
                              updateQuantity(laptopId, item.quantity - 1)
                            }
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(laptopId, item.quantity + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                      {item.quantity > (item.laptop.stock || 0) && (
                          <div className="stock-warning">
                            Unable to proceed due to stock overage
                          </div>
                        )}
                    </div>
                    <button
                      className="delete-btn"
                      onClick={() => removeItem(laptopId)}
                      title="Remove this item"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="total-section">
              <button className="outline-btn" onClick={clearCart}>
                Clear Cart
              </button>
              <div className="total">
                <p>Total:</p>
                <h3>${totalPrice.toLocaleString()}</h3>
              </div>
            </div>
            
            <button className="checkout-btn" onClick={handleCheckout}>
              {isAuthenticated ? 'Proceed to Checkout' : 'Sign In to Checkout'}
            </button>

            <button className="outline-btn" onClick={toggleCart}>
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
