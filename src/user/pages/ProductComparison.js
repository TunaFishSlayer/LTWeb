import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, X, Plus, Search } from "lucide-react";
import { FaStar } from "react-icons/fa";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartSidebar from "../components/CartSidebar";
import { laptops } from "../lib/laptop";
import "../styles/ProductComparison.css";

export default function ProductComparison() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [product1, setProduct1] = useState(null);
  const [product2, setProduct2] = useState(null);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [selectorTarget, setSelectorTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const product1Id = searchParams.get('product1');
    const product2Id = searchParams.get('product2');
    
    if (product1Id) {
      const p1 = laptops.find(l => l.id === product1Id);
      setProduct1(p1);
    }
    
    if (product2Id) {
      const p2 = laptops.find(l => l.id === product2Id);
      setProduct2(p2);
    }
  }, [searchParams]);

  const updateUrl = (p1, p2) => {
    const params = new URLSearchParams();
    if (p1) params.set('product1', p1.id);
    if (p2) params.set('product2', p2.id);
    setSearchParams(params);
  };

  const handleProductSelect = (product) => {
    if (selectorTarget === 'product1') {
      const newProduct2 = product2 && product2.id === product.id ? null : product2;
      setProduct1(product);
      setProduct2(newProduct2);
      updateUrl(product, newProduct2);
    } else if (selectorTarget === 'product2') {
      const newProduct1 = product1 && product1.id === product.id ? null : product1;
      setProduct2(product);
      setProduct1(newProduct1);
      updateUrl(newProduct1, product);
    }
    setShowProductSelector(false);
    setSelectorTarget(null);
  };

  const removeProduct = (productNumber) => {
    if (productNumber === 1) {
      setProduct1(null);
      updateUrl(null, product2);
    } else {
      setProduct2(null);
      updateUrl(product1, null);
    }
  };

  const openProductSelector = (target) => {
    setSelectorTarget(target);
    setShowProductSelector(true);
  };

  const availableProducts = laptops.filter(
    laptop => laptop.id !== product1?.id && laptop.id !== product2?.id
  );

  const filteredProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSpecValue = (product, specKey) => {
    if (!product || !product.specs) return 'N/A';
    return product.specs[specKey] || 'N/A';
  };

  const specKeys = ['processor', 'ram', 'storage', 'graphics', 'display'];

  return (
    <div className="comparison-container">
      <Header />
      <CartSidebar />

      <div className="comparison-content">
        <button className="back-button" onClick={() => navigate("/products")}>
          <ArrowLeft size={20} />
          Back to Products
        </button>

        <h1 className="comparison-title">Compare Products</h1>

        {/* Product Selection */}
        <div className="product-selection">
          <div className="product-slot">
            {product1 ? (
              <div className="selected-product">
                <img src={product1.image} alt={product1.name} />
                <div className="product-info">
                  <h3>{product1.name}</h3>
                  <p>${product1.price.toLocaleString()}</p>
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => removeProduct(1)}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button 
                className="add-product-btn"
                onClick={() => openProductSelector('product1')}
              >
                <Plus size={20} />
                Add First Product
              </button>
            )}
          </div>

          <div className="vs-divider">VS</div>

          <div className="product-slot">
            {product2 ? (
              <div className="selected-product">
                <img src={product2.image} alt={product2.name} />
                <div className="product-info">
                  <h3>{product2.name}</h3>
                  <p>${product2.price.toLocaleString()}</p>
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => removeProduct(2)}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button 
                className="add-product-btn"
                onClick={() => openProductSelector('product2')}
              >
                <Plus size={20} />
                Add Second Product
              </button>
            )}
          </div>
        </div>

        {/* Comparison Table */}
        {product1 && product2 && (
          <div className="comparison-table">
            <div className="table-header">
              <div className="spec-label">Specification</div>
              <div className="product-col">
                <img src={product1.image} alt={product1.name} />
                <h3>{product1.name}</h3>
              </div>
              <div className="product-col">
                <img src={product2.image} alt={product2.name} />
                <h3>{product2.name}</h3>
              </div>
            </div>

            {/* Basic Info */}
            <div className="table-row">
              <div className="spec-label">Brand</div>
              <div className="spec-value">{product1.brand}</div>
              <div className="spec-value">{product2.brand}</div>
            </div>

            <div className="table-row">
              <div className="spec-label">Price</div>
              <div className="spec-value price">${product1.price.toLocaleString()}</div>
              <div className="spec-value price">${product2.price.toLocaleString()}</div>
            </div>

            <div className="table-row">
              <div className="spec-label">Rating</div>
              <div className="spec-value">{product1.rating} ({product1.reviews} reviews)</div>
              <div className="spec-value">{product2.rating} ({product2.reviews} reviews)</div>
            </div>

            <div className="table-row">
              <div className="spec-label">Stock Status</div>
              <div className="spec-value">{product1.inStock ? 'In Stock' : 'Out of Stock'}</div>
              <div className="spec-value">{product2.inStock ? 'In Stock' : 'Out of Stock'}</div>
            </div>

            {/* Specifications */}
            {specKeys.map(key => (
              <div key={key} className="table-row">
                <div className="spec-label">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </div>
                <div className="spec-value">{getSpecValue(product1, key)}</div>
                <div className="spec-value">{getSpecValue(product2, key)}</div>
              </div>
            ))}
          </div>
        )}

        {!product1 && !product2 && (
          <div className="empty-state">
            <h2>Select products to compare</h2>
            <p>Choose two products from our catalog to see their specifications side by side.</p>
          </div>
        )}
      </div>

      {/* Product Selector Modal */}
      {showProductSelector && (
        <div className="modal-overlay" onClick={() => setShowProductSelector(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Select Product to Compare</h3>
              <button onClick={() => setShowProductSelector(false)}>
                <X size={20} />
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="search-container">
              <div className="search-input-wrapper">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by name or brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button 
                    className="clear-search-btn"
                    onClick={() => setSearchQuery("")}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="product-grid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <div 
                    key={product.id}
                    className="product-option"
                    onClick={() => handleProductSelect(product)}
                  >
                    <img src={product.image} alt={product.name} />
                    <div className="product-details">
                      <div className="product-brand-badge">{product.brand}</div>
                      <h4>{product.name}</h4>
                      <p>${product.price.toLocaleString()}</p>
                      <div className="product-rating">
                        <FaStar className="star-icon" />
                        <span>{product.rating}</span>
                        <span className="review-count">({product.reviews})</span>
                      </div>
                      <div className="product-specs-preview">
                        <span>{product.specs.processor}</span>
                        <span>{product.specs.ram}</span>
                        <span>{product.specs.storage}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <Search size={48} className="no-results-icon" />
                  <h4>No products found</h4>
                  <p>Try adjusting your search terms</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
