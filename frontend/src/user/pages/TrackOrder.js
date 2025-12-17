import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../lib/auth';
import { toast } from 'sonner';
import '../styles/TrackOrder.css';

export default function TrackOrder() {
  const { orderId } = useParams();
  const { user } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingInfo, setTrackingInfo] = useState({
    status: 'processing',
    estimatedDelivery: '2023-12-15',
    carrier: 'Taplop Shipping',
    trackingNumber: `TP${Math.floor(10000000 + Math.random() * 90000000)}`,
    history: [
      {
        status: 'order_placed',
        date: '2023-11-10T10:30:00',
        location: 'Warehouse',
        description: 'Order received and being processed'
      }
    ]
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Simulate API call to get order details
        const savedOrders = JSON.parse(localStorage.getItem(`user_${user?.id}_orders`) || '[]');
        const foundOrder = savedOrders.find(o => o.id === orderId);
        
        if (foundOrder) {
          setOrder(foundOrder);
          
          // Simulate tracking updates based on order status
          const statusUpdates = {
            processing: [
              {
                status: 'processing',
                date: new Date().toISOString(),
                location: 'Processing Center',
                description: 'Your order is being processed'
              }
            ],
            shipped: [
              {
                status: 'shipped',
                date: new Date(Date.now() + 86400000).toISOString(),
                location: 'Distribution Center',
                description: 'Your order has been shipped'
              },
              {
                status: 'processing',
                date: new Date().toISOString(),
                location: 'Processing Center',
                description: 'Your order is being processed'
              }
            ],
            delivered: [
              {
                status: 'delivered',
                date: new Date(Date.now() + 259200000).toISOString(),
                location: 'Your Address',
                description: 'Your order has been delivered'
              },
              {
                status: 'out_for_delivery',
                date: new Date(Date.now() + 172800000).toISOString(),
                location: 'Local Facility',
                description: 'Out for delivery'
              },
              {
                status: 'shipped',
                date: new Date(Date.now() + 86400000).toISOString(),
                location: 'Distribution Center',
                description: 'Your order has been shipped'
              },
              {
                status: 'processing',
                date: new Date().toISOString(),
                location: 'Processing Center',
                description: 'Your order is being processed'
              }
            ]
          };

          const updates = statusUpdates[foundOrder.status?.toLowerCase()] || statusUpdates.processing;
          setTrackingInfo(prev => ({
            ...prev,
            status: foundOrder.status?.toLowerCase() || 'processing',
            history: updates
          }));
        } else {
          toast.error('Order not found');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, user?.id]);

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
        <p className="order-number">Order #: {order.id}</p>
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
