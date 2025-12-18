import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/auth';
import { toast } from 'sonner';
import '../styles/TrackOrder.css';

const API_BASE = '/api';

export default function TrackOrder() {
  const { orderId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingInfo, setTrackingInfo] = useState({
    status: 'pending',
    estimatedDelivery: '',
    carrier: 'Taplop Shipping',
    trackingNumber: '',
    history: []
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch order from backend API
        const response = await fetch(`${API_BASE}/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Order not found');
        }

        const fetchedOrder = data.data;
        
        // Transform order to match frontend format
        const transformedOrder = {
          id: fetchedOrder._id || fetchedOrder.id,
          date: fetchedOrder.createdAt,
          status: fetchedOrder.status || 'pending',
          items: fetchedOrder.items?.map(item => ({
            id: item.laptop?._id || item.laptop?.id,
            name: item.laptop?.name,
            image: item.laptop?.image,
            price: item.price || item.laptop?.price,
            quantity: item.quantity
          })) || [],
          subtotal: fetchedOrder.totalPrice,
          total: fetchedOrder.totalPrice,
          shippingAddress: fetchedOrder.shippingAddress
        };

        setOrder(transformedOrder);
        
        // Generate tracking info based on order status
        const status = fetchedOrder.status?.toLowerCase() || 'pending';
        const orderDate = new Date(fetchedOrder.createdAt || new Date());
        const estimatedDelivery = new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from order
        
        const statusUpdates = {
          pending: [
            {
              status: 'pending',
              date: orderDate.toISOString(),
              location: 'Processing Center',
              description: 'Order received and being processed'
            }
          ],
          paid: [
            {
              status: 'paid',
              date: orderDate.toISOString(),
              location: 'Processing Center',
              description: 'Payment confirmed, preparing your order'
            },
            {
              status: 'pending',
              date: orderDate.toISOString(),
              location: 'Warehouse',
              description: 'Order received and being processed'
            }
          ],
          shipped: [
            {
              status: 'shipped',
              date: new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
              location: 'Distribution Center',
              description: 'Your order has been shipped'
            },
            {
              status: 'paid',
              date: orderDate.toISOString(),
              location: 'Processing Center',
              description: 'Payment confirmed, preparing your order'
            }
          ],
          completed: [
            {
              status: 'completed',
              date: estimatedDelivery.toISOString(),
              location: 'Your Address',
              description: 'Your order has been delivered'
            },
            {
              status: 'shipped',
              date: new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
              location: 'Distribution Center',
              description: 'Your order has been shipped'
            },
            {
              status: 'paid',
              date: orderDate.toISOString(),
              location: 'Processing Center',
              description: 'Payment confirmed, preparing your order'
            }
          ],
          cancelled: [
            {
              status: 'cancelled',
              date: orderDate.toISOString(),
              location: 'Processing Center',
              description: 'Order has been cancelled'
            }
          ]
        };

        const updates = statusUpdates[status] || statusUpdates.pending;
        setTrackingInfo({
          status: status,
          estimatedDelivery: estimatedDelivery.toISOString(),
          carrier: 'Taplop Shipping',
          trackingNumber: `TP${(fetchedOrder._id || fetchedOrder.id).toString().slice(-8).toUpperCase()}`,
          history: updates
        });
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error(error.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (user && orderId) {
      fetchOrder();
    } else if (!user) {
      navigate('/login');
    }
  }, [orderId, user, navigate]);

  const getStatusLabel = (status) => {
    const labels = {
      processing: 'Processing',
      shipped: 'Shipped',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="tracking-loading">
        <div className="loading-spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="tracking-not-found">
        <h2>Order Not Found</h2>
        <p>We couldn't find an order with that ID.</p>
        <Link to="/orders" className="btn btn-primary">
          Back to Order History
        </Link>
      </div>
    );
  }

  return (
    <div className="track-order-container">
      <div className="tracking-header">
        <h1>Track Your Order</h1>
        <p className="order-number">Order #: {order.id || order._id}</p>
      </div>

      <div className="tracking-summary">
        <div className="tracking-status">
          <div className="status-badge">
            {getStatusLabel(trackingInfo.status)}
          </div>
          <p>Estimated Delivery: {new Date(trackingInfo.estimatedDelivery).toLocaleDateString()}</p>
        </div>
        
        <div className="tracking-details">
          <div className="tracking-info">
            <h3>Tracking Information</h3>
            <p><strong>Carrier:</strong> {trackingInfo.carrier}</p>
            <p><strong>Tracking Number:</strong> {trackingInfo.trackingNumber}</p>
          </div>
          
          <div className="shipping-address">
            <h3>Shipping To</h3>
            {order.shippingAddress ? (
              <>
                <p>{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
              </>
            ) : (
              <p>No shipping address provided</p>
            )}
          </div>
        </div>
      </div>

      <div className="tracking-timeline">
        <h3>Order Status</h3>
        <div className="timeline">
          {trackingInfo.history.map((event, index) => (
            <div key={index} className={`timeline-step ${event.status}`}>
              <div className="timeline-marker">
                <div className="timeline-dot"></div>
                {index < trackingInfo.history.length - 1 && <div className="timeline-line"></div>}
              </div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <h4>{getStatusLabel(event.status)}</h4>
                  <span className="timeline-date">
                    {new Date(event.date).toLocaleString()}
                  </span>
                </div>
                <p className="timeline-location">{event.location}</p>
                <p className="timeline-description">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="order-actions">
        <Link to="/orders" className="btn btn-outline">
          Back to Orders
        </Link>
        <Link to="/products" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
