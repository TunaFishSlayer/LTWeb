import React, { useState } from 'react';
import { useAuthStore } from '../../lib/auth';
import { LuMail, LuCalendar, LuShoppingBag } from 'react-icons/lu';
import '../styles/Profile.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartSidebar from '../components/CartSidebar';

export default function Profile() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Update user profile via API
    console.log('Updating profile:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  const getJoinDate = () => {
    if (user?.createdAt) {
      return new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return 'Unknown';
  };

  const getFullName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.name || 'User';
  };

  const getInitials = () => {
    const name = getFullName();
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="profile-container">
      <Header/>
      <CartSidebar />
      
      <div className="profile-content">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {getInitials()}
            </div>
            {!isEditing && (
              <button 
                className="edit-avatar-btn"
                onClick={() => setIsEditing(true)}
              >Edit</button>
            )}
          </div>

          <div className="profile-info">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="button" onClick={handleCancel} className="btn-cancel">
                    Cancel
                  </button>
                  <button type="submit" className="btn-save">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="info-display">
                <h2>{getFullName()}</h2>
                <div className="info-item">
                  <LuMail className="info-icon" />
                  <span>{user?.email}</span>
                </div>
                <div className="info-item">
                  <LuCalendar className="info-icon" />
                  <span>Member since {getJoinDate()}</span>
                </div>
                <div className="info-item">
                  <LuShoppingBag className="info-icon" />
                  <span>Role: {user?.role || 'User'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    <Footer/>
    </div>
   
  );
}