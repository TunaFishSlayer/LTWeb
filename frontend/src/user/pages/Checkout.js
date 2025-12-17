import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../lib/cart';
import '../styles/Checkout.css';
export default function Checkout() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const { items: cartItems, clearCart, getTotalPrice } = useCartStore();
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Convert cart items to the format expected by this component
    const formattedItems = cartItems.map(cartItem => ({
      id: cartItem.laptop.id,
      name: cartItem.laptop.name,
      image: cartItem.laptop.image,
      price: cartItem.laptop.price,
      quantity: cartItem.quantity
    }));
    setItems(formattedItems);
  }, [cartItems]);

  const totalPrice = getTotalPrice();
  const shipping = totalPrice > 1000 ? 0 : 50;
  const tax = totalPrice * 0.08;
  const finalTotal = totalPrice + shipping + tax;

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
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setOrderId(`LH${Date.now().toString().slice(-6)}`);
    setOrderComplete(true);
    clearCart(); // Clear the cart after successful order
    setItems([]);
    setIsProcessing(false);
  };

  if (orderComplete) {
    return (
      <div className="checkout-success">
        <div className="success-box">
          <div className="icon"></div>
          <h2>Order Successful!</h2>
          <p>Thank you for your purchase.</p>
          <p><strong>Order ID:</strong> {orderId}</p>
          <button onClick={() => navigate('/')}>Continue Shopping</button>
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
