import React, { useState } from "react";
import { LuUpload, LuSave, LuX, LuTrash2 } from "react-icons/lu";
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import "./AddProduct.css";

const API_BASE = '/api';

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
    rating: 0,
    reviews: 0,
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
      setNotification("Vui lòng điền đầy đủ thông tin bắt buộc!");
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    if (parseFloat(product.price) <= 0) {
      setNotification("Giá sản phẩm phải lớn hơn 0!");
      toast.error("Giá sản phẩm phải lớn hơn 0!");
      return;
    }

    if (!product.image) {
      setNotification("Vui lòng tải lên hình ảnh sản phẩm!");
      toast.error("Vui lòng tải lên hình ảnh sản phẩm!");
      return;
    }

    if (!product.specs.processor || !product.specs.ram || !product.specs.storage || 
        !product.specs.graphics || !product.specs.display) {
      setNotification("Vui lòng điền đầy đủ thông số kỹ thuật!");
      toast.error("Vui lòng điền đầy đủ thông số kỹ thuật!");
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
        rating: parseFloat(product.rating) || 0,
        reviews: parseInt(product.reviews) || 0,
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

      setNotification("Thêm sản phẩm thành công!");
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
          rating: 0,
          reviews: 0,
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
      setNotification(error.message || "Có lỗi xảy ra khi thêm sản phẩm!");
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
      rating: 0,
      reviews: 0,
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
        <h2>Thêm Sản phẩm Mới</h2>
        <div className="header-actions">
          <button onClick={handleReset} className="reset-btn">
            <LuX size={16} />
            Reset
          </button>
          <button onClick={handleSaveProduct} className="save-btn">
            <LuSave size={16} />
            Lưu Sản phẩm
          </button>
        </div>
      </div>

      {notification && (
        <div className={`notification ${notification.includes("thành công") ? "success" : "error"}`}>
          {notification}
        </div>
      )}

      <div className="product-form">
        <div className="form-sections">
          {/* Basic Information */}
          <div className="form-section">
            <h3>Thông tin cơ bản</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Tên sản phẩm *</label>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Nhập tên sản phẩm"
                />
              </div>

              <div className="form-group">
                <label>Thương hiệu *</label>
                <select
                  value={product.brand}
                  onChange={(e) => handleInputChange("brand", e.target.value)}
                >
                  <option value="">Chọn thương hiệu</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Giá bán ($) *</label>
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
                <label>Số lượng tồn kho</label>
                <input
                  type="number"
                  value={product.stockQuantity}
                  onChange={(e) => handleInputChange("stockQuantity", parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Đánh giá (1-5)</label>
                <input
                  type="number"
                  value={product.rating}
                  onChange={(e) => handleInputChange("rating", parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  max="5"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="form-section">
            <h3>Thông số kỹ thuật</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>CPU</label>
                <input
                  type="text"
                  value={product.specs.processor}
                  onChange={(e) => handleInputChange("specs.processor", e.target.value)}
                  placeholder="Ví dụ: Intel Core i7-12700H"
                />
              </div>

              <div className="form-group">
                <label>RAM</label>
                <input
                  type="text"
                  value={product.specs.ram}
                  onChange={(e) => handleInputChange("specs.ram", e.target.value)}
                  placeholder="Ví dụ: 16GB"
                />
              </div>

              <div className="form-group">
                <label>Ổ cứng</label>
                <input
                  type="text"
                  value={product.specs.storage}
                  onChange={(e) => handleInputChange("specs.storage", e.target.value)}
                  placeholder="Ví dụ: 512GB SSD"
                />
              </div>

              <div className="form-group">
                <label>Đồ họa</label>
                <input
                  type="text"
                  value={product.specs.graphics}
                  onChange={(e) => handleInputChange("specs.graphics", e.target.value)}
                  placeholder="Ví dụ: NVIDIA RTX 3070"
                />
              </div>

              <div className="form-group">
                <label>Màn hình</label>
                <input
                  type="text"
                  value={product.specs.display}
                  onChange={(e) => handleInputChange("specs.display", e.target.value)}
                  placeholder="Ví dụ: 15.6-inch FHD IPS"
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="form-section">
            <h3>Hình ảnh sản phẩm *</h3>
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
                    <span>Tải lên hình ảnh (Bắt buộc)</span>
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
                <p><strong>Tải lên hình ảnh sản phẩm (Bắt buộc)</strong></p>
                <p>Định dạng: JPG, PNG (tối đa 5MB)</p>
                <p>Kích thước đề xuất: 500x400 pixels</p>
                {!product.image && (
                  <p style={{ color: '#ef4444', marginTop: '0.5rem' }}>
                    ⚠ Vui lòng tải lên hình ảnh sản phẩm
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="form-section">
            <h3>Cài đặt bổ sung</h3>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={product.inStock}
                  onChange={(e) => handleInputChange("inStock", e.target.checked)}
                />
                Còn hàng
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={product.featured}
                  onChange={(e) => handleInputChange("featured", e.target.checked)}
                />
                Sản phẩm nổi bật
              </label>
            </div>

            <div className="form-group">
              <label>Mô tả sản phẩm</label>
              <textarea
                value={product.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Nhập mô tả chi tiết về sản phẩm..."
                rows={4}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Product Preview */}
      <div className="product-preview">
        <h3>Xem trước sản phẩm</h3>
        <div className="preview-card">
          <div className="preview-image">
            {previewImage ? (
              <img src={previewImage} alt={product.name || "Product preview"} />
            ) : (
              <div className="no-image">Không có hình ảnh</div>
            )}
          </div>
          <div className="preview-content">
            <h4>{product.name || "Tên sản phẩm"}</h4>
            <p className="preview-brand">{product.brand || "Thương hiệu"}</p>
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
                {product.inStock ? "Còn hàng" : "Hết hàng"}
              </span>
              {product.featured && (
                <span className="featured-badge">Nổi bật</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
