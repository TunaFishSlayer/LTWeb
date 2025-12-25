import React, { useState, useEffect } from "react";
import { LuPlus, LuPen, LuTrash2, LuSave, LuX, LuPercent, LuCalendar } from "react-icons/lu";
import { toast } from 'sonner';
import "./DiscountManagement.css";

const API_BASE = process.env.REACT_APP_API_BASE || '  /api';

export default function DiscountManagement() {
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [notification, setNotification] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch laptops for product selection
        const laptopsRes = await fetch(`${API_BASE}/laptops?limit=100`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const laptopsData = await laptopsRes.json();
        
        if (laptopsRes.ok && laptopsData.success) {
          setProducts(laptopsData.data || []);
        }
        
        // Fetch discounts
        const discountsRes = await fetch(`${API_BASE}/discounts`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const discountsData = await discountsRes.json();
        
        if (discountsRes.ok && discountsData.success) {
          // Transform backend format to frontend format
          const transformedDiscounts = discountsData.data.map(discount => ({
            id: discount._id || discount.id,
            name: discount.name,
            type: discount.type,
            value: discount.value,
            applicableTo: discount.applicableTo,
            productIds: discount.productIds?.map(p => p._id || p.id || p) || [],
            startDate: discount.startDate ? new Date(discount.startDate).toISOString().split('T')[0] : '',
            endDate: discount.endDate ? new Date(discount.endDate).toISOString().split('T')[0] : '',
            isActive: discount.isActive,
            minPurchase: discount.minPurchase || 0,
            maxDiscount: discount.maxDiscount || 0
          }));
          setDiscounts(transformedDiscounts);
        } else {
          throw new Error(discountsData.message || 'Failed to load discounts');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error(error.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleAddDiscount = () => {
    setEditingDiscount({
      name: "",
      type: "percentage",
      value: 0,
      applicableTo: "all",
      productIds: [],
      startDate: "",
      endDate: "",
      isActive: true,
      minPurchase: 0,
      maxDiscount: 0
    });
    setShowAddForm(true);
  };

  const handleEditDiscount = (discount) => {
    setEditingDiscount({ ...discount });
    setShowAddForm(true);
  };

  const handleSaveDiscount = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Prepare discount data for backend
      const discountData = {
        name: editingDiscount.name,
        type: editingDiscount.type,
        value: parseFloat(editingDiscount.value),
        applicableTo: editingDiscount.applicableTo,
        productIds: editingDiscount.applicableTo === 'specific' 
          ? editingDiscount.productIds 
          : [],
        startDate: editingDiscount.startDate,
        endDate: editingDiscount.endDate,
        isActive: editingDiscount.isActive,
        minPurchase: parseFloat(editingDiscount.minPurchase) || 0,
        maxDiscount: parseFloat(editingDiscount.maxDiscount) || 0
      };

      let response;
      if (editingDiscount.id) {
        // Update existing discount
        response = await fetch(`${API_BASE}/discounts/${editingDiscount.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(discountData)
        });
      } else {
        // Create new discount
        response = await fetch(`${API_BASE}/discounts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(discountData)
        });
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to save discount');
      }

      // Refresh discounts list
      const discountsRes = await fetch(`${API_BASE}/discounts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const discountsData = await discountsRes.json();
      
      if (discountsRes.ok && discountsData.success) {
        const transformedDiscounts = discountsData.data.map(discount => ({
          id: discount._id || discount.id,
          name: discount.name,
          type: discount.type,
          value: discount.value,
          applicableTo: discount.applicableTo,
          productIds: discount.productIds?.map(p => p._id || p.id || p) || [],
          startDate: discount.startDate ? new Date(discount.startDate).toISOString().split('T')[0] : '',
          endDate: discount.endDate ? new Date(discount.endDate).toISOString().split('T')[0] : '',
          isActive: discount.isActive,
          minPurchase: discount.minPurchase || 0,
          maxDiscount: discount.maxDiscount || 0
        }));
        setDiscounts(transformedDiscounts);
      }

      showNotification(editingDiscount.id ? "Discount update successfully!" : "Discount created successfully!");
      toast.success(editingDiscount.id ? 'Discount updated successfully' : 'Discount created successfully');
      
      setShowAddForm(false);
      setEditingDiscount(null);
    } catch (error) {
      console.error('Error saving discount:', error);
      toast.error(error.message || 'Failed to save discount');
    }
  };

  const handleDeleteDiscount = async (id) => {
    if (!window.confirm('Are you sure you want to delete this discount?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/discounts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete discount');
      }

      setDiscounts(discounts.filter(d => d.id !== id));
      showNotification("Discount deleted successfully!");
      toast.success('Discount deleted successfully');
    } catch (error) {
      console.error('Error deleting discount:', error);
      toast.error(error.message || 'Failed to delete discount');
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  const getDiscountDisplay = (discount) => {
    if (discount.type === "percentage") {
      return `${discount.value}%`;
    } else {
      return `$${discount.value}`;
    }
  };

  const getApplicableProducts = (discount) => {
    if (discount.applicableTo === "all") {
      return "All Laptop";
    } else {
      const productNames = products
        .filter(p => discount.productIds.includes(p._id || p.id))
        .map(p => p.name)
        .slice(0, 2);
      
      if (discount.productIds.length > 2) {
        return `${productNames.join(", ")} and ${discount.productIds.length - 2} other laptops`;
      }
      return productNames.join(", ") || "No laptop";
    }
  };

  const isExpired = (endDate) => {
    return new Date(endDate) < new Date();
  };

  if (loading) {
    return (
      <div className="discount-management">
        <div className="admin-loading">
          <p>Loading discount data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="discount-management">
      <div className="discount-header">
        <h2>Discount Management</h2>
        <button onClick={handleAddDiscount} className="add-btn">
          <LuPlus size={20} />
          Add Discount
        </button>
      </div>

      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}

      {showAddForm && (
        <div className="discount-form-overlay">
          <div className="discount-form">
            <h3>{editingDiscount.id ? "Edit Discount" : "Add New Discount"}</h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Discount Name</label>
                <input
                  type="text"
                  value={editingDiscount.name}
                  onChange={(e) => setEditingDiscount({
                    ...editingDiscount,
                    name: e.target.value
                  })}
                  placeholder="Enter discount name"
                />
              </div>

              <div className="form-group">
                <label>Discount Type</label>
                <select
                  value={editingDiscount.type}
                  onChange={(e) => setEditingDiscount({
                    ...editingDiscount,
                    type: e.target.value
                  })}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed ($)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Value</label>
                <input
                  type="number"
                  value={editingDiscount.value}
                  onChange={(e) => setEditingDiscount({
                    ...editingDiscount,
                    value: parseFloat(e.target.value) || 0
                  })}
                  placeholder={editingDiscount.type === "percentage" ? "0-100" : "0"}
                  min="0"
                  max={editingDiscount.type === "percentage" ? 100 : undefined}
                />
              </div>

              <div className="form-group">
                <label>Apply to</label>
                <select
                  value={editingDiscount.applicableTo}
                  onChange={(e) => setEditingDiscount({
                    ...editingDiscount,
                    applicableTo: e.target.value,
                    productIds: e.target.value === "all" ? [] : editingDiscount.productIds
                  })}
                >
                  <option value="all">All Laptop</option>
                  <option value="specific">Specific Laptop</option>
                </select>
              </div>

              {editingDiscount.applicableTo === "specific" && (
                <div className="form-group full-width">
                  <label>Laptop Apply</label>
                  <div className="product-selector">
                    {products.map(product => {
                      const productId = product._id || product.id;
                      return (
                        <label key={productId} className="product-checkbox">
                          <input
                            type="checkbox"
                            checked={editingDiscount.productIds.includes(productId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditingDiscount({
                                  ...editingDiscount,
                                  productIds: [...editingDiscount.productIds, productId]
                                });
                              } else {
                                setEditingDiscount({
                                  ...editingDiscount,
                                  productIds: editingDiscount.productIds.filter(id => id !== productId)
                                });
                              }
                            }}
                          />
                          <span>{product.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={editingDiscount.startDate}
                  onChange={(e) => setEditingDiscount({
                    ...editingDiscount,
                    startDate: e.target.value
                  })}
                />
              </div>

              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={editingDiscount.endDate}
                  onChange={(e) => setEditingDiscount({
                    ...editingDiscount,
                    endDate: e.target.value
                  })}
                />
              </div>

              <div className="form-group">
                <label>Min purchase</label>
                <input
                  type="number"
                  value={editingDiscount.minPurchase}
                  onChange={(e) => setEditingDiscount({
                    ...editingDiscount,
                    minPurchase: parseFloat(e.target.value) || 0
                  })}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Max discount</label>
                <input
                  type="number"
                  value={editingDiscount.maxDiscount}
                  onChange={(e) => setEditingDiscount({
                    ...editingDiscount,
                    maxDiscount: parseFloat(e.target.value) || 0
                  })}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="form-group full-width">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editingDiscount.isActive}
                    onChange={(e) => setEditingDiscount({
                      ...editingDiscount,
                      isActive: e.target.checked
                    })}
                  />
                  Activate discount
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button onClick={handleSaveDiscount} className="save-btn">
                <LuSave size={16} />
                Save discount
              </button>
              <button 
                onClick={() => {
                  setShowAddForm(false);
                  setEditingDiscount(null);
                }} 
                className="cancel-btn"
              >
                <LuX size={16} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="discount-list">
        {discounts.map((discount) => {
          const expired = isExpired(discount.endDate);
          
          return (
            <div key={discount.id} className={`discount-card ${!discount.isActive || expired ? 'inactive' : ''}`}>
              <div className="discount-info">
                <div className="discount-header-info">
                  <h3>{discount.name}</h3>
                  <div className="discount-value">
                    <LuPercent size={20} />
                    {getDiscountDisplay(discount)}
                  </div>
                </div>

                <div className="discount-details">
                  <div className="detail-item">
                    <span className="detail-label">Apply to:</span>
                    <span className="detail-value">{getApplicableProducts(discount)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Time:</span>
                    <span className="detail-value">
                      <LuCalendar size={14} />
                      {discount.startDate} - {discount.endDate}
                    </span>
                  </div>
                  {discount.minPurchase > 0 && (
                    <div className="detail-item">
                      <span className="detail-label">Min purchase:</span>
                      <span className="detail-value">${discount.minPurchase.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="discount-status">
                  <span className={`status-badge ${discount.isActive && !expired ? 'active' : 'inactive'}`}>
                    {discount.isActive && !expired ? 'Active' : (expired ? 'Expired' : 'Inactive')}
                  </span>
                </div>
              </div>

              <div className="discount-actions">
                <button onClick={() => handleEditDiscount(discount)} className="edit-btn">
                  <LuPen size={16} />
                </button>
                <button onClick={() => handleDeleteDiscount(discount.id)} className="delete-btn">
                  <LuTrash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {discounts.length === 0 && (
        <div className="no-discounts">
          <p>No discounts found. Add a new discount!</p>
        </div>
      )}
    </div>
  );
}
