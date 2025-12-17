import React from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartSidebar from '../components/CartSidebar';
import '../styles/Contact.css';

export default function Contact() {
  return (
    <div className="contact-page">
      <Header />
      <CartSidebar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            Contact <span>Us</span>
          </h1>
          <p>
            Have questions? We're here to help. Reach out to our expert team for personalized assistance.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="contact-section">
        <div className="contact-container">
          {/* Left: Info */}
          <div className="contact-info">
            <h2>Get in Touch</h2>
            <p>
              Whether you need help choosing the right laptop, have questions about your order, 
              or need technical support, our team is ready to assist you.
            </p>

            <div className="info-cards">
              <div className="info-card">
                <Phone className="icon blue" />
                <div>
                  <h3>Phone Support</h3>
                  <p>+1 (555) 123-4567</p>
                  <small>
                    Mon-Fri: 9:00 AM - 8:00 PM EST<br />
                    Sat-Sun: 10:00 AM - 6:00 PM EST
                  </small>
                </div>
              </div>

              <div className="info-card">
                <Mail className="icon green" />
                <div>
                  <h3>Email Support</h3>
                  <p>support@laptophub.com</p>
                  <small>We typically respond within 2–4 hours during business hours</small>
                </div>
              </div>

              <div className="info-card">
                <MapPin className="icon purple" />
                <div>
                  <h3>Visit Our Store</h3>
                  <p>
                    123 Tech Street<br />Silicon Valley, CA 94025
                  </p>
                  <small>
                    Mon-Sat: 10:00 AM - 7:00 PM<br />
                    Sunday: 12:00 PM - 5:00 PM
                  </small>
                </div>
              </div>

              <div className="info-card">
                <Clock className="icon orange" />
                <div>
                  <h3>24/7 Live Chat</h3>
                  <p>Available on our website</p>
                  <small>Instant support for urgent questions and order assistance</small>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="contact-form">
            <h2>Send us a Message</h2>
            <form>
              <div className="form-grid">
                <div>
                  <label>First Name</label>
                  <input type="text" placeholder="John" />
                </div>
                <div>
                  <label>Last Name</label>
                  <input type="text" placeholder="Doe" />
                </div>
              </div>

              <label>Email</label>
              <input type="email" placeholder="john@example.com" />

              <label>Phone (Optional)</label>
              <input type="tel" placeholder="+1 (555) 123-4567" />

              <label>Subject</label>
              <input type="text" placeholder="How can we help you?" />

              <label>Message</label>
              <textarea rows="5" placeholder="Please describe your question or concern in detail..."></textarea>

              <button type="submit">
                <Send size={16} /> Send Message
              </button>
              <p className="note">
                We'll get back to you within 24 hours. For urgent matters, please call us directly.
              </p>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
