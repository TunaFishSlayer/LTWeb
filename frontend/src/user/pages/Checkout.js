import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../lib/cart';
import { useDiscountStore } from '../../lib/discount';
import { toast } from 'sonner';
import '../styles/Checkout.css';

const API_BASE = process.env.REACT_APP_API_BASE || '/api';

export default function Checkout() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');
  const [discount, setDiscount] = useState(null);
  const [finalPrice, setFinalPrice] = useState(null);
  const { items: cartItems, clearCart, getTotalPrice } = useCartStore();
  const { fetchDiscounts, getDiscountForLaptop } = useDiscountStore();
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
      // Fetch discounts if needed (cached)
      await fetchDiscounts();
      
      if (cartItems.length > 0) {
        const currentTotalPrice = getTotalPrice();
        
        // Apply discount for each laptop in cart
        let totalDiscount = 0;
        let applicableDiscountFound = null;
        
        for (const cartItem of cartItems) {
          const laptopId = cartItem.laptop._id || cartItem.laptop.id;
          const applicableDiscount = getDiscountForLaptop(laptopId);
          
          if (applicableDiscount) {
            applicableDiscountFound = applicableDiscount;
            let itemDiscount = 0;
            
            if (applicableDiscount.type === 'percentage') {
              itemDiscount = cartItem.laptop.price * (applicableDiscount.value / 100);
              if (applicableDiscount.maxDiscount > 0) {
                const maxDiscountAmount = cartItem.laptop.price * (applicableDiscount.maxDiscount / 100);
                itemDiscount = Math.min(itemDiscount, maxDiscountAmount);
              }
            } else if (applicableDiscount.type === 'fixed') {
              itemDiscount = Math.min(applicableDiscount.value, cartItem.laptop.price);
            }
            
            totalDiscount += itemDiscount * cartItem.quantity;
          }
        }
        
        if (applicableDiscountFound) {
          setDiscount(applicableDiscountFound);
          const discountedTotal = Math.max(0, currentTotalPrice - totalDiscount);
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
  }, [cartItems, getTotalPrice, fetchDiscounts, getDiscountForLaptop]);

  useEffect(() => {
    fetchDiscount();
  }, [cartItems, fetchDiscount]);

  const totalPrice = getTotalPrice();
  const shipping = totalPrice > 1000 ? 0 : 50;
  const tax = totalPrice * 0.08;
  const finalTotal = (finalPrice !== null ? finalPrice : totalPrice) + shipping + tax;

  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');

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
        quantity: item.quantity,
        price: item.laptop.price
      }));

      // Prepare payment info based on selected method
      let paymentInfoData = {
        method: paymentMethod
      };

      if (paymentMethod === 'card') {
        paymentInfoData.details = {
          cardNumber: paymentInfo.cardNumber,
          nameOnCard: paymentInfo.nameOnCard
        };
      }

      // Call backend API to create order
      const orderPayload = {
        items: orderItems,
        totalPrice: finalTotal,
        paymentMethod: paymentMethod,
        paymentInfo: paymentInfoData,
        shippingAddress: shippingInfo,
        discountInfo: discount ? {
          code: discount.code,
          amount: totalPrice - finalTotal,
          type: discount.type,
          value: discount.value
        } : null
      };
        
      console.log('Sending order payload:', orderPayload); // Debug log
      
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create order');
      }

      // If payment method is card, process payment
      if (paymentMethod === 'card') {
        try {
          console.log('Making payment request to:', `${API_BASE}/payments`);
          console.log('Payment payload:', {
            cardDetails: {
              cardNumber: paymentInfo.cardNumber,
              nameOnCard: paymentInfo.nameOnCard,
              expiryDate: paymentInfo.expiryDate,
              cvv: paymentInfo.cvv
            },
            amount: finalTotal
          });
         
        } catch (paymentError) {
          throw new Error(`Payment failed: ${paymentError.message}`);
        }
      }

      // Order created successfully
      setOrderId(data.data._id || data.data.id);
      setOrderComplete(true);
      clearCart();
      setItems([]);
      
      // Navigate to order history with the new order data
      navigate('/user/orders', { 
        state: { 
          order: data.data,
          paymentSuccess: true 
        } 
      });
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
            <button onClick={() => navigate('/user/orders')}>View Order History</button>
            <button onClick={() => navigate('/user/home')}>Continue Shopping</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button 
          className="outline-btn" 
          onClick={() => navigate(-1)} 
          style={{ padding: '0.5rem 1rem' }}
        >
          ← Back
        </button>
        <h1>Checkout</h1>
      </div>
      <div className="checkout-grid">
        {/* Form */}
        <form className="checkout-form" onSubmit={handlePlaceOrder}>
          <h2>Shipping Information</h2>
          <div className="grid-2">
            <input
              placeholder="First Name"
              value={shippingInfo.firstName}
              onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
              required
            />
            <input
              placeholder="Last Name"
              value={shippingInfo.lastName}
              onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
              required
            />
          </div>
          <input
            placeholder="Phone"
            value={shippingInfo.phone}
            onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
            required
          />
          <input
            placeholder="Address"
            value={shippingInfo.address}
            onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
            required
          />
          <div className="grid-3">
            <input
              placeholder="City"
              value={shippingInfo.city}
              onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
              required
            />
          </div>

          <h2>Payment Information</h2>
          <div className="payment-methods">
            <label className="payment-method">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Cash on Delivery (COD)</span>
            </label>
            <label className="payment-method">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Credit/Debit Card</span>
            </label>
            <label className="payment-method">
              <input
                type="radio"
                name="paymentMethod"
                value="other"
                checked={paymentMethod === 'other'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Other Payment Method</span>
            </label>
          </div>

          {paymentMethod === 'card' && (
            <>
              <h3>Card Details</h3>
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
            </>
          )}

          {paymentMethod === 'cod' && (
            <div className="cod-message">
              <p>You will pay cash when your order is delivered.</p>
              <p>Payment amount: ${finalTotal.toFixed(2)}</p>
            </div>
          )}

          {paymentMethod === 'other' && (
            <div className="other-payment-message">
              <p>Please contact us for alternative payment methods.</p>
              <p>We accept bank transfers, PayPal, and other payment options.</p>
              <p>Payment amount: ${finalTotal.toFixed(2)}</p>
            </div>
          )}

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
