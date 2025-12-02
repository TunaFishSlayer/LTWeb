import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/auth';
import { useCartStore } from '../lib/cart';
import { toast } from 'sonner';
import '../styles/OrderHistory.css';

export default function OrderHistory() {
  const { user } = useAuthStore();
  const { clearCart } = useCartStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Get orders from localStorage
        const savedOrders = JSON.parse(localStorage.getItem(`user_${user?.id}_orders`) || '[]');
        
        // Check for new order from location state (from successful payment)
        const newOrder = location.state?.order;
        let updatedOrders = [...savedOrders];
        
        if (newOrder && !savedOrders.some(order => order.id === newOrder.id)) {
          updatedOrders = [newOrder, ...savedOrders];
          localStorage.setItem(`user_${user?.id}_orders`, JSON.stringify(updatedOrders));
          
          // Show success message and clear cart for new orders
          if (location.state?.paymentSuccess) {
            toast.success('Payment successful! Your order has been placed.');
            clearCart();
            // Clear the state to prevent showing the message again on refresh
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
        
        // Also check for legacy payment_success query parameter
        const searchParams = new URLSearchParams(location.search);
        const legacyPaymentSuccess = searchParams.get('payment_success');
        
        if (legacyPaymentSuccess === 'true') {
          toast.success('Payment successful! Your order has been placed.');
          clearCart();
          // Remove the query parameter from URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        setOrders(updatedOrders);
      } catch (error) {
        console.error('Error processing orders:', error);
        toast.error('Failed to process orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.id, location, clearCart]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-animation">
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
        </div>
        <p className="loading-text">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="no-orders">
        <div className="empty-state">
          <div className="empty-illustration">
            <svg width="120" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 6H21" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2>No Orders Yet</h2>
          <p>You haven't placed any orders yet.</p>
          <Link to="/products" className="shop-now-btn">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'processing': 'processing',
      'shipped': 'shipped',
      'delivered': 'delivered',
      'cancelled': 'cancelled'
    };
    return statusMap[status.toLowerCase()] || 'processing';
  };

  return (
    <div className="order-history-container">
      <div className="order-history-header">
        <h1>Order History</h1>
        <Link to="/products" className="btn btn-outline">
          &larr; Back to Products
        </Link>
      </div>
      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <h3>Order: {order.id}</h3>
                <p className="order-date">
                  {new Date(order.date || new Date()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="order-status">
                <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>

            <div className="order-items">
              {order.items?.map((item) => (
                <div key={item.id} className="order-item">
                  <img 
                    src={item.image || 'https://via.placeholder.com/80'} 
                    alt={item.name} 
                    className="item-image" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/80';
                    }}
                  />
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>Quantity: {item.quantity}</p>
                    <p>{formatPrice(item.price)} each</p>
                  </div>
                  <div className="item-total">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>{formatPrice(order.subtotal || order.total)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>{order.shipping ? formatPrice(order.shipping) : 'Free'}</span>
              </div>
              <div className="summary-row">
                <span>Tax (10%):</span>
                <span>{formatPrice((order.subtotal || order.total) * 0.1)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>{formatPrice(
                  (order.subtotal || order.total) + 
                  (order.shipping || 0) + 
                  ((order.subtotal || order.total) * 0.1)
                )}</span>
              </div>
            </div>

            <div className="order-actions">
              {order.status?.toLowerCase() !== 'cancelled' && (
                <button 
                  className="btn btn-outline"
                  onClick={() => navigate(`/track-order/${order.id}`)}
                >
                  Track Order
                </button>
              )}
              <Link to="/products" className="btn btn-primary">
                Buy Again
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}