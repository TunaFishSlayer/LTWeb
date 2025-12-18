import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../lib/cart';
import { useAuthStore } from '../../lib/auth';
import './Header.css';
import { LuSearch, LuShoppingCart, LuMenu, LuUser } from "react-icons/lu";

export default function Header() {
  const { toggleCart, getTotalItems } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const totalItems = getTotalItems();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo + Menu */}
        <div className="header-left">
          <Link to="/" className="logo">
            <img src="taplop-high-resolution-logo-transparent.png" alt="Taplop Logo" />
            <h2>TAPLOP</h2>
          </Link>


          <nav className={`nav ${menuOpen ? 'open' : ''}`}>
            <Link to="/home" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/products" onClick={() => setMenuOpen(false)}>Products</Link>
            <Link to="/about" onClick={() => setMenuOpen(false)}>About Us</Link>
            <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
          </nav>
        </div>

        {/* Search */}
        <div className="search-bar">
          <input type="text" placeholder="Search laptops..." />
          <span className="search-icon"><LuSearch/></span>
        </div>

        {/* User actions */}
        <div className="header-right">
          <button className="icon-btn cart-btn" onClick={toggleCart}>
            <LuShoppingCart />
            {totalItems > 0 && <span className="badge-cart">{totalItems}</span>}
          </button>

          {isAuthenticated ? (
            <div className="user-dropdown"> 
              <button className="icon-btn user-btn">
                <LuUser />
              </button>
              <div className="dropdown-content">
                <div className="dropdown-user">
                  <div className="user-avatar">
                    {user?.firstName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{user?.firstName} {user?.lastName}</div>
                    <div className="user-email">{user?.email}</div>
                  </div>
                </div>
                <div className="dropdown-actions">
                  <Link to="/orders" className="dropdown-link">
                    <span>My Orders</span>
                  </Link>
                  <button onClick={handleLogout} className="logout-btn">
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link to="/login" className="icon-btn"><LuUser /></Link>
          )}

          <button className="icon-btn menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <LuMenu />
          </button>
        </div>
      </div>
    </header>
  );
}
