import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/auth';
import { useCartStore } from '../../lib/cart';
import { toast } from 'sonner';
import '../styles/OrderHistory.css';

const API_BASE = '/api';

export default function OrderHistory() {
  const { user } = useAuthStore();
  const { clearCart } = useCartStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch orders from backend API
        const response = await fetch(`${API_BASE}/orders/my-orders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to fetch orders');
        }

        // Transform backend order format to match frontend expectations
        const transformedOrders = data.data.map(order => {
          console.log('Raw order from backend:', order); // Debug log
          
          const discountedTotal = order.totalPrice - (order.discountInfo?.amount || 0);
          const tax = discountedTotal * 0.1;
            
          const transformedOrder = {
            id: order._id || order.id,
            date: order.createdAt || order.date,
            status: order.status || 'pending',
            items: order.items.map(item => ({
              id: item.laptop?._id || item.laptop?.id || item.id,
              name: item.laptop?.name || 'Unknown Product',
              image: item.laptop?.image || '/placeholder-laptop.jpg',
              price: item.price || item.laptop?.price || 0,
              originalPrice: item.laptop?.price || item.price || 0,
              quantity: item.quantity,
              discountApplied: order.discountInfo ? {
                code: order.discountInfo.code,
                amount: order.discountInfo.amount,
                type: order.discountInfo.type,
                value: order.discountInfo.value
              } : null
            })),
            subtotal: order.totalPrice,
            total: discountedTotal,
            paidAmount: discountedTotal + tax,
            discountInfo: order.discountInfo,
            shipping: 0,
            shippingAddress: order.shippingAddress,
            paymentMethod: order.paymentMethod,
            paymentInfo: order.paymentInfo
          };
          
          console.log('Transformed order:', transformedOrder); // Debug log
          return transformedOrder;
        });

        // Check for new order from location state (from successful checkout)
        const newOrder = location.state?.order;
        let finalOrders = transformedOrders;
        
        if (newOrder && !transformedOrders.some(order => 
          order.id === (newOrder._id || newOrder.id)
        )) {
          // Transform new order to match format
          const newDiscountedTotal = newOrder.totalPrice - (newOrder.discountInfo?.amount || 0);
          const newTax = newDiscountedTotal * 0.1;
          
          const transformedNewOrder = {
            id: newOrder._id || newOrder.id,
            date: newOrder.createdAt || new Date().toISOString(),
            status: newOrder.status || 'paid',
            items: newOrder.items?.map(item => ({
              id: item.laptop?._id || item.laptop?.id || item.id,
              name: item.laptop?.name || item.name || 'Unknown Product',
              image: item.laptop?.image || item.image || '/placeholder-laptop.jpg',
              price: item.price || item.laptop?.price || 0,
              originalPrice: item.laptop?.price || item.price || 0,
              quantity: item.quantity,
              discountApplied: newOrder.discountInfo ? {
                code: newOrder.discountInfo.code,
                amount: newOrder.discountInfo.amount,
                type: newOrder.discountInfo.type,
                value: newOrder.discountInfo.value
              } : null
            })) || [],
            subtotal: newOrder.totalPrice,
            total: newDiscountedTotal,
            paidAmount: newDiscountedTotal + newTax,
            discountInfo: newOrder.discountInfo,
            shipping: 0,
            shippingAddress: newOrder.shippingAddress,
            paymentMethod: newOrder.paymentMethod,
            paymentInfo: newOrder.paymentInfo
          };
          finalOrders = [transformedNewOrder, ...transformedOrders];
          
          // Show success message and clear cart for new orders
          if (location.state?.paymentSuccess) {
            toast.success('Payment successful! Your order has been placed.');
            clearCart();
            // Clear the state to prevent showing the message again on refresh
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
        
        setOrders(finalOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(error.message || 'Failed to load orders');
        toast.error(error.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user, location, clearCart, navigate]);

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

  if (error && orders.length === 0) {
    return (
      <div className="no-orders">
        <div className="empty-state">
          <h2>Error Loading Orders</h2>
          <p>{error}</p>
          <Link to="/user/products" className="shop-now-btn">
            Back to Products
          </Link>
        </div>
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
          <Link to="/user/products" className="shop-now-btn">
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
      'pending': 'pending',
      'paid': 'paid',
      'processing': 'processing',
      'shipped': 'shipped',
      'delivered': 'delivered',
      'cancelled': 'cancelled'
    };
    return statusMap[status.toLowerCase()] || 'pending';
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    
    setIsProcessingAction(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE}/orders/${selectedOrder.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to cancel order');
      }

      // Remove order from the list entirely
      setOrders(prevOrders => 
        prevOrders.filter(order => order.id !== selectedOrder.id)
      );
      
      setShowCancelModal(false);
      setSelectedOrder(null);
      toast.success('Order cancelled successfully!');
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error(error.message || 'Failed to cancel order');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleRefundOrder = async () => {
    if (!selectedOrder) return;
    
    setIsProcessingAction(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE}/orders/${selectedOrder.id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to process refund');
      }

      // Update order status locally
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === selectedOrder.id 
            ? { ...order, status: 'cancelled' }
            : order
        )
      );
      
      setShowRefundModal(false);
      setSelectedOrder(null);
      toast.success('Refund processed successfully!');
    } catch (error) {
      console.error('Refund error:', error);
      toast.error(error.message || 'Failed to process refund');
    } finally {
      setIsProcessingAction(false);
    }
  };

  return (
    <div className="order-history-container">
      <div className="order-history-header">
        <h1>Order History</h1>
        <Link to="/user/products" className="btn btn-outline">
          &larr; Back to Products
        </Link>
      </div>
      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <h3>Order: {order.id || order._id}</h3>
                <p className="order-date">
                  {new Date(order.date || order.createdAt || new Date()).toLocaleDateString('en-US', {
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
                  {order.status || 'pending'}
                </span>
              </div>
            </div>

            <div className="order-items">
              {order.items?.map((item) => (
                <div key={item.id} className="order-item">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="item-image" 
                    onError={(e) => {
                      e.target.onerror = null;
                    }}
                  />
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>Quantity: {item.quantity}</p>
                    {console.log('Item discountApplied:', item.discountApplied)} {/* Debug log */}
                    {item.discountApplied && item.originalPrice > item.price ? (
                      <div className="item-discount-info">
                        <p className="original-price">{formatPrice(item.originalPrice)} each</p>
                        <p className="discounted-price">{formatPrice(item.price)} each</p>
                        <p className="discount-code">Discount: {item.discountApplied.code}</p>
                      </div>
                    ) : (
                      <p>{formatPrice(item.price)} each</p>
                    )}
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
              {order.discountInfo && (
                <div className="summary-row discount">
                  <span>
                    Discount {order.discountInfo.code}:
                    {order.discountInfo.type === 'percentage' && ` ${order.discountInfo.value}%`}
                  </span>
                  <span>-{formatPrice(order.discountInfo.amount)}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Shipping:</span>
                <span>{order.shipping ? formatPrice(order.shipping) : 'Free'}</span>
              </div>
              <div className="summary-row">
                <span>Tax (10%):</span>
                <span>{formatPrice((order.total || (order.subtotal - (order.discountInfo?.amount || 0))) * 0.1)}</span>
              </div>
              <div className="summary-row">
                <span>Payment Method:</span>
                <span>{order.paymentMethod || 'Cash on Delivery'}</span>
              </div>
             
              <div className="summary-row total">
                <span>Total Paid:</span>
                <span>{formatPrice(order.paidAmount)}</span>
              </div>
            </div>

            <div className="order-actions">
              {order.status?.toLowerCase() === 'pending' && (
                <button 
                  className="btn btn-danger"
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowCancelModal(true);
                  }}
                >
                  Cancel Order
                </button>
              )}
              {order.status?.toLowerCase() === 'paid' && (
                <button 
                  className="btn btn-warning"
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowRefundModal(true);
                  }}
                >
                  Request Refund
                </button>
              )}
              {order.status?.toLowerCase() !== 'cancelled' && (
                <button 
                  className="btn btn-outline"
                  onClick={() => navigate(`/user/track-order/${order.id || order._id}`)}
                >
                  Track Order
                </button>
              )}
              <Link to="/user/products" className="btn btn-primary">
                Buy Again
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Cancel Order</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedOrder(null);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <p>Are you sure you want to cancel this order?</p>
              <p><strong>Order ID:</strong> {selectedOrder.id || selectedOrder._id}</p>
              <p><strong>Total Amount:</strong> {formatPrice(selectedOrder.total)}</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>

            <div className="modal-actions">
              <button 
                className="btn btn-outline"
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedOrder(null);
                }}
                disabled={isProcessingAction}
              >
                Keep Order
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleCancelOrder}
                disabled={isProcessingAction}
              >
                {isProcessingAction ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Order Modal */}
      {showRefundModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Request Refund</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowRefundModal(false);
                  setSelectedOrder(null);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <p>Are you sure you want to request a refund for this order?</p>
              <p><strong>Order ID:</strong> {selectedOrder.id || selectedOrder._id}</p>
              <p><strong>Refund Amount:</strong> {formatPrice(selectedOrder.total)}</p>
              <p className="info-text">Refunds will be processed within 5-7 business days.</p>
            </div>

            <div className="modal-actions">
              <button 
                className="btn btn-outline"
                onClick={() => {
                  setShowRefundModal(false);
                  setSelectedOrder(null);
                }}
                disabled={isProcessingAction}
              >
                Keep Order
              </button>
              <button 
                className="btn btn-warning"
                onClick={handleRefundOrder}
                disabled={isProcessingAction}
              >
                {isProcessingAction ? 'Processing...' : 'Request Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}