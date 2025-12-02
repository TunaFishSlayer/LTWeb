import React from 'react';
import { useCartStore } from '../lib/cart';
import { useAuthStore } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import './CartSidebar.css';

export default function CartSidebar() {
  const {
    items,
    isOpen,
    toggleCart,
    removeItem,
    updateQuantity,
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

  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const totalPrice = getTotalPrice();

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      // Prepare order data
      const order = {
        id: `ORDER-${Date.now()}`,
        date: new Date().toISOString(),
        items: items.map(item => ({
          id: item.laptop.id,
          name: item.laptop.name,
          price: item.laptop.price,
          quantity: item.quantity,
          image: item.laptop.image
        })),
        status: 'Processing',
        subtotal: totalPrice,
        shipping: 0, // You can calculate shipping if needed
        tax: 0, // You can calculate tax if needed
        total: totalPrice,
        paymentMethod: 'Credit Card' // Default, can be updated in checkout
      };

      // Save to localStorage
      const savedOrders = JSON.parse(localStorage.getItem(`user_${user?.id}_orders`) || '[]');
      savedOrders.unshift(order);
      localStorage.setItem(`user_${user?.id}_orders`, JSON.stringify(savedOrders));

      // Navigate to checkout with the order ID
      toggleCart();
      navigate('/checkout', { 
        state: { 
          orderId: order.id,
          fromCart: true
        } 
      });
    } catch (error) {
      console.error('Error saving order:', error);
      // Still navigate to checkout even if saving to history fails
      toggleCart();
      navigate('/checkout');
    }
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
            items.map((item) => (
              <div key={item.laptop.id} className="cart-item">
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
                          updateQuantity(item.laptop.id, item.quantity - 1)
                        }
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.laptop.id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => removeItem(item.laptop.id)}
                    >
                    </button>
                  </div>
                </div>
              </div>
            ))
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
