import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../lib/cart';
import { useAuthStore } from '../../lib/auth';
import './Header.css';
import { LuShoppingCart, LuMenu, LuUser } from "react-icons/lu";

export default function Header() {
  const { toggleCart, getTotalItems } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const totalItems = getTotalItems();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Helper function to get the correct path based on authentication
  const getPath = (path) => {
    return isAuthenticated ? `/user${path}` : path;
  };

  // Helper function to get user display name
  const getUserName = () => {
    if (!user) return '';
    
    // If user has firstName and lastName (regular signup)
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    
    // If user has name field (Google login)
    if (user.name) {
      return user.name;
    }
    
    // Fallback to email if no name available
    return user.email || '';
  };

  // Helper function to get user initial
  const getUserInitial = () => {
    const userName = getUserName();
    return userName.charAt(0).toUpperCase();
  };

  const handleLogoClick = () => {
    navigate(getPath('/home'));
  };

  // Toggle user dropdown
  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
    setUserDropdownOpen(false);
  };

  
  return (
    <header className="header">
      <div className="header-container">
        {/* Logo + Menu */}
        <div className="header-left">
          <div className="logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <img src="/taplop-high-resolution-logo-transparent.png" alt="Taplop Logo" />
            <h2>TAPLOP</h2>
          </div>


          <nav className={`nav ${menuOpen ? 'open' : ''}`}>
            <Link to={getPath('/home')} onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to={getPath('/products')} onClick={() => setMenuOpen(false)}>Products</Link>
            <Link to={getPath('/about')} onClick={() => setMenuOpen(false)}>About Us</Link>
            <Link to={getPath('/contact')} onClick={() => setMenuOpen(false)}>Contact</Link>
          </nav>
        </div>
    
        {/* User actions */}
        <div className="header-right">
          <button className="icon-btn cart-btn" onClick={toggleCart}>
            <LuShoppingCart />
            {totalItems > 0 && <span className="badge-cart">{totalItems}</span>}
          </button>

          {isAuthenticated ? (
            <div className="user-dropdown"> 
              <button className="icon-btn user-btn" onClick={toggleUserDropdown}>
                <LuUser />
              </button>
              {userDropdownOpen && (
                <div className="dropdown-content">
                  <div className="dropdown-user">
                    <div className="user-avatar">
                      {getUserInitial()}
                    </div>
                    <div className="user-info clickable" onClick={() => {
                      setUserDropdownOpen(false);
                      navigate('/user/profile');
                    }}>
                      <div className="user-name">{getUserName()}</div>
                      <div className="user-email">{user?.email}</div>
                    </div>
                  </div>
                  <div className="dropdown-actions">
                    <Link to={getPath('/orders')} className="dropdown-link" onClick={() => setUserDropdownOpen(false)}>
                      <span>My Orders</span>
                    </Link>
                    <button onClick={handleLogout} className="logout-btn">
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
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
