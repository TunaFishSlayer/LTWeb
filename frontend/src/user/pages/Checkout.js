import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../lib/cart';
import { toast } from 'sonner';
import '../styles/Checkout.css';

const API_BASE = '/api';

export default function Checkout() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');
  const [discount, setDiscount] = useState(null);
  const [finalPrice, setFinalPrice] = useState(null);
  const { items: cartItems, clearCart, getTotalPrice } = useCartStore();
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Convert cart items to the format expected by this component
    const formattedItems = cartItems.map(cartItem => ({
      id: cartItem.laptop.id || cartItem.laptop._id,
      name: cartItem.laptop.name,
      image: cartItem.laptop.image,
      price: cartItem.laptop.price,
      quantity: cartItem.quantity
    }));
    setItems(formattedItems);
  }, [cartItems]);

  const fetchDiscount = useCallback(async () => {
    try {
      // Fetch active discounts from public endpoint
      const response = await fetch(`${API_BASE}/discounts/active`);
      const data = await response.json();
      
      if (data.success && data.data && cartItems.length > 0) {
        const currentTotalPrice = getTotalPrice();
        
        // For simplicity, we'll apply the first applicable discount found
        // In a real scenario, you might want to handle multiple discounts differently
        const firstCartItem = cartItems[0];
        const laptopId = firstCartItem.laptop._id || firstCartItem.laptop.id;
        
        // Find applicable discount for this laptop
        const applicableDiscount = data.data.find(d => {
          if (d.applicableTo === 'all') {
            return true;
          } else if (d.applicableTo === 'specific') {
            const productIds = d.productIds?.map(p => p._id || p.id || p) || [];
            return productIds.includes(laptopId);
          }
          return false;
        });
        
        if (applicableDiscount) {
          setDiscount(applicableDiscount);
          
          // Calculate final price after discount for the total cart
          let discountedTotal = currentTotalPrice;
          if (applicableDiscount.type === 'percentage') {
            discountedTotal = currentTotalPrice * (1 - applicableDiscount.value / 100);
            if (applicableDiscount.maxDiscount > 0) {
              const maxDiscountAmount = currentTotalPrice * (applicableDiscount.maxDiscount / 100);
              const discountAmount = currentTotalPrice - discountedTotal;
              if (discountAmount > maxDiscountAmount) {
                discountedTotal = currentTotalPrice - maxDiscountAmount;
              }
            }
          } else if (applicableDiscount.type === 'fixed') {
            discountedTotal = Math.max(0, currentTotalPrice - applicableDiscount.value);
          }
          
          setFinalPrice(Math.round(discountedTotal * 100) / 100);
        } else {
          setDiscount(null);
          setFinalPrice(null);
        }
      }
    } catch (error) {
      // Silently fail - discounts are optional
      console.error('Error fetching discounts:', error);
      setDiscount(null);
      setFinalPrice(null);
    }
  }, [cartItems, getTotalPrice, setDiscount, setFinalPrice]);

  useEffect(() => {
    fetchDiscount();
  }, [cartItems, fetchDiscount]);

  const totalPrice = getTotalPrice();
  const shipping = totalPrice > 1000 ? 0 : 50;
  const tax = totalPrice * 0.08;
  const finalTotal = (finalPrice !== null ? finalPrice : totalPrice) + shipping + tax;

  const [billingInfo, setBillingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
  });

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Prepare order items for backend (use _id if available, otherwise id)
      const orderItems = cartItems.map(item => ({
        laptopId: item.laptop._id || item.laptop.id,
        quantity: item.quantity
      }));

      // Call backend API to create order
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: orderItems,
          discountCode: discount?.code || null,
          shippingAddress: {
            firstName: billingInfo.firstName,
            lastName: billingInfo.lastName,
            email: billingInfo.email,
            phone: billingInfo.phone,
            address: billingInfo.address,
            city: billingInfo.city,
            state: billingInfo.state,
            zipCode: billingInfo.zipCode,
            country: billingInfo.country
          }
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create order');
      }

      // Order created successfully
      setOrderId(data.data._id || data.data.id);
      setOrderComplete(true);
      clearCart();
      setItems([]);
      toast.success('Order placed successfully!');

    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
      toast.error(err.message || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="checkout-success">
        <div className="success-box">
          <div className="icon"></div>
          <h2>Order Successful!</h2>
          <p>Thank you for your purchase.</p>
          <p><strong>Order ID:</strong> {orderId}</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button onClick={() => navigate('/orders')}>View Order History</button>
            <button onClick={() => navigate('/')}>Continue Shopping</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      <div className="checkout-grid">
        {/* Form */}
        <form className="checkout-form" onSubmit={handlePlaceOrder}>
          <h2>Billing Information</h2>
          <div className="grid-2">
            <input
              placeholder="First Name"
              value={billingInfo.firstName}
              onChange={(e) => setBillingInfo({ ...billingInfo, firstName: e.target.value })}
              required
            />
            <input
              placeholder="Last Name"
              value={billingInfo.lastName}
              onChange={(e) => setBillingInfo({ ...billingInfo, lastName: e.target.value })}
              required
            />
          </div>
          <input
            type="email"
            placeholder="Email"
            value={billingInfo.email}
            onChange={(e) => setBillingInfo({ ...billingInfo, email: e.target.value })}
            required
          />
          <input
            placeholder="Phone"
            value={billingInfo.phone}
            onChange={(e) => setBillingInfo({ ...billingInfo, phone: e.target.value })}
            required
          />
          <input
            placeholder="Address"
            value={billingInfo.address}
            onChange={(e) => setBillingInfo({ ...billingInfo, address: e.target.value })}
            required
          />
          <div className="grid-3">
            <input
              placeholder="City"
              value={billingInfo.city}
              onChange={(e) => setBillingInfo({ ...billingInfo, city: e.target.value })}
              required
            />
            <input
              placeholder="State"
              value={billingInfo.state}
              onChange={(e) => setBillingInfo({ ...billingInfo, state: e.target.value })}
              required
            />
            <input
              placeholder="ZIP Code"
              value={billingInfo.zipCode}
              onChange={(e) => setBillingInfo({ ...billingInfo, zipCode: e.target.value })}
              required
            />
          </div>

          <h2>Payment Information</h2>
          <input
            placeholder="Card Number"
            value={paymentInfo.cardNumber}
            onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
            required
          />
          <input
            placeholder="Name on Card"
            value={paymentInfo.nameOnCard}
            onChange={(e) => setPaymentInfo({ ...paymentInfo, nameOnCard: e.target.value })}
            required
          />
          <div className="grid-2">
            <input
              placeholder="MM/YY"
              value={paymentInfo.expiryDate}
              onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })}
              required
            />
            <input
              placeholder="CVV"
              value={paymentInfo.cvv}
              onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
              required
            />
          </div>

          {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
          <button type="submit" disabled={isProcessing}>
            {isProcessing ? "Processing..." : `Place Order - $${finalTotal.toFixed(2)}`}
          </button>
        </form>

        {/* Summary */}
        <div className="order-summary">
          <h2>Order Summary</h2>
          {items.map((item) => (
            <div key={item.id} className="summary-item">
              <img src={item.image} alt={item.name} />
              <div>
                <p>{item.name}</p>
                <p>Qty: {item.quantity}</p>
              </div>
              <p>${(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
          <hr />
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${totalPrice.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Discount</span>
            <span>
              {discount ? (
                discount.type === 'percentage' ? 
                  `-${discount.value}%` : 
                  `-$${discount.value}`
              ) : '0%'}
            </span>
          </div>
          {discount && finalPrice !== null && finalPrice < totalPrice && (
            <div className="summary-row">
              <span>Subtotal after discount</span>
              <span>${finalPrice.toLocaleString()}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : `$${shipping}`}</span>
          </div>
          <div className="summary-row">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <hr />
          <div className="summary-row total">
            <span>Total</span>
            <span>${finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
