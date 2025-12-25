import React, { useState, useEffect } from "react";
import { LuSearch, LuPen, LuSave, LuX, LuCircleAlert } from "react-icons/lu";
import { toast } from 'sonner';
import "./InventoryManagement.css";

const API_BASE = process.env.REACT_APP_API_BASE || '/api';

export default function InventoryManagement() {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [notification, setNotification] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    brand: '',
    stockQuantity: 0,
    image: ''
  });
  const [editImagePreview, setEditImagePreview] = useState('');

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch all laptops from backend
        const response = await fetch(`${API_BASE}/laptops?limit=100`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to load inventory');
        }
        
        // Transform laptops to inventory format
        const inventoryData = data.data.map(laptop => ({
          ...laptop,
          id: laptop._id || laptop.id,
          stockQuantity: laptop.stock || 0,
          lowStockThreshold: 5,
          lastRestocked: laptop.updatedAt 
            ? new Date(laptop.updatedAt).toLocaleDateString()
            : new Date().toLocaleDateString()
        }));
        
        setInventory(inventoryData);
      } catch (error) {
        console.error('Error fetching inventory:', error);
        toast.error(error.message || 'Failed to load inventory');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInventory();
  }, []);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (item) => {
    setEditingItem(item);
    setEditFormData({
      name: item.name || '',
      price: item.price || '',
      description: item.description || '',
      category: item.category || '',
      brand: item.brand || '',
      stockQuantity: item.stockQuantity || 0,
      image: item.image || ''
    });
    setEditImagePreview(item.image || '');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      // Update all laptop information via backend API
      const response = await fetch(`${API_BASE}/laptops/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editFormData.name,
          price: parseFloat(editFormData.price),
          description: editFormData.description,
          category: editFormData.category,
          brand: editFormData.brand,
          stock: parseInt(editFormData.stockQuantity),
          image: editFormData.image
        })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update product');
      }
      
      // Update local state
      setInventory(inventory.map(item => 
        item.id === editingItem.id ? {
          ...item,
          ...editFormData,
          lastRestocked: new Date().toLocaleDateString()
        } : item
      ));
      setEditingItem(null);
      showNotification("Product updated successfully");
      toast.success('Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result);
        setEditFormData(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancel = () => {
    setEditingItem(null);
    setEditFormData({
      name: '',
      price: '',
      description: '',
      category: '',
      brand: '',
      stockQuantity: 0,
      image: ''
    });
    setEditImagePreview('');
  };

  const handleDelete = async (item) => {
    if (!window.confirm('Are you sure you want to delete this laptop?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/laptops/${item.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete laptop');
      }
      
      // Remove from local state
      setInventory(inventory.filter(i => i.id !== item.id));
      showNotification("Laptop deleted successfully");
      toast.success('Laptop deleted successfully');
    } catch (error) {
      console.error('Error deleting laptop:', error);
      toast.error(error.message || 'Failed to delete laptop');
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  const getStockStatus = (quantity, threshold) => {
    if (quantity === 0) return { status: "out-of-stock", color: "#ef4444", text: "Out of stock" };
    if (quantity <= threshold) return { status: "low-stock", color: "#f97316", text: "Low stock" };
    return { status: "in-stock", color: "#10b981", text: "In stock" };
  };

  return (
    <div className="admin-inventory-management">
      <div className="admin-inventory-header">
        <h2>Inventory Management</h2>
        <div className="admin-inventory-stats">
          <div className="admin-stat-item">
            <span className="admin-stat-label">Total products:</span>
            <span className="admin-stat-value">{inventory.length}</span>
          </div>
          <div className="admin-stat-item">
            <span className="admin-stat-label">Out of stock:</span>
            <span className="admin-stat-value admin-out">
              {inventory.filter(item => item.stockQuantity === 0).length}
            </span>
          </div>
          <div className="admin-stat-item">
            <span className="admin-stat-label">Low stock:</span>
            <span className="admin-stat-value admin-low">
              {inventory.filter(item => item.stockQuantity <= item.lowStockThreshold && item.stockQuantity > 0).length}
            </span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="admin-loading">
          <p>Loading inventory data...</p>
        </div>
      )}

      {notification && (
        <div className="admin-notification">
          <LuCircleAlert size={20} />
          {notification}
        </div>
      )}

      <div className="admin-inventory-controls">
        <div className="admin-search-bar">
          <LuSearch size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-inventory-table">
        <div className="admin-table-header">
          <div>Laptop</div>
          <div>Brand</div>
          <div>Stock</div>
          <div>Restocked</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        <div className="admin-table-body">
          {filteredInventory.map((item) => {
            const stockStatus = getStockStatus(item.stockQuantity, item.lowStockThreshold);
            const isEditing = editingItem && editingItem.id === item.id;

            return (
              <div key={item.id} className={`admin-table-row ${isEditing ? 'editing' : ''}`}>
                <div className="admin-product-info">
                  <img src={item.image} alt={item.name} className="admin-product-image" />
                  <div>
                    <div className="admin-product-name">
                      {item.name}
                      {isEditing && <span className="editing-indicator"> (Editing)</span>}
                    </div>
                    <div className="admin-product-price">${item.price.toLocaleString()}</div>
                  </div>
                </div>

                <div className="admin-brand">{item.brand}</div>

                <div className="admin-stock">
                  {isEditing ? (
                    <input
                      type="number"
                      value={editingItem.stockQuantity}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        stockQuantity: parseInt(e.target.value) || 0
                      })}
                      className="admin-stock-input"
                      min="0"
                    />
                  ) : (
                    <span className="admin-stock-quantity">{item.stockQuantity}</span>
                  )}
                </div>

                <div className="admin-date">{item.lastRestocked}</div>

                <div className="admin-status">
                  <span 
                    className="admin-status-badge"
                    style={{ backgroundColor: stockStatus.color }}
                  >
                    {stockStatus.text}
                  </span>
                </div>

                <div className="admin-actions">
                  {isEditing ? (
                    <div className="admin-edit-actions">
                      <button 
                        onClick={handleSave} 
                        className="admin-save-btn"
                        disabled={saving}
                      >
                        <LuSave size={16} />
                        Save changes
                      </button>
                      <button 
                        onClick={handleCancel} 
                        className="admin-cancel-btn"
                        disabled={saving}
                      >
                        <LuX size={16} />
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="admin-action-buttons">
                      <button onClick={() => handleEdit(item)} className="admin-edit-btn">
                        <LuPen size={16} />
                      </button>
                      <button onClick={() => handleDelete(item)} className="admin-delete-btn">
                        <LuX size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {filteredInventory.length === 0 && (
        <div className="admin-no-results">
          <p>No results found.</p>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="admin-edit-modal">
          <div className="admin-modal-content">
            <h3>Edit Product Information</h3>
            <div className="admin-modal-grid">
              <div className="admin-form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleInputChange}
                  disabled={saving}
                />
              </div>
              
              <div className="admin-form-group">
                <label>Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={editFormData.brand}
                  onChange={handleInputChange}
                  disabled={saving}
                />
              </div>
              
              <div className="admin-form-group">
                <label>Price</label>
                <input
                  type="number"
                  name="price"
                  value={editFormData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  disabled={saving}
                />
              </div>
              
              <div className="admin-form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={editFormData.category}
                  onChange={handleInputChange}
                  disabled={saving}
                />
              </div>
              
              <div className="admin-form-group">
                <label>Stock</label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={editFormData.stockQuantity}
                  onChange={handleInputChange}
                  min="0"
                  disabled={saving}
                />
              </div>
            </div>
            
            <div className="admin-form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={editFormData.description}
                onChange={handleInputChange}
                rows="4"
                disabled={saving}
              />
            </div>
            
            <div className="admin-form-group">
              <label>Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={saving}
              />
              {editImagePreview && (
                <div className="admin-image-preview">
                  <img src={editImagePreview} alt="Preview" />
                </div>
              )}
            </div>
            
            <div className="admin-modal-actions">
              <button 
                onClick={handleSave} 
                className="admin-save-btn"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="admin-spinner"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <LuSave size={16} />
                    Save changes
                  </>
                )}
              </button>
              <button 
                onClick={handleCancel} 
                className="admin-cancel-btn"
                disabled={saving}
              >
                <LuX size={16} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
