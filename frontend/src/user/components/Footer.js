import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Cột 1 */}
          <div className="footer-column">
            <h3 className="footer-title">LaptopHub</h3>
            <p className="footer-text">
              Your trusted destination for premium laptops. We offer the latest
              models from top brands with competitive prices and excellent
              customer service.
            </p>
          </div>

          {/* Cột 2 */}
          <div className="footer-column">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-list">
              <li><Link to="/home">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Cột 3 */}
          <div className="footer-column">
            <h4 className="footer-heading">Categories</h4>
            <ul className="footer-list">
              <li><Link to="/products?category=gaming">Gaming Laptops</Link></li>
              <li><Link to="/products?category=business">Business Laptops</Link></li>
              <li><Link to="/products?category=ultrabooks">Ultrabooks</Link></li>
              <li><Link to="/products?category=2in1">2-in-1 Laptops</Link></li>
            </ul>
          </div>

          {/* Cột 4 */}
          <div className="footer-column">
            <h4 className="footer-heading">Contact Info</h4>
            <ul className="footer-contact">
              <li>+1 (555) 123-4567</li>
              <li>support@laptophub.com</li>
              <li> 123 Tech Street, Silicon Valley</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 LaptopHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
