import React, { useState } from "react";
import { LuUpload, LuSave, LuX, LuTrash2 } from "react-icons/lu";
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import "./AddProduct.css";

const API_BASE =  process.env.REACT_APP_API_BASE || '/api';

export default function AddProduct() {
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: "",
    brand: "",
    price: "",
    image: "",
    specs: {
      processor: "",
      ram: "",
      storage: "",
      graphics: "",
      display: ""
    },
    inStock: true,
    featured: false,
    stockQuantity: 0,
    description: ""
  });

  const [notification, setNotification] = useState("");
  const [previewImage, setPreviewImage] = useState("");

  const brands = ["Apple", "Dell", "ASUS", "HP", "Lenovo", "Microsoft", "Razer", "Acer", "LG", "MSI", "Samsung", "Google", "Huawei", "Xiaomi"];

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setProduct({
        ...product,
        [parent]: {
          ...product[parent],
          [child]: value
        }
      });
    } else {
      setProduct({
        ...product,
        [field]: value
      });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setProduct({
          ...product,
          image: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = async () => {
    // Validation
    if (!product.name || !product.brand || !product.price) {
      setNotification("Please fill in all required fields!");
      toast.error("Please fill in all required fields!");
      return;
    }

    if (parseFloat(product.price) <= 0) {
      setNotification("Price must be greater than 0!");
      toast.error("Price must be greater than 0!");
      return;
    }

    if (!product.image) {
      setNotification("Please upload a product image!");
      toast.error("Please upload a product image!");
      return;
    }

    if (!product.specs.processor || !product.specs.ram || !product.specs.storage || 
        !product.specs.graphics || !product.specs.display) {
      setNotification("Please fill in all required technical specifications!");
      toast.error("Please fill in all required technical specifications!");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Prepare product data for backend
      const productData = {
        name: product.name,
        brand: product.brand,
        price: parseFloat(product.price),
        originalPrice: parseFloat(product.price), // Set originalPrice same as price
        image: product.image,
        specs: {
          processor: product.specs.processor,
          ram: product.specs.ram,
          storage: product.specs.storage,
          graphics: product.specs.graphics,
          display: product.specs.display
        },
        stock: parseInt(product.stockQuantity) || 0,
        featured: product.featured || false
      };

      // Call backend API to create laptop
      const response = await fetch(`${API_BASE}/laptops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create product');
      }

      setNotification("Product added successfully!");
      toast.success('Product created successfully!');

      // Reset form after successful save
      setTimeout(() => {
        setProduct({
          name: "",
          brand: "",
          price: "",
          image: "",
          specs: {
            processor: "",
            ram: "",
            storage: "",
            graphics: "",
            display: ""
          },
          inStock: true,
          featured: false,
          stockQuantity: 0,
          description: ""
        });
        setPreviewImage("");
        setNotification("");
        // Optionally navigate to inventory
        navigate('/admin/inventory');
      }, 2000);
    } catch (error) {
      console.error('Error creating product:', error);
      setNotification(error.message || "Error creating product!");
      toast.error(error.message || 'Failed to create product');
    }
  };

  const handleReset = () => {
    setProduct({
      name: "",
      brand: "",
      price: "",
      image: "",
      specs: {
        processor: "",
        ram: "",
        storage: "",
        graphics: "",
        display: ""
      },
      inStock: true,
      featured: false,
      stockQuantity: 0,
      description: ""
    });
    setPreviewImage("");
  };

  return (
    <div className="add-product">
      <div className="product-header">
        <h2>Add New laptop</h2>
        <div className="header-actions">
          <button onClick={handleReset} className="reset-btn">
            <LuX size={16} />
            Reset
          </button>
          <button onClick={handleSaveProduct} className="save-btn">
            <LuSave size={16} />
            Save laptop
          </button>
        </div>
      </div>

      {notification && (
        <div className={`notification ${notification.includes("success") ? "success" : "error"}`}>
          {notification}
        </div>
      )}

      <div className="product-form">
        <div className="form-sections">
          {/* Basic Information */}
          <div className="form-section">
            <h3>Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="input laptop name"
                />
              </div>

              <div className="form-group">
                <label>Brand *</label>
                <select
                  value={product.brand}
                  onChange={(e) => handleInputChange("brand", e.target.value)}
                >
                  <option value="">Select brand</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Price *</label>
                <input
                  type="number"
                  value={product.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Stock Quantity</label>
                <input
                  type="number"
                  value={product.stockQuantity}
                  onChange={(e) => handleInputChange("stockQuantity", parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="form-section">
            <h3>Specifications</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>CPU</label>
                <input
                  type="text"
                  value={product.specs.processor}
                  onChange={(e) => handleInputChange("specs.processor", e.target.value)}
                  placeholder="Intel Core i7-12700H"
                />
              </div>

              <div className="form-group">
                <label>RAM</label>
                <input
                  type="text"
                  value={product.specs.ram}
                  onChange={(e) => handleInputChange("specs.ram", e.target.value)}
                  placeholder="16GB"
                />
              </div>

              <div className="form-group">
                <label>Storage</label>
                <input
                  type="text"
                  value={product.specs.storage}
                  onChange={(e) => handleInputChange("specs.storage", e.target.value)}
                  placeholder="512GB SSD"
                />
              </div>

              <div className="form-group">
                <label>Graphics</label>
                <input
                  type="text"
                  value={product.specs.graphics}
                  onChange={(e) => handleInputChange("specs.graphics", e.target.value)}
                  placeholder="NVIDIA RTX 3070"
                />
              </div>

              <div className="form-group">
                <label>Display</label>
                <input
                  type="text"
                  value={product.specs.display}
                  onChange={(e) => handleInputChange("specs.display", e.target.value)}
                  placeholder="15.6-inch FHD IPS"
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="form-section">
            <h3>Image</h3>
            <div className="image-upload">
              <div className="upload-area">
                {previewImage ? (
                  <div className="image-preview">
                    <img src={previewImage} alt="Product preview" />
                    <button
                      onClick={() => {
                        setPreviewImage("");
                        setProduct({ ...product, image: "" });
                      }}
                      className="remove-image"
                      type="button"
                    >
                      <LuTrash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="upload-label">
                    <LuUpload size={32} />
                    <span>Upload image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      hidden
                      required
                    />
                  </label>
                )}
              </div>
              <div className="image-info">
                <p><strong>Upload image (Required)</strong></p>
                <p>Format: JPG, PNG (max 5MB)</p>
                <p>Recommended size: 500x400 pixels</p>
                {!product.image && (
                  <p style={{ color: '#ef4444', marginTop: '0.5rem' }}>
                    ⚠ Please upload a product image
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="form-section">
            <h3>Additional settings</h3>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={product.inStock}
                  onChange={(e) => handleInputChange("inStock", e.target.checked)}
                />
                In stock
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={product.featured}
                  onChange={(e) => handleInputChange("featured", e.target.checked)}
                />
                Featured
              </label>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={product.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter detailed description about the laptop..."
                rows={4}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Product Preview */}
      <div className="product-preview">
        <h3>Laptop Preview</h3>
        <div className="preview-card">
          <div className="preview-image">
            {previewImage ? (
              <img src={previewImage} alt={product.name || "Product preview"} />
            ) : (
              <div className="no-image">No image</div>
            )}
          </div>
          <div className="preview-content">
            <h4>{product.name || "Laptop name"}</h4>
            <p className="preview-brand">{product.brand || "Brand"}</p>
            <div className="preview-price">
              <strong>${product.price || "0"}</strong>
            </div>
            <div className="preview-specs">
              <div>{product.specs.processor || "CPU"}</div>
              <div>{product.specs.ram || "RAM"} • {product.specs.storage || "Storage"}</div>
              <div>{product.specs.display || "Display"}</div>
            </div>
            <div className="preview-status">
              <span className={`status-badge ${product.inStock ? "in-stock" : "out-of-stock"}`}>
                {product.inStock ? "In stock" : "Out of stock"}
              </span>
              {product.featured && (
                <span className="featured-badge">Featured</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
